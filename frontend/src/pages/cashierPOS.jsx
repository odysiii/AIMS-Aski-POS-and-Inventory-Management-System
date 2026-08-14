import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Search, Trash2, ChevronDown, Plus, Minus, Store,
  Lock, Clock, Banknote, Percent, Download, LogOut, ScanLine,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { exportCsv } from '../utils/exportCsv';
import { apiGet, apiPost, ApiError } from '../lib/api';
import { peso, amount, toNumber } from '../lib/format';
import { POS_STOCK_POLL_MS } from '../config';
import { useAuth } from '../auth/useAuth';
import { useToast } from '../components/useToast';
import Modal from '../components/Modal';

/** UI label → Prisma enum literal. The enum is `E_Wallet` (mixed case), not
 *  `E_WALLET`, so string mangling like `.toUpperCase().replace('-','_')` fails
 *  the transaction on the backend. */
const PAYMENT_METHOD_ENUM = {
  Cash: 'CASH',
  Card: 'CARD',
  'E-wallet': 'E_Wallet',
};

/** Full denomination table matching the Prisma Reconciliation model + the
 *  X-Reading receipt. Previously four rows (₱0.50, ₱0.10, ₱0.05, ₱0.01) were
 *  missing from the UI but present in the export template — they always
 *  shipped as zero. */
const DENOMINATIONS = [
  { key: 'p1000', label: '₱1,000.00 Note', value: 1000 },
  { key: 'p500',  label: '₱500.00 Note',   value: 500 },
  { key: 'p200',  label: '₱200.00 Note',   value: 200 },
  { key: 'p100',  label: '₱100.00 Note',   value: 100 },
  { key: 'p50',   label: '₱50.00 Note',    value: 50 },
  { key: 'p20',   label: '₱20.00 Note',    value: 20 },
  { key: 'p10',   label: '₱10.00 Coin',    value: 10 },
  { key: 'p5',    label: '₱5.00 Coin',     value: 5 },
  { key: 'p1',    label: '₱1.00 Coin',     value: 1 },
  { key: 'p0_50', label: '₱0.50 Coin',     value: 0.5 },
  { key: 'c25',   label: '₱0.25 Coin',     value: 0.25 },
  { key: 'p0_10', label: '₱0.10 Coin',     value: 0.1 },
  { key: 'p0_05', label: '₱0.05 Coin',     value: 0.05 },
  { key: 'p0_01', label: '₱0.01 Coin',     value: 0.01 },
];

const EMPTY_DENOMS = DENOMINATIONS.reduce((acc, d) => ({ ...acc, [d.key]: 0 }), {});

const HELD_SALES_KEY = 'aims.pos.pendingSales';

