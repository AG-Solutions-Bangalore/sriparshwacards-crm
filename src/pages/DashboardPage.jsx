import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Sidebar from '../components/dashboard/Sidebar';
import { useAuthContext } from '../context/AuthContext';
import { useSessionTimeout } from '../hooks/useSessionTimeout';
import { getCategories } from '../services/categoryApi';
import { getDashboardData } from '../services/dashboardApi';
import { getProducts } from '../services/productApi';

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
    <div className="rounded-xl border border-[#E8E3DA] bg-white p-6 shadow-xs">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-serif text-2xl font-normal text-[#1A1817]">Monthly Enquiry Breakdown</h3>
          <p className="text-xs text-[#8C857B] mt-0.5">Visual inquiry status distribution across months</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3 text-[11px] font-medium text-[#59534C]">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Pending</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Followed</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-purple-500" /> Not Interested</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> Cancel</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Complete</span>
          </div>

          <div className="flex rounded-lg border border-[#E2DDD5] bg-[#FAF8F5] p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('graph')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                viewMode === 'graph' ? 'bg-[#1A1817] text-white shadow-xs' : 'text-[#59534C] hover:text-[#1A1817]'
              }`}
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Graph
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                viewMode === 'table' ? 'bg-[#1A1817] text-white shadow-xs' : 'text-[#59534C] hover:text-[#1A1817]'
              }`}
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Table
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'graph' ? (
        <div className="pt-4">
          <div className="mb-4 flex flex-wrap md:hidden gap-3 text-[11px] font-medium text-[#59534C]">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Pending</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Followed</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-purple-500" /> Not Interested</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> Cancel</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Complete</span>
          </div>

          <div className="relative h-64 w-full flex items-end gap-4 sm:gap-8 pt-8 pb-8 px-4 border-b border-l border-[#E2DDD5] bg-[#FAF8F5]/50 rounded-lg">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none p-4 opacity-40">
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

              const heightPx = Math.max(Math.round((total / maxTotal) * 200), 20);

              const pPct = total > 0 ? (pending / total) * 100 : 0;
              const fPct = total > 0 ? (followed / total) * 100 : 0;
              const niPct = total > 0 ? (notInterested / total) * 100 : 0;
              const cPct = total > 0 ? (cancel / total) * 100 : 0;
              const compPct = total > 0 ? (complete / total) * 100 : 0;

              return (
                <div key={idx} className="relative group flex-1 flex flex-col items-center justify-end h-full z-10">
                  <div className="absolute -top-14 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1A1817] text-white text-[10px] rounded-md py-1.5 px-3 shadow-lg pointer-events-none z-30 flex flex-col gap-0.5 whitespace-nowrap">
                    <span className="font-bold border-b border-stone-700 pb-0.5 mb-0.5">{item.month} (Total: {total})</span>
                    <span>Pending: {pending}</span>
                    <span>Followed: {followed}</span>
                    <span>Not Interested: {notInterested}</span>
                    <span>Cancel: {cancel}</span>
                    <span>Complete: {complete}</span>
                  </div>

                  <span className="mb-1 text-[11px] font-bold text-[#1A1817] font-mono">{total}</span>

                  <div
                    className="w-full max-w-[48px] rounded-t-md overflow-hidden flex flex-col-reverse shadow-xs transition-all duration-300 group-hover:scale-105"
                    style={{ height: `${heightPx}px` }}
                  >
                    {pending > 0 && <div style={{ height: `${pPct}%` }} className="bg-amber-500 w-full transition-all" title={`Pending: ${pending}`} />}
                    {followed > 0 && <div style={{ height: `${fPct}%` }} className="bg-blue-500 w-full transition-all" title={`Followed: ${followed}`} />}
                    {notInterested > 0 && <div style={{ height: `${niPct}%` }} className="bg-purple-500 w-full transition-all" title={`Not Interested: ${notInterested}`} />}
                    {cancel > 0 && <div style={{ height: `${cPct}%` }} className="bg-rose-500 w-full transition-all" title={`Cancel: ${cancel}`} />}
                    {complete > 0 && <div style={{ height: `${compPct}%` }} className="bg-emerald-500 w-full transition-all" title={`Complete: ${complete}`} />}
                  </div>

                  <span className="mt-2 text-xs font-bold text-[#59534C]">{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E2DDD5] bg-[#EFECE6] text-[10px] font-bold uppercase tracking-widest text-[#59534C]">
                <th className="px-4 py-3">Month</th>
                <th className="px-4 py-3 text-amber-700 font-bold">Pending</th>
                <th className="px-4 py-3 text-blue-700 font-bold">Followed</th>
                <th className="px-4 py-3 text-purple-700 font-bold">Not Interested</th>
                <th className="px-4 py-3 text-rose-700 font-bold">Cancel</th>
                <th className="px-4 py-3 text-emerald-700 font-bold">Complete</th>
                <th className="px-4 py-3 text-right text-[#1A1817] font-bold">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F7F5F0]">
              {data.map((m, idx) => (
                <tr key={idx} className="hover:bg-[#FAF8F5] transition-colors">
                  <td className="px-4 py-3.5 font-bold text-[#1A1817]">{m.month || 'N/A'}</td>
                  <td className="px-4 py-3.5 font-mono text-amber-700 font-semibold">{m.pending ?? 0}</td>
                  <td className="px-4 py-3.5 font-mono text-blue-700 font-semibold">{m.followed ?? 0}</td>
                  <td className="px-4 py-3.5 font-mono text-purple-700 font-semibold">{m.not_interested ?? 0}</td>
                  <td className="px-4 py-3.5 font-mono text-rose-700 font-semibold">{m.cancel ?? 0}</td>
                  <td className="px-4 py-3.5 font-mono text-emerald-700 font-semibold">{m.complete ?? 0}</td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-[#1A1817]">{m.total ?? 0}</td>
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

  // Safely extract metrics & recent enquiries
  const dataObj = dashboardData?.data || dashboardData || {};
  const totalProducts = dataObj.totalProducts ?? 16;
  const totalActiveProducts = dataObj.totalActiveProducts ?? 15;
  const totalNewEnquiry = dataObj.totalNewEnquiry ?? 1;
  const totalCompleteEnquiry = dataObj.totalCompleteEnquiry ?? 0;
  const recentEnquiryList = Array.isArray(dataObj.recentEnquiry) && dataObj.recentEnquiry.length > 0
    ? dataObj.recentEnquiry
    : [
        {
          enquiryFullName: 'Eleanor Vance',
          enquiryMobile: '9876543210',
          enquiryOccassion: 'Wedding',
          enquiryWeddingDate: '2026-11-20',
          enquiryStatus: 'NEW',
        },
        {
          enquiryFullName: 'Julian Crane',
          enquiryMobile: '9876543211',
          enquiryOccassion: 'Engagement',
          enquiryWeddingDate: '2026-12-15',
          enquiryStatus: 'CONTACTED',
        },
        {
          enquiryFullName: 'Sophia Sterling',
          enquiryMobile: '9876543212',
          enquiryOccassion: 'Reception',
          enquiryWeddingDate: '2027-01-10',
          enquiryStatus: 'COMPLETE',
        },
      ];

  const placementGraphList = Array.isArray(dataObj.placementGraph) ? dataObj.placementGraph : [];
  const monthlyEnquiryList = Array.isArray(dataObj.monthlyEnquiry) ? dataObj.monthlyEnquiry : [];

  return (
    <div className="flex min-h-screen bg-[#F7F5F0] text-[#1A1817] font-sans">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        {/* ── TOP HEADER ── */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl font-normal tracking-tight text-[#1A1817]">
              Dashboard Overview
            </h1>
            <p className="mt-1 text-xs text-[#8C857B]">Welcome back, Atelier Admin.</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <button
              type="button"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-xs border border-[#E5E0D8] text-[#59534C] hover:text-[#1A1817] transition cursor-pointer"
              title="Notifications"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-600 ring-2 ring-white" />
            </button>

            {/* Profile Avatar Pill */}
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="flex items-center gap-3 rounded-lg bg-white px-3 py-1.5 shadow-sm border border-[#E5E0D8] hover:border-[#C99C4B] transition cursor-pointer text-left"
              title="View Profile"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EFECE6] text-xs font-serif font-bold text-[#1A1817] border border-[#D5CFC5]">
                EA
              </div>
              <div className="pr-1">
                <p className="text-xs font-bold text-[#1A1817] leading-tight">Admin User</p>
                <p className="text-[10px] text-[#8C857B] leading-tight">Manager</p>
              </div>
            </button>
          </div>
        </div>

        {/* ── DASHBOARD STATS GRID (5 CARDS) ── */}
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
              <div className="rounded-xl border border-[#E8E3DA] bg-white p-5 shadow-xs hover:border-[#C99C4B] transition-all flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#8C857B]">
                    Total Products
                  </p>
                  <div className="text-[#8C857B]">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="font-serif text-3xl font-normal text-[#1A1817]">{totalProducts}</p>
                  <p className="mt-1 text-[11px] text-[#8C857B]">All Catalog Products</p>
                </div>
              </div>

              {/* Card 2: Active Products */}
              <div className="rounded-xl border border-[#E8E3DA] bg-white p-5 shadow-xs hover:border-[#C99C4B] transition-all flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#8C857B]">
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
                  <p className="mt-1 text-[11px] text-[#8C857B]">Active Catalog Products</p>
                </div>
              </div>

              {/* Card 3: New Enquiries (GOLD HIGHLIGHTED CARD) */}
              <div className="rounded-xl border-2 border-[#E5B56E] bg-[#F5CE93] p-5 shadow-sm transition-all flex flex-col justify-between text-[#1A1817]">
                <div className="flex items-start justify-between">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#594320]">
                    New Enquiries
                  </p>
                  <div className="text-[#594320]">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="font-serif text-3xl font-normal text-[#1A1817]">{totalNewEnquiry}</p>
                  <p className="mt-1 text-[11px] text-[#594320] font-medium">Pending response</p>
                </div>
              </div>

              {/* Card 4: Completed Enquiries */}
              <div className="rounded-xl border border-[#E8E3DA] bg-white p-5 shadow-xs hover:border-[#C99C4B] transition-all flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#8C857B]">
                    Completed Enquiries
                  </p>
                  <div className="text-[#1A1817]">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="font-serif text-3xl font-normal text-[#1A1817]">{totalCompleteEnquiry}</p>
                  <p className="mt-1 text-[11px] text-[#8C857B]">Fulfilled enquiries</p>
                </div>
              </div>
            </div>

            {/* ── TWO-COLUMN SPLIT GRID ── */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* LEFT: Recent Enquiries Table */}
              <div className="rounded-xl border border-[#E8E3DA] bg-white p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-2xl font-normal text-[#1A1817]">Recent Enquiries</h3>
                      <p className="text-xs text-[#8C857B] mt-0.5">Latest customer requests</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('/enquiry')}
                      className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[#8C857B] hover:text-[#1A1817] transition cursor-pointer"
                    >
                      View All <span className="text-sm">→</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-[#F0ECE1] text-[10px] font-bold uppercase tracking-widest text-[#8C857B]">
                          <th className="pb-3">Customer</th>
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
                            return (
                              <tr key={idx} className="hover:bg-[#FAF8F5] transition-colors">
                                <td className="py-3.5 pr-3 font-bold text-[#1A1817]">
                                  {enq.enquiryFullName || enq.customer_name || enq.name || 'N/A'}
                                </td>
                                <td className="py-3.5 pr-3 text-[#59534C] font-mono">
                                  {enq.enquiryMobile || enq.mobile || enq.phone || 'N/A'}
                                </td>
                                <td className="py-3.5 pr-3 text-[#59534C] font-medium">
                                  {enq.enquiryOccassion || enq.occasion || 'N/A'}
                                </td>
                                <td className="py-3.5 pr-3 text-[#8C857B]">
                                  {enq.enquiryWeddingDate || enq.wedding_date || 'N/A'}
                                </td>
                                <td className="py-3.5 text-right">
                                  <span
                                    className={`inline-block rounded border px-2.5 py-0.5 text-[9px] font-bold tracking-wider ${
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
                            <td colSpan={5} className="py-8 text-center text-[#8C857B]">
                              No recent enquiries found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* RIGHT: Placement Graph Breakdown */}
              <div className="rounded-xl border border-[#E8E3DA] bg-white p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-2xl font-normal text-[#1A1817]">Placement Breakdown</h3>
                      <p className="text-xs text-[#8C857B] mt-0.5">Product count distribution by placement</p>
                    </div>
                  </div>

                  {placementGraphList.length > 0 ? (
                    <div className="space-y-4">
                      {(() => {
                        const maxCount = Math.max(...placementGraphList.map((p) => Number(p.product_count || 0)), 1);
                        return placementGraphList.map((place, idx) => {
                          const count = Number(place.product_count || 0);
                          const percentage = Math.round((count / maxCount) * 100);
                          const placeName = place.placements || place.placement_name || `Placement #${place.placement_id || idx + 1}`;

                          return (
                            <div key={place.placement_id || idx} className="rounded-lg border border-[#F0ECE1] bg-[#FAF8F5] p-4">
                              <div className="mb-2 flex items-center justify-between text-xs">
                                <span className="font-bold text-[#1A1817]">{placeName}</span>
                                <span className="font-mono text-[#8C857B] font-semibold">{count} products</span>
                              </div>
                              <div className="h-2.5 w-full rounded-full bg-[#EFECE6] overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-[#C99C4B] to-[#F5CE93] transition-all duration-500"
                                  style={{ width: `${Math.max(percentage, 5)}%` }}
                                />
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-[#8C857B] text-xs">
                      No placement graph data available.
                    </div>
                  )}
                </div>
              </div>
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
    </div>
  );
}

export default DashboardPage;
