import React, { useState } from 'react';
import { Search, Trash2, ChevronDown, Plus, Minus, Store } from 'lucide-react';

const INITIAL_PRODUCTS = [
  { id: 1, name: "Lettuce Seed", price: 349.00, category: "Seeds" },
  { id: 2, name: "Triple 14", price: 1000.00, category: "Fertilizers" },
  { id: 3, name: "BiMeg", price: 300.00, category: "Feeds" },
  { id: 4, name: "Eggplant Seed", price: 250.00, category: "Seeds" },
  { id: 5, name: "Omega 1", price: 550.00, category: "Feeds" },
  { id: 6, name: "Compose", price: 1200.00, category: "Fertilizers" },
  { id: 7, name: "Worm Killer", price: 120.00, category: "Pesticides" },
  { id: 8, name: "Tomato Seed", price: 380.00, category: "Seeds" },
  { id: 9, name: "Shovel", price: 400.00, category: "Tools" },
  { id: 10, name: "Omega 2", price: 650.00, category: "Feeds" },
  { id: 11, name: "Rat killer", price: 100.00, category: "Pesticides" },
  { id: 12, name: "Wheel Barrow", price: 150.00, category: "Tools" },
];

export default function CashierPOS() {
  const [products] = useState(INITIAL_PRODUCTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [paymentMethod, setPaymentMethod] = useState("Card");

  const [cart, setCart] = useState([
    { id: 1, name: "Product 1", unitPrice: 349.00, quantity: 2 },
    { id: 2, name: "Product 2", unitPrice: 1000.00, quantity: 1 },
    { id: 3, name: "Product 3", unitPrice: 300.00, quantity: 3 },
    { id: 4, name: "Product 4", unitPrice: 250.00, quantity: 2 },
    { id: 5, name: "Product 5", unitPrice: 550.00, quantity: 1 },
  ]);

  const handleAddToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { id: product.id, name: product.name, unitPrice: product.price, quantity: 1 }];
    });
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

  const handleClearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-[#EAE8FE] p-4 gap-4 font-sans overflow-hidden box-border">
      
      {/* LEFT SECTION: PRODUCT CATALOG */}
      <div className="flex-1 flex flex-col h-full min-h-0 bg-transparent">
        
        {/* Top Header Title */}
        <div className="flex items-center gap-3 mb-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-white shrink-0 shadow-sm">
            <Store className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h1 className="text-base font-extrabold text-gray-800 uppercase tracking-wide leading-tight">
              ASKI MULTI-COOP
            </h1>
            <p className="text-xs font-semibold text-gray-500 leading-tight">
              Isynergies, Inc.
            </p>
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

        {/* Scrollable Product Grid */}
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
                  <div className="text-gray-600 font-bold mt-0.5">
                    PHP {product.price.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT SECTION: ORDER DETAILS */}
      <div className="w-full lg:w-80 xl:w-88 bg-[#FAF7F5] rounded-2xl p-4 flex flex-col h-full min-h-0 shadow-lg border border-gray-100 shrink-0">
        
        <h2 className="text-base font-bold text-gray-900 mb-2 shrink-0">Order Details</h2>
        <hr className="border-gray-200 mb-2 shrink-0" />

        {/* Scrollable Cart Item List */}
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
                    <button
                      onClick={() => handleUpdateQuantity(item.id, -1)}
                      className="text-gray-600 hover:text-black p-0.5"
                    >
                      <Minus className="w-2.5 h-2.5" />
                    </button>
                    <span className="font-semibold text-[11px] px-0.5 min-w-[10px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, 1)}
                      className="text-gray-600 hover:text-black p-0.5"
                    >
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-gray-400 hover:text-red-500 ml-0.5 p-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Total Summary Row */}
        <div className="flex justify-between items-center py-2 border-t border-gray-200 mb-2 shrink-0">
          <span className="text-sm font-bold text-gray-800">Total:</span>
          <span className="text-base font-extrabold text-gray-900">
            PHP {cartTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
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
            onClick={() => alert(`Confirmed sale of PHP ${cartTotal.toFixed(2)} via ${paymentMethod}`)}
            className="py-2 bg-[#B8ADA7] hover:bg-[#a89c96] text-gray-900 text-xs font-bold rounded-lg transition-colors shadow-sm"
          >
            Confirm
          </button>
        </div>

      </div>
    </div>
  );
}