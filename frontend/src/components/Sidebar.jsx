import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/jobs', label: 'Jobs', icon: '💼' },
  { to: '/pipeline', label: 'Pipeline', icon: '🔄' },
  { to: '/candidates', label: 'Candidates', icon: '👥' },
  { to: '/analytics', label: 'Analytics', icon: '📈' },
];

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-[#1e1e2e] text-white flex flex-col">
      <div className="p-6 border-b border-white/10">
        <h1 className="text-xl font-bold tracking-tight">HR Recruit</h1>
        <p className="text-xs text-gray-400 mt-1">Recruitment Platform</p>
      </div>

      <nav className="flex-1 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                isActive
                  ? 'bg-white/10 text-white border-r-2 border-blue-400'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-medium">
            HR
          </div>
          <div>
            <p className="text-sm font-medium">Admin User</p>
            <span className="inline-block px-2 py-0.5 text-[10px] font-medium bg-blue-500/20 text-blue-300 rounded-full">
              HR Manager
            </span>
          </div>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }}
          className="mt-3 w-full text-xs text-gray-400 hover:text-white transition-colors text-left"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
