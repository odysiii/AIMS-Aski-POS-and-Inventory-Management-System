import React, { useState, useMemo } from 'react';
import { 
  Home, 
  Package,
  Bell, 
  X,
  Search,
  Calendar,
  ChevronDown,
  Plus
} from 'lucide-react';
import NotificationPanel from './NotificationPanel';

// --- Sample Product Data ---
const initialProducts = [
  {
    id: 1,
    name: 'Product Name 1',
    category: 'Category 1',
    currentStock: 55,
    unitCost: '130.00',
    sellingPrice: '140.00',
    batchDate: '07/20/2026',
    expirationDate: '07/20/2028',
    status: 'In Stock'
  },
  {
    id: 2,
    name: 'Product Name 2',
    category: 'Category 4',
    currentStock: 10,
    unitCost: '130.00',
    sellingPrice: '140.00',
    batchDate: '07/20/2026',
    expirationDate: '07/20/2028',
    status: 'Low Stock'
  },
  {
    id: 3,
    name: 'Product Name 3',
    category: 'Category 3',
    currentStock: 55,
    unitCost: '130.00',
    sellingPrice: '140.00',
    batchDate: '07/20/2025',
    expirationDate: '07/20/2026',
    status: 'Expired'
  }
];

export default function InventoryList() {
  const [isInputFormOpen, setIsInputFormOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    productName: '',
    batchNo: '',
    quantity: '',
    arrivalDate: '',
    expirationDate: '',
    category: '',
    unitCost: '',
    sellingPrice: '',
    reorderLevel: ''
  });

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStock, setFilterStock] = useState('');
  const [filterBatchDate, setFilterBatchDate] = useState('');
  const [filterExpDate, setFilterExpDate] = useState('');

  // Dynamic Filtering Logic
  const filteredProducts = useMemo(() => {
    return initialProducts.filter((prod) => {
      const matchesSearch = 
        prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = filterCategory ? prod.category === filterCategory : true;
      const matchesStock = filterStock ? prod.status === filterStock : true;
      const matchesBatchDate = filterBatchDate ? prod.batchDate.includes(filterBatchDate) : true;
      const matchesExpDate = filterExpDate ? prod.expirationDate.includes(filterExpDate) : true;

      return matchesSearch && matchesCategory && matchesStock && matchesBatchDate && matchesExpDate;
    });
  }, [searchQuery, filterCategory, filterStock, filterBatchDate, filterExpDate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClearForm = () => {
    setFormData({
      productName: '',
      batchNo: '',
      quantity: '',
      arrivalDate: '',
      expirationDate: '',
      category: '',
      unitCost: '',
      sellingPrice: '',
      reorderLevel: ''
    });
  };

  const handleClearFilters = () => {
    setFilterCategory('');
    setFilterStock('');
    setFilterBatchDate('');
    setFilterExpDate('');
    setSearchQuery('');
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    handleClearForm();
  };

  const toggleInputForm = () => {
    setIsInputFormOpen(!isInputFormOpen);
  };

  
  return (
    <>
        
        {/* HEADER */}
        <header className="relative flex items-center justify-between bg-gradient-to-r from-white via-white/90 to-blue-200/60 backdrop-blur-xl border border-white/80 rounded-3xl px-8 py-4 shadow-xl shadow-blue-500/10 shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600">AMPC</p>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                INVENTORY
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsInputFormOpen(!isInputFormOpen)}
              className={`flex items-center gap-2 px-4 py-2 font-bold text-xs rounded-2xl shadow-md transition-all cursor-pointer ${
                isInputFormOpen
                  ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/20'
              }`}
            >
              {isInputFormOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{isInputFormOpen ? 'Close Form' : 'Add Product'}</span>
            </button>

            <div className="relative">
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-3 rounded-2xl bg-white border border-slate-200/60 text-slate-700 hover:bg-slate-50 transition shadow-sm"
              >
                <Bell className="w-5 h-5 text-slate-700" />
                <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-blue-600 rounded-full border-2 border-white animate-pulse" />
              </button>

              <NotificationPanel 
                isOpen={isNotifOpen} 
                onClose={() => setIsNotifOpen(false)} 
              />
            </div>
          </div> 
        </header>

        {/* SECTION 1: INPUT PRODUCTS */}
        {isInputFormOpen && (
          <div className="bg-gradient-to-br from-blue-950 via-indigo-950 to-slate-900 backdrop-blur-xl rounded-3xl p-5 shadow-xl shadow-blue-950/20 border border-blue-800/40 transition-all animate-fadeIn text-white shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wide">
                INPUT PRODUCTS
              </h3>
              <div className="flex items-center gap-2">
                <button 
                  type="button"
                  onClick={handleClearForm}
                  className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  Clear
                </button>
                <button 
                  type="button"
                  onClick={handleAddProduct}
                  className="px-4 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-blue-500/30 cursor-pointer"
                >
                  Add Product
                </button>
              </div>
            </div>

            <form onSubmit={handleAddProduct} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 text-left">
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-blue-200 mb-1">Product Name</label>
                <input 
                  type="text"
                  name="productName"
                  value={formData.productName}
                  onChange={handleInputChange}
                  className="w-full bg-blue-900/40 border border-blue-700/40 rounded-xl px-3 py-1.5 text-xs text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400/50 backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-blue-200 mb-1">Batch No.</label>
                <input 
                  type="text"
                  name="batchNo"
                  value={formData.batchNo}
                  onChange={handleInputChange}
                  className="w-full bg-blue-900/40 border border-blue-700/40 rounded-xl px-3 py-1.5 text-xs text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400/50 backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-blue-200 mb-1">Quantity</label>
                <input 
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className="w-full bg-blue-900/40 border border-blue-700/40 rounded-xl px-3 py-1.5 text-xs text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400/50 backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-blue-200 mb-1">Arrival Date</label>
                <div className="relative flex items-center">
                  <input 
                    type="date"
                    name="arrivalDate"
                    value={formData.arrivalDate}
                    onChange={handleInputChange}
                    className="w-full bg-blue-900/40 border border-blue-700/40 rounded-xl px-3 py-1.5 text-xs text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400/50 appearance-none backdrop-blur-sm"
                  />
                  <Calendar className="w-3.5 h-3.5 text-blue-300 absolute right-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-blue-200 mb-1">Expiration Date</label>
                <div className="relative flex items-center">
                  <input 
                    type="date"
                    name="expirationDate"
                    value={formData.expirationDate}
                    onChange={handleInputChange}
                    className="w-full bg-blue-900/40 border border-blue-700/40 rounded-xl px-3 py-1.5 text-xs text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400/50 appearance-none backdrop-blur-sm"
                  />
                  <Calendar className="w-3.5 h-3.5 text-blue-300 absolute right-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-blue-200 mb-1">Category</label>
                <div className="relative flex items-center">
                  <select 
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full bg-blue-900/40 border border-blue-700/40 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50 appearance-none backdrop-blur-sm"
                  >
                    <option value="" className="bg-slate-900 text-white">Select Category</option>
                    <option value="Category 1" className="bg-slate-900 text-white">Category 1</option>
                    <option value="Category 2" className="bg-slate-900 text-white">Category 2</option>
                    <option value="Category 3" className="bg-slate-900 text-white">Category 3</option>
                    <option value="Category 4" className="bg-slate-900 text-white">Category 4</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-blue-300 absolute right-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-blue-200 mb-1">Unit Cost</label>
                <input 
                  type="text"
                  name="unitCost"
                  value={formData.unitCost}
                  onChange={handleInputChange}
                  className="w-full bg-blue-900/40 border border-blue-700/40 rounded-xl px-3 py-1.5 text-xs text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400/50 backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-blue-200 mb-1">Selling Price</label>
                <input 
                  type="text"
                  name="sellingPrice"
                  value={formData.sellingPrice}
                  onChange={handleInputChange}
                  className="w-full bg-blue-900/40 border border-blue-700/40 rounded-xl px-3 py-1.5 text-xs text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400/50 backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-blue-200 mb-1">Reorder Level</label>
                <input 
                  type="number"
                  name="reorderLevel"
                  value={formData.reorderLevel}
                  onChange={handleInputChange}
                  className="w-full bg-blue-900/40 border border-blue-700/40 rounded-xl px-3 py-1.5 text-xs text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400/50 backdrop-blur-sm"
                />
              </div>
            </form>
          </div>
        )}

        {/* SECTION 2: PRODUCT LIST & SEARCH */}
        <div className="bg-white/40 bg-gradient-to-t from-white backdrop-blur-md rounded-3xl p-5 shadow-lg shadow-blue-500/5 border border-white/60 flex-1 flex flex-col min-h-[250px]">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <h3 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wide">
              PRODUCT LIST
            </h3>

            <div className="relative flex items-center w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="w-full bg-white/60 border border-white/80 rounded-full pl-9 pr-4 py-1.5 text-xs text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 backdrop-blur-sm"
              />
            </div>
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 mb-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-700 mb-1">Category</label>
              <div className="relative flex items-center">
                <select 
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full bg-white/70 border border-white/80 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none appearance-none backdrop-blur-sm"
                >
                  <option value="">All Categories</option>
                  <option value="Category 1">Category 1</option>
                  <option value="Category 3">Category 3</option>
                  <option value="Category 4">Category 4</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 mb-1">Stock</label>
              <div className="relative flex items-center">
                <select 
                  value={filterStock}
                  onChange={(e) => setFilterStock(e.target.value)}
                  className="w-full bg-white/70 border border-white/80 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none appearance-none backdrop-blur-sm"
                >
                  <option value="">All Statuses</option>
                  <option value="In Stock">In Stock</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Expired">Expired</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 mb-1">Batch Date</label>
              <input 
                type="text"
                placeholder="e.g. 2026"
                value={filterBatchDate}
                onChange={(e) => setFilterBatchDate(e.target.value)}
                className="w-full bg-white/70 border border-white/80 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none backdrop-blur-sm"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 mb-1">Expiration Date</label>
              <input 
                type="text"
                placeholder="e.g. 2028"
                value={filterExpDate}
                onChange={(e) => setFilterExpDate(e.target.value)}
                className="w-full bg-white/70 border border-white/80 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none backdrop-blur-sm"
              />
            </div>

            <div className="col-span-2 lg:col-span-1 flex items-end">
              <button 
                type="button"
                onClick={handleClearFilters}
                className="w-full py-1.5 bg-white/60 hover:bg-white text-slate-700 border border-white/80 font-bold text-xs rounded-xl transition-all shadow-sm cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>

          {/* PRODUCT DATA TABLE */}
          <div className="flex-1 overflow-x-auto rounded-2xl border border-white/60 bg-white/20 backdrop-blur-sm shadow-sm">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead>
                <tr className="bg-white/40 text-slate-800 font-bold border-b border-white/60">
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-center">Current Stock</th>
                  <th className="p-3 text-center">Unit Cost</th>
                  <th className="p-3 text-center">Selling Price</th>
                  <th className="p-3 text-center">Batch Date</th>
                  <th className="p-3 text-center">Expiration Date</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/40 font-medium text-slate-700">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((prod) => (
                    <tr key={prod.id} className="hover:bg-white/30 transition-colors">
                      <td className="p-3 font-semibold text-slate-900">{prod.name}</td>
                      <td className="p-3">{prod.category}</td>
                      <td className="p-3 text-center font-bold text-slate-900">{prod.currentStock}</td>
                      <td className="p-3 text-center">{prod.unitCost}</td>
                      <td className="p-3 text-center">{prod.sellingPrice}</td>
                      <td className="p-3 text-center">{prod.batchDate}</td>
                      <td className="p-3 text-center">{prod.expirationDate}</td>
                      <td className="p-3 text-right font-bold text-blue-600">{prod.status}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="p-4 text-center text-slate-500 font-semibold">
                      No products found matching filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </>
  );
}