import Sidebar from '../dashboard/Sidebar';

export function downloadExcel(data, fromDate, toDate) {
  if (!data || data.length === 0) return;

  const headers = [
    'Sl.no',
    'Customer Name',
    'Mobile',
    'Email',
    'Occasion / Message',
    'Wedding Date',
    'Status',
    'Created At',
  ];

  const rows = data.map((item, index) => {
    const name =
      item.enquiryFullName ||
      item.enquiry_full_name ||
      item.customer_name ||
      item.full_name ||
      item.name ||
      item.customer ||
      'N/A';
    const mobile =
      item.enquiryMobile ||
      item.enquiry_mobile ||
      item.mobile ||
      item.phone ||
      item.phone_number ||
      'N/A';
    const email =
      item.enquiryEmail ||
      item.enquiry_email ||
      item.email ||
      'N/A';
    const message =
      item.enquiryOccassion ||
      item.enquiryOccasion ||
      item.enquiry_occassion ||
      item.enquiryMessage ||
      item.enquiry_message ||
      item.message ||
      item.remarks ||
      item.occasion ||
      'N/A';
    const weddingDate =
      item.enquiryWeddingDate ||
      item.enquiry_wedding_date ||
      item.wedding_date ||
      'N/A';
    const status =
      item.enquiryStatus || item.enquiry_status || item.status || 'New';
    const createdAt = item.created_at
      ? new Date(item.created_at).toLocaleDateString()
      : 'N/A';

    return [
      index + 1,
      `"${String(name).replace(/"/g, '""')}"`,
      `"${String(mobile).replace(/"/g, '""')}"`,
      `"${String(email).replace(/"/g, '""')}"`,
      `"${String(message).replace(/"/g, '""')}"`,
      `"${String(weddingDate).replace(/"/g, '""')}"`,
      `"${String(status).replace(/"/g, '""')}"`,
      `"${String(createdAt).replace(/"/g, '""')}"`,
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const rangeStr = fromDate && toDate ? `${fromDate}_to_${toDate}` : 'All_Time';
  link.setAttribute('href', url);
  link.setAttribute('download', `Enquiry_Report_${rangeStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function EnquiryReportView({
  items,
  loading,
  hasSubmitted,
  fromDateInput,
  toDateInput,
  statusInput,
  onFromDateChange,
  onToDateChange,
  onStatusInputChange,
  onSubmitFilter,
  appliedFilters,
  onApplyPreset,
  onProfile,
}) {
  const { fromDate, toDate } = appliedFilters;

  const handleExport = () => {
    downloadExcel(items, fromDate, toDate);
  };

  return (
    <div className="flex min-h-screen bg-[#F7F5F0] text-[#1A1817] font-sans">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        {/* HEADER */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl font-normal tracking-tight text-[#1A1817]">
              Enquiry Reports
            </h1>
            <p className="mt-1 text-xs text-[#8C857B]">
              Filter, preview, and download customer enquiry reports in Excel format
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onProfile}
              className="flex items-center gap-3 rounded-lg bg-white px-3 py-1.5 shadow-sm border border-[#E5E0D8] hover:border-[#C99C4B] transition cursor-pointer text-left"
              title="View Profile"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EFECE6] text-xs font-serif font-bold text-[#1A1817] border border-[#D5CFC5]">
                EA
              </div>
              <div className="pr-1">
                <p className="text-xs font-bold text-[#1A1817] leading-tight">Admin User</p>
              </div>
            </button>
          </div>
        </div>

        {/* DATE RANGE FILTER FORM */}
        <div className="mb-6 rounded-xl border border-[#E8E3DA] bg-white p-6 shadow-xs">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-lg font-normal text-[#1A1817]">Filter by Date & Criteria</h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onApplyPreset('today')}
                className="rounded-md border border-[#E2DDD5] bg-[#FAF8F5] px-3 py-1 text-xs font-medium text-[#59534C] hover:bg-[#EFECE6] transition cursor-pointer"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => onApplyPreset('week')}
                className="rounded-md border border-[#E2DDD5] bg-[#FAF8F5] px-3 py-1 text-xs font-medium text-[#59534C] hover:bg-[#EFECE6] transition cursor-pointer"
              >
                This Week
              </button>
              <button
                type="button"
                onClick={() => onApplyPreset('month')}
                className="rounded-md border border-[#E2DDD5] bg-[#FAF8F5] px-3 py-1 text-xs font-medium text-[#59534C] hover:bg-[#EFECE6] transition cursor-pointer"
              >
                This Month
              </button>
              <button
                type="button"
                onClick={() => onApplyPreset('all')}
                className="rounded-md border border-[#E2DDD5] bg-[#FAF8F5] px-3 py-1 text-xs font-medium text-[#59534C] hover:bg-[#EFECE6] transition cursor-pointer"
              >
                All Time
              </button>
            </div>
          </div>

          <form onSubmit={onSubmitFilter} className="grid grid-cols-1 gap-4 sm:grid-cols-4 items-end">
            {/* From Date */}
            <div>
              <label htmlFor="fromDateInput" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[#8C857B]">
                FROM DATE
              </label>
              <input
                id="fromDateInput"
                type="date"
                value={fromDateInput}
                onChange={(e) => onFromDateChange(e.target.value)}
                className="w-full rounded-md border border-[#E2DDD5] bg-[#FAF8F5] p-2.5 text-xs text-[#1A1817] outline-none focus:border-[#1A1817] transition cursor-pointer"
              />
            </div>

            {/* To Date */}
            <div>
              <label htmlFor="toDateInput" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[#8C857B]">
                TO DATE
              </label>
              <input
                id="toDateInput"
                type="date"
                value={toDateInput}
                onChange={(e) => onToDateChange(e.target.value)}
                className="w-full rounded-md border border-[#E2DDD5] bg-[#FAF8F5] p-2.5 text-xs text-[#1A1817] outline-none focus:border-[#1A1817] transition cursor-pointer"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="statusInput" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[#8C857B]">
                STATUS
              </label>
              <select
                id="statusInput"
                value={statusInput}
                onChange={(e) => onStatusInputChange(e.target.value)}
                className="w-full rounded-md border border-[#E2DDD5] bg-[#FAF8F5] p-2.5 text-xs text-[#1A1817] outline-none focus:border-[#1A1817] transition cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Followed">Followed</option>
                <option value="Not Interested">Not Interested</option>
                <option value="Complete">Complete</option>
                <option value="Cancel">Cancel</option>
              </select>
            </div>

            {/* SUBMIT BUTTON */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-[#1A1817] hover:bg-[#38332E] py-2.5 px-4 text-xs font-bold uppercase tracking-widest text-white transition shadow-xs cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {loading ? 'FETCHING...' : 'SUBMIT FILTER'}
              </button>
            </div>
          </form>
        </div>

        {/* MAIN DATA PREVIEW CARD */}
        <div className="rounded-xl border border-[#E8E3DA] bg-white shadow-xs">
          <div className="border-b border-[#F0ECE1] px-6 py-4 flex items-center justify-between bg-[#FAF8F5]">
            <div>
              <h2 className="font-serif text-xl font-normal text-[#1A1817]">Report Data Preview</h2>
              <p className="text-xs text-[#8C857B] mt-0.5">
                {hasSubmitted
                  ? `Showing ${items.length} enquiries ${fromDate || toDate ? `(${fromDate || 'Start'} to ${toDate || 'Today'})` : ''}`
                  : 'Select date range and click SUBMIT FILTER'}
              </p>
            </div>

            {/* DOWNLOAD EXCEL BUTTON */}
            <button
              type="button"
              onClick={handleExport}
              disabled={!hasSubmitted || items.length === 0}
              className="flex items-center gap-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white transition shadow-sm cursor-pointer disabled:opacity-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              DOWNLOAD EXCEL (.XLSX)
            </button>
          </div>

          {/* TABLE PREVIEW */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="border-b border-[#E2DDD5] bg-[#EFECE6]">
                <tr className="text-[11px] font-semibold uppercase tracking-wider text-[#59534C]">
                  <th className="w-16 px-6 py-3.5">Sl.no</th>
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5">Mobile</th>
                  <th className="px-6 py-3.5">Email</th>
                  <th className="px-6 py-3.5">Occasion / Message</th>
                  <th className="px-6 py-3.5">Wedding Date</th>
                  <th className="w-32 px-6 py-3.5 text-right">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#F7F5F0] bg-[#FAF8F5]/30">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-[#8C857B]">
                      Loading enquiries report from server...
                    </td>
                  </tr>
                ) : !hasSubmitted ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-[#8C857B]">
                      Select date range and click <strong className="text-[#1A1817]">SUBMIT FILTER</strong> to view and download report records.
                    </td>
                  </tr>
                ) : items.length > 0 ? (
                  items.map((item, index) => {
                    const name =
                      item.enquiryFullName ||
                      item.enquiry_full_name ||
                      item.customer_name ||
                      item.full_name ||
                      item.name ||
                      item.customer ||
                      'N/A';

                    const mobile =
                      item.enquiryMobile ||
                      item.enquiry_mobile ||
                      item.mobile ||
                      item.phone ||
                      item.phone_number ||
                      'N/A';

                    const email =
                      item.enquiryEmail ||
                      item.enquiry_email ||
                      item.email ||
                      'N/A';

                    const message =
                      item.enquiryOccassion ||
                      item.enquiryOccasion ||
                      item.enquiry_occassion ||
                      item.enquiryMessage ||
                      item.enquiry_message ||
                      item.message ||
                      item.remarks ||
                      item.occasion ||
                      'N/A';

                    const weddingDate =
                      item.enquiryWeddingDate ||
                      item.enquiry_wedding_date ||
                      item.wedding_date ||
                      'N/A';

                    const status =
                      item.enquiryStatus ||
                      item.enquiry_status ||
                      item.status ||
                      'New';

                    const statusText = String(status).toUpperCase();

                    return (
                      <tr key={item.id || index} className="hover:bg-[#FAF8F5] transition-colors">
                        <td className="px-6 py-4 font-mono text-[#8C857B]">{index + 1}</td>
                        <td className="px-6 py-4 font-bold text-[#1A1817]">{name}</td>
                        <td className="px-6 py-4 text-[#59534C] font-mono">{mobile}</td>
                        <td className="px-6 py-4 text-[#59534C]">{email}</td>
                        <td className="max-w-xs px-6 py-4 text-[#8C857B] truncate" title={message}>
                          {message}
                        </td>
                        <td className="px-6 py-4 text-[#8C857B]">{weddingDate}</td>
                        <td className="px-6 py-4 text-right">
                          <span
                            className={`inline-block rounded border px-2.5 py-0.5 text-[9px] font-bold tracking-wider ${statusText.includes('NEW') || statusText.includes('PENDING')
                              ? 'border-amber-400 bg-amber-50 text-amber-800'
                              : statusText.includes('COMPLETE')
                                ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
                                : 'border-[#C5C0B6] bg-[#FAF8F5] text-[#59534C]'
                              }`}
                          >
                            {statusText}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-[#8C857B]">
                      No enquiry records match the selected date range and filter criteria.
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

export default EnquiryReportView;