function readHeldSales() {
  try {
    const raw = sessionStorage.getItem(HELD_SALES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function CashierPOS() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user, logout, authorizeSupervisor } = useAuth();

  // Catalog / async
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & selection
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [cashTendered, setCashTendered] = useState('');
  const [checkingOut, setCheckingOut] = useState(false);

  // Cart
  const [cart, setCart] = useState([]);

  // Discount
  const [discountPercent, setDiscountPercent] = useState(0);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [supervisorPin, setSupervisorPin] = useState('');
  const [tempDiscountInput, setTempDiscountInput] = useState(10);
  const [discountError, setDiscountError] = useState('');
  const [supervisorAuthorized, setSupervisorAuthorized] = useState(false);
  const [authorizingDiscount, setAuthorizingDiscount] = useState(false);

  // Pending / held sales (persist across refresh)
  const [pendingSales, setPendingSales] = useState(readHeldSales);
  const [showPendingModal, setShowPendingModal] = useState(false);

  useEffect(() => {
    try {
      sessionStorage.setItem(HELD_SALES_KEY, JSON.stringify(pendingSales));
    } catch { /* storage may be disabled */ }
  }, [pendingSales]);

  // X-Reading / EOD
  const [showEODModal, setShowEODModal] = useState(false);
  const [xReading, setXReading] = useState({
    grossSales: 0, netSales: 0, totalDiscount: 0, posCash: 0, pointsAvailed: 0, cashDiscount: 0,
  });
  const [cashDenominations, setCashDenominations] = useState(EMPTY_DENOMS);

  // ---------- Data loading & polling ----------

  const fetchProducts = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const data = await apiGet('/api/products');
      setProducts(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch products');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    // `loading` starts true; drive the initial fetch through the silent path so
    // this effect body doesn't call setState synchronously (react-hooks lint).
    let alive = true;
    apiGet('/api/products')
      .then((data) => {
        if (!alive) return;
        setProducts(Array.isArray(data) ? data : []);
        setError(null);
      })
      .catch((err) => alive && setError(err.message || 'Failed to fetch products'))
      .finally(() => alive && setLoading(false));

    // Poll to mitigate stale-cache oversells while a real server-side
    // stock guard is pending (BACKEND-HANDOFF.md item #1).
    const id = setInterval(() => fetchProducts({ silent: true }), POS_STOCK_POLL_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [fetchProducts]);

  // ---------- Derived ----------

  const productById = useMemo(() => {
    const m = new Map();
    products.forEach((p) => m.set(p.id, p));
    return m;
  }, [products]);

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category || 'Uncategorized'));
    return ['All', ...Array.from(set).sort()];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return products.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q)) return false;
      if (selectedCategory !== 'All' && (p.category || 'Uncategorized') !== selectedCategory) return false;
      return true;
    });
  }, [products, searchTerm, selectedCategory]);

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + toNumber(item.unitPrice) * item.quantity, 0),
    [cart]
  );
  const discountAmount = useMemo(() => (subtotal * discountPercent) / 100, [subtotal, discountPercent]);
  const cartTotal = useMemo(() => Math.max(0, subtotal - discountAmount), [subtotal, discountAmount]);

  const totalCountedCash = useMemo(
    () => DENOMINATIONS.reduce((sum, d) => sum + (cashDenominations[d.key] || 0) * d.value, 0),
    [cashDenominations]
  );
  const shortOver = totalCountedCash - toNumber(xReading.posCash);

  const changeDue = useMemo(() => {
    if (paymentMethod !== 'Cash') return 0;
    const tendered = toNumber(cashTendered);
    return tendered - cartTotal;
  }, [cashTendered, cartTotal, paymentMethod]);

  // ---------- Cart handlers ----------
  // NB: none of these fire alerts inside the state updater — the updater runs
  // twice under StrictMode. Toasts happen out here so they only fire once.

  const handleAddToCart = (product) => {
    if (toNumber(product.stock) <= 0) {
      toast.warn(`${product.name} is out of stock.`);
      return;
    }
    const existingQty = cart.find((i) => i.id === product.id)?.quantity ?? 0;
    if (existingQty >= toNumber(product.stock)) {
      toast.warn(`Only ${product.stock} of ${product.name} in stock.`);
      return;
    }
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          unitPrice: toNumber(product.price),
          quantity: 1,
        },
      ];
    });
  };

  const handleUpdateQuantity = (id, delta) => {
    const cartItem = cart.find((i) => i.id === id);
    const stock = toNumber(productById.get(id)?.stock ?? 0);
    if (cartItem && delta > 0 && cartItem.quantity + delta > stock) {
      toast.warn(`Only ${stock} in stock.`);
      return;
    }
    setCart((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (id) => setCart((prev) => prev.filter((item) => item.id !== id));

  const handleClearCart = () => {
    setCart([]);
    setDiscountPercent(0);
    setSupervisorAuthorized(false);
    setCashTendered('');
  };

  // ---------- Barcode ----------

  const handleBarcodeSubmit = async (e) => {
    e.preventDefault();
    const code = barcodeInput.trim();
    if (!code) return;
    try {
      const results = await apiGet(`/api/products/barcode/${encodeURIComponent(code)}`);
      const found = Array.isArray(results) ? results[0] : results;
      if (!found) {
        toast.error(`No product matches "${code}".`);
        return;
      }
      handleAddToCart(found);
      setBarcodeInput('');
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        toast.error(`No product matches "${code}".`);
      } else {
        toast.error(err.message || 'Barcode lookup failed.');
      }
    }
  };

  // ---------- Discount ----------

  const handleApplyDiscount = async () => {
    const raw = Number(tempDiscountInput);
    if (!Number.isFinite(raw) || raw < 0 || raw > 100) {
      setDiscountError('Enter a percentage between 0 and 100.');
      return;
    }
    setAuthorizingDiscount(true);
    setDiscountError('');
    try {
      const ok = await authorizeSupervisor(supervisorPin);
      if (!ok) {
        setDiscountError('Invalid supervisor password.');
        return;
      }
      setDiscountPercent(raw);
      setSupervisorAuthorized(true);
      setShowDiscountModal(false);
      setSupervisorPin('');
    } catch (err) {
      setDiscountError(err.message || 'Authorization failed.');
    } finally {
      setAuthorizingDiscount(false);
    }
  };

  // ---------- Held sales ----------

  const handleHoldSale = () => {
    if (cart.length === 0) return;
    setPendingSales((prev) => [
      ...prev,
      {
        id: `PEND-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        cart: [...cart],
        discountPercent,
        supervisorAuthorized,
        total: cartTotal,
      },
    ]);
    handleClearCart();
  };

  const handleRestorePendingSale = (pendingOrder) => {
    setCart(pendingOrder.cart);
    setDiscountPercent(pendingOrder.discountPercent || 0);
    setSupervisorAuthorized(!!pendingOrder.supervisorAuthorized);
    setPendingSales((prev) => prev.filter((o) => o.id !== pendingOrder.id));
    setShowPendingModal(false);
  };

  // ---------- Checkout ----------

  const handleConfirmSale = async () => {
    if (cart.length === 0) {
      toast.warn('Cart is empty.');
      return;
    }
    if (paymentMethod === 'Cash' && cashTendered !== '' && toNumber(cashTendered) < cartTotal) {
      toast.error(`Insufficient cash tendered. Need at least ${peso(cartTotal)}.`);
      return;
    }
    if (!user?.id) {
      toast.error('Cannot record a sale without a signed-in cashier.');
      return;
    }

    // Refetch to catch stale stock before we commit. Server-side guard is the
    // real fix (handoff #1) but this narrows the race meaningfully.
    await fetchProducts({ silent: true });
    for (const item of cart) {
      const fresh = productById.get(item.id);
      if (!fresh || toNumber(fresh.stock) < item.quantity) {
        toast.error(`Stock changed: ${item.name} now has ${fresh?.stock ?? 0}.`);
        return;
      }
    }

    const payload = {
      items: cart.map((item) => ({
        productId: item.id,
        name: item.name,
        unitPrice: toNumber(item.unitPrice),
        quantity: item.quantity,
      })),
      subtotal,
      discountPercent,
      discountAmount,
      supervisorAuthorized,
      totalAmount: cartTotal,
      paymentMethod: PAYMENT_METHOD_ENUM[paymentMethod],
      cashierId: user.id,
    };

    setCheckingOut(true);
    try {
      await apiPost('/api/transactions', payload);
      const changeLabel = paymentMethod === 'Cash' && cashTendered !== ''
        ? ` — change ${peso(Math.max(0, changeDue))}`
        : '';
      toast.success(`Transaction recorded: ${peso(cartTotal)}${changeLabel}`);
      handleClearCart();
      fetchProducts();
    } catch (err) {
      toast.error(`Transaction failed: ${err.message}`);
    } finally {
      setCheckingOut(false);
    }
  };

  // ---------- X-Reading / EOD ----------

  const fetchXReadingTotals = async () => {
    try {
      const data = await apiGet('/api/reconciliation/expected-cash');
      setXReading({
        grossSales:    toNumber(data.grossSales),
        netSales:      toNumber(data.netSales),
        totalDiscount: toNumber(data.totalDiscount),
        posCash:       toNumber(data.expectedCash ?? data.posCash),
        pointsAvailed: toNumber(data.pointsAvailed),
        cashDiscount:  toNumber(data.cashDiscount),
      });
    } catch (err) {
      toast.error(`Failed to load day totals: ${err.message}`);
      setXReading({ grossSales: 0, netSales: 0, totalDiscount: 0, posCash: 0, pointsAvailed: 0, cashDiscount: 0 });
    }
  };

  const handleOpenEODModal = () => {
    setShowEODModal(true);
    fetchXReadingTotals();
  };

  const handleDenominationChange = (key, value) => {
    const numeric = value === '' ? 0 : Math.max(0, parseInt(value, 10) || 0);
    setCashDenominations((prev) => ({ ...prev, [key]: numeric }));
  };

  const handleExportReport = () => {
    exportCsv({
      reportNo: `X-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
      cashier: { username: user?.username || 'UNKNOWN' },

      grossSales:    xReading.grossSales,
      pointsAvailed: xReading.pointsAvailed,
      totalDiscount: xReading.totalDiscount,
      netSales:      xReading.netSales,

      ...cashDenominations,

      posCash:      xReading.posCash,
      cashDiscount: xReading.cashDiscount,
      cashierCash:  totalCountedCash,
      shortOver,
    });
  };

  const handleSubmitReconciliation = async () => {
    if (!user?.id) {
      toast.error('Cannot submit reconciliation without a signed-in cashier.');
      return;
    }
    const payload = {
      cashierId: user.id,
      grossSales:    xReading.grossSales,
      pointsAvailed: xReading.pointsAvailed,
      totalDiscount: xReading.totalDiscount,
      netSales:      xReading.netSales,
      posCash:       xReading.posCash,
      cashDiscount:  xReading.cashDiscount,
      cashierCash:   totalCountedCash,
      shortOver,
      denominations: cashDenominations,
    };
    try {
      await apiPost('/api/reconciliation', payload);
      toast.success('Reconciliation saved.');
      handleExportReport();
      setShowEODModal(false);
    } catch (err) {
      toast.error(`Failed to save reconciliation: ${err.message}`);
    }
  };

  // ---------- Render helpers ----------

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#EAE8FE] font-bold text-gray-700">
        Loading inventory…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full w-full items-center justify-center bg-[#EAE8FE] gap-2 p-4">
        <p className="text-red-700 font-bold text-center">Failed to load inventory: {error}</p>
        <button
          type="button"
          onClick={() => fetchProducts()}
          className="px-4 py-1.5 bg-gray-800 text-white rounded-lg text-xs font-bold cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-[#EAE8FE] p-4 gap-4 font-sans overflow-hidden box-border">
      {/* LEFT: catalog */}
      <div className="flex-1 flex flex-col h-full min-h-0 bg-transparent">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-white shrink-0 shadow-sm" aria-hidden="true">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-gray-900 uppercase tracking-wide leading-tight">
                ASKI Multi-Coop
              </h1>
              <p className="text-xs font-semibold text-gray-600 leading-tight">
                Cashier: {user?.username || 'unknown'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPendingModal(true)}
              className="relative px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Clock className="w-4 h-4" aria-hidden="true" />
              Pending
              {pendingSales.length > 0 && (
                <span className="ml-1 bg-amber-700 text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center">
                  {pendingSales.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={handleOpenEODModal}
              className="px-3 py-1.5 bg-gray-800 hover:bg-black text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Banknote className="w-4 h-4" aria-hidden="true" />
              X-Reading / EOD
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
              aria-label="Log out"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2 mb-3 shrink-0">
          <div className="relative">
            <label htmlFor="pos-category" className="sr-only">Category</label>
            <select
              id="pos-category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none bg-gray-200/80 text-gray-800 pl-3 pr-8 py-1.5 rounded-full text-xs font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-600 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
          </div>

          <form onSubmit={handleBarcodeSubmit} className="relative flex items-center">
            <ScanLine className="w-3.5 h-3.5 text-gray-600 absolute left-3" aria-hidden="true" />
            <label htmlFor="pos-barcode" className="sr-only">Barcode</label>
            <input
              id="pos-barcode"
              type="text"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              placeholder="Scan barcode…"
              className="bg-gray-200/80 text-gray-900 pl-8 pr-3 py-1.5 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-gray-500 placeholder-gray-600 w-44"
            />
          </form>

          <div className="relative flex-1 max-w-xs ml-auto">
            <Search className="w-3.5 h-3.5 text-gray-600 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <label htmlFor="pos-search" className="sr-only">Search products</label>
            <input
              id="pos-search"
              type="text"
              placeholder="Search…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-200/80 text-gray-900 pl-8 pr-3 py-1.5 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-gray-500 placeholder-gray-600"
            />
          </div>
        </div>

        {/* Product grid */}
        <div className="flex-1 bg-[#F5F2F0] rounded-2xl p-3 overflow-y-auto min-h-0 shadow-inner">
          {filteredProducts.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs font-semibold text-gray-600">
              No products match your search.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filteredProducts.map((product) => {
                const outOfStock = toNumber(product.stock) <= 0;
                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleAddToCart(product)}
                    disabled={outOfStock}
                    className="text-left bg-gray-300 rounded-xl p-2.5 flex flex-col justify-between cursor-pointer hover:bg-gray-400/80 transition-all border border-gray-300/50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-600"
                  >
                    <div className="bg-white rounded-lg h-20 w-full flex items-center justify-center mb-2" aria-hidden="true">
                      <Store className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="text-gray-900 font-medium text-xs">
                      <div className="truncate font-semibold">{product.name}</div>
                      <div className="flex justify-between items-center mt-0.5">
                        <span className="text-gray-800 font-bold">{peso(product.price)}</span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${outOfStock ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}
                        >
                          Stock: {product.stock}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: order details */}
      <aside className="w-full lg:w-80 xl:w-88 bg-[#FAF7F5] rounded-2xl p-4 flex flex-col h-full min-h-0 shadow-lg border border-gray-100 shrink-0">
        <div className="flex justify-between items-center mb-2 shrink-0">
          <h2 className="text-base font-bold text-gray-900">Order Details</h2>
          <button
            type="button"
            onClick={handleHoldSale}
            disabled={cart.length === 0}
            className="text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 px-2 py-1 rounded transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hold Sale
          </button>
        </div>
        <hr className="border-gray-200 mb-2 shrink-0" />

        <div className="flex-1 overflow-y-auto space-y-2 pr-1 mb-2 min-h-0">
          {cart.length === 0 ? (
            <div className="text-center py-6 text-gray-500 text-xs">Cart is empty</div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg p-2 shadow-sm border border-gray-100 flex items-center justify-between text-xs"
              >
                <div>
                  <h4 className="font-semibold text-gray-900 text-xs">{item.name}</h4>
                  <span className="text-[11px] text-gray-600 font-medium">
                    {amount(item.unitPrice)}
                  </span>
                </div>

                <div className="text-right flex flex-col items-end gap-1">
                  <span className="font-bold text-xs text-gray-900">
                    {peso(item.unitPrice * item.quantity)}
                  </span>
                  <div className="flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded-full border border-gray-200">
                    <button
                      type="button"
                      onClick={() => handleUpdateQuantity(item.id, -1)}
                      className="text-gray-700 hover:text-black p-0.5 cursor-pointer"
                      aria-label={`Decrease ${item.name}`}
                    >
                      <Minus className="w-2.5 h-2.5" />
                    </button>
                    <span className="font-semibold text-[11px] px-0.5 min-w-[10px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleUpdateQuantity(item.id, 1)}
                      className="text-gray-700 hover:text-black p-0.5 cursor-pointer"
                      aria-label={`Increase ${item.name}`}
                    >
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-gray-500 hover:text-red-600 ml-0.5 p-0.5 cursor-pointer"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals + discount */}
        <div className="border-t border-gray-200 pt-2 mb-2 shrink-0 space-y-1">
          <div className="flex justify-between items-center text-xs text-gray-700">
            <span>Subtotal:</span>
            <span>{peso(subtotal)}</span>
          </div>

          {discountPercent > 0 && (
            <div className="flex justify-between items-center text-xs text-emerald-800 font-semibold">
              <span>Discount ({discountPercent}%):</span>
              <span>- {peso(discountAmount)}</span>
            </div>
          )}

          <div className="flex justify-between items-center pt-1">
            <span className="text-sm font-bold text-gray-900">Total:</span>
            <span className="text-base font-extrabold text-gray-900">{peso(cartTotal)}</span>
          </div>

          <button
            type="button"
            onClick={() => setShowDiscountModal(true)}
            className="w-full text-left text-[11px] font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 mt-1 cursor-pointer"
          >
            <Percent className="w-3 h-3" aria-hidden="true" />
            {discountPercent > 0 ? 'Change Discount' : 'Apply Supervisor Discount'}
          </button>
        </div>

        {/* Payment method — real radios */}
        <fieldset className="space-y-1 mb-3 shrink-0">
          <legend className="block text-[11px] font-semibold text-gray-700 mb-1">
            Payment Method
          </legend>
          {Object.keys(PAYMENT_METHOD_ENUM).map((method) => {
            const inputId = `pay-${method}`;
            const active = paymentMethod === method;
            return (
              <label
                key={method}
                htmlFor={inputId}
                className={`flex items-center gap-2 w-full p-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                  active
                    ? 'bg-white border-gray-500 shadow-sm text-gray-900'
                    : 'bg-white/60 border-transparent text-gray-600 hover:bg-white'
                }`}
              >
                <input
                  id={inputId}
                  type="radio"
                  name="paymentMethod"
                  value={method}
                  checked={active}
                  onChange={() => setPaymentMethod(method)}
                  className="accent-gray-800"
                />
                {method}
              </label>
            );
          })}
        </fieldset>

        {/* Cash tendered + change */}
        {paymentMethod === 'Cash' && cart.length > 0 && (
          <div className="mb-3 shrink-0">
            <label htmlFor="cash-tendered" className="block text-[11px] font-semibold text-gray-700 mb-1">
              Cash tendered
            </label>
            <input
              id="cash-tendered"
              type="number"
              min="0"
              step="0.01"
              value={cashTendered}
              onChange={(e) => setCashTendered(e.target.value)}
              placeholder="0.00"
              className="w-full bg-white border border-gray-300 rounded-lg px-2 py-1.5 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
            {cashTendered !== '' && (
              <div className={`mt-1 text-[11px] font-bold ${changeDue < 0 ? 'text-red-700' : 'text-emerald-800'}`}>
                {changeDue < 0
                  ? `Short by ${peso(Math.abs(changeDue))}`
                  : `Change: ${peso(changeDue)}`}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 shrink-0">
          <button
            type="button"
            onClick={handleClearCart}
            className="py-2 bg-[#C2B8B3] hover:bg-[#b2a7a1] text-gray-900 text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={handleConfirmSale}
            disabled={cart.length === 0 || checkingOut}
            className="py-2 bg-[#B8ADA7] hover:bg-[#a89c96] text-gray-900 text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {checkingOut ? 'Confirming…' : 'Confirm'}
          </button>
        </div>
      </aside>

      {/* Discount modal */}
      <Modal
        open={showDiscountModal}
        onClose={() => setShowDiscountModal(false)}
        title="Supervisor Approval"
        icon={Lock}
        size="xs"
        footer={
          <button
            type="button"
            onClick={handleApplyDiscount}
            disabled={authorizingDiscount}
            className="w-full py-2 bg-gray-800 hover:bg-black text-white rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-60"
          >
            {authorizingDiscount ? 'Authorizing…' : 'Authorize & Apply'}
          </button>
        }
      >
        <div className="space-y-3">
          <div>
            <label htmlFor="disc-pct" className="block text-[11px] font-semibold text-gray-700 mb-1">
              Discount Percentage (%)
            </label>
            <input
              id="disc-pct"
              type="number"
              min="0"
              max="100"
              value={tempDiscountInput}
              onChange={(e) => setTempDiscountInput(e.target.value)}
              className="w-full border rounded-lg p-2 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
          </div>

          <div>
            <label htmlFor="disc-pin" className="block text-[11px] font-semibold text-gray-700 mb-1">
              Supervisor Password
            </label>
            <input
              id="disc-pin"
              type="password"
              autoComplete="off"
              placeholder="Enter password"
              value={supervisorPin}
              onChange={(e) => setSupervisorPin(e.target.value)}
              className="w-full border rounded-lg p-2 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
          </div>

          {discountError && (
            <p role="alert" className="text-[11px] font-bold text-red-600">
              {discountError}
            </p>
          )}
        </div>
      </Modal>

      {/* Pending sales modal */}
      <Modal
        open={showPendingModal}
        onClose={() => setShowPendingModal(false)}
        title="Pending Sales Queue"
        icon={Clock}
        size="md"
      >
        <div className="space-y-2">
          {pendingSales.length === 0 ? (
            <p className="text-center text-xs text-gray-500 py-6">No sales on hold</p>
          ) : (
            pendingSales.map((item) => (
              <div key={item.id} className="p-3 bg-gray-50 border rounded-xl flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-gray-900">{item.id} ({item.timestamp})</div>
                  <div className="text-gray-600 text-[11px]">{item.cart.length} item(s)</div>
                  <div className="font-semibold text-gray-900 mt-0.5">{peso(item.total)}</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRestorePendingSale(item)}
                  className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-bold text-xs cursor-pointer"
                >
                  Resume
                </button>
              </div>
            ))
          )}
        </div>
      </Modal>

      {/* X-Reading / EOD modal */}
      <Modal
        open={showEODModal}
        onClose={() => setShowEODModal(false)}
        title="X-Reading / Cashier Accountability"
        icon={Banknote}
        size="lg"
        footer={
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleExportReport}
              className="py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              Export X-Reading
            </button>
            <button
              type="button"
              onClick={handleSubmitReconciliation}
              className="py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              Submit Reconciliation
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <p className="text-xs text-gray-600 font-medium">
            Input physical cash denomination quantities:
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {DENOMINATIONS.map((denom) => {
              const inputId = `denom-${denom.key}`;
              return (
                <div key={denom.key} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200">
                  <label htmlFor={inputId} className="font-semibold text-gray-800">
                    {denom.label}
                  </label>
                  <input
                    id={inputId}
                    type="number"
                    min="0"
                    value={cashDenominations[denom.key] === 0 ? '' : cashDenominations[denom.key]}
                    placeholder="0"
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => handleDenominationChange(denom.key, e.target.value)}
                    className="w-16 border rounded p-1 text-center font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                  />
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-gray-100 rounded-xl space-y-1.5 text-xs">
            <div className="flex justify-between font-medium text-gray-700">
              <span>Gross sales (today):</span>
              <span className="font-bold text-gray-900">{peso(xReading.grossSales)}</span>
            </div>
            <div className="flex justify-between font-medium text-gray-700">
              <span>Total discounts (today):</span>
              <span className="font-bold text-gray-900">{peso(xReading.totalDiscount)}</span>
            </div>
            <div className="flex justify-between font-medium text-gray-700">
              <span>Net sales (today):</span>
              <span className="font-bold text-gray-900">{peso(xReading.netSales)}</span>
            </div>
            <div className="flex justify-between font-medium text-gray-700 border-t border-gray-300 pt-1">
              <span>Cashier Cash (Counted):</span>
              <span className="font-bold text-gray-900">{peso(totalCountedCash)}</span>
            </div>
            <div className="flex justify-between font-medium text-gray-700">
              <span>POS Cash (Expected):</span>
              <span className="font-bold text-gray-900">{peso(xReading.posCash)}</span>
            </div>
            <div className="flex justify-between font-bold border-t border-gray-300 pt-1 text-sm">
              <span>Short / Over:</span>
              <span className={shortOver < 0 ? 'text-red-700' : shortOver > 0 ? 'text-emerald-800' : 'text-gray-900'}>
                {peso(shortOver)}
              </span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
