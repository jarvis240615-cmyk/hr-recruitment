import { NavLink } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/jobs', label: 'Jobs', icon: '💼' },
  { to: '/pipeline', label: 'Pipeline', icon: '🔄' },
  { to: '/candidates', label: 'Candidates', icon: '👥' },
  { to: '/scorecards', label: 'Scorecards', icon: '📋' },
  { to: '/analytics', label: 'Analytics', icon: '📈' },
];

/* ── Star/particle canvas inside sidebar ── */
function SidebarStars({ width = 240, height = 600 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = width, H = height;
    canvas.width = W;
    canvas.height = H;

    const stars = Array.from({ length: 60 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.2 + 0.3,
      speed: Math.random() * 0.15 + 0.05,
      opacity: Math.random() * 0.5 + 0.2,
      twinkleOffset: Math.random() * Math.PI * 2,
    }));

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const t = Date.now() * 0.001;
      for (const s of stars) {
        const op = s.opacity * (0.5 + 0.5 * Math.sin(t * 1.5 + s.twinkleOffset));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(147,197,253,${op})`;
        ctx.fill();
        s.y -= s.speed;
        if (s.y < -2) { s.y = H + 2; s.x = Math.random() * W; }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.6 }}
    />
  );
}

export default function Sidebar() {
  const [hovered, setHovered] = useState(null);

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
      overflow: 'hidden',
    }}>
      {/* Star field background */}
      <SidebarStars />

      {/* Glow accent top */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
        background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4)',
        zIndex: 1,
      }} />

      {/* Animated pulsing gradient border on right side */}
      <div style={{
        position: 'absolute', top: 0, right: 0, width: '2px', bottom: 0,
        background: 'linear-gradient(180deg, #3b82f6, #8b5cf6, #22d3ee, #3b82f6)',
        backgroundSize: '100% 300%',
        animation: 'glowBorderSweep 3s ease infinite',
        zIndex: 2,
      }} />

      {/* Logo area */}
      <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'relative', zIndex: 3 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem',
            boxShadow: '0 0 20px rgba(59,130,246,0.4)',
            animation: 'float 3s ease-in-out infinite',
          }}>🚀</div>
          <div style={{ flex: 1 }}>
            <h1 style={{
              fontSize: '1rem', fontWeight: 800, color: 'rgba(255,255,255,0.95)',
              letterSpacing: '-0.01em', lineHeight: 1,
            }}>HR Recruit</h1>
            <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', marginTop: '3px' }}>Recruitment Platform</p>
          </div>
          {/* Live pulsing status dot */}
          <div style={{ position: 'relative', width: '10px', height: '10px', flexShrink: 0 }}>
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              background: '#22c55e',
              animation: 'pulseDot 2s ease-in-out infinite',
            }} />
            <div style={{
              position: 'absolute', inset: '-3px', borderRadius: '50%',
              background: 'rgba(34,197,94,0.3)',
              animation: 'pulseGlow 2s ease-in-out infinite',
            }} />
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '0.75rem 0', position: 'relative', zIndex: 3 }}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onMouseEnter={() => setHovered(item.to)}
            onMouseLeave={() => setHovered(null)}
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
              color: isActive ? 'rgba(255,255,255,0.95)' : hovered === item.to ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.45)',
              background: isActive ? 'rgba(59,130,246,0.15)' : hovered === item.to ? 'rgba(255,255,255,0.06)' : 'transparent',
              border: `1px solid ${isActive ? 'rgba(59,130,246,0.3)' : 'transparent'}`,
              boxShadow: isActive
                ? '0 0 20px rgba(59,130,246,0.1), inset 0 0 20px rgba(59,130,246,0.05)'
                : hovered === item.to
                  ? '0 0 12px rgba(59,130,246,0.15)'
                  : 'none',
              transform: hovered === item.to && !isActive ? 'translateX(4px)' : 'translateX(0)',
              transition: 'all 0.2s cubic-bezier(.22,1,.36,1)',
              position: 'relative',
              overflow: 'hidden',
            })}
          >
            {({ isActive }) => (
              <>
                {/* Glow burst overlay on hover */}
                {hovered === item.to && !isActive && (
                  <div style={{
                    position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                    width: '3px', height: '60%', borderRadius: '0 3px 3px 0',
                    background: 'linear-gradient(180deg, #3b82f6, #8b5cf6)',
                    boxShadow: '0 0 8px rgba(59,130,246,0.6)',
                  }} />
                )}
                <span style={{ fontSize: '1rem', lineHeight: 1 }}>{item.icon}</span>
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.06)', position: 'relative', zIndex: 3 }}>
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
            background: 'none', border: 'none', cursor: 'none', textAlign: 'left',
            padding: '0.25rem 0', transition: 'color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
        >Sign out →</button>
      </div>
    </aside>
  );
}
