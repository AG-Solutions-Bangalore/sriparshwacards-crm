import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Sidebar from '../components/dashboard/Sidebar';
import { useAuthContext } from '../context/AuthContext';
import { useSessionTimeout } from '../hooks/useSessionTimeout';

function DashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout } = useAuthContext();
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');

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

  const handleRelogin = () => {
    setShowSessionModal(false);
    navigate('/login');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isHomepageActive = location.pathname === '/';

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
            {/* Profile Avatar Pill */}
            <button
              type="button"
              onClick={() => navigate('/profile')}
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

            {/* Logout button */}
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-none bg-[#1A1817] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-[#38332E] cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>

        {/* ── COMING SOON CARD ── */}
        <div className="rounded-xl border border-[#E8E3DA] bg-white p-16 shadow-xs text-center flex flex-col items-center justify-center min-h-[420px]">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EFECE6] border border-[#D5CFC5] mb-5">
            <svg className="h-7 w-7 text-[#C99C4B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="font-serif text-3xl font-normal text-[#1A1817] tracking-wide">
            {isHomepageActive ? 'Dashboard coming soon...' : 'Occasion coming soon...'}
          </h2>
          <p className="mt-2 text-xs text-[#8C857B] uppercase tracking-widest">
            Crafting bespoke analytics & curation tools
          </p>
        </div>
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
              className="mt-6 w-full bg-[#1A1817] px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-white hover:bg-[#38332E] transition shadow-xs cursor-pointer"
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
