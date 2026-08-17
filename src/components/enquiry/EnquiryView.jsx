import { useEffect, useRef, useState } from 'react';

import Sidebar from '../dashboard/Sidebar';

const TOGGLEABLE_COLUMNS = [
  { key: 'slno', label: 'Sl.no' },
  { key: 'name', label: 'Customer Name' },
  { key: 'mobile', label: 'Mobile' },
  { key: 'email', label: 'Email' },
  { key: 'message', label: 'Message' },
  { key: 'status', label: 'Status' },
];

function EnquiryView({
  items,
  loading,
  onToggleStatus,
  onDelete,
  onLogout,
  onProfile,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [visibleCols, setVisibleCols] = useState({
    slno: true,
    name: true,
    mobile: true,
    email: true,
    message: true,
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
    const name = item.name || item.customer_name || item.full_name || '';
    const email = item.email || '';
    const mobile = item.mobile || item.phone || '';
    const query = searchQuery.toLowerCase();

    return (
      name.toLowerCase().includes(query) ||
      email.toLowerCase().includes(query) ||
      mobile.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex min-h-screen bg-stone-100 text-stone-800">
      <Sidebar />

      <main className="flex-1 p-8">
        {/* HEADER */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
              Customer Enquiries
            </h1>
            <p className="mt-1 text-sm text-stone-500">View and manage customer inquiry requests</p>
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

        {/* MAIN CARD */}
        <div className="rounded-2xl border border-stone-200 bg-white shadow-sm">
          <div className="border-b border-stone-200 px-6 py-4">
            <h2 className="text-base font-semibold text-stone-800">Enquiry List</h2>
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
                placeholder="Search enquiries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2.5 pl-10 pr-4 text-sm text-stone-800 outline-none placeholder:text-stone-400
                           focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-200 transition"
              />
            </div>

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
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto border-t border-stone-200">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-stone-200 bg-[#e3d3a3]">
                <tr>
                  {visibleCols.slno && <th className="w-16 px-6 py-4 font-semibold text-stone-800">Sl.no</th>}
                  {visibleCols.name && <th className="px-6 py-4 font-semibold text-stone-800">Name</th>}
                  {visibleCols.mobile && <th className="px-6 py-4 font-semibold text-stone-800">Mobile</th>}
                  {visibleCols.email && <th className="px-6 py-4 font-semibold text-stone-800">Email</th>}
                  {visibleCols.message && <th className="px-6 py-4 font-semibold text-stone-800">Message</th>}
                  {visibleCols.status && <th className="w-36 px-6 py-4 font-semibold text-stone-800">Status</th>}
                  <th className="w-24 px-6 py-4 font-semibold text-stone-800">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-stone-100 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-stone-400">
                      Loading enquiries...
                    </td>
                  </tr>
                ) : filteredItems.length > 0 ? (
                  filteredItems.map((item, index) => {
                    const status = item.enquiryStatus || item.status || 'Pending';
                    return (
                      <tr key={item.id} className="hover:bg-amber-50/40 transition-colors">
                        {visibleCols.slno && <td className="px-6 py-4 font-medium text-stone-600">{index + 1}</td>}
                        {visibleCols.name && <td className="px-6 py-4 font-semibold text-stone-800">{item.name || item.customer_name || 'N/A'}</td>}
                        {visibleCols.mobile && <td className="px-6 py-4 text-stone-600">{item.mobile || item.phone || 'N/A'}</td>}
                        {visibleCols.email && <td className="px-6 py-4 text-stone-600">{item.email || 'N/A'}</td>}
                        {visibleCols.message && <td className="px-6 py-4 text-stone-600 max-w-xs truncate">{item.message || 'N/A'}</td>}
                        {visibleCols.status && (
                          <td className="px-6 py-4">
                            <select
                              value={status}
                              onChange={(e) => onToggleStatus(item.id, e.target.value)}
                              className={`rounded-lg px-2.5 py-1 text-xs font-semibold border outline-none cursor-pointer ${
                                status === 'Resolved' || status === 'Completed'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : status === 'In Progress'
                                  ? 'bg-blue-50 text-blue-800 border-blue-300'
                                  : 'bg-amber-50 text-amber-800 border-amber-300'
                              }`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Resolved">Resolved</option>
                            </select>
                          </td>
                        )}
                        <td className="px-6 py-4">
                          <button
                            type="button"
                            onClick={() => onDelete(item.id)}
                            className="rounded-lg border border-stone-200 p-2 text-red-400 hover:border-red-400 hover:bg-red-50 hover:text-red-600 transition"
                            title="Delete Enquiry"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-stone-400">
                      No enquiries found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default EnquiryView;
