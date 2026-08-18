import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Sidebar from '../components/dashboard/Sidebar';
import LogoutConfirmModal from '../components/common/LogoutConfirmModal';
import { useAuthContext } from '../context/AuthContext';
import { useSessionTimeout } from '../hooks/useSessionTimeout';
import { getCategories } from '../services/categoryApi';
import { getDashboardData } from '../services/dashboardApi';
import { getProducts } from '../services/productApi';

function formatDateDDMMYYYY(dateStr) {
  if (!dateStr) return 'N/A';
  const str = String(dateStr).trim();

  // Format: YYYY-MM-DD or YYYY/MM/DD
  const ymdMatch = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (ymdMatch) {
    const year = ymdMatch[1];
    const month = ymdMatch[2].padStart(2, '0');
    const day = ymdMatch[3].padStart(2, '0');
    return `${day}-${month}-${year}`;
  }

  // Format: DD-MM-YYYY or DD/MM/YYYY
  const dmyMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${day}-${month}-${year}`;
  }

  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  return str;
}

function getPieSlices(items, radius = 85, innerRadius = 52, cx = 100, cy = 100) {
  const total = items.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
  if (total === 0) return [];

  let cumulativeAngle = 0;
  return items.map((item) => {
    const val = Number(item.value) || 0;
    const angle = (val / total) * 360;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    cumulativeAngle = endAngle;

    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;

    const effectiveEndRad = angle >= 359.99 ? startRad + (359.99 * Math.PI) / 180 : endRad;

    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(effectiveEndRad);
    const y2 = cy + radius * Math.sin(effectiveEndRad);

    const ix1 = cx + innerRadius * Math.cos(startRad);
    const iy1 = cy + innerRadius * Math.sin(startRad);
    const ix2 = cx + innerRadius * Math.cos(effectiveEndRad);
    const iy2 = cy + innerRadius * Math.sin(effectiveEndRad);

    const largeArcFlag = angle > 180 ? 1 : 0;

    let pathData = '';
    if (innerRadius > 0) {
      pathData = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${ix1} ${iy1} Z`;
    } else {
      pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
    }

    const percentage = ((val / total) * 100).toFixed(1);

    return {
      ...item,
      pathData,
      percentage,
      angle,
      val,
    };
  });
}

