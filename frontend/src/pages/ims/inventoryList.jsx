import { useEffect, useMemo, useState } from 'react';
import { X, Search, ChevronDown, Plus } from 'lucide-react';
import { apiGet } from '../../lib/api';
import { amount, toNumber } from '../../lib/format';
import { LOW_STOCK_THRESHOLD } from '../../config';
import { useToast } from '../../components/useToast';

const EMPTY_FORM = {
  productName: '',
  batchNo: '',
  quantity: '',
  arrivalDate: '',
  expirationDate: '',
  category: '',
  unitCost: '',
  sellingPrice: '',
  reorderLevel: '',
};

/** Derive display status from live product columns.
 *  Product schema has no batchDate/expirationDate yet; the "Expired" bucket
 *  will start reflecting reality once those columns land (see handoff doc). */
function computeStatus(product) {
  const stock = toNumber(product.stock);
  if (stock <= 0) return 'Out of Stock';
  if (stock <= LOW_STOCK_THRESHOLD) return 'Low Stock';
  return 'In Stock';
}

const STATUS_STYLE = {
  'In Stock':     'text-emerald-800',
  'Low Stock':    'text-amber-800',
  'Out of Stock': 'text-red-800',
  'Expired':      'text-red-800',
};

export default function InventoryList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInputFormOpen, setIsInputFormOpen] = useState(false);

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStock, setFilterStock] = useState('');
  const [filterBatchDate, setFilterBatchDate] = useState('');
  const [filterExpDate, setFilterExpDate] = useState('');

  const toast = useToast();

  useEffect(() => {
    let alive = true;
    // `loading` initializes to true.
    apiGet('/api/products')
      .then((data) => {
        if (!alive) return;
        setProducts(Array.isArray(data) ? data : []);
        setError(null);
      })
      .catch((err) => alive && setError(err.message || 'Failed to load products'))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  // Single source of truth for the category vocabulary — derived from live data.
  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category || 'Uncategorized'));
    return Array.from(set).sort();
  }, [products]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products
      .map((p) => ({ ...p, _status: computeStatus(p) }))
      .filter((p) => {
        if (q && !`${p.name} ${p.category || ''}`.toLowerCase().includes(q)) return false;
        if (filterCategory && (p.category || 'Uncategorized') !== filterCategory) return false;
        if (filterStock && p._status !== filterStock) return false;
        // Batch / expiration filters take a YYYY-MM-DD and compare to product dates.
        // Product schema has no batch/expiration columns yet, so this is defensive.
        if (filterBatchDate) {
          const b = p.batchDate ? new Date(p.batchDate) : null;
          if (!b || new Date(filterBatchDate) > b) return false;
        }
        if (filterExpDate) {
          const e = p.expiryDate ? new Date(p.expiryDate) : null;
          if (!e || new Date(filterExpDate) < e) return false;
        }
        return true;
      });
  }, [products, searchQuery, filterCategory, filterStock, filterBatchDate, filterExpDate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClearForm = () => setFormData(EMPTY_FORM);

  const handleClearFilters = () => {
    setFilterCategory('');
    setFilterStock('');
    setFilterBatchDate('');
    setFilterExpDate('');
    setSearchQuery('');
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    // POST /api/products does not exist yet — see BACKEND-HANDOFF.md.
    // Wired but disabled so QA can see the correct behavior once it lands.
    toast.warn('Add Product needs POST /api/products on the backend. Handoff item #3.');
  };

  return (
    <div className="flex flex-col gap-3 flex-1 min-h-0">
      {/* Page title */}
      <div className="flex items-center justify-between shrink-0 px-1">
        <h2 className="text-sm sm:text-base font-black text-black tracking-wider uppercase">
          Inventory
        </h2>
        <button
          type="button"
          onClick={() => setIsInputFormOpen((v) => !v)}
          title={isInputFormOpen ? 'Collapse input form' : 'Add product'}
          aria-expanded={isInputFormOpen}
          className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-700 hover:bg-gray-200 hover:text-black transition-all cursor-pointer"
        >
          {isInputFormOpen ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        </button>
      </div>

      {error && (
        <div role="alert" className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 rounded-lg p-2">
          {error}
        </div>
      )}

      {/* Input products form */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden shrink-0 ${
          isInputFormOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 -mb-3 pointer-events-none'
        }`}
      >
        <form
          onSubmit={handleAddProduct}
          className="bg-[#F5F5F5] rounded-2xl p-3 sm:p-4 shadow-xs border border-gray-200/80"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs sm:text-sm font-black text-black uppercase tracking-wide">
              Input Products
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
                type="submit"
                title="POST /api/products endpoint pending — see handoff"
                className="px-4 py-1.5 bg-[#D4D4D4] hover:bg-[#C2C2C2] text-black font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Add Product
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-left">
            <Field label="Product Name" name="productName" value={formData.productName} onChange={handleInputChange} colSpan={2} required />
            <Field label="Batch No." name="batchNo" value={formData.batchNo} onChange={handleInputChange} />
            <Field label="Quantity" name="quantity" type="number" min="0" value={formData.quantity} onChange={handleInputChange} required />
            <Field label="Arrival Date" name="arrivalDate" type="date" value={formData.arrivalDate} onChange={handleInputChange} />
            <Field label="Expiration Date" name="expirationDate" type="date" value={formData.expirationDate} onChange={handleInputChange} />
            <SelectField
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              options={categories}
            />
            <Field label="Unit Cost" name="unitCost" type="number" min="0" step="0.01" value={formData.unitCost} onChange={handleInputChange} />
            <Field label="Selling Price" name="sellingPrice" type="number" min="0" step="0.01" value={formData.sellingPrice} onChange={handleInputChange} required />
            <Field label="Reorder Level" name="reorderLevel" type="number" min="0" value={formData.reorderLevel} onChange={handleInputChange} />
          </div>
        </form>
      </div>

      {/* Product list */}
      <div className="bg-[#F5F5F5] rounded-2xl p-3 sm:p-4 shadow-xs border border-gray-200/80 flex-1 flex flex-col min-h-[250px]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <h3 className="text-xs sm:text-sm font-black text-black uppercase tracking-wide">
            Product List
          </h3>

          <div className="relative flex items-center w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-600 absolute left-3 pointer-events-none" aria-hidden="true" />
            <label htmlFor="product-search" className="sr-only">Search products</label>
            <input
              id="product-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name or category"
              className="w-full bg-[#E2E2E2] rounded-full pl-9 pr-4 py-1.5 text-xs text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
          </div>
        </div>

        {/* Filters row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-3">
          <SelectField
            label="Category"
            name="filterCategory"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            options={categories}
            placeholder="All Categories"
          />
          <SelectField
            label="Stock"
            name="filterStock"
            value={filterStock}
            onChange={(e) => setFilterStock(e.target.value)}
            options={['In Stock', 'Low Stock', 'Out of Stock']}
            placeholder="All Statuses"
          />
          <Field
            label="Batch Date (after)"
            name="filterBatchDate"
            type="date"
            value={filterBatchDate}
            onChange={(e) => setFilterBatchDate(e.target.value)}
          />
          <Field
            label="Expires (before)"
            name="filterExpDate"
            type="date"
            value={filterExpDate}
            onChange={(e) => setFilterExpDate(e.target.value)}
          />
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

        {/* Table */}
        <div className="flex-1 overflow-x-auto rounded-xl border border-gray-300">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#C1B2B0] text-gray-900 font-bold">
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
            <tbody className="divide-y divide-gray-200 bg-[#EAEAEA] font-medium text-gray-900">
              {loading && (
                <tr><td colSpan={8} className="p-4 text-center text-gray-700 font-semibold">Loading products…</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={8} className="p-4 text-center text-gray-700 font-semibold">No products found.</td></tr>
              )}
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-300/40 transition-colors">
                  <td className="p-2.5 font-semibold">{p.name}</td>
                  <td className="p-2.5">{p.category || 'Uncategorized'}</td>
                  <td className="p-2.5 text-center font-bold">{p.stock}</td>
                  <td className="p-2.5 text-center">{p.unitCost != null ? amount(p.unitCost) : '—'}</td>
                  <td className="p-2.5 text-center">{amount(p.price)}</td>
                  <td className="p-2.5 text-center">{p.batchDate || '—'}</td>
                  <td className="p-2.5 text-center">{p.expiryDate || '—'}</td>
                  <td className={`p-2.5 text-right font-bold ${STATUS_STYLE[p._status] || ''}`}>
                    {p._status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* --- small local field helpers --- */

function Field({ label, name, type = 'text', value, onChange, required, min, step, colSpan }) {
  const id = `field-${name}`;
  return (
    <div className={colSpan === 2 ? 'md:col-span-2' : ''}>
      <label htmlFor={id} className="block text-[11px] font-bold text-gray-700 mb-1">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        min={min}
        step={step}
        className="w-full bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500"
      />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options, placeholder = '' }) {
  const id = `field-${name}`;
  return (
    <div>
      <label htmlFor={id} className="block text-[11px] font-bold text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative flex items-center">
        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          className="w-full bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 appearance-none"
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <ChevronDown className="w-3.5 h-3.5 text-gray-600 absolute right-3 pointer-events-none" aria-hidden="true" />
      </div>
    </div>
  );
}
