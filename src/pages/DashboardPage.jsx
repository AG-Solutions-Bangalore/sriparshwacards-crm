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
    <div className="flex min-h-screen bg-[#f4f0ea] text-stone-800">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-stone-900">Dashboard Overview</h1>
            <p className="mt-2 text-stone-600">Welcome back, Admin.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="flex items-center gap-3 rounded-full border border-stone-300 bg-white px-3 py-2 shadow-sm hover:border-amber-400 hover:bg-stone-50 transition cursor-pointer text-left"
              title="View Profile"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e3d3a3] text-xs font-semibold text-stone-800">
                AD
              </div>
              <div>
                <p className="text-sm font-medium text-stone-800">Admin User</p>
                <p className="text-xs text-stone-500">Manager</p>
              </div>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-stone-300 bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-10 shadow-sm">
          <p className="text-3xl font-medium text-stone-700">
            {isHomepageActive ? 'Dashboard coming soon...' : 'Occasion coming soon...'}
          </p>
        </div>
      </main>

      {showSessionModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-semibold text-stone-900">
              {isExpired ? 'Session expired' : 'Session warning'}
            </h2>
            <p className="mt-3 text-sm text-stone-600">{warningMessage}</p>

            <button
              type="button"
              onClick={handleRelogin}
              className="mt-6 w-full rounded-xl bg-stone-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-stone-700"
            >
              Login Again
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default DashboardPage;
