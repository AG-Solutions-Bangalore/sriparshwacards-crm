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
    <div className="flex min-h-screen bg-[#F7F5F0] text-[#1A1817] font-sans">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        {/* HEADER */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl font-normal tracking-tight text-[#1A1817]">
              Customer Enquiries
            </h1>
            <p className="mt-1 text-xs text-[#8C857B]">View and manage bespoke invitation inquiry requests</p>
          </div>

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

        {/* MAIN CARD */}
        <div className="rounded-xl border border-[#E8E3DA] bg-white shadow-xs">
          <div className="border-b border-[#F0ECE1] px-6 py-4 flex items-center justify-between">
            <h2 className="font-serif text-xl font-normal text-[#1A1817]">Enquiries List</h2>
            <span className="text-xs text-[#8C857B]">{filteredItems.length} Enquiries</span>
          </div>

          {/* Search + Action row */}
          <div className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#F0ECE1] bg-[#FAF8F5]">
            <div className="relative w-full sm:w-80">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#8C857B]">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search by name, email, mobile..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-[#E2DDD5] bg-white py-2 pl-10 pr-4 text-xs text-[#1A1817] outline-none placeholder:text-[#A39C93] focus:border-[#1A1817] transition"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setColumnsOpen((o) => !o)}
                  className={`flex items-center gap-2 rounded-md border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition shadow-xs cursor-pointer ${columnsOpen
                    ? 'border-[#1A1817] bg-[#F5CE93] text-[#1A1817]'
                    : 'border-[#E2DDD5] bg-white text-[#59534C] hover:bg-[#F7F5F0]'
                    }`}
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                          <label className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-1.5 text-xs text-[#1A1817] hover:bg-[#F7F5F0] select-none">
                            <input
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
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="border-b border-[#E2DDD5] bg-[#EFECE6]">
                <tr className="text-[11px] font-semibold uppercase tracking-wider text-[#59534C]">
                  {visibleCols.slno && <th className="w-16 px-6 py-3.5">Sl.no</th>}
                  {visibleCols.name && <th className="px-6 py-3.5">Customer</th>}
                  {visibleCols.mobile && <th className="px-6 py-3.5">Mobile</th>}
                  {visibleCols.email && <th className="px-6 py-3.5">Email</th>}
                  {visibleCols.message && <th className="px-6 py-3.5">Message</th>}
                  {visibleCols.status && <th className="w-36 px-6 py-3.5">Status</th>}
                  <th className="w-24 px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#F7F5F0] bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-12 text-center text-[#8C857B]">
                      Loading enquiries...
                    </td>
                  </tr>
                ) : filteredItems.length > 0 ? (
                  filteredItems.map((item, index) => {
                    const name = item.name || item.customer_name || item.full_name || 'N/A';
                    const mobile = item.mobile || item.phone || 'N/A';
                    const email = item.email || 'N/A';
                    const message = item.message || item.remarks || 'N/A';
                    const status = item.status || item.enquiry_status || 'New';

                    const badgeStyle =
                      status.toLowerCase() === 'new'
                        ? 'bg-[#F5CE93] text-[#1A1817]'
                        : status.toLowerCase() === 'contacted'
                          ? 'bg-[#E5E2DC] text-[#4A453E]'
                          : 'bg-[#E6DDD0] text-[#544738]';

                    return (
                      <tr key={item.id || index} className="hover:bg-[#FAF8F5] transition-colors">
                        {visibleCols.slno && <td className="px-6 py-4 font-mono text-[#8C857B]">{index + 1}</td>}
                        {visibleCols.name && <td className="px-6 py-4 font-bold text-[#1A1817]">{name}</td>}
                        {visibleCols.mobile && <td className="px-6 py-4 text-[#59534C] font-mono">{mobile}</td>}
                        {visibleCols.email && <td className="px-6 py-4 text-[#59534C]">{email}</td>}
                        {visibleCols.message && (
                          <td className="max-w-xs px-6 py-4 text-[#8C857B] truncate" title={message}>
                            {message}
                          </td>
                        )}
                        {visibleCols.status && (
                          <td className="px-6 py-4">
                            <button
                              type="button"
                              onClick={() => onToggleStatus && onToggleStatus(item.id, status)}
                              className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider cursor-pointer ${badgeStyle}`}
                            >
                              {status}
                            </button>
                          </td>
                        )}
                        <td className="px-6 py-4 text-right">
                          {onDelete && (
                            <button
                              type="button"
                              onClick={() => onDelete(item.id)}
                              className="p-1.5 text-[#8C857B] hover:text-red-600 transition cursor-pointer"
                              title="Delete Enquiry"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={10} className="px-6 py-12 text-center text-[#8C857B]">
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

