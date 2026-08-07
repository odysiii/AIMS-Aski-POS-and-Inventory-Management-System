import { useNavigate, useLocation } from 'react-router-dom';
import React, { useState, useMemo } from 'react';
import { 
  Home, 
  Package, 
  TrendingUp, 
  BarChart2, 
  Settings, 
  LogOut, 
  Bell, 
  Menu,
  Image as ImageIcon,
  X,
  Search,
  Calendar,
  ChevronDown,
  Plus
} from 'lucide-react';

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
  const navigate = useNavigate();
  const location = useLocation();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isInputFormOpen, setIsInputFormOpen] = useState(true);

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
      // 1. Search Query (Name or Category)
      const matchesSearch = 
        prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.category.toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Category Filter
      const matchesCategory = filterCategory ? prod.category === filterCategory : true;

      // 3. Stock Status Filter
      const matchesStock = filterStock ? prod.status === filterStock : true;

      // 4. Batch Date Filter
      const matchesBatchDate = filterBatchDate ? prod.batchDate.includes(filterBatchDate) : true;

      // 5. Expiration Date Filter
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

  return (
    <div className="relative h-screen w-screen bg-[#EAE8FE] flex flex-col font-sans overflow-hidden select-none">
      
      {/* Top Header Breadcrumb */}
      <div className="pt-2 pl-3 sm:pl-4 text-gray-500 font-semibold text-[10px] sm:text-xs tracking-wider uppercase z-20 shrink-0">
        AIMS - IM - ADMIN - INVENTORY
      </div>

      {/* Main Container Wrapper */}
      <div className="relative flex-1 m-2 sm:m-3 md:m-4 mt-1 rounded-2xl overflow-hidden flex flex-col md:flex-row gap-2 sm:gap-3 min-h-0">
        
        {/* COLLAPSIBLE SIDEBAR */}
        <div 
          className={`bg-[#EDEDED] rounded-2xl flex md:flex-col justify-between p-2 md:py-4 shrink-0 shadow-sm border border-white/60 transition-all duration-300 ease-in-out ${
            isExpanded ? 'md:w-48 md:px-3' : 'md:w-16 items-center'
          }`}
        >
          {/* Top Nav Group */}
          <div className="flex md:flex-col items-center gap-2 md:gap-3 w-full">
            <button 
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className={`p-2 text-gray-600 hover:text-black hover:bg-gray-200 rounded-xl transition-all flex items-center ${
                isExpanded ? 'w-full justify-start gap-3 px-2.5' : 'justify-center'
              }`}
            >
              <Menu className="w-5 h-5 shrink-0" />
              {isExpanded && <span className="hidden md:inline text-xs font-bold text-gray-700">Collapse</span>}
            </button>

          {/*HOME BUTTON -> /adminDashboard */} 
            <button type="button" onClick={() => navigate('/adminDashboard')}
            className={`p-2 text-gray-500 hover:text-black hover:bg-gray-200 rounded-xl transition-all flex items-center ${
              location.pathname === '/adminDashboard'} 
              ${isExpanded ? 'w-full justify-start gap-3 px-3' : 'justify-center'
            }`}>
              <Home className="w-5 h-5 shrink-0" />
              {isExpanded && <span className="hidden md:inline text-xs font-bold whitespace-nowrap">Home</span>}
            </button>

            {/*INVENTORY BUTTON -> /inventoryList */}
            <button type="button" onClick={() => navigate('/inventoryList')}
            className={`p-2 bg-[#C0C0C0] text-gray-800 rounded-xl md:rounded-2xl shadow-sm flex items-center ${
              location.pathname === 'inventoryList'}
              ${isExpanded ? 'w-full justify-start gap-3 px-3' : 'justify-center'
            }`}>
              <Package className="w-5 h-5 shrink-0" />
              {isExpanded && <span className="hidden md:inline text-xs font-bold text-gray-800 whitespace-nowrap">Inventory</span>}
            </button>

            {/*FORECAST BUTTON -> /demand */}
            <button type="button" onClick={() => navigate('/demand')}
            className={`p-2 text-gray-500 hover:text-black hover:bg-gray-200 rounded-xl transition-all flex items-center ${
              location.pathname === '/demand'} 
              ${isExpanded ? 'w-full justify-start gap-3 px-3' : 'justify-center'
            }`}>
              <TrendingUp className="w-5 h-5 shrink-0" />
              {isExpanded && <span className="hidden md:inline text-xs font-bold text-gray-700 whitespace-nowrap">Forecast</span>}
            </button>

            {/*Analytics Button -> /accounting */}
            <button type="button" onClick={() => navigate('/accounting')}
            className={`p-2 text-gray-500 hover:text-black hover:bg-gray-200 rounded-xl transition-all flex items-center ${
              location.pathname === '/accounting'}
              ${isExpanded ? 'w-full justify-start gap-3 px-3' : 'justify-center'
            }`}>
              <BarChart2 className="w-5 h-5 shrink-0" />
              {isExpanded && <span className="hidden md:inline text-xs font-bold text-gray-700 whitespace-nowrap">Analytics</span>}
            </button>
          </div>

          {/* Bottom Nav Group */}
          <div className="flex md:flex-col items-center gap-2 w-full justify-end">
            <button type="button" onClick={() => navigate('/pos')}
             className={`p-2 text-gray-500 hover:text-black hover:bg-gray-200 rounded-xl transition-all flex items-center ${
              location.pathname === '/pos'}
              ${isExpanded ? 'w-full justify-start gap-3 px-3' : 'justify-center'
            }`}>
              <Settings className="w-5 h-5 shrink-0" />
              {isExpanded && <span className="hidden md:inline text-xs font-bold text-gray-700 whitespace-nowrap">Settings</span>}
            </button>

            {/*LOGOUT BUTTON -> / */}
            <button type="button" onClick={() => navigate('/')}
            className={`p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all flex items-center ${
              isExpanded ? 'w-full justify-start gap-3 px-3' : 'justify-center'
            }`}>
              <LogOut className="w-5 h-5 shrink-0" />
              {isExpanded && <span className="hidden md:inline text-xs font-bold text-red-600 whitespace-nowrap">Logout</span>}
            </button>
          </div>
        </div>

        {/* MAIN INVENTORY CONTENT AREA */}
        <div className="flex-1 bg-[#EDEDED] rounded-2xl p-3 sm:p-4 flex flex-col gap-3 overflow-y-auto border border-white/60 shadow-sm min-h-0">
          
          {/* TOP BAR */}
          <div className="flex items-center justify-between shrink-0 mb-1 gap-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gray-300 flex items-center justify-center border border-gray-400/40 shrink-0">
                <ImageIcon className="w-4 h-4 text-gray-600" />
              </div>
              <h1 className="text-xs sm:text-sm md:text-base font-black text-black tracking-wide uppercase truncate">
                INVENTORY MANAGEMENT
              </h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button type="button" className="p-1.5 sm:p-2 text-gray-700 hover:bg-gray-300/60 rounded-full transition-all cursor-pointer">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <span className="text-[11px] sm:text-xs font-black text-gray-800 hidden sm:inline">Hi, Admin!</span>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-300 flex items-center justify-center border border-gray-400/40 shrink-0">
                <ImageIcon className="w-4 h-4 text-gray-600" />
              </div>
            </div>
          </div>

          {/* PAGE TITLE & COLLAPSE TOGGLE BUTTON */}
          <div className="flex items-center justify-between shrink-0 px-1">
            <h2 className="text-sm sm:text-base font-black text-black tracking-wider uppercase">
              INVENTORY
            </h2>
            <button 
              type="button" 
              onClick={() => setIsInputFormOpen(!isInputFormOpen)}
              title={isInputFormOpen ? "Collapse Input Form" : "Expand Input Form"}
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-700 hover:bg-gray-200 hover:text-black transition-all cursor-pointer"
            >
              {isInputFormOpen ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </button>
          </div>

          {/* SECTION 1: INPUT PRODUCTS FORM (Collapsible) */}
          <div 
            className={`transition-all duration-300 ease-in-out overflow-hidden shrink-0 ${
              isInputFormOpen 
                ? 'max-h-[1000px] opacity-100 mb-0' 
                : 'max-h-0 opacity-0 -mb-3 pointer-events-none'
            }`}
          >
            <div className="bg-[#F5F5F5] rounded-2xl p-3 sm:p-4 shadow-xs border border-gray-200/80">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs sm:text-sm font-black text-black uppercase tracking-wide">
                  INPUT PRODUCTS
                </h3>
                <div className="flex items-center gap-2">
                  <button 
                    type="button"
                    onClick={handleClearForm}
                    className="px-4 py-1.5 bg-[#D4D4D4] hover:bg-[#C2C2C2] text-black font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Clear
                  </button>
                  <button 
                    type="button"
                    onClick={handleAddProduct}
                    className="px-4 py-1.5 bg-[#D4D4D4] hover:bg-[#C2C2C2] text-black font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Add Product
                  </button>
                </div>
              </div>

              {/* FORM INPUT GRID */}
              <form onSubmit={handleAddProduct} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-left">
                
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-gray-700 mb-1">Product Name</label>
                  <input 
                    type="text"
                    name="productName"
                    value={formData.productName}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-1">Batch No.</label>
                  <input 
                    type="text"
                    name="batchNo"
                    value={formData.batchNo}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-1">Quantity</label>
                  <input 
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-1">Arrival Date</label>
                  <div className="relative flex items-center">
                    <input 
                      type="date"
                      name="arrivalDate"
                      value={formData.arrivalDate}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-400 appearance-none"
                    />
                    <Calendar className="w-3.5 h-3.5 text-gray-500 absolute right-3 pointer-events-none" />
                  </div>
                </div>

                <div className="md:col-span-1">
                  <label className="block text-[10px] font-bold text-gray-700 mb-1">Expiration Date</label>
                  <div className="relative flex items-center">
                    <input 
                      type="date"
                      name="expirationDate"
                      value={formData.expirationDate}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-400 appearance-none"
                    />
                    <Calendar className="w-3.5 h-3.5 text-gray-500 absolute right-3 pointer-events-none" />
                  </div>
                </div>

                <div className="md:col-span-1">
                  <label className="block text-[10px] font-bold text-gray-700 mb-1">Category</label>
                  <div className="relative flex items-center">
                    <select 
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-400 appearance-none"
                    >
                      <option value=""></option>
                      <option value="Category 1">Category 1</option>
                      <option value="Category 2">Category 2</option>
                      <option value="Category 3">Category 3</option>
                      <option value="Category 4">Category 4</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-3 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-1">Unit Cost</label>
                  <input 
                    type="text"
                    name="unitCost"
                    value={formData.unitCost}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-1">Selling Price</label>
                  <input 
                    type="text"
                    name="sellingPrice"
                    value={formData.sellingPrice}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-400"
                  />
                </div>

                <div className="md:col-span-1">
                  <label className="block text-[10px] font-bold text-gray-700 mb-1">Reorder Level</label>
                  <input 
                    type="number"
                    name="reorderLevel"
                    value={formData.reorderLevel}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-400"
                  />
                </div>

              </form>
            </div>
          </div>

          {/* SECTION 2: PRODUCT LIST & SEARCH */}
          <div className="bg-[#F5F5F5] rounded-2xl p-3 sm:p-4 shadow-xs border border-gray-200/80 flex-1 flex flex-col min-h-[250px]">
            
            {/* Header + Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <h3 className="text-xs sm:text-sm font-black text-black uppercase tracking-wide">
                PRODUCT LIST
              </h3>

              {/* Search Bar */}
              <div className="relative flex items-center w-full sm:w-64">
                <Search className="w-4 h-4 text-gray-500 absolute left-3 pointer-events-none" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search"
                  className="w-full bg-[#E2E2E2] rounded-full pl-9 pr-4 py-1.5 text-xs text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
              </div>
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-700 mb-1">Category</label>
                <div className="relative flex items-center">
                  <select 
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs text-gray-800 focus:outline-none appearance-none"
                  >
                    <option value="">All Categories</option>
                    <option value="Category 1">Category 1</option>
                    <option value="Category 3">Category 3</option>
                    <option value="Category 4">Category 4</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-700 mb-1">Stock</label>
                <div className="relative flex items-center">
                  <select 
                    value={filterStock}
                    onChange={(e) => setFilterStock(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs text-gray-800 focus:outline-none appearance-none"
                  >
                    <option value="">All Statuses</option>
                    <option value="In Stock">In Stock</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Expired">Expired</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-700 mb-1">Batch Date</label>
                <input 
                  type="text"
                  placeholder="e.g. 2026"
                  value={filterBatchDate}
                  onChange={(e) => setFilterBatchDate(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs text-gray-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-700 mb-1">Expiration Date</label>
                <input 
                  type="text"
                  placeholder="e.g. 2028"
                  value={filterExpDate}
                  onChange={(e) => setFilterExpDate(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs text-gray-800 focus:outline-none"
                />
              </div>

              <div className="flex items-end">
                <button 
                  type="button"
                  onClick={handleClearFilters}
                  className="w-full py-1.5 bg-[#D4D4D4] hover:bg-[#C2C2C2] text-black font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* PRODUCT DATA TABLE */}
            <div className="flex-1 overflow-x-auto rounded-xl border border-gray-300">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#C1B2B0] text-gray-800 font-bold">
                    <th className="p-2.5">Product Name</th>
                    <th className="p-2.5">Category</th>
                    <th className="p-2.5 text-center">Current Stock</th>
                    <th className="p-2.5 text-center">Unit Cost</th>
                    <th className="p-2.5 text-center">Selling Price</th>
                    <th className="p-2.5 text-center">Batch Date</th>
                    <th className="p-2.5 text-center">Expiration Date</th>
                    <th className="p-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-[#EAEAEA] font-medium text-gray-800">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((prod) => (
                      <tr key={prod.id} className="hover:bg-gray-300/40 transition-colors">
                        <td className="p-2.5 font-semibold">{prod.name}</td>
                        <td className="p-2.5">{prod.category}</td>
                        <td className="p-2.5 text-center font-bold">{prod.currentStock}</td>
                        <td className="p-2.5 text-center">{prod.unitCost}</td>
                        <td className="p-2.5 text-center">{prod.sellingPrice}</td>
                        <td className="p-2.5 text-center">{prod.batchDate}</td>
                        <td className="p-2.5 text-center">{prod.expirationDate}</td>
                        <td className="p-2.5 text-right font-bold">{prod.status}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="p-4 text-center text-gray-500 font-semibold">
                        No products found matching filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}