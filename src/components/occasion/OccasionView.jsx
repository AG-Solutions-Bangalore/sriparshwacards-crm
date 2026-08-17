import { useEffect, useRef, useState } from 'react';

import Sidebar from '../dashboard/Sidebar';

/* Columns that can be toggled. 'actions' is always visible. */
const TOGGLEABLE_COLUMNS = [
  { key: 'slno', label: 'Sl.no' },
  { key: 'name', label: 'Occasion Name' },
  { key: 'status', label: 'Status' },
];

function OccasionView({
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
  const filteredItems = items.filter((item) =>
    (item.occasions || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#F7F5F0] text-[#1A1817] font-sans">
      {/* SIDEBAR */}
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        {/* ── PAGE HEADER ── */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl font-normal tracking-tight text-[#1A1817]">
              Occasion Overview
            </h1>
            <p className="mt-1 text-xs text-[#8C857B]">Manage invitation occasions & wedding celebration types</p>
          </div>

          {/* Admin badge + logout */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onProfile}
              className="flex items-center gap-3 rounded-full bg-white px-3 py-1.5 shadow-sm border border-[#E5E0D8] hover:border-[#C99C4B] transition cursor-pointer text-left"
              title="View Profile"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EFECE6] text-xs font-serif font-bold text-[#1A1817] border border-[#D5CFC5]">
                EA
              </div>
              <div className="pr-1">
                <p className="text-xs font-bold text-[#1A1817] leading-tight">Admin User</p>
                <p className="text-[10px] text-[#8C857B] leading-tight">Manager</p>
              </div>
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-none bg-[#1A1817] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-[#38332E] cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>

        {/* ── MAIN CARD ── */}
        <div className="rounded-xl border border-[#E8E3DA] bg-white shadow-xs">
          {/* Card header bar */}
          <div className="border-b border-[#F0ECE1] px-6 py-4 flex items-center justify-between">
            <h2 className="font-serif text-xl font-normal text-[#1A1817]">Occasion List</h2>
            <span className="text-xs text-[#8C857B]">{filteredItems.length} Occasions</span>
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
                id="occasion-search"
                placeholder="Search occasion..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
                  className={`flex items-center gap-2 rounded-md border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition shadow-xs cursor-pointer ${
                    columnsOpen
                      ? 'border-[#1A1817] bg-[#F5CE93] text-[#1A1817]'
                      : 'border-[#E2DDD5] bg-white text-[#59534C] hover:bg-[#F7F5F0]'
                  }`}
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none"
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

              {/* Add Occasion button */}
              <button
                type="button"
                id="add-occasion-btn"
                onClick={onOpenModal}
                className="flex items-center gap-2 bg-[#1A1817] hover:bg-[#38332E] px-5 py-2 text-xs font-semibold uppercase tracking-widest text-white transition shadow-xs cursor-pointer"
              >
                <span className="text-sm font-bold leading-none">+</span>
                ADD OCCASION
              </button>
            </div>
          </div>

          {/* ── TABLE ── */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="border-b border-[#E2DDD5] bg-[#EFECE6]">
                <tr className="text-[11px] font-semibold uppercase tracking-wider text-[#59534C]">
                  {visibleCols.slno && (
                    <th className="w-20 px-6 py-3.5">Sl.no</th>
                  )}
                  {visibleCols.name && (
                    <th className="px-6 py-3.5">Occasion Name</th>
                  )}
                  {visibleCols.status && (
                    <th className="w-36 px-6 py-3.5">Status</th>
                  )}
                  <th className="w-32 px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#F7F5F0] bg-white">
                {loading ? (
                  <tr>
                    <td
                      colSpan={Object.values(visibleCols).filter(Boolean).length + 1}
                      className="px-6 py-12 text-center text-[#8C857B]"
                    >
                      Loading occasions...
                    </td>
                  </tr>
                ) : filteredItems.length > 0 ? (
                  filteredItems.map((item, index) => {
                    const status = item.occasions_status || item.status || 'Active';
                    return (
                      <tr key={item.id} className="hover:bg-[#FAF8F5] transition-colors">
                        {visibleCols.slno && (
                          <td className="px-6 py-4 font-mono text-[#8C857B]">{index + 1}</td>
                        )}
                        {visibleCols.name && (
                          <td className="px-6 py-4 font-bold text-[#1A1817]">{item.occasions}</td>
                        )}
                        {visibleCols.status && (
                          <td className="px-6 py-4">
                            <button
                              type="button"
                              onClick={() => onToggleStatus && onToggleStatus(item.id, status)}
                              className={`inline-block border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider cursor-pointer transition ${
                                status === 'Active'
                                  ? 'border-[#1A1817] text-[#1A1817] bg-white hover:bg-[#F5CE93]'
                                  : 'border-[#C5C0B6] text-[#8C857B] bg-white hover:bg-[#EFECE6]'
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
                            title="Edit Occasion"
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
                      No occasions found.
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md rounded-xl bg-[#F7F5F0] p-6 shadow-2xl border border-[#E2DDD5]">
            <button
              type="button"
              onClick={onCloseModal}
              className="absolute right-4 top-4 text-[#8C857B] hover:text-[#1A1817] transition"
            >
              ✕
            </button>

            <h2 className="font-serif text-2xl font-normal text-[#1A1817] mb-6">
              {editingId ? 'Edit Occasion' : 'Add Occasion'}
            </h2>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label htmlFor="occasions" className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-[#8C857B]">
                  OCCASION NAME
                </label>
                <input
                  id="occasions"
                  name="occasions"
                  type="text"
                  value={form.occasions}
                  onChange={onChange}
                  placeholder="Enter occasion name"
                  required
                  className="w-full rounded-md border border-[#E2DDD5] bg-white p-3 text-xs text-[#1A1817] outline-none placeholder:text-[#A39C93] focus:border-[#1A1817] transition"
                />
              </div>

              <div>
                <label htmlFor="occasions_status" className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-[#8C857B]">
                  STATUS
                </label>
                <select
                  id="occasions_status"
                  name="occasions_status"
                  value={form.occasions_status || 'Active'}
                  onChange={onChange}
                  className="w-full rounded-md border border-[#E2DDD5] bg-white p-3 text-xs text-[#1A1817] outline-none focus:border-[#1A1817] transition"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-[#1A1817] px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white hover:bg-[#38332E] transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'SAVING...' : editingId ? 'UPDATE' : 'CREATE'}
                </button>
                <button
                  type="button"
                  onClick={onCloseModal}
                  className="flex-1 border border-[#2D2926] bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-[#1A1817] hover:bg-[#EFECE6] transition cursor-pointer"
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default OccasionView;

