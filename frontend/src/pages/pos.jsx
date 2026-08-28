import React, { useState } from "react";
import { Search, ChevronDown, Clock, X, Trash2, Banknote } from "lucide-react";


export default function POSInterface() {
  // State management
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("Cash");

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

  // Denominations Configuration List
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
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    const matchesSearch = product.name .toLowerCase() .includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculations
  const totalAmount = cart.reduce( (sum, item) => sum + item.price * item.quantity, 0);

  // Cart Handlers
  const handleAddToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      } return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const handleClearCart = () => { setCart([]);};

  const handleHoldSale = () => {
    if (cart.length === 0) return;
    const newPendingOrder = {
      id: `PEND-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      cart: [...cart],
      total: totalAmount
    };
    setPendingSales((prev) => [...prev, newPendingOrder]);
    handleClearCart();
  };

  const handleRestorePendingSale = (pendingOrder) => {
    setCart(pendingOrder.cart);
    setPendingSales((prev) => prev.filter((order) => order.id !== pendingOrder.id));
    setShowPendingModal(false);
  };

  const handleConfirmSale = async () => {
    if (cart.length === 0) return;

    const newSale = {
      id: `TXN-${Date.now().toString().slice(-5)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      cart: [...cart],
      total: totalAmount,
      paymentMethod
    };

    setCompletedSales((prev) => [...prev, newSale]);
    alert("Sale Confirmed!");
    setCart([]);
  };

  // Quantity and Item Removal Handlers
  const handleUpdateQuantity = (id, delta) => {
    setCart((prevCart) =>
      prevCart .map((item) => {
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

  // X-Reading Accountability Logic
  const handleDenominationChange = (value, count) => {
    const qty = parseInt(count, 10) || 0;
    setDenominations((prev) => ({
      ...prev,
      [value]: qty >= 0 ? qty : 0,
    }));
  };

  const totalCountedCash = Object.entries(denominations).reduce(
    (sum, [denomValue, count]) => sum + Number(denomValue) * count, 0);

  const expectedCash = completedSales .filter((sale) => sale.paymentMethod === "Cash")
    .reduce((sum, sale) => sum + sale.total, 0);

  const shortOrOver = totalCountedCash - expectedCash;

  const handleOpenEODModal = () => { setShowEODModal(true); };

  const handleExportXReading = () => {
    const reportData = {
      countedCash: totalCountedCash,
      expectedCash: expectedCash,
      variance: shortOrOver,
      denominationsUsed: denominations,
      generatedAt: new Date().toLocaleString(),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json", });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `X-Reading_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmitReconciliation = () => {
    alert(`Reconciliation Submitted!\nVariance: PHP ${shortOrOver.toFixed(2)}`);
    setShowEODModal(false);
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full bg-[#EBF0F6] p-6 gap-6 font-sans overflow-hidden box-border">
      {/* LEFT SECTION: MAIN POS INTERFACE */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-6 shrink-0">
          {/* Logo Section */}
          <div className="flex flex-col items-center">
            <img src="/aski_logo.png" alt="AMPC Point of Sale" className="h-12 object-contain"/>
            <span className="text-[15px] font-black text-[#27136C] tracking-wider uppercase -mt-0.5 ">Point of Sale</span>
          </div>

          {/* Center Toggle Pill */}
          <div className="bg-white/80 backdrop-blur-md rounded-full p-1.5 shadow-sm border border-gray-100 flex items-center gap-2">
            <button onClick={() => setShowPendingModal(true)}
              className="px-5 py-2 bg-[#92B5F6]/30 text-gray-800 rounded-full text-xs font-bold flex items-center gap-2 hover:bg-[#92B5F6]/50 transition-all cursor-pointer">
              Pending Sale 
              {pendingSales.length > 0 && (
                <span className="bg-blue-600 text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center">
                  {pendingSales.length}
                </span>
              )}
            </button>
            <button onClick={handleOpenEODModal}
              className="px-5 py-2 text-gray-700 hover:text-black rounded-full text-xs font-bold transition-all cursor-pointer">
              End of the Day Sale
            </button>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="flex items-center gap-3 mb-4 shrink-0">
          <button onClick={() => setSelectedCategory("All")}
            className="px-6 py-2.5 bg-[#0190DC] text-white font-bold rounded-full text-xs shadow-md shadow-blue-500/20 cursor-pointer hover:bg-[#0190DC] transition-all">
            All Products
          </button>

          {/* Category Dropdown */}
          <div className="relative flex items-center">
            <select value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none bg-white/90 text-gray-500 border border-gray-200/80 pl-4 pr-9 py-2.5 rounded-full text-xs font-semibold focus:outline-none cursor-pointer shadow-2xs"> 
              <option value="All">Select Supplier</option>
              <option value="Supplier A">Supplier A</option>
              <option value="Supplier B">Supplier B</option>
              <option value="Supplier C">Supplier C</option>
            </select>

            <div className="absolute right-1.5 pointer-events-none bg-white border border-gray-200 rounded-full px-2 py-0.5 flex items-center justify-center shadow-2xs">
              <ChevronDown className="w-3 h-3 text-gray-500" />
            </div>
          </div>

          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/90 text-gray-700 pl-10 pr-4 py-2.5 rounded-full text-xs font-medium focus:outline-none border border-gray-200/80 shadow-2xs placeholder-gray-400"/>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto min-h-0 pr-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <div key={product.id} onClick={() => handleAddToCart(product)}
                className="bg-white rounded-2xl p-3 flex flex-col cursor-pointer shadow-sm border border-gray-100/80 hover:shadow-md transition-all">
                <div className="bg-[#EAEAEA] rounded-xl h-24 w-full mb-3" />
                <div className="text-gray-900 font-bold text-xs truncate">
                  {product.name}
                </div>
                <div className="text-gray-900 font-bold text-xs mt-0.5">
                  PHP {Number(product.price || 0).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT SECTION: ORDER DETAILS */}
      <div className="w-full lg:w-88 xl:w-96 bg-white rounded-3xl p-6 flex flex-col h-full min-h-0 shadow-sm shrink-0">
        <div className="flex justify-between items-center mb-3 shrink-0">
          <h2 className="text-lg font-black text-gray-900">Order Details</h2>
          <button onClick={handleHoldSale} disabled={cart.length === 0}
            className="text-xs text-decoration-line: underline font-extrabold text-gray-400 hover:text-gray-600 tracking-wider uppercase cursor-pointer disabled:opacity-40">
            HOLD SALE
          </button>
        </div>

        {/* Cart Itemized List */}
        <div className="flex-1 overflow-y-auto min-h-0 my-3 space-y-2.5 pr-1">
          {cart.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400 text-xs font-medium">
              No items in order
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id}
                className="bg-[#FDF5F5]/80 border border-gray-100 rounded-2xl p-3 flex flex-col gap-2 shadow-2xs">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-gray-900 truncate max-w-[140px]">
                    {item.name}
                  </span>
                  <span className="text-xs font-black text-gray-900">
                    PHP {(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center mt-1">
                  <span className="text-[11px] font-medium text-gray-400">
                    {Number(item.price).toFixed(2)}
                  </span>

                  <div className="flex items-center gap-1.5 bg-white border border-gray-200/80 rounded-full px-2 py-0.5 shadow-2xs">
                    <button onClick={() => handleUpdateQuantity(item.id, -1)}
                      className="text-gray-400 hover:text-gray-700 text-xs font-bold px-1 transition-colors cursor-pointer">
                      −
                    </button>
                    <span className="text-xs font-bold text-gray-800 min-w-[12px] text-center">
                      {item.quantity}
                    </span>
                    <button onClick={() => handleUpdateQuantity(item.id, 1)}
                      className="text-gray-400 hover:text-gray-700 text-xs font-bold px-1 transition-colors cursor-pointer">
                      +
                    </button>
                    <button onClick={() => handleRemoveItem(item.id)}
                      className="ml-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] hover:bg-red-700 transition-colors cursor-pointer">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Total Display */}
        <div className="border-t border-gray-100 pt-4 mb-4 shrink-0">
          <div className="flex justify-between items-center text-sm font-black text-gray-900">
            <span>TOTAL</span>
            <span>PHP {totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Options */}
        <div className="space-y-2 mb-6 shrink-0">
          <label className="block text-xs font-bold text-gray-800 mb-1">
            Payment Method
          </label>
          {["Cash", "Card", "E-wallet"].map((method) => (
            <label key={method} onClick={() => setPaymentMethod(method)}
              className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-2xl text-xs font-semibold cursor-pointer transition-all 
                ${ paymentMethod === method ? "bg-[#BEE1ED] text-gray-900" : "bg-[#F9F3F3] text-gray-600 hover:bg-[#BEE1ED]"} `}> 
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  paymentMethod === method ? "border-gray-400 bg-white" : "border-gray-300"} `}>
                {paymentMethod === method && (
                  <div className="w-2 h-2 rounded-full bg-[#2A2A8C]" />
                )}
              </div>
              {method}
            </label>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 shrink-0">
          <button onClick={handleClearCart}
            className="py-3 bg-[#8CE2FA] hover:bg-[#72d6f2] text-gray-900 text-xs font-black tracking-wider uppercase rounded-full transition-all cursor-pointer">
            CLEAR
          </button>
          <button onClick={handleConfirmSale}
            disabled={cart.length === 0}
            className="py-3 bg-[#009BE8] hover:bg-[#0089cf] text-black text-xs font-black tracking-wider uppercase rounded-full transition-all shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
            CONFIRM
          </button>
        </div>
      </div>

      {/* --- MODAL 1: PENDING SALES OVERLAY --- */}
      {showPendingModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-gray-500" />
                Pending Sales Queue
              </h3>
              <button onClick={() => setShowPendingModal(false)} className="cursor-pointer">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {pendingSales.length === 0 ? (
                <p className="text-center text-xs text-gray-400 py-6">No sales on hold</p>
              ) : ( pendingSales.map((item) => (
                  <div key={item.id} className="p-3 bg-gray-50 border rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-gray-800">{item.id} ({item.timestamp})</div>
                      <div className="text-gray-500 text-[11px]">{item.cart.length} item(s)</div>
                      <div className="font-semibold text-gray-900 mt-0.5">PHP {item.total.toFixed(2)}</div>
                    </div>
                    <button onClick={() => handleRestorePendingSale(item)}
                      className="px-3 py-1.5 bg-[#0190DC] hover:bg-[#017bbd] text-white rounded-lg font-bold text-xs cursor-pointer">
                      Resume
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: X-READING / CASHIER ACCOUNTABILITY --- */}
      {showEODModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-xl shadow-2xl space-y-5">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <h3 className="font-bold text-gray-800 text-base flex items-center gap-2">
                <Banknote className="text-emerald-600 font-black" />
                X-Reading / Cashier Accountability
              </h3>
              <button
                onClick={() => setShowEODModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full cursor-pointer transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <p className="text-xs font-semibold text-gray-500 -mt-2">
              Input physical cash denomination quantities:
            </p>

            {/* Denominations Grid */}
            <div className="grid grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
              {denominationList.map((item) => (
                <div
                  key={item.value}
                  className="flex items-center justify-between p-2.5 bg-gray-50/80 border border-gray-200/80 rounded-xl">
                  <span className="text-xs font-bold text-gray-700">{item.label}</span>
                  <input type="number"
                    min="0"
                    value={denominations[item.value] || 0}
                    onChange={(e) => handleDenominationChange(item.value, e.target.value)}
                    className="w-20 px-2 py-1 bg-white border border-gray-300 rounded-lg text-xs font-bold text-center text-gray-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              ))}
            </div>

            {/* Reconciliation Summary Box */}
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600 font-semibold">Cashier Cash (Counted):</span>
                <span className="font-black text-gray-900">
                  PHP {totalCountedCash.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600 font-semibold">POS Cash (Expected):</span>
                <span className="font-black text-gray-900">
                  PHP {expectedCash.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm font-black border-t border-gray-200/60 pt-2 mt-1">
                <span className="text-gray-900">Short / Over:</span>
                <span className={shortOrOver < 0 ? "text-red-600" : "text-emerald-600"}>
                  PHP {shortOrOver.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={handleExportXReading}
                className="py-3 bg-[#1A6CF6] hover:bg-[#1258d3] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export X-Reading
              </button>
              <button
                onClick={handleSubmitReconciliation}
                className="py-3 bg-[#008A56] hover:bg-[#007548] text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-sm">
                Submit Reconciliation
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}