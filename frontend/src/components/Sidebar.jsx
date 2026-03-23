import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/jobs', label: 'Jobs', icon: '💼' },
  { to: '/pipeline', label: 'Pipeline', icon: '🔄' },
  { to: '/candidates', label: 'Candidates', icon: '👥' },
  { to: '/scorecards', label: 'Scorecards', icon: '📋' },
  { to: '/analytics', label: 'Analytics', icon: '📈' },
];

export default function Sidebar() {
  return (
    <aside style={{
      width: '240px',
      minHeight: '100vh',
      background: 'linear-gradient(180deg, rgba(6,10,30,0.98) 0%, rgba(3,5,18,0.99) 100%)',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      zIndex: 10,
      flexShrink: 0,
    }}>
      {/* Glow accent top */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
        background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4)',
      }} />

      {/* Logo area */}
      <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem',
            boxShadow: '0 0 20px rgba(59,130,246,0.4)',
          }}>🚀</div>
          <div>
            <h1 style={{
              fontSize: '1rem', fontWeight: 800, color: 'rgba(255,255,255,0.95)',
              letterSpacing: '-0.01em', lineHeight: 1,
            }}>HR Recruit</h1>
            <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', marginTop: '3px' }}>Recruitment Platform</p>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '0.75rem 0' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.7rem 1rem',
              margin: '0.15rem 0.75rem',
              borderRadius: '12px',
              fontSize: '0.84rem',
              fontWeight: isActive ? 600 : 400,
              textDecoration: 'none',
              color: isActive ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.45)',
              background: isActive ? 'rgba(59,130,246,0.15)' : 'transparent',
              border: `1px solid ${isActive ? 'rgba(59,130,246,0.3)' : 'transparent'}`,
              boxShadow: isActive ? '0 0 20px rgba(59,130,246,0.1), inset 0 0 20px rgba(59,130,246,0.05)' : 'none',
              transition: 'all 0.25s ease',
            })}
          >
            <span style={{ fontSize: '1rem', lineHeight: 1 }}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.72rem', fontWeight: 700, color: 'white',
            boxShadow: '0 0 12px rgba(59,130,246,0.3)',
          }}>HR</div>
          <div>
            <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>Admin User</p>
            <span style={{
              display: 'inline-block',
              fontSize: '0.62rem', fontWeight: 500,
              background: 'rgba(59,130,246,0.15)', color: '#60a5fa',
              padding: '1px 7px', borderRadius: '20px',
              border: '1px solid rgba(59,130,246,0.2)',
            }}>HR Manager</span>
          </div>
        </div>
        <button
          onClick={() => { localStorage.removeItem('token'); window.location.href = '/hr-recruitment/'; }}
          style={{
            width: '100%', fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)',
            background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
            padding: '0.25rem 0', transition: 'color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
        >Sign out →</button>
      </div>
    </aside>
  );
}
