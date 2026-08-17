import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';

const navItems = [
  {
    label: 'Dashboard',
    to: '/',
    exact: true,
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: 'Occasions',
    to: '/occasion',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    label: 'Categories',
    to: '/category',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z" />
        <circle cx="12" cy="7" r="1.5" />
      </svg>
    ),
  },
  {
    label: 'Card Types',
    to: '/card-type',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    label: 'Product Catalog',
    to: '/products',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    label: 'Enquiries',
    to: '/enquiry',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M3 6l9 6 9-6" />
      </svg>
    ),
  },
];

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthContext();

  const isReportsActive = location.pathname.startsWith('/reports');
  const [reportsOpen, setReportsOpen] = useState(isReportsActive);

  const handleLogout = async () => {
    if (logout) {
      await logout();
    }
    navigate('/login');
  };

  return (
    <aside className="flex min-h-screen w-64 flex-col justify-between border-r border-[#E2DDD5] bg-[#EFECE6] px-5 py-8 text-[#2D2926] select-none">
      <div>
        {/* Branding Header */}
        <div className="mb-10 px-2">
          <h1 className="font-serif text-2xl font-bold tracking-wider text-[#2D2926] uppercase leading-tight">
            Sri Parshwa
          </h1>
          <h2 className="font-serif text-2xl font-bold tracking-wider text-[#2D2926] uppercase leading-tight">
            Cards
          </h2>
          <p className="mt-2 text-[11px] font-medium uppercase tracking-widest text-[#8C857B]">
            Managing Craftsmanship
          </p>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navItems.map(({ label, to, exact, icon }) => (
            <NavLink
              key={label}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3 text-xs font-semibold tracking-wide transition-all duration-200 ${isActive
                  ? 'border-l-4 border-[#C99C4B] bg-[#F5CE93] text-[#1A1817] shadow-sm font-bold'
                  : 'border-l-4 border-transparent text-[#59534C] hover:bg-[#E5E1DA] hover:text-[#1A1817]'
                }`
              }
            >
              <span className="flex-shrink-0">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}

          {/* Reports Collapsible Dropdown */}
          <div>
            <button
              type="button"
              onClick={() => setReportsOpen((prev) => !prev)}
              className={`w-full flex items-center justify-between px-4 py-3 text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                isReportsActive
                  ? 'border-l-4 border-[#C99C4B] bg-[#F5CE93] text-[#1A1817] shadow-sm font-bold'
                  : 'border-l-4 border-transparent text-[#59534C] hover:bg-[#E5E1DA] hover:text-[#1A1817]'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Reports</span>
              </div>
              <svg
                className={`h-4 w-4 transition-transform duration-200 ${reportsOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {reportsOpen && (
              <div className="ml-5 mt-1 space-y-1 border-l-2 border-[#C99C4B]/40 pl-3">
                <NavLink
                  to="/reports/enquiry"
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-md transition-all duration-200 ${
                      isActive
                        ? 'bg-[#1A1817] text-white font-bold shadow-xs'
                        : 'text-[#59534C] hover:bg-[#E5E1DA] hover:text-[#1A1817]'
                    }`
                  }
                >
                  <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <path d="M3 6l9 6 9-6" />
                  </svg>
                  <span>Enquiry Reports</span>
                </NavLink>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Profile & Logout Footer */}
      <div className="border-t border-[#E2DDD5] pt-6 px-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E5E1DA] font-serif text-xs font-bold text-[#2D2926] border border-[#D5CFC5]">
              EA
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#2D2926]">Admin User</span>
              <button
                type="button"
                onClick={handleLogout}
                className="text-left text-[11px] font-medium text-[#8C857B] hover:text-[#2D2926] transition-colors"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;

