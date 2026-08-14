import { useEffect, useRef, useState } from 'react';

import Sidebar from '../dashboard/Sidebar';

/* Toggleable Columns */
const TOGGLEABLE_COLUMNS = [
  { key: 'slno', label: 'Sl.no' },
  { key: 'name', label: 'Product Name' },
  { key: 'made_of', label: 'Made Of' },
  { key: 'occasions', label: 'Occasion IDs' },
  { key: 'categories', label: 'Category IDs' },
  { key: 'card_types', label: 'Card Type IDs' },
  { key: 'status', label: 'Status' },
];

function ProductView({
  form,
  onChange,
  onSubmit,
  items,
  loading,
  editingId,
  onEdit,
  onToggleStatus,
  onLogout,
  onProfile,
  isModalOpen,
  onOpenModal,
  onCloseModal,
  onDelete,
  submitting,
  occasionsList = [],
  categoriesList = [],
  cardTypesList = [],
  placementsList = [],
  onAddImageRow,
  onRemoveImageRow,
  onImageChange,
  onAddPlacementRow,
  onRemovePlacementRow,
  onPlacementChange,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [visibleCols, setVisibleCols] = useState({
    slno: true,
    name: true,
    made_of: true,
    occasions: true,
    categories: true,
    card_types: true,
    status: true,
  });
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setColumnsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleCol = (key) => {
    setVisibleCols((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredItems = items.filter((item) => {
    const name = item.product_name || item.name || '';
    const madeOf = item.product_made_of || '';
    return (
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      madeOf.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="flex min-h-screen bg-stone-100 text-stone-800">
      <Sidebar />

      <main className="flex-1 p-8">
        {/* ── HEADER ── */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
              Product Overview
            </h1>
            <p className="mt-1 text-sm text-stone-500">Manage and view catalog products</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onProfile}
              className="flex items-center gap-3 rounded-full border border-stone-300 bg-white px-3 py-2 shadow-sm hover:border-amber-400 hover:bg-stone-50 transition cursor-pointer text-left"
              title="View Profile"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e3d3a3] text-xs font-bold text-stone-800">
                AD
              </div>
              <div>
                <p className="text-sm font-medium text-stone-800">Admin User</p>
                <p className="text-xs text-stone-500">Manager</p>
              </div>
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="rounded-xl bg-stone-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700"
            >
              Logout
            </button>
          </div>
        </div>

        {/* ── MAIN CARD ── */}
        <div className="rounded-2xl border border-stone-200 bg-white shadow-sm">
          <div className="border-b border-stone-200 px-6 py-4">
            <h2 className="text-base font-semibold text-stone-800">Product Catalog List</h2>
          </div>

          {/* Search + Action bar */}
          <div className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:w-72">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2.5 pl-10 pr-4 text-sm text-stone-800 outline-none placeholder:text-stone-400
                           focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-200 transition"
              />
            </div>

            <div className="flex items-center gap-2">
              {/* Columns Toggle */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setColumnsOpen((o) => !o)}
                  className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition shadow-sm
                    ${columnsOpen
                      ? 'border-amber-500 bg-[#e3d3a3] text-stone-900'
                      : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-50'
                    }`}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="18" rx="1" />
                    <rect x="14" y="3" width="7" height="18" rx="1" />
                  </svg>
                  Columns
                </button>

                {columnsOpen && (
                  <div className="absolute right-0 top-full z-30 mt-2 w-52 rounded-xl border border-stone-200 bg-white shadow-xl">
                    <p className="border-b border-stone-100 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-stone-500">
                      Toggle Columns
                    </p>
                    <ul className="p-2">
                      {TOGGLEABLE_COLUMNS.map((col) => (
                        <li key={col.key}>
                          <label className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-stone-700 hover:bg-stone-50 select-none">
                            <input
                              type="checkbox"
                              checked={visibleCols[col.key]}
                              onChange={() => toggleCol(col.key)}
                              className="h-4 w-4 rounded border-stone-300 accent-amber-500"
                            />
                            {col.label}
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Add Product Button */}
              <button
                type="button"
                onClick={onOpenModal}
                className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition"
              >
                <span className="text-base font-bold leading-none">+</span>
                Add Product
              </button>
            </div>
          </div>

          {/* ── TABLE ── */}
          <div className="overflow-x-auto border-t border-stone-200">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-stone-200 bg-[#e3d3a3]">
                <tr>
                  {visibleCols.slno && <th className="w-16 px-6 py-4 font-semibold text-stone-800">Sl.no</th>}
                  {visibleCols.name && <th className="px-6 py-4 font-semibold text-stone-800">Product Name</th>}
                  {visibleCols.made_of && <th className="px-6 py-4 font-semibold text-stone-800">Made Of</th>}
                  {visibleCols.occasions && <th className="px-6 py-4 font-semibold text-stone-800">Occasion IDs</th>}
                  {visibleCols.categories && <th className="px-6 py-4 font-semibold text-stone-800">Category IDs</th>}
                  {visibleCols.card_types && <th className="px-6 py-4 font-semibold text-stone-800">Card Type IDs</th>}
                  {visibleCols.status && <th className="w-32 px-6 py-4 font-semibold text-stone-800">Status</th>}
                  <th className="w-28 px-6 py-4 font-semibold text-stone-800">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-stone-100 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-12 text-center text-stone-400">
                      Loading products...
                    </td>
                  </tr>
                ) : filteredItems.length > 0 ? (
                  filteredItems.map((item, index) => {
                    const status = item.product_status || item.status || 'Active';
                    return (
                      <tr key={item.id} className="hover:bg-amber-50/40 transition-colors">
                        {visibleCols.slno && <td className="px-6 py-4 font-medium text-stone-600">{index + 1}</td>}
                        {visibleCols.name && <td className="px-6 py-4 font-semibold text-stone-800">{item.product_name}</td>}
                        {visibleCols.made_of && <td className="px-6 py-4 text-stone-600">{item.product_made_of || 'N/A'}</td>}
                        {visibleCols.occasions && <td className="px-6 py-4 text-stone-600">{item.occasions_ids || 'N/A'}</td>}
                        {visibleCols.categories && <td className="px-6 py-4 text-stone-600">{item.categories_ids || 'N/A'}</td>}
                        {visibleCols.card_types && <td className="px-6 py-4 text-stone-600">{item.card_types_ids || 'N/A'}</td>}
                        {visibleCols.status && (
                          <td className="px-6 py-4">
                            <button
                              type="button"
                              onClick={() => onToggleStatus && onToggleStatus(item.id, status)}
                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border transition ${
                                status === 'Active'
                                  ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                                  : 'bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200'
                              }`}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${status === 'Active' ? 'bg-amber-500' : 'bg-stone-400'}`} />
                              {status}
                            </button>
                          </td>
                        )}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => onEdit(item.id)}
                              className="rounded-lg border border-stone-200 p-2 text-stone-500 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700 transition"
                              title="Edit Product"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z" />
                              </svg>
                            </button>
                            {onDelete && (
                              <button
                                type="button"
                                onClick={() => onDelete(item.id)}
                                className="rounded-lg border border-stone-200 p-2 text-red-400 hover:border-red-400 hover:bg-red-50 hover:text-red-600 transition"
                                title="Delete Product"
                              >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={10} className="px-6 py-12 text-center text-stone-400">
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* ─────────── MODAL ─────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative my-8 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={onCloseModal}
              className="absolute right-4 top-4 text-stone-400 hover:text-stone-700 transition"
            >
              ✕
            </button>

            <h2 className="mb-6 text-xl font-bold text-stone-900">
              {editingId ? 'Edit Product' : 'Add Product'}
            </h2>

            <form onSubmit={onSubmit} className="space-y-6">
              {/* Product Name */}
              <div>
                <label htmlFor="product_name" className="mb-1.5 block text-sm font-medium text-stone-700">
                  Product Name
                </label>
                <input
                  id="product_name"
                  name="product_name"
                  type="text"
                  value={form.product_name || ''}
                  onChange={onChange}
                  placeholder="e.g. The Aurelia Suite"
                  required
                  className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm text-stone-800 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                />
              </div>

              {/* Made Of */}
              <div>
                <label htmlFor="product_made_of" className="mb-1.5 block text-sm font-medium text-stone-700">
                  Product Made Of
                </label>
                <input
                  id="product_made_of"
                  name="product_made_of"
                  type="text"
                  value={form.product_made_of || ''}
                  onChange={onChange}
                  placeholder="e.g. Handmade Paper"
                  className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm text-stone-800 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                />
              </div>

              {/* IDs (Occasions, Categories, Card Types) */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="occasions_ids" className="mb-1.5 block text-sm font-medium text-stone-700">
                    Occasions IDs
                  </label>
                  <input
                    id="occasions_ids"
                    name="occasions_ids"
                    type="text"
                    value={form.occasions_ids || ''}
                    onChange={onChange}
                    placeholder="e.g. 1,2"
                    className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm text-stone-800 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                  />
                  {occasionsList.length > 0 && (
                    <p className="mt-1 text-xs text-stone-400">
                      Available: {occasionsList.map((o) => `${o.id}:${o.occasions || o.name}`).join(', ')}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="categories_ids" className="mb-1.5 block text-sm font-medium text-stone-700">
                    Categories IDs
                  </label>
                  <input
                    id="categories_ids"
                    name="categories_ids"
                    type="text"
                    value={form.categories_ids || ''}
                    onChange={onChange}
                    placeholder="e.g. 1"
                    className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm text-stone-800 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                  />
                  {categoriesList.length > 0 && (
                    <p className="mt-1 text-xs text-stone-400">
                      Available: {categoriesList.map((c) => `${c.id}:${c.categories || c.name}`).join(', ')}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="card_types_ids" className="mb-1.5 block text-sm font-medium text-stone-700">
                    Card Types IDs
                  </label>
                  <input
                    id="card_types_ids"
                    name="card_types_ids"
                    type="text"
                    value={form.card_types_ids || ''}
                    onChange={onChange}
                    placeholder="e.g. 1"
                    className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm text-stone-800 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                  />
                  {cardTypesList.length > 0 && (
                    <p className="mt-1 text-xs text-stone-400">
                      Available: {cardTypesList.map((ct) => `${ct.id}:${ct.card_types || ct.name}`).join(', ')}
                    </p>
                  )}
                </div>
              </div>

              {/* Status */}
              <div>
                <label htmlFor="product_status" className="mb-1.5 block text-sm font-medium text-stone-700">
                  Product Status
                </label>
                <select
                  id="product_status"
                  name="product_status"
                  value={form.product_status || 'Active'}
                  onChange={onChange}
                  className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm text-stone-800 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Images Section */}
              <div className="border-t border-stone-200 pt-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-stone-800">Product Images</h3>
                  <button
                    type="button"
                    onClick={onAddImageRow}
                    className="text-xs font-semibold text-amber-600 hover:text-amber-700"
                  >
                    + Add Image Row
                  </button>
                </div>
                {(form.images || []).map((img, idx) => (
                  <div key={idx} className="mb-3 flex items-center gap-3 rounded-xl border border-stone-200 p-3 bg-stone-50">
                    <input
                      type="text"
                      placeholder="Image URL / Base64"
                      value={img.product_images || ''}
                      onChange={(e) => onImageChange(idx, 'product_images', e.target.value)}
                      className="flex-1 rounded-lg border border-stone-300 px-3 py-1.5 text-xs text-stone-800"
                    />
                    <input
                      type="number"
                      placeholder="Sort order"
                      value={img.product_images_sort_order || idx + 1}
                      onChange={(e) => onImageChange(idx, 'product_images_sort_order', e.target.value)}
                      className="w-24 rounded-lg border border-stone-300 px-3 py-1.5 text-xs text-stone-800"
                    />
                    <button
                      type="button"
                      onClick={() => onRemoveImageRow(idx, img.id)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              {/* Placements Section */}
              <div className="border-t border-stone-200 pt-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-stone-800">Placements</h3>
                  <button
                    type="button"
                    onClick={onAddPlacementRow}
                    className="text-xs font-semibold text-amber-600 hover:text-amber-700"
                  >
                    + Add Placement Row
                  </button>
                </div>
                {(form.placements || []).map((plc, idx) => (
                  <div key={idx} className="mb-3 flex items-center gap-3 rounded-xl border border-stone-200 p-3 bg-stone-50">
                    <input
                      type="text"
                      placeholder="Placement ID (e.g. 1)"
                      value={plc.placements_id || ''}
                      onChange={(e) => onPlacementChange(idx, 'placements_id', e.target.value)}
                      className="flex-1 rounded-lg border border-stone-300 px-3 py-1.5 text-xs text-stone-800"
                    />
                    <button
                      type="button"
                      onClick={() => onRemovePlacementRow(idx, plc.id)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-xl bg-amber-500 hover:bg-amber-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingId ? 'Update Product' : 'Create Product'}
                </button>
                <button
                  type="button"
                  onClick={onCloseModal}
                  className="flex-1 rounded-xl border border-stone-300 bg-white px-5 py-3 text-sm font-medium text-stone-700 hover:bg-stone-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductView;
