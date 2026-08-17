import { NavLink } from 'react-router-dom';

const navItems = [
  { label: 'Homepage', to: '/' },
  { label: 'Occasion', to: '/occasion' },
  { label: 'Category', to: '/category' },
  { label: 'Card Type', to: '/card-type' },
  { label: 'Products', to: '/products' },
  { label: 'Enquiry', to: '/enquiry' },
];

function Sidebar() {
  return (
    <aside className="w-full max-w-[260px] border-r border-stone-300 bg-stone-100 px-4 py-6">
      <div className="mb-8 px-2">
        <h1 className="text-3xl font-semibold uppercase tracking-tight text-stone-800">Sri Parshwa</h1>
        <h2 className="text-3xl font-semibold uppercase tracking-tight text-stone-800">Cards</h2>
        <p className="mt-2 text-sm text-stone-600">Managing Craftsmanship</p>
      </div>

      <nav className="space-y-2">
        {navItems.map(({ label, to }) => (
          <NavLink
            key={label}
            to={to}
            end={label === 'Homepage'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-r-xl border-l-4 px-4 py-3 text-left text-base font-medium transition ${
                isActive
                  ? 'border-amber-500 bg-[#e3d3a3] text-stone-900 shadow-sm'
                  : 'border-transparent text-stone-600 hover:bg-stone-200 hover:text-stone-900'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
