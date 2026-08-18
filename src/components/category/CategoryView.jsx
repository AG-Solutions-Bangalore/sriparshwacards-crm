import { useEffect, useRef, useState } from 'react';
import Sidebar from '../dashboard/Sidebar';
import LogoutConfirmModal from '../common/LogoutConfirmModal';

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
  currentPage = 1,
  onPageChange,
  totalPages = 1,
  totalCount = 0,
  searchQuery = '',
  onSearchChange,
}) {
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleConfirmLogout = async () => {
    setLoggingOut(true);
    if (onLogout) await onLogout();
    setLoggingOut(false);
    setShowLogoutConfirm(false);
  };
  const [visibleCols, setVisibleCols] = useState({
    slno: true,
    name: true,
    status: true,
  });
  const dropdownRef = useRef(null);

  const itemsPerPage = 10;
  const isServerPaginated = typeof onPageChange === 'function';
  const filteredItems = items.filter((item) => {
    const name = item.categories || item.category_name || item.name || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = isServerPaginated ? filteredItems : filteredItems.slice(startIndex, startIndex + itemsPerPage);
  const calculatedTotalPages = isServerPaginated ? totalPages : Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
  const displayTotal = isServerPaginated ? (totalCount || items.length) : filteredItems.length;
  const startNum = startIndex + 1;
  const endNum = isServerPaginated ? Math.min(currentPage * itemsPerPage, displayTotal) : Math.min(startIndex + itemsPerPage, filteredItems.length);

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

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F5F0] text-[#1A1817] font-sans">
      {/* SIDEBAR */}
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        {/* ── PAGE HEADER ── */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl font-normal tracking-tight text-[#1A1817]">
              Category Overview
            </h1>
            <p className="mt-1 text-xs text-[#8C857B]">Manage invitation categories & collection groupings</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onProfile}
              className="flex items-center gap-2.5 rounded-full bg-white px-3.5 py-1.5 shadow-xs border border-[#E5E0D8] hover:border-[#C99C4B] transition cursor-pointer text-left"
              title="View Profile"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EFECE6] text-[11px] font-serif font-bold text-[#1A1817] border border-[#D5CFC5]">
                A
              </div>
              <div className="pr-1">
                <p className="text-xs font-bold text-[#1A1817] leading-tight">Admin</p>
                <p className="text-[10px] text-[#8C857B] leading-tight">Manager</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              className="flex items-center gap-2.5 rounded-full bg-white px-3.5 py-1.5 shadow-xs border border-[#E5E0D8] hover:border-red-500 hover:bg-red-50/40 transition cursor-pointer text-left"
              title="Log out"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-50 text-red-600 border border-red-200">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <div className="pr-1">
                <p className="text-xs font-bold text-red-600 leading-tight">Logout</p>
                <p className="text-[10px] text-red-500/80 leading-tight">Exit</p>
              </div>
            </button>
          </div>
        </div>

        {/* ── MAIN CARD ── */}
        <div className="rounded-xl border border-[#E8E3DA] bg-white shadow-xs">
          {/* Card header bar */}
          <div className="border-b border-[#F0ECE1] px-6 py-4 flex items-center justify-between">
            <h2 className="font-serif text-xl font-normal text-[#1A1817]">Category List</h2>
          </div>

          {/* Search + actions row */}
          <div className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#F0ECE1] bg-[#FAF8F5]">
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#8C857B]">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search category..."
                value={searchQuery}
                onChange={(e) => onSearchChange ? onSearchChange(e.target.value) : null}
                className="w-full rounded-md border border-[#E2DDD5] bg-white py-2 pl-10 pr-4 text-xs text-[#1A1817] outline-none placeholder:text-[#A39C93] focus:border-[#1A1817] transition"
              />
            </div>

            {/* Right side: Columns dropdown + Add button */}
            <div className="flex items-center gap-3">
              {/* COLUMNS DROPDOWN */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  id="columns-toggle-btn"
                  onClick={() => setColumnsOpen((o) => !o)}
                  className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-serif text-xs font-normal tracking-wide transition shadow-xs cursor-pointer ${
                    columnsOpen
                      ? 'border-[#1A1817] bg-[#F5CE93] text-[#1A1817]'
                      : 'border-[#E2DDD5] bg-white text-[#1A1817] hover:bg-[#F7F5F0]'
                  }`}
                >
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="18" rx="1" />
                    <rect x="14" y="3" width="7" height="18" rx="1" />
                  </svg>
                  Columns
                </button>

                {columnsOpen && (
                  <div className="absolute right-0 top-full z-30 mt-2 w-52 rounded-lg border border-[#E2DDD5] bg-white shadow-lg">
                    <p className="border-b border-[#F0ECE1] px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#8C857B]">
                      Toggle Columns
                    </p>
                    <ul className="p-2 space-y-1">
                      {TOGGLEABLE_COLUMNS.map((col) => (
                        <li key={col.key}>
                          <label
                            htmlFor={`col-${col.key}`}
                            className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-1.5 text-xs text-[#1A1817] hover:bg-[#F7F5F0] select-none"
                          >
                            <input
                              id={`col-${col.key}`}
                              type="checkbox"
                              checked={visibleCols[col.key]}
                              onChange={() => toggleCol(col.key)}
                              className="h-3.5 w-3.5 rounded border-[#C5C0B6] accent-[#1A1817]"
                            />
                            {col.label}
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Add Category button */}
              <button
                type="button"
                id="add-category-btn"
                onClick={onOpenModal}
                className="flex items-center gap-1.5 rounded-full bg-[#1A1817] hover:bg-[#38332E] px-4 py-1.5 font-serif text-xs font-normal tracking-wide text-white transition shadow-xs cursor-pointer"
              >
                <span className="font-serif text-xs leading-none">+</span>
                Add Category
              </button>
            </div>
          </div>

          {/* ── TABLE ── */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="border-b border-[#E2DDD5] bg-[#EFECE6]">
                <tr className="text-[10px] font-semibold uppercase tracking-wider text-[#59534C]">
                  {visibleCols.slno && (
                    <th className="w-20 px-6 py-2.5">Sl.no</th>
                  )}
                  {visibleCols.name && (
                    <th className="px-6 py-2.5">Category Name</th>
                  )}
                  {visibleCols.status && (
                    <th className="w-36 px-6 py-2.5">Status</th>
                  )}
                  <th className="w-32 px-6 py-2.5 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#F7F5F0] bg-white">
                {loading ? (
                  <tr>
                    <td
                      colSpan={Object.values(visibleCols).filter(Boolean).length + 1}
                      className="px-6 py-12 text-center text-[#8C857B]"
                    >
                      Loading categories...
                    </td>
                  </tr>
                ) : paginatedItems.length > 0 ? (
                  paginatedItems.map((item, index) => {
                    const status = item.categories_status || item.status || 'Active';
                    return (
                      <tr key={item.id} className="hover:bg-[#FAF8F5] transition-colors">
                        {visibleCols.slno && (
                          <td className="px-6 py-4 font-mono text-[#8C857B]">{startIndex + index + 1}</td>
                        )}
                        {visibleCols.name && (
                          <td className="px-6 py-4 font-bold text-[#1A1817]">{item.categories}</td>
                        )}
                        {visibleCols.status && (
                          <td className="px-6 py-4">
                            <button
                              type="button"
                              onClick={() => onToggleStatus && onToggleStatus(item.id, status)}
                              className={`inline-block border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md cursor-pointer transition ${
                                status === 'Active'
                                  ? 'border-emerald-500 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                                  : 'border-rose-400 text-rose-700 bg-rose-50 hover:bg-rose-100'
                              }`}
                            >
                              {status}
                            </button>
                          </td>
                        )}
                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => onEdit(item.id)}
                            className="p-1.5 text-[#59534C] hover:text-[#1A1817] transition cursor-pointer"
                            title="Edit Category"
                          >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"
                              stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
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
                      className="px-6 py-12 text-center text-[#8C857B]"
                    >
                      No categories found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ── PAGINATION BAR ── */}
          <div className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between border-t border-[#F0ECE1] bg-[#FAF8F5]">
            <p className="text-xs text-[#8C857B]">
              Showing <span className="font-semibold text-[#1A1817]">{displayTotal > 0 ? startNum : 0}</span> to{' '}
              <span className="font-semibold text-[#1A1817]">{endNum}</span> of{' '}
              <span className="font-semibold text-[#1A1817]">{displayTotal}</span> categories
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onPageChange && onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="inline-flex items-center gap-1 rounded-full border border-[#E2DDD5] bg-white px-3 py-1 text-[10px] font-semibold text-[#1A1817] shadow-xs hover:bg-[#EFECE6] disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>

              <div className="flex items-center gap-1 px-3 text-[10px] font-semibold text-[#59534C]">
                <span>Page</span>
                <span className="text-[#1A1817] font-bold">{currentPage}</span>
                <span>of</span>
                <span className="text-[#1A1817] font-bold">{calculatedTotalPages}</span>
              </div>

              <button
                type="button"
                onClick={() => onPageChange && onPageChange(currentPage + 1)}
                disabled={currentPage >= calculatedTotalPages}
                className="inline-flex items-center gap-1 rounded-full border border-[#E2DDD5] bg-white px-3 py-1 text-[10px] font-semibold text-[#1A1817] shadow-xs hover:bg-[#EFECE6] disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                Next
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ─────────── MODAL ─────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md rounded-xl bg-[#F7F5F0] p-6 shadow-2xl border border-[#E2DDD5]">
            <button
              type="button"
              onClick={onCloseModal}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-[#8C857B] hover:text-[#1A1817] hover:bg-[#EFECE6] transition cursor-pointer"
              title="Close modal"
            >
              ✕
            </button>

            <h2 className="font-serif text-2xl font-normal text-[#1A1817] mb-6">
              {editingId ? 'Edit Category' : 'Add Category'}
            </h2>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label htmlFor="categories" className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-[#8C857B]">
                  CATEGORY NAME
                </label>
                <input
                  id="categories"
                  name="categories"
                  type="text"
                  autoFocus
                  value={form.categories}
                  onChange={onChange}
                  placeholder="Enter category name"
                  required
                  className="w-full rounded-md border border-[#E2DDD5] bg-white p-3 text-xs text-[#1A1817] outline-none placeholder:text-[#A39C93] focus:border-[#1A1817] transition"
                />
              </div>

              {editingId ? (
                <div>
                  <label htmlFor="categories_status" className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-[#8C857B]">
                    STATUS
                  </label>
                  <select
                    id="categories_status"
                    name="categories_status"
                    value={form.categories_status || 'Active'}
                    onChange={onChange}
                    className="w-full rounded-md border border-[#E2DDD5] bg-white p-3 text-xs text-[#1A1817] outline-none focus:border-[#1A1817] transition"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              ) : null}

              <div className="flex items-center justify-center gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-full bg-[#1A1817] hover:bg-[#38332E] px-6 py-1.5 font-serif text-xs font-normal tracking-wide text-white transition shadow-xs cursor-pointer disabled:opacity-50 min-w-[90px]"
                >
                  {submitting ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={onCloseModal}
                  className="rounded-full border border-[#E2DDD5] bg-white hover:bg-[#F7F5F0] px-6 py-1.5 font-serif text-xs font-normal tracking-wide text-[#1A1817] transition cursor-pointer shadow-xs min-w-[90px]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <LogoutConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleConfirmLogout}
        submitting={loggingOut}
      />
    </div>
  );
}

export default CategoryView;

