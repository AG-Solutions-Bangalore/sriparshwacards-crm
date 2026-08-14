import { useEffect, useRef, useState } from 'react';

import Sidebar from '../dashboard/Sidebar';

/* Columns that can be toggled. 'actions' is always visible. */
const TOGGLEABLE_COLUMNS = [
  { key: 'slno', label: 'Sl.no' },
  { key: 'name', label: 'Category Name' },
  { key: 'status', label: 'Status' },
];

function CategoryView({
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
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [visibleCols, setVisibleCols] = useState({
    slno: true,
    name: true,
    status: true,
  });
  const dropdownRef = useRef(null);

  /* Close columns dropdown on outside click */
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setColumnsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /* Toggle a column's visibility */
  const toggleCol = (key) => {
    setVisibleCols((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  /* Filtered rows */
  const filteredItems = items.filter((item) => {
    const name = item.categories || item.category_name || item.name || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex min-h-screen bg-stone-100 text-stone-800">
      {/* SIDEBAR */}
      <Sidebar />

      <main className="flex-1 p-8">
        {/* ── PAGE HEADER ── */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
              Category Overview
            </h1>
            <p className="mt-1 text-sm text-stone-500">Manage and view category list</p>
          </div>

          {/* Admin badge + logout */}
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

          {/* Card header bar */}
          <div className="border-b border-stone-200 px-6 py-4">
            <h2 className="text-base font-semibold text-stone-800">Category List</h2>
          </div>

          {/* Search + actions row */}
          <div className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">

            {/* Search */}
            <div className="relative w-full sm:w-72">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                id="category-search"
                placeholder="Search category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2.5 pl-10 pr-4 text-sm text-stone-800 outline-none placeholder:text-stone-400
                           focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-200 transition"
              />
            </div>

            {/* Right side: Columns dropdown + Add button */}
            <div className="flex items-center gap-2">

              {/* ── COLUMNS DROPDOWN ── */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  id="columns-toggle-btn"
                  onClick={() => setColumnsOpen((o) => !o)}
                  className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition shadow-sm
                    ${columnsOpen
                      ? 'border-amber-500 bg-[#e3d3a3] text-stone-900'
                      : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-50'
                    }`}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="18" rx="1" />
                    <rect x="14" y="3" width="7" height="18" rx="1" />
                  </svg>
                  Columns
                  <svg
                    className={`h-3.5 w-3.5 transition-transform ${columnsOpen ? 'rotate-180' : ''}`}
                    viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {/* Dropdown panel */}
                {columnsOpen && (
                  <div className="absolute right-0 top-full z-30 mt-2 w-52 rounded-xl border border-stone-200 bg-white shadow-xl">
                    <p className="border-b border-stone-100 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-stone-500">
                      Toggle Columns
                    </p>
                    <ul className="p-2">
                      {TOGGLEABLE_COLUMNS.map((col) => (
                        <li key={col.key}>
                          <label
                            htmlFor={`col-${col.key}`}
                            className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-stone-700 hover:bg-stone-50 select-none"
                          >
                            <input
                              id={`col-${col.key}`}
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
                    <div className="border-t border-stone-100 px-4 py-2">
                      <p className="text-xs text-stone-400">Actions column is always visible.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Add Category button */}
              <button
                type="button"
                id="add-category-btn"
                onClick={onOpenModal}
                className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition"
              >
                <span className="text-base font-bold leading-none">+</span>
                Add Category
              </button>
            </div>
          </div>

          {/* ── TABLE ── */}
          <div className="overflow-hidden border-t border-stone-200">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-stone-200 bg-[#e3d3a3]">
                <tr>
                  {visibleCols.slno && (
                    <th className="w-20 px-6 py-4 font-semibold text-stone-800">Sl.no</th>
                  )}
                  {visibleCols.name && (
                    <th className="px-6 py-4 font-semibold text-stone-800">
                      <div className="flex items-center gap-1.5">
                        Category Name
                        <svg className="h-3.5 w-3.5 text-stone-600" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="17 11 12 6 7 11" />
                          <polyline points="17 13 12 18 7 13" />
                        </svg>
                      </div>
                    </th>
                  )}
                  {visibleCols.status && (
                    <th className="w-36 px-6 py-4 font-semibold text-stone-800">Status</th>
                  )}
                  {/* Actions always shown */}
                  <th className="w-32 px-6 py-4 font-semibold text-stone-800">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-stone-100 bg-white">
                {loading ? (
                  <tr>
                    <td
                      colSpan={Object.values(visibleCols).filter(Boolean).length + 1}
                      className="px-6 py-12 text-center"
                    >
                      <div className="flex flex-col items-center gap-2 text-stone-400">
                        <svg className="h-6 w-6 animate-spin text-amber-500" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Loading categories...
                      </div>
                    </td>
                  </tr>
                ) : filteredItems.length > 0 ? (
                  filteredItems.map((item, index) => {
                    const name = item.categories || item.category_name || item.name || '';
                    const status = item.categories_status || item.status || 'Active';
                    return (
                      <tr key={item.id} className="hover:bg-amber-50/40 transition-colors">
                        {visibleCols.slno && (
                          <td className="px-6 py-4 font-medium text-stone-600">{index + 1}</td>
                        )}
                        {visibleCols.name && (
                          <td className="px-6 py-4 font-medium text-stone-800">{name}</td>
                        )}
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
                              title="Click to toggle status"
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${
                                status === 'Active' ? 'bg-amber-500' : 'bg-stone-400'
                              }`} />
                              {status}
                            </button>
                          </td>
                        )}
                        <td className="px-6 py-4">
                          <button
                            type="button"
                            onClick={() => onEdit(item.id)}
                            className="inline-flex items-center justify-center rounded-lg border border-stone-200 bg-white p-2 text-stone-500
                                       hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700 transition shadow-sm"
                            title="Edit Category"
                            aria-label={`Edit ${name}`}
                          >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"
                              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={Object.values(visibleCols).filter(Boolean).length + 1}
                      className="px-6 py-14 text-center"
                    >
                      <div className="flex flex-col items-center gap-2 text-stone-400">
                        <svg className="h-8 w-8 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round"
                            d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {searchQuery ? `No categories match "${searchQuery}"` : 'No categories found.'}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ── FOOTER / PAGINATION ── */}
          <div className="flex items-center justify-between border-t border-stone-100 px-6 py-4">
            <p className="text-sm text-stone-500">
              Showing <span className="font-semibold text-stone-800">{filteredItems.length}</span> of{' '}
              <span className="font-semibold text-stone-800">{items.length}</span> categories
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled
                className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-300 shadow-sm cursor-not-allowed"
              >
                Previous
              </button>
              <button
                type="button"
                disabled
                className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-300 shadow-sm cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ─────────── MODAL ─────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-stone-200">

            {/* Close button */}
            <button
              type="button"
              onClick={onCloseModal}
              className="absolute right-4 top-4 text-stone-400 hover:text-stone-700 transition"
              aria-label="Close modal"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Modal title */}
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e3d3a3]">
                <svg className="h-5 w-5 text-amber-700" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-stone-900">
                {editingId ? 'Edit Category' : 'Add Category'}
              </h2>
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} className="space-y-5">
              {/* Category Name */}
              <div>
                <label htmlFor="categories" className="mb-1.5 block text-sm font-medium text-stone-700">
                  Category Name
                </label>
                <input
                  id="categories"
                  name="categories"
                  type="text"
                  value={form.categories}
                  onChange={onChange}
                  placeholder="Enter category name"
                  required
                  className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-800 shadow-sm outline-none transition
                             focus:border-amber-500 focus:ring-2 focus:ring-amber-200 placeholder:text-stone-400"
                />
              </div>

              {/* Status */}
              <div>
                <label htmlFor="categories_status" className="mb-1.5 block text-sm font-medium text-stone-700">
                  Status
                </label>
                <select
                  id="categories_status"
                  name="categories_status"
                  value={form.categories_status || 'Active'}
                  onChange={onChange}
                  className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-800 shadow-sm outline-none transition
                             focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-xl bg-amber-500 hover:bg-amber-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Saving...' : editingId ? 'Update' : 'Create'}
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

export default CategoryView;