function PlacementPieChart({ placementList, className = '' }) {
  const samplePlacementData = [
    { placement_id: 1, placements: 'Bestseller', product_count: 5 },
    { placement_id: 2, placements: 'New Arrival', product_count: 4 },
    { placement_id: 3, placements: 'Featured', product_count: 3 },
  ];

  const rawData = Array.isArray(placementList) && placementList.length > 0 ? placementList : samplePlacementData;

  const COLORS = [
    '#C99C4B', // Gold (Bestseller)
    '#1A1817', // Onyx (New Arrival)
    '#2563EB', // Royal Blue (Featured)
    '#10B981', // Emerald
    '#8B5CF6', // Purple
    '#F59E0B', // Amber
    '#EC4899', // Pink
    '#06B6D4', // Cyan
  ];

  const chartData = rawData.map((item, idx) => ({
    name: item.placements || item.placement_name || `Placement #${item.placement_id || idx + 1}`,
    value: Number(item.product_count || 0),
    color: COLORS[idx % COLORS.length],
  }));

  const totalProducts = chartData.reduce((acc, curr) => acc + curr.value, 0);
  const slices = getPieSlices(chartData, 75, 45, 90, 90);
  const [hoveredIdx, setHoveredIdx] = useState(null);

  return (
    <div className={`rounded-xl border border-[#E8E3DA] bg-white p-5 shadow-xs flex flex-col justify-between ${className}`}>
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-serif text-xl font-normal text-[#1A1817]">Placement Breakdown</h3>
            <p className="text-[11px] text-[#8C857B] mt-0.5">Product count distribution by placement</p>
          </div>
        </div>

        {totalProducts > 0 ? (
          <div className="flex flex-col items-center gap-5">
            {/* SVG Pie Chart Centered */}
            <div className="relative flex items-center justify-center shrink-0 my-2">
              <svg viewBox="0 0 180 180" className="h-44 w-44 overflow-visible transform -rotate-90">
                {slices.map((slice, idx) => {
                  const isHovered = hoveredIdx === idx;
                  return (
                    <path
                      key={idx}
                      d={slice.pathData}
                      fill={slice.color}
                      className="transition-all duration-300 cursor-pointer"
                      style={{
                        transform: isHovered ? 'scale(1.06)' : 'scale(1)',
                        transformOrigin: '90px 90px',
                        filter: isHovered ? 'drop-shadow(0px 3px 6px rgba(0,0,0,0.2))' : 'none',
                        opacity: hoveredIdx !== null && !isHovered ? 0.6 : 1,
                      }}
                      onMouseEnter={() => setHoveredIdx(idx)}
                      onMouseLeave={() => setHoveredIdx(null)}
                    />
                  );
                })}
              </svg>
              {/* Donut Inner Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-2">
                <span className="text-[9px] uppercase font-bold tracking-wider text-[#8C857B] truncate max-w-[80px]">
                  {hoveredIdx !== null ? chartData[hoveredIdx].name : 'Total'}
                </span>
                <span className="font-serif text-2xl font-bold text-[#1A1817] leading-tight">
                  {hoveredIdx !== null ? chartData[hoveredIdx].value : totalProducts}
                </span>
                <span className="text-[9px] font-semibold text-[#8C857B]">
                  {hoveredIdx !== null ? `${slices[hoveredIdx]?.percentage}%` : 'Products'}
                </span>
              </div>
            </div>

            {/* Legend List BELOW (down) the pie chart */}
            <div className="w-full space-y-2">
              {chartData.map((item, idx) => {
                const percentage = totalProducts > 0 ? ((item.value / totalProducts) * 100).toFixed(1) : 0;
                const isHovered = hoveredIdx === idx;
                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    className={`flex items-center justify-between rounded-lg p-2 px-3 border transition-all cursor-pointer ${
                      isHovered
                        ? 'border-[#C99C4B] bg-[#FAF8F5] shadow-xs translate-y-[-1px]'
                        : 'border-[#F0ECE1] bg-white hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-[11px] font-semibold text-[#1A1817] truncate">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 text-[11px] font-mono">
                      <span className="font-bold text-[#1A1817]">{item.value}</span>
                      <span className="text-[9px] text-[#8C857B]">({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-[#8C857B] text-xs">
            No placement graph data available.
          </div>
        )}
      </div>
    </div>
  );
}

function MonthlyEnquiryGraph({ monthlyList }) {
  const [viewMode, setViewMode] = useState('graph');

  const sampleData = [
    { month: 'Jan', pending: 4, followed: 6, not_interested: 1, cancel: 0, complete: 12, total: 23 },
    { month: 'Feb', pending: 3, followed: 8, not_interested: 2, cancel: 1, complete: 15, total: 29 },
    { month: 'Mar', pending: 5, followed: 7, not_interested: 1, cancel: 2, complete: 18, total: 33 },
    { month: 'Apr', pending: 2, followed: 5, not_interested: 0, cancel: 1, complete: 10, total: 18 },
  ];

  const data = Array.isArray(monthlyList) && monthlyList.length > 0 ? monthlyList : sampleData;
  const maxTotal = Math.max(...data.map(d => Number(d.total || (Number(d.pending || 0) + Number(d.followed || 0) + Number(d.complete || 0)) || 1)), 10);

  return (
    <div className="rounded-xl border border-[#E8E3DA] bg-white p-5 shadow-xs">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-serif text-xl font-normal text-[#1A1817]">Monthly Enquiry Breakdown</h3>
          <p className="text-[10px] text-[#8C857B] mt-0.5">Visual inquiry status distribution across months</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3 text-[10px] font-medium text-[#59534C]">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" /> Pending</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-500" /> Followed</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-purple-500" /> Not Interested</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-500" /> Cancel</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Complete</span>
          </div>

          <div className="flex rounded-lg border border-[#E2DDD5] bg-[#FAF8F5] p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('graph')}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-[10px] font-semibold transition cursor-pointer ${
                viewMode === 'graph' ? 'bg-[#1A1817] text-white shadow-xs' : 'text-[#59534C] hover:text-[#1A1817]'
              }`}
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Graph
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-[10px] font-semibold transition cursor-pointer ${
                viewMode === 'table' ? 'bg-[#1A1817] text-white shadow-xs' : 'text-[#59534C] hover:text-[#1A1817]'
              }`}
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Table
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'graph' ? (
        <div className="pt-2">
          <div className="mb-3 flex flex-wrap md:hidden gap-3 text-[10px] font-medium text-[#59534C]">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" /> Pending</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-500" /> Followed</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-purple-500" /> Not Interested</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-500" /> Cancel</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Complete</span>
          </div>

          <div className="relative h-52 w-full flex items-end justify-center gap-6 sm:gap-10 pt-4 pb-4 px-4 overflow-x-auto">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none p-2 opacity-40">
              <div className="border-b border-dashed border-[#C5C0B6]" />
              <div className="border-b border-dashed border-[#C5C0B6]" />
              <div className="border-b border-dashed border-[#C5C0B6]" />
              <div className="border-b border-dashed border-[#C5C0B6]" />
            </div>

            {data.map((item, idx) => {
              const pending = Number(item.pending || 0);
              const followed = Number(item.followed || 0);
              const notInterested = Number(item.not_interested || 0);
              const cancel = Number(item.cancel || 0);
              const complete = Number(item.complete || 0);
              const total = Number(item.total || (pending + followed + notInterested + cancel + complete));

              const heightPx = Math.max(Math.round((total / maxTotal) * 145), 18);

              const pPct = total > 0 ? (pending / total) * 100 : 0;
              const fPct = total > 0 ? (followed / total) * 100 : 0;
              const niPct = total > 0 ? (notInterested / total) * 100 : 0;
              const cPct = total > 0 ? (cancel / total) * 100 : 0;
              const compPct = total > 0 ? (complete / total) * 100 : 0;

              return (
                <div key={idx} className="relative group flex-1 max-w-[84px] min-w-[50px] flex flex-col items-center justify-end h-full z-10">
                  <div className="absolute -top-14 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1A1817] text-white text-[10px] rounded-md py-1.5 px-3 shadow-lg pointer-events-none z-30 flex flex-col gap-0.5 whitespace-nowrap">
                    <span className="font-bold border-b border-stone-700 pb-0.5 mb-0.5">{item.month} (Total: {total})</span>
                    <span>Pending: {pending}</span>
                    <span>Followed: {followed}</span>
                    <span>Not Interested: {notInterested}</span>
                    <span>Cancel: {cancel}</span>
                    <span>Complete: {complete}</span>
                  </div>

                  <span className="mb-1 text-[10px] font-bold text-[#1A1817] font-mono">{total}</span>

                  <div
                    className="w-full max-w-[42px] rounded-t-md overflow-hidden flex flex-col-reverse shadow-xs transition-all duration-300 group-hover:scale-105"
                    style={{ height: `${heightPx}px` }}
                  >
                    {pending > 0 && <div style={{ height: `${pPct}%` }} className="bg-amber-500 w-full transition-all" title={`Pending: ${pending}`} />}
                    {followed > 0 && <div style={{ height: `${fPct}%` }} className="bg-blue-500 w-full transition-all" title={`Followed: ${followed}`} />}
                    {notInterested > 0 && <div style={{ height: `${niPct}%` }} className="bg-purple-500 w-full transition-all" title={`Not Interested: ${notInterested}`} />}
                    {cancel > 0 && <div style={{ height: `${cPct}%` }} className="bg-rose-500 w-full transition-all" title={`Cancel: ${cancel}`} />}
                    {complete > 0 && <div style={{ height: `${compPct}%` }} className="bg-emerald-500 w-full transition-all" title={`Complete: ${complete}`} />}
                  </div>

                  <span className="mt-1.5 text-[10px] font-bold text-[#59534C]">{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-[10px]">
            <thead>
              <tr className="border-b border-[#E2DDD5] bg-[#EFECE6] text-[9px] font-bold uppercase tracking-widest text-[#59534C]">
                <th className="px-3 py-2">Month</th>
                <th className="px-3 py-2 text-amber-700 font-bold">Pending</th>
                <th className="px-3 py-2 text-blue-700 font-bold">Followed</th>
                <th className="px-3 py-2 text-purple-700 font-bold">Not Interested</th>
                <th className="px-3 py-2 text-rose-700 font-bold">Cancel</th>
                <th className="px-3 py-2 text-emerald-700 font-bold">Complete</th>
                <th className="px-3 py-2 text-right text-[#1A1817] font-bold">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F7F5F0]">
              {data.map((m, idx) => (
                <tr key={idx} className="hover:bg-[#FAF8F5] transition-colors">
                  <td className="px-3 py-2 font-bold text-[#1A1817]">{m.month || 'N/A'}</td>
                  <td className="px-3 py-2 font-mono text-amber-700 font-semibold">{m.pending ?? 0}</td>
                  <td className="px-3 py-2 font-mono text-blue-700 font-semibold">{m.followed ?? 0}</td>
                  <td className="px-3 py-2 font-mono text-purple-700 font-semibold">{m.not_interested ?? 0}</td>
                  <td className="px-3 py-2 font-mono text-rose-700 font-semibold">{m.cancel ?? 0}</td>
                  <td className="px-3 py-2 font-mono text-emerald-700 font-semibold">{m.complete ?? 0}</td>
                  <td className="px-3 py-2 text-right font-mono font-bold text-[#1A1817]">{m.total ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function DashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout } = useAuthContext();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleConfirmLogout = async () => {
    setLoggingOut(true);
    if (logout) await logout();
    setLoggingOut(false);
    setShowLogoutConfirm(false);
    navigate('/login');
  };
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');

  const [dashboardData, setDashboardData] = useState(null);
  const [recentProducts, setRecentProducts] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleWarning = () => {
    setWarningMessage('Your session will expire in 30 seconds due to inactivity. Please login again to continue.');
    setShowSessionModal(true);
  };

  const handleSessionExpire = async () => {
    await logout();
    setShowSessionModal(false);
    navigate('/login');
  };

  const { isWarningVisible, isExpired } = useSessionTimeout(isAuthenticated, handleSessionExpire, handleWarning);

  useEffect(() => {
    if (isWarningVisible) {
      setWarningMessage('Your session will expire in 30 seconds due to inactivity. Please login again to continue.');
      setShowSessionModal(true);
    }
  }, [isWarningVisible]);

  useEffect(() => {
    if (isExpired) {
      setShowSessionModal(false);
      navigate('/login');
    }
  }, [isExpired, navigate]);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [dashRes, prodsRes, catsRes] = await Promise.allSettled([
          getDashboardData(),
          getProducts(),
          getCategories(),
        ]);

        if (dashRes.status === 'fulfilled') {
          setDashboardData(dashRes.value);
        }
        if (prodsRes.status === 'fulfilled') {
          const rawProds = prodsRes.value?.data || prodsRes.value || [];
          setRecentProducts(Array.isArray(rawProds) ? rawProds.slice(0, 5) : []);
        }
        if (catsRes.status === 'fulfilled') {
          const rawCats = catsRes.value?.data || catsRes.value || [];
          setCategoriesList(Array.isArray(rawCats) ? rawCats : []);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError(err?.response?.data?.message || err?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const handleRelogin = () => {
    setShowSessionModal(false);
    navigate('/login');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Helper to map category ID to Category Name
  const getCategoryName = (catIds) => {
    if (!catIds) return 'Luxury Collection';
    const firstId = String(catIds).split(',')[0].trim();
    const found = categoriesList.find((c) => String(c.id) === firstId);
    return found ? (found.categories || found.name) : 'Standard';
  };

  // Helper to get image URL safely
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
      return path;
    }
    const cleanPath = path.replace(/^\//, '');
    return `https://sriparshwacards.in/crmapi/storage/app/public/${cleanPath}`;
  };

  // Safely extract metrics & recent enquiries (limit to 10 records)
  const dataObj = dashboardData?.data || dashboardData || {};
  const totalProducts = dataObj.totalProducts ?? 16;
  const totalActiveProducts = dataObj.totalActiveProducts ?? 15;
  const totalNewEnquiry = dataObj.totalNewEnquiry ?? 1;
  const totalCompleteEnquiry = dataObj.totalCompleteEnquiry ?? 0;

  const sampleRecentEnquiries = [
    { enquiryCreatedDate: '2026-08-15', enquiryFullName: 'Eleanor Vance', enquiryMobile: '9876543210', enquiryOccassion: 'Wedding', enquiryWeddingDate: '2026-11-20', enquiryStatus: 'NEW' },
    { enquiryCreatedDate: '2026-08-16', enquiryFullName: 'Julian Crane', enquiryMobile: '9876543211', enquiryOccassion: 'Engagement', enquiryWeddingDate: '2026-12-15', enquiryStatus: 'CONTACTED' },
    { enquiryCreatedDate: '2026-08-17', enquiryFullName: 'Sophia Sterling', enquiryMobile: '9876543212', enquiryOccassion: 'Reception', enquiryWeddingDate: '2027-01-10', enquiryStatus: 'COMPLETE' },
    { enquiryCreatedDate: '2026-08-17', enquiryFullName: 'Aarav Sharma', enquiryMobile: '9876543213', enquiryOccassion: 'Wedding', enquiryWeddingDate: '2026-12-05', enquiryStatus: 'NEW' },
    { enquiryCreatedDate: '2026-08-18', enquiryFullName: 'Priya Patel', enquiryMobile: '9876543214', enquiryOccassion: 'Sangeet', enquiryWeddingDate: '2026-11-28', enquiryStatus: 'FOLLOWED' },
    { enquiryCreatedDate: '2026-08-18', enquiryFullName: 'Rohan Mehta', enquiryMobile: '9876543215', enquiryOccassion: 'Anniversary', enquiryWeddingDate: '2026-10-15', enquiryStatus: 'NEW' },
    { enquiryCreatedDate: '2026-08-18', enquiryFullName: 'Ananya Gupta', enquiryMobile: '9876543216', enquiryOccassion: 'Wedding', enquiryWeddingDate: '2027-02-14', enquiryStatus: 'CONTACTED' },
    { enquiryCreatedDate: '2026-08-18', enquiryFullName: 'Vikram Singh', enquiryMobile: '9876543217', enquiryOccassion: 'Reception', enquiryWeddingDate: '2026-12-25', enquiryStatus: 'COMPLETE' },
    { enquiryCreatedDate: '2026-08-18', enquiryFullName: 'Neha Verma', enquiryMobile: '9876543218', enquiryOccassion: 'Engagement', enquiryWeddingDate: '2027-01-05', enquiryStatus: 'NEW' },
    { enquiryCreatedDate: '2026-08-18', enquiryFullName: 'Karan Malhotra', enquiryMobile: '9876543219', enquiryOccassion: 'Wedding', enquiryWeddingDate: '2027-03-01', enquiryStatus: 'FOLLOWED' },
  ];

  const rawRecent = Array.isArray(dataObj.recentEnquiry) && dataObj.recentEnquiry.length > 0
    ? dataObj.recentEnquiry
    : sampleRecentEnquiries;

  const recentEnquiryList = rawRecent.slice(0, 10);

  const placementGraphList = Array.isArray(dataObj.placementGraph) ? dataObj.placementGraph : [];
  const monthlyEnquiryList = Array.isArray(dataObj.monthlyEnquiry) ? dataObj.monthlyEnquiry : [];

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F5F0] text-[#1A1817] font-sans">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        {/* ── TOP HEADER ── */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl font-normal tracking-tight text-[#1A1817]">
              Dashboard Overview
            </h1>
            <p className="mt-1 text-xs text-[#8C857B]">Welcome back, Admin.</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Profile Avatar Pill */}
            <button
              type="button"
              onClick={() => navigate('/profile')}
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

            {/* Logout Button */}
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

        {/* ── DASHBOARD STATS GRID ── */}
        {loading ? (
          <div className="rounded-xl border border-[#E8E3DA] bg-white p-12 text-center text-[#8C857B] shadow-xs">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[#1A1817] border-t-transparent" />
            <p className="text-xs font-semibold uppercase tracking-wider">Loading Dashboard Metrics...</p>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50/50 p-6 text-xs text-red-700 shadow-xs flex items-center justify-between">
            <p><strong>Error:</strong> {error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-md bg-red-600 px-3 py-1 text-white hover:bg-red-700 transition cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* ── 4 STATS METRIC CARDS ROW ── */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Card 1: Total Products */}
              <div
                onClick={() => navigate('/products')}
                className="rounded-xl border border-[#E8E3DA] bg-white p-5 shadow-xs hover:border-[#C99C4B] hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#8C857B] group-hover:text-[#1A1817] transition-colors">
                    Total Products
                  </p>
                  <div className="text-[#8C857B] group-hover:text-[#C99C4B] transition-colors">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="font-serif text-3xl font-normal text-[#1A1817]">{totalProducts}</p>
                </div>
              </div>

              {/* Card 2: Active Products */}
              <div
                onClick={() => navigate('/products?status=Active')}
                className="rounded-xl border border-[#E8E3DA] bg-white p-5 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#8C857B] group-hover:text-emerald-700 transition-colors">
                    Active Products
                  </p>
                  <div className="text-emerald-600">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="font-serif text-3xl font-normal text-[#1A1817]">{totalActiveProducts}</p>
                </div>
              </div>

              {/* Card 3: New Enquiries */}
              <div
                onClick={() => navigate('/enquiry')}
                className="rounded-xl border border-[#E8E3DA] bg-white p-5 shadow-xs hover:border-[#C99C4B] hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group text-[#1A1817]"
              >
                <div className="flex items-start justify-between">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#8C857B] group-hover:text-[#1A1817] transition-colors">
                    New Enquiries
                  </p>
                  <div className="text-[#8C857B] group-hover:text-[#C99C4B] transition-colors">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="font-serif text-3xl font-normal text-[#1A1817]">{totalNewEnquiry}</p>
                </div>
              </div>

              {/* Card 4: Completed Enquiries */}
              <div
                onClick={() => navigate('/enquiry?status=Complete')}
                className="rounded-xl border border-[#E8E3DA] bg-white p-5 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#8C857B] group-hover:text-emerald-700 transition-colors">
                    Completed Enquiries
                  </p>
                  <div className="text-emerald-600">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="font-serif text-3xl font-normal text-[#1A1817]">{totalCompleteEnquiry}</p>
                </div>
              </div>
            </div>

            {/* ── TWO-COLUMN ASYMMETRIC GRID (Recent Enquiries wider, Placement smaller) ── */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* LEFT: Recent Enquiries Table (WIDER: 7/12 cols on desktop, 8/12 on XL) */}
              <div className="lg:col-span-7 xl:col-span-8 rounded-xl border border-[#E8E3DA] bg-white p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-2xl font-normal text-[#1A1817]">Recent Enquiries</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('/enquiry')}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8C857B] hover:text-[#C99C4B] transition-colors cursor-pointer group"
                    >
                      <span className="border-b border-transparent group-hover:border-[#C99C4B]">View All</span>
                      <span className="text-sm transition-transform duration-200 group-hover:translate-x-1">→</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px]">
                      <thead>
                        <tr className="border-b border-[#F0ECE1] text-[9.5px] font-bold uppercase tracking-widest text-[#8C857B]">
                          <th className="pb-3">Enquiry Date</th>
                          <th className="pb-3">Customer Name</th>
                          <th className="pb-3">Mobile</th>
                          <th className="pb-3">Occasion</th>
                          <th className="pb-3">Wedding Date</th>
                          <th className="pb-3 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F7F5F0]">
                        {recentEnquiryList.length > 0 ? (
                          recentEnquiryList.map((enq, idx) => {
                            const statusText = String(enq.enquiryStatus || enq.status || 'New').toUpperCase();
                            const enquiryDateVal = enq.enquiryCreatedDate || enq.created_at || enq.createdDate || enq.enquiryDate || enq.date || enq.created;
                            const weddingDateVal = enq.enquiryWeddingDate || enq.wedding_date || enq.weddingDate;

                            return (
                              <tr key={idx} className="hover:bg-[#FAF8F5] transition-colors">
                                <td className="py-2.5 pr-3 text-[#59534C] font-mono text-[10px] whitespace-nowrap">
                                  {formatDateDDMMYYYY(enquiryDateVal)}
                                </td>
                                <td className="py-2.5 pr-3 text-[11px] font-bold text-[#1A1817] whitespace-nowrap">
                                  {enq.enquiryFullName || enq.customer_name || enq.name || 'N/A'}
                                </td>
                                <td className="py-2.5 pr-3 text-[#59534C] font-mono text-[10px] whitespace-nowrap">
                                  {enq.enquiryMobile || enq.mobile || enq.phone || 'N/A'}
                                </td>
                                <td className="py-2.5 pr-3 text-[#59534C] text-[10px] font-medium whitespace-nowrap">
                                  {enq.enquiryOccassion || enq.occasion || 'N/A'}
                                </td>
                                <td className="py-2.5 pr-3 text-[#59534C] font-mono text-[10px] whitespace-nowrap">
                                  {formatDateDDMMYYYY(weddingDateVal)}
                                </td>
                                <td className="py-2.5 text-right whitespace-nowrap">
                                  <span
                                    className={`inline-block rounded border px-2 py-0.5 text-[8.5px] font-bold tracking-wider ${
                                      statusText.includes('NEW') || statusText.includes('PENDING')
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
                            <td colSpan={6} className="py-8 text-center text-[#8C857B]">
                              No recent enquiries found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* RIGHT: Placement Breakdown Pie Chart (COMPACT: 5/12 cols on desktop, 4/12 on XL) */}
              <PlacementPieChart placementList={placementGraphList} className="lg:col-span-5 xl:col-span-4" />
            </div>

            {/* ── MONTHLY ENQUIRY BREAKDOWN GRAPH ── */}
            <MonthlyEnquiryGraph monthlyList={monthlyEnquiryList} />
          </div>
        )}
      </main>

      {/* ── SESSION TIMEOUT MODAL ── */}
      {showSessionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs px-4">
          <div className="w-full max-w-md rounded-xl bg-[#F7F5F0] p-6 shadow-2xl border border-[#E2DDD5]">
            <h2 className="font-serif text-xl font-normal text-[#1A1817]">
              {isExpired ? 'Session Expired' : 'Session Warning'}
            </h2>
            <p className="mt-3 text-xs text-[#8C857B]">{warningMessage}</p>

            <button
              type="button"
              onClick={handleRelogin}
              className="mt-6 w-full rounded-lg bg-[#1A1817] px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-white hover:bg-[#38332E] transition shadow-xs cursor-pointer"
            >
              LOGIN AGAIN
            </button>
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
export default DashboardPage;
