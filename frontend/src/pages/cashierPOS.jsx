import React, { useState, useEffect } from 'react';
import { 
  Search, Trash2, ChevronDown, Plus, Minus, Store, 
  Lock, Clock, Banknote, X, Percent, CheckCircle 
} from 'lucide-react';

export default function CashierPOS() {
  // LIVE BACKEND STATES
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  const [cart, setCart] = useState([]);

  // FEATURE 1: Supervisor Discount States
  const [discountPercent, setDiscountPercent] = useState(0);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [supervisorPassword, setSupervisorPassword] = useState("");
  const [tempDiscountInput, setTempDiscountInput] = useState(10);
  const [discountError, setDiscountError] = useState("");

  // FEATURE 2: Pending Transactions States
  const [pendingSales, setPendingSales] = useState([]);
  const [showPendingModal, setShowPendingModal] = useState(false);

  // FEATURE 3: End of Day Reconciliation States
  const [showEODModal, setShowEODModal] = useState(false);
  const [cashDenominations, setCashDenominations] = useState({
    p1000: 0, p500: 0, p200: 0, p100: 0, p50: 0, p20: 0,
    p10: 0, p5: 0, p1: 0, c25: 0
  });

  // 1. FETCH PRODUCTS FROM POSTGRESQL BACKEND
  const fetchProducts = () => {
    fetch('http://localhost:5000/api/products')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch products');
        return res.json();
      })
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching products:', err);
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // CART CALCULATIONS
  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const cartTotal = Math.max(0, subtotal - discountAmount);

  // Cart Handler Functions
  const handleAddToCart = (product) => {
    if (product.stock <= 0) {
      alert("Item is out of stock!");
      return;
    }

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert(`Cannot add more than remaining stock (${product.stock})`);
          return prevCart;
        }
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { id: product.id, name: product.name, unitPrice: product.price, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (id, delta) => {
    const targetProduct = products.find(p => p.id === id);

    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            if (targetProduct && newQty > targetProduct.stock) {
              alert(`Cannot exceed available stock of ${targetProduct.stock}`);
              return item;
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const handleRemoveItem = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    setCart([]);
    setDiscountPercent(0);
  };

  // FEATURE 1: Discount Authorization Logic
  const handleApplyDiscount = () => {
    if (supervisorPassword === "super123") {
      setDiscountPercent(Number(tempDiscountInput));
      setShowDiscountModal(false);
      setSupervisorPassword("");
      setDiscountError("");
    } else {
      setDiscountError("Invalid Supervisor Password!");
    }
  };

  // FEATURE 2: Park/Hold Sale Logic
  const handleHoldSale = () => {
    if (cart.length === 0) return;
    const newPendingOrder = {
      id: `PEND-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      cart: [...cart],
      discountPercent,
      total: cartTotal
    };
    setPendingSales((prev) => [...prev, newPendingOrder]);
    handleClearCart();
  };

  const handleRestorePendingSale = (pendingOrder) => {
    setCart(pendingOrder.cart);
    setDiscountPercent(pendingOrder.discountPercent);
    setPendingSales((prev) => prev.filter((o) => o.id !== pendingOrder.id));
    setShowPendingModal(false);
  };

  // 2. SUBMIT CONFIRMED TRANSACTION TO POSTGRESQL BACKEND
  const handleConfirmSale = async () => {
    if (cart.length === 0) {
      alert("Cart is empty!");
      return;
    }

    const payload = {
      items: cart.map((item) => ({
        productId: item.id,
        name: item.name,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
      })),
      subtotal,
      discountPercent,
      discountAmount,
      totalAmount: cartTotal,
      paymentMethod: paymentMethod.toUpperCase(),
      cashierId: 'CASHIER-1',
    };

    try {
      const response = await fetch('http://localhost:5000/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert(`Transaction successful! PHP ${cartTotal.toFixed(2)} recorded to PostgreSQL.`);
        handleClearCart();
        fetchProducts(); // Refresh product list to show updated stock counts
      } else {
        alert("Transaction failed to process.");
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert("Error connecting to server!");
    }
  };

  // FEATURE 3: EOD Cash Denomination Totaling
  const calculatePhysicalCash = () => {
    return (
      (cashDenominations.p1000 * 1000) +
      (cashDenominations.p500 * 500) +
      (cashDenominations.p200 * 200) +
      (cashDenominations.p100 * 100) +
      (cashDenominations.p50 * 50) +
      (cashDenominations.p20 * 20) +
      (cashDenominations.p10 * 10) +
      (cashDenominations.p5 * 5) +
      (cashDenominations.p1 * 1) +
      (cashDenominations.c25 * 0.25)
    );
  };

  const expectedSales = 15498.00; // Example system expected total
  const totalCountedCash = calculatePhysicalCash();
  const variance = totalCountedCash - expectedSales;

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#EAE8FE] font-bold text-gray-700">
        Loading inventory from PostgreSQL...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full w-full items-center justify-center bg-[#EAE8FE] gap-2">
        <p className="text-red-600 font-bold">Failed to load inventory: {error}</p>
        <button onClick={fetchProducts} className="px-4 py-1.5 bg-gray-800 text-white rounded-lg text-xs font-bold">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-[#EAE8FE] p-4 gap-4 font-sans overflow-hidden box-border">
      
      {/* LEFT SECTION: PRODUCT CATALOG */}
      <div className="flex-1 flex flex-col h-full min-h-0 bg-transparent">
        
        {/* Top Header Title & Action Buttons */}
        <div className="flex items-center justify-between gap-3 mb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-white shrink-0 shadow-sm">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-gray-800 uppercase tracking-wide leading-tight">
                ASKI MULTI-COOP
              </h1>
              <p className="text-xs font-semibold text-gray-500 leading-tight">
                Isynergies, Inc.
              </p>
            </div>
          </div>

          {/* EOD & Pending Actions Header Toolbar */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPendingModal(true)}
              className="relative px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Clock className="w-4 h-4" />
              Pending
              {pendingSales.length > 0 && (
                <span className="ml-1 bg-amber-600 text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center">
                  {pendingSales.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setShowEODModal(true)}
              className="px-3 py-1.5 bg-gray-800 hover:bg-black text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Banknote className="w-4 h-4" />
              End of Day
            </button>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-wrap items-center gap-2 mb-3 shrink-0">
          <button
            onClick={() => setSelectedCategory("All")}
            className={`px-4 py-1.5 rounded-full font-medium shadow-sm transition-colors text-xs ${
              selectedCategory === "All"
                ? "bg-white text-gray-800 border border-gray-200"
                : "bg-gray-200/70 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All Products
          </button>

          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none bg-gray-200/80 text-gray-600 pl-3 pr-8 py-1.5 rounded-full text-xs font-medium focus:outline-none cursor-pointer"
            >
              <option value="All">Select Category</option>
              <option value="Seeds">Seeds</option>
              <option value="Fertilizers">Fertilizers</option>
              <option value="Feeds">Feeds</option>
              <option value="Pesticides">Pesticides</option>
              <option value="Tools">Tools</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="relative flex-1 max-w-xs ml-auto">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-200/80 text-gray-700 pl-8 pr-3 py-1.5 rounded-full text-xs focus:outline-none placeholder-gray-400"
            />
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 bg-[#F5F2F0] rounded-2xl p-3 overflow-y-auto min-h-0 shadow-inner">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => handleAddToCart(product)}
                className="bg-gray-300 rounded-xl p-2.5 flex flex-col justify-between cursor-pointer hover:bg-gray-400/80 transition-all border border-gray-300/50"
              >
                <div className="bg-white rounded-lg h-20 w-full flex items-center justify-center mb-2">
                  <Store className="w-5 h-5 text-gray-400" />
                </div>
                <div className="text-gray-800 font-medium text-xs">
                  <div className="truncate font-semibold">{product.name}</div>
                  <div className="flex justify-between items-center mt-0.5">
                    <span className="text-gray-600 font-bold">
                      PHP {Number(product.price).toFixed(2)}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${product.stock > 0 ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
                      Stock: {product.stock}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT SECTION: ORDER DETAILS */}
      <div className="w-full lg:w-80 xl:w-88 bg-[#FAF7F5] rounded-2xl p-4 flex flex-col h-full min-h-0 shadow-lg border border-gray-100 shrink-0">
        
        <div className="flex justify-between items-center mb-2 shrink-0">
          <h2 className="text-base font-bold text-gray-900">Order Details</h2>
          <button
            onClick={handleHoldSale}
            disabled={cart.length === 0}
            className="text-xs font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 px-2 py-1 rounded transition-colors disabled:opacity-50"
          >
            Hold Sale
          </button>
        </div>
        <hr className="border-gray-200 mb-2 shrink-0" />

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 mb-2 min-h-0">
          {cart.length === 0 ? (
            <div className="text-center py-6 text-gray-400 text-xs">Cart is empty</div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg p-2 shadow-sm border border-gray-100 flex items-center justify-between text-xs"
              >
                <div>
                  <h4 className="font-semibold text-gray-800 text-xs">{item.name}</h4>
                  <span className="text-[11px] text-gray-500 font-medium">
                    {item.unitPrice.toFixed(2)}
                  </span>
                </div>

                <div className="text-right flex flex-col items-end gap-1">
                  <span className="font-bold text-xs text-gray-900">
                    PHP {(item.unitPrice * item.quantity).toFixed(2)}
                  </span>
                  <div className="flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded-full border border-gray-200">
                    <button onClick={() => handleUpdateQuantity(item.id, -1)} className="text-gray-600 hover:text-black p-0.5">
                      <Minus className="w-2.5 h-2.5" />
                    </button>
                    <span className="font-semibold text-[11px] px-0.5 min-w-[10px] text-center">
                      {item.quantity}
                    </span>
                    <button onClick={() => handleUpdateQuantity(item.id, 1)} className="text-gray-600 hover:text-black p-0.5">
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                    <button onClick={() => handleRemoveItem(item.id)} className="text-gray-400 hover:text-red-500 ml-0.5 p-0.5">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Total Summary Row & Discount Trigger */}
        <div className="border-t border-gray-200 pt-2 mb-2 shrink-0 space-y-1">
          <div className="flex justify-between items-center text-xs text-gray-600">
            <span>Subtotal:</span>
            <span>PHP {subtotal.toFixed(2)}</span>
          </div>

          {/* Applied Discount Line */}
          {discountPercent > 0 && (
            <div className="flex justify-between items-center text-xs text-emerald-700 font-semibold">
              <span>Discount ({discountPercent}%):</span>
              <span>- PHP {discountAmount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between items-center pt-1">
            <span className="text-sm font-bold text-gray-800">Total:</span>
            <span className="text-base font-extrabold text-gray-900">
              PHP {cartTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <button
            onClick={() => setShowDiscountModal(true)}
            className="w-full text-left text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mt-1"
          >
            <Percent className="w-3 h-3" />
            {discountPercent > 0 ? "Change Discount" : "Apply Supervisor Discount"}
          </button>
        </div>

        {/* Payment Options */}
        <div className="space-y-1 mb-3 shrink-0">
          <label className="block text-[11px] font-semibold text-gray-600 mb-1">
            Payment Method
          </label>
          {["Cash", "Card", "E-wallet"].map((method) => (
            <label
              key={method}
              onClick={() => setPaymentMethod(method)}
              className={`flex items-center gap-2 w-full p-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                paymentMethod === method
                  ? "bg-white border-gray-400 shadow-sm text-gray-800"
                  : "bg-white/60 border-transparent text-gray-500 hover:bg-white"
              }`}
            >
              <div
                className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === method ? "border-gray-700 bg-gray-700" : "border-gray-300"
                }`}
              >
                {paymentMethod === method && <div className="w-1 h-1 rounded-full bg-white" />}
              </div>
              {method}
            </label>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 shrink-0">
          <button
            onClick={handleClearCart}
            className="py-2 bg-[#C2B8B3] hover:bg-[#b2a7a1] text-gray-800 text-xs font-bold rounded-lg transition-colors"
          >
            Clear
          </button>
          <button
            onClick={handleConfirmSale}
            disabled={cart.length === 0}
            className="py-2 bg-[#B8ADA7] hover:bg-[#a89c96] text-gray-900 text-xs font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            Confirm
          </button>
        </div>

      </div>

      {/* --- MODAL 1: SUPERVISOR DISCOUNT AUTHORIZATION --- */}
      {showDiscountModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-xs shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-amber-600" />
                Supervisor Approval
              </h3>
              <button onClick={() => setShowDiscountModal(false)}>
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">Discount Percentage (%)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={tempDiscountInput}
                  onChange={(e) => setTempDiscountInput(e.target.value)}
                  className="w-full border rounded-lg p-2 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">Supervisor Password</label>
                <input
                  type="password"
                  placeholder="Enter Password (super123)"
                  value={supervisorPassword}
                  onChange={(e) => setSupervisorPassword(e.target.value)}
                  className="w-full border rounded-lg p-2 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
              </div>

              {discountError && (
                <p className="text-[11px] font-bold text-red-500">{discountError}</p>
              )}
            </div>

            <button
              onClick={handleApplyDiscount}
              className="w-full py-2 bg-gray-800 hover:bg-black text-white rounded-lg text-xs font-bold transition-all"
            >
              Authorize & Apply
            </button>
          </div>
        </div>
      )}

      {/* --- MODAL 2: PENDING SALES AREA --- */}
      {showPendingModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600" />
                Pending Sales Queue
              </h3>
              <button onClick={() => setShowPendingModal(false)}>
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {pendingSales.length === 0 ? (
                <p className="text-center text-xs text-gray-400 py-6">No sales on hold</p>
              ) : (
                pendingSales.map((item) => (
                  <div key={item.id} className="p-3 bg-gray-50 border rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-gray-800">{item.id} ({item.timestamp})</div>
                      <div className="text-gray-500 text-[11px]">{item.cart.length} item(s)</div>
                      <div className="font-semibold text-gray-900 mt-0.5">PHP {item.total.toFixed(2)}</div>
                    </div>
                    <button
                      onClick={() => handleRestorePendingSale(item)}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs"
                    >
                      Resume
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 3: END OF DAY RECONCILIATION --- */}
      {showEODModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-lg shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center border-b pb-2 shrink-0">
              <h3 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                <Banknote className="w-4 h-4 text-emerald-700" />
                End of Day Cash Reconciliation
              </h3>
              <button onClick={() => setShowEODModal(false)}>
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              <p className="text-xs text-gray-500 font-medium">Input physical cash denomination quantities below:</p>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { label: "₱1000 Bill", key: "p1000" },
                  { label: "₱500 Bill", key: "p500" },
                  { label: "₱200 Bill", key: "p200" },
                  { label: "₱100 Bill", key: "p100" },
                  { label: "₱50 Bill", key: "p50" },
                  { label: "₱20 Bill", key: "p20" },
                  { label: "₱10 Coin", key: "p10" },
                  { label: "₱5 Coin", key: "p5" },
                  { label: "₱1 Coin", key: "p1" },
                  { label: "25¢ Coin", key: "c25" },
                ].map((denom) => (
                  <div key={denom.key} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border">
                    <span className="font-semibold text-gray-700">{denom.label}</span>
                    <input
                      type="number"
                      min="0"
                      value={cashDenominations[denom.key]}
                      onChange={(e) =>
                        setCashDenominations({ ...cashDenominations, [denom.key]: Number(e.target.value) })
                      }
                      className="w-16 border rounded p-1 text-center font-bold text-gray-800"
                    />
                  </div>
                ))}
              </div>

              {/* Reconciliation Audit Box */}
              <div className="p-3 bg-gray-100 rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between font-medium text-gray-600">
                  <span>Counted Cash:</span>
                  <span className="font-bold text-gray-800">PHP {totalCountedCash.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium text-gray-600">
                  <span>Expected System Cash:</span>
                  <span className="font-bold text-gray-800">PHP {expectedSales.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-1 text-sm">
                  <span>Variance:</span>
                  <span className={variance >= 0 ? "text-emerald-700" : "text-red-600"}>
                    PHP {variance.toFixed(2)} {variance >= 0 ? "(Over)" : "(Short)"}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                alert(`Reconciliation submitted! Cash Variance: PHP ${variance.toFixed(2)}`);
                setShowEODModal(false);
              }}
              className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-all shrink-0"
            >
              Submit Reconciliation
            </button>
          </div>
        </div>
      )}

    </div>
  );
}