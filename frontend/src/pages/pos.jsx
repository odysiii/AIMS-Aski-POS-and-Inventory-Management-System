import React, { useState } from "react";
import {
  Search,
  ChevronDown,
  Clock,
  X,
  Trash2,
  Banknote,
  Bell,
  ShoppingCart,
  CheckCircle2
} from "lucide-react";

export default function POSInterface() {
  // State management
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  // Confirmation Modal State
  const [lastTransaction, setLastTransaction] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Pending Sales States
  const [pendingSales, setPendingSales] = useState([]);
  const [showPendingModal, setShowPendingModal] = useState(false);

  // EOD & Sales History States
  const [completedSales, setCompletedSales] = useState([]);
  const [showEODModal, setShowEODModal] = useState(false);

  // Cash Denominations State for X-Reading
  const [denominations, setDenominations] = useState({
    1000: 0,
    500: 0,
    200: 0,
    100: 0,
    50: 0,
    20: 0,
    10: 0,
    5: 0,
    1: 0,
    0.25: 0,
  });

  const denominationList = [
    { label: "₱1,000.00 Note", value: 1000 },
    { label: "₱500.00 Note", value: 500 },
    { label: "₱200.00 Note", value: 200 },
    { label: "₱100.00 Note", value: 100 },
    { label: "₱50.00 Note", value: 50 },
    { label: "₱20.00 Note", value: 20 },
    { label: "₱10.00 Coin", value: 10 },
    { label: "₱5.00 Coin", value: 5 },
    { label: "₱1.00 Coin", value: 1 },
    { label: "₱0.25 Coin", value: 0.25 },
  ];

  // Sample Product Data
  const products = [
    { id: 1, name: "Product 1", price: 150.0, stock: 20 },
    { id: 2, name: "Product 2", price: 250.0, stock: 15 },
    { id: 3, name: "Product 3", price: 99.0, stock: 50 },
    { id: 4, name: "Product 4", price: 450.0, stock: 10 },
    { id: 5, name: "Product 5", price: 1200.0, stock: 5 },
    { id: 6, name: "Product 6", price: 80.0, stock: 30 },
    { id: 7, name: "Product 7", price: 150.0, stock: 25 },
    { id: 8, name: "Product 8", price: 200.0, stock: 15 },
  ];

  // Filtering products
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculations
  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Cart Handlers
  const handleAddToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleHoldSale = () => {
    if (cart.length === 0) return;
    const newPendingOrder = {
      id: `PEND-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      cart: [...cart],
      total: totalAmount,
    };
    setPendingSales((prev) => [...prev, newPendingOrder]);
    handleClearCart();
  };

  const handleRestorePendingSale = (pendingOrder) => {
    setCart(pendingOrder.cart);
    setPendingSales((prev) =>
      prev.filter((order) => order.id !== pendingOrder.id)
    );
    setShowPendingModal(false);
  };

  const handleConfirmSale = () => {
    if (cart.length === 0) return;

    const newSale = {
      id: `TXN-${Date.now().toString().slice(-5)}`,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      cart: [...cart],
      total: totalAmount,
      paymentMethod,
    };

    setCompletedSales((prev) => [...prev, newSale]);
    setLastTransaction(newSale);
    setShowSuccessModal(true);
    setCart([]);
  };

  const handleUpdateQuantity = (id, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
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

  const handleDenominationChange = (value, count) => {
    const qty = parseInt(count, 10) || 0;
    setDenominations((prev) => ({
      ...prev,
      [value]: qty >= 0 ? qty : 0,
    }));
  };

  const totalCountedCash = Object.entries(denominations).reduce(
    (sum, [denomValue, count]) => sum + Number(denomValue) * count,
    0
  );

  const expectedCash = completedSales
    .filter((sale) => sale.paymentMethod === "Cash")
    .reduce((sum, sale) => sum + sale.total, 0);

  const shortOrOver = totalCountedCash - expectedCash;

  const handleExportXReading = () => {
    const reportData = {
      countedCash: totalCountedCash,
      expectedCash: expectedCash,
      variance: shortOrOver,
      denominationsUsed: denominations,
      generatedAt: new Date().toLocaleString(),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `X-Reading_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmitReconciliation = () => {
    setShowEODModal(false);
  };

  return (
    <div className="flex h-screen w-full bg-gradient-to-br from-[#DCE8F6] via-[#E6F0FA] to-[#EDF4FC] p-4 gap-4 font-sans overflow-hidden box-border">
      
      {/* 1. LEFT SECTION: MAIN POS PRODUCTS INTERFACE */}
      <div className="flex-1 flex flex-col min-h-0 gap-4">
        
        {/* Header Bar */}
        <div className="bg-white/70 backdrop-blur-xl rounded-[24px] px-6 py-3.5 flex items-center justify-between border border-white/80 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.04)] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-blue-500 tracking-wider uppercase block">
                AMPC
              </span>
              <h1 className="text-base font-black text-slate-800 tracking-tight">
                POINT OF SALE
              </h1>
            </div>
          </div>

          {/* Center Toggle Pill */}
          <div className="bg-slate-100/80 backdrop-blur-md rounded-full p-1 border border-slate-200/60 flex items-center gap-1">
            <button
              onClick={() => setShowPendingModal(true)}
              className="px-5 py-2 bg-white text-slate-800 rounded-full text-xs font-bold flex items-center gap-2 shadow-xs hover:bg-blue-50 transition-all cursor-pointer"
            >
              Pending Sale
              {pendingSales.length > 0 && (
                <span className="bg-blue-600 text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center font-bold">
                  {pendingSales.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowEODModal(true)}
              className="px-5 py-2 text-slate-600 hover:text-slate-900 rounded-full text-xs font-bold transition-all cursor-pointer"
            >
              End of the Day Sale
            </button>
          </div>

          {/* Right Bell Icon */}
          <button className="w-9 h-9 bg-white border border-slate-200/80 rounded-full flex items-center justify-center text-slate-600 shadow-xs hover:bg-slate-50 cursor-pointer">
            <Bell className="w-4 h-4" />
          </button>
        </div>

        {/* Filters & Search Controls Bar */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setSelectedCategory("All")}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-full text-xs shadow-md shadow-blue-500/20 cursor-pointer hover:opacity-95 transition-all"
          >
            All Products
          </button>

          {/* Supplier Dropdown */}
          <div className="relative flex items-center">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none bg-white/80 backdrop-blur-md text-slate-600 border border-white/90 pl-4 pr-10 py-2.5 rounded-full text-xs font-bold focus:outline-none cursor-pointer shadow-xs"
            >
              <option value="All">Select Supplier</option>
              <option value="Supplier A">Supplier A</option>
              <option value="Supplier B">Supplier B</option>
              <option value="Supplier C">Supplier C</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 pointer-events-none" />
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/80 backdrop-blur-md text-slate-700 pl-10 pr-4 py-2.5 rounded-full text-xs font-semibold focus:outline-none border border-white/90 shadow-xs placeholder-slate-400"
            />
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-y-auto min-h-0 pr-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => handleAddToCart(product)}
                className="bg-white/80 backdrop-blur-xl rounded-[24px] p-3.5 flex flex-col cursor-pointer border border-white/90 shadow-[0_10px_20px_-8px_rgba(0,0,0,0.05)] hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <div className="bg-slate-100/90 rounded-2xl h-28 w-full mb-3 flex items-center justify-center text-slate-300 font-bold text-xs">
                  [Image]
                </div>
                <div className="text-slate-800 font-extrabold text-xs truncate">
                  {product.name}
                </div>
                <div className="text-blue-600 font-black text-xs mt-1">
                  PHP {Number(product.price || 0).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. RIGHT SECTION: ORDER DETAILS PANEL */}
      <div className="w-full lg:w-88 xl:w-96 bg-white/80 backdrop-blur-2xl rounded-[28px] p-6 flex flex-col h-full min-h-0 border border-white/90 shadow-[0_15px_30px_-10px_rgba(0,0,0,0.08)] shrink-0">
        
        {/* Panel Title */}
        <div className="flex justify-between items-center mb-4 shrink-0">
          <h2 className="text-base font-black text-slate-800 tracking-tight">
            Order Details
          </h2>
          <button
            onClick={handleHoldSale}
            disabled={cart.length === 0}
            className="text-xs underline font-extrabold text-slate-400 hover:text-slate-600 tracking-wider uppercase cursor-pointer disabled:opacity-40"
          >
            HOLD SALE
          </button>
        </div>

        {/* Itemized Cart Items */}
        <div className="flex-1 overflow-y-auto min-h-0 my-2 space-y-2.5 pr-1">
          {cart.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs font-semibold">
              No items in order
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="bg-slate-50/90 border border-slate-100 rounded-2xl p-3 flex flex-col gap-2 shadow-2xs"
              >
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-slate-800 truncate max-w-[140px]">
                    {item.name}
                  </span>
                  <span className="text-xs font-black text-slate-900">
                    PHP {(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center mt-1">
                  <span className="text-[11px] font-medium text-slate-400">
                    PHP {Number(item.price).toFixed(2)}
                  </span>

                  {/* Quantity Actions */}
                  <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-2 py-0.5 shadow-2xs">
                    <button
                      onClick={() => handleUpdateQuantity(item.id, -1)}
                      className="text-slate-400 hover:text-slate-700 text-xs font-bold px-1 transition-colors cursor-pointer"
                    >
                      −
                    </button>
                    <span className="text-xs font-bold text-slate-800 min-w-[14px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, 1)}
                      className="text-slate-400 hover:text-slate-700 text-xs font-bold px-1 transition-colors cursor-pointer"
                    >
                      +
                    </button>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="ml-1 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center hover:bg-rose-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Total Calculation Display */}
        <div className="border-t border-slate-100 pt-4 my-3 shrink-0">
          <div className="flex justify-between items-center text-sm font-black text-slate-900">
            <span>TOTAL</span>
            <span className="text-base text-blue-600">
              PHP {totalAmount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-2 mb-5 shrink-0">
          <label className="block text-xs font-extrabold text-slate-700 mb-1">
            Payment Method
          </label>
          {["Cash", "Card", "E-wallet"].map((method) => (
            <label
              key={method}
              onClick={() => setPaymentMethod(method)}
              className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-2xl text-xs font-bold cursor-pointer transition-all ${
                paymentMethod === method
                  ? "bg-blue-100/80 text-blue-900 border border-blue-200"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  paymentMethod === method
                    ? "border-blue-600 bg-white"
                    : "border-slate-300"
                }`}
              >
                {paymentMethod === method && (
                  <div className="w-2 h-2 rounded-full bg-blue-600" />
                )}
              </div>
              {method}
            </label>
          ))}
        </div>

        {/* Clear & Confirm Action Buttons */}
        <div className="grid grid-cols-2 gap-3 shrink-0">
          <button
            onClick={handleClearCart}
            className="py-3 bg-sky-200/80 hover:bg-sky-300 text-sky-900 text-xs font-black tracking-wider uppercase rounded-full transition-all cursor-pointer"
          >
            CLEAR
          </button>
          <button
            onClick={handleConfirmSale}
            disabled={cart.length === 0}
            className="py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-95 text-white text-xs font-black tracking-wider uppercase rounded-full transition-all shadow-md shadow-blue-500/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            CONFIRM
          </button>
        </div>
      </div>

      {/* --- MODAL 1: TRANSACTION SUCCESS POPUP --- */}
      {showSuccessModal && lastTransaction && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[28px] p-6 w-full max-w-sm shadow-2xl flex flex-col items-center text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-md shadow-emerald-500/10">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="font-extrabold text-slate-800 text-lg">
                Sale Confirmed!
              </h3>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">
                Transaction ID: {lastTransaction.id}
              </p>
            </div>

            <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span>Payment Method</span>
                <span className="font-bold text-slate-800">
                  {lastTransaction.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Items Sold</span>
                <span className="font-bold text-slate-800">
                  {lastTransaction.cart.reduce((sum, item) => sum + item.quantity, 0)} pcs
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-200/60 pt-2 font-black text-sm text-slate-900">
                <span>Total Amount</span>
                <span className="text-blue-600">
                  PHP {lastTransaction.total.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-md shadow-blue-500/20 cursor-pointer transition-all"
            >
              Done / Next Sale
            </button>
          </div>
        </div>
      )}

      {/* --- MODAL 2: PENDING SALES OVERLAY --- */}
      {showPendingModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[28px] p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                Pending Sales Queue
              </h3>
              <button
                onClick={() => setShowPendingModal(false)}
                className="p-1 hover:bg-slate-100 rounded-full cursor-pointer"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {pendingSales.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-6">
                  No sales on hold
                </p>
              ) : (
                pendingSales.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 bg-slate-50 rounded-2xl flex items-center justify-between text-xs border border-slate-100"
                  >
                    <div>
                      <div className="font-bold text-slate-800">
                        {item.id} ({item.timestamp})
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        {item.cart.length} item(s)
                      </div>
                      <div className="font-black text-blue-600 mt-0.5">
                        PHP {item.total.toFixed(2)}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRestorePendingSale(item)}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs cursor-pointer transition-all"
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

      {/* --- MODAL 3: X-READING / CASHIER ACCOUNTABILITY --- */}
      {showEODModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[28px] p-6 w-full max-w-xl shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Banknote className="text-emerald-600 font-black" />
                X-Reading / Cashier Accountability
              </h3>
              <button
                onClick={() => setShowEODModal(false)}
                className="p-1 hover:bg-slate-100 rounded-full cursor-pointer transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <p className="text-xs font-semibold text-slate-500 -mt-2">
              Input physical cash denomination quantities:
            </p>

            <div className="grid grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
              {denominationList.map((item) => (
                <div
                  key={item.value}
                  className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-2xl"
                >
                  <span className="text-xs font-bold text-slate-700">
                    {item.label}
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={denominations[item.value] || 0}
                    onChange={(e) =>
                      handleDenominationChange(item.value, e.target.value)
                    }
                    className="w-20 px-2 py-1 bg-white border border-slate-200 rounded-xl text-xs font-bold text-center text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              ))}
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600 font-semibold">
                  Cashier Cash (Counted):
                </span>
                <span className="font-black text-slate-900">
                  PHP {totalCountedCash.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600 font-semibold">
                  POS Cash (Expected):
                </span>
                <span className="font-black text-slate-900">
                  PHP {expectedCash.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm font-black border-t border-slate-200/60 pt-2 mt-1">
                <span className="text-slate-900">Short / Over:</span>
                <span
                  className={
                    shortOrOver < 0 ? "text-rose-600" : "text-emerald-600"
                  }
                >
                  PHP {shortOrOver.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={handleExportXReading}
                className="py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                Export X-Reading
              </button>
              <button
                onClick={handleSubmitReconciliation}
                className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs transition-all cursor-pointer shadow-sm"
              >
                Submit Reconciliation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}