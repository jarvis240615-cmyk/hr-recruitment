import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { mockJobs, mockCandidates, mockActivity, mockFunnelData } from '../api/mockData';

/* ─── Data ─── */
const openJobs = mockJobs.filter((j) => j.status === 'open').length;
const totalCandidates = mockCandidates.length;
const inInterview = mockCandidates.filter((c) => c.stage === 'Interview').length;
const avgScore = Math.round(
  mockCandidates.reduce((sum, c) => sum + c.aiScore, 0) / mockCandidates.length
);

/* ─── Animated counter hook ─── */
function useCountUp(target, duration = 1400) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const startTime = performance.now();
    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [target, duration]);
  return value;
}

/* ─── Mini Three.js scene hook ─── */
function useThreeScene(canvasRef, setupFn) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const width = canvas.clientWidth || 200;
    const height = canvas.clientHeight || 140;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.z = 3.5;

    const ambient = new THREE.AmbientLight(0x404060, 0.6);
    scene.add(ambient);
    const point = new THREE.PointLight(0x8b5cf6, 1.2, 20);
    point.position.set(2, 2, 4);
    scene.add(point);

    const { mesh, tick } = setupFn(scene);

    let frameId;
    const clock = new THREE.Clock();
    function animate() {
      frameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      tick(t, mesh);
      renderer.render(scene, camera);
    }
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      renderer.dispose();
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
    };
  }, []);
}

/* ─── Three.js setup factories ─── */
function setupRotatingBox(scene) {
  const geo = new THREE.BoxGeometry(1.2, 0.9, 0.7);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x3b82f6,
    emissive: 0x1e40af,
    emissiveIntensity: 0.5,
    metalness: 0.7,
    roughness: 0.3,
  });
  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);
  return {
    mesh,
    tick: (t, m) => {
      m.rotation.y = t * 0.7;
      m.rotation.x = Math.sin(t * 0.5) * 0.3;
    },
  };
}

function setupOrbitingDots(scene) {
  const count = 60;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 0.8 + Math.random() * 0.5;
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({ color: 0x22c55e, size: 0.07, sizeAttenuation: true });
  const mesh = new THREE.Points(geo, mat);
  scene.add(mesh);
  return {
    mesh,
    tick: (t, m) => {
      m.rotation.y = t * 0.4;
      m.rotation.x = t * 0.2;
    },
  };
}

function setupPulsingSphere(scene) {
  const geo = new THREE.SphereGeometry(0.7, 32, 32);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x8b5cf6,
    emissive: 0x6d28d9,
    emissiveIntensity: 0.6,
    metalness: 0.5,
    roughness: 0.4,
    wireframe: true,
  });
  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);
  return {
    mesh,
    tick: (t, m) => {
      const s = 1 + Math.sin(t * 2) * 0.15;
      m.scale.set(s, s, s);
      m.rotation.y = t * 0.3;
    },
  };
}

function setupRotatingTorus(scene) {
  const geo = new THREE.TorusGeometry(0.6, 0.22, 16, 48);
  const mat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xd97706,
    emissiveIntensity: 0.5,
    metalness: 0.6,
    roughness: 0.3,
  });
  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);
  return {
    mesh,
    tick: (t, m) => {
      m.rotation.x = t * 0.8;
      m.rotation.y = t * 0.5;
    },
  };
}

/* ─── Stats Card component ─── */
function StatsCard3D({ title, value, subtitle, setupFn, delay = 0 }) {
  const canvasRef = useRef(null);
  const displayValue = useCountUp(value, 1400);
  useThreeScene(canvasRef, setupFn);

  return (
    <div
      className="stats-card"
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '16px',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        padding: '1.5rem',
        minHeight: '170px',
        transition: 'transform 0.35s cubic-bezier(.22,1,.36,1), box-shadow 0.35s ease',
        cursor: 'default',
        animationDelay: `${delay}ms`,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: 0.35,
          pointerEvents: 'none',
        }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <p style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.55)', marginBottom: '0.35rem' }}>
          {title}
        </p>
        <p style={{ fontSize: '2.4rem', fontWeight: 800, lineHeight: 1.1, background: 'linear-gradient(135deg,#fff 0%,#a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {displayValue}
        </p>
        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.4rem' }}>
          {subtitle}
        </p>
      </div>
    </div>
  );
}

/* ─── Pipeline Funnel ─── */
function PipelineFunnel() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(id);
  }, []);

  const maxCount = Math.max(...mockFunnelData.map((d) => d.count));
  const colors = {
    Applied: '#3b82f6',
    Screening: '#8b5cf6',
    Interview: '#f59e0b',
    Offer: '#22c55e',
    Hired: '#10b981',
    Rejected: '#ef4444',
  };

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px',
        backdropFilter: 'blur(12px)',
        padding: '1.5rem',
      }}
    >
      <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Hiring Pipeline
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {mockFunnelData.map((d, i) => {
          const pct = (d.count / maxCount) * 100;
          const color = colors[d.stage] || '#6b7280';
          return (
            <div key={d.stage}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.65)' }}>{d.stage}</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color }}>{d.count}</span>
              </div>
              <div style={{ height: '28px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    borderRadius: '8px',
                    width: mounted ? `${pct}%` : '0%',
                    background: `linear-gradient(90deg, ${color}cc, ${color})`,
                    transition: `width 0.9s cubic-bezier(.22,1,.36,1) ${i * 120}ms`,
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: '0.65rem',
                    boxShadow: `0 0 16px ${color}44`,
                  }}
                >
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                    {d.count}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── AI Score Gauge ─── */
function AIScoreGauge({ score }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 200);
    return () => clearTimeout(id);
  }, []);

  const displayScore = useCountUp(score, 1800);
  const radius = 80;
  const circumference = Math.PI * radius; // half-circle
  const offset = circumference - (score / 100) * circumference;
  const color = score > 70 ? '#22c55e' : score >= 50 ? '#eab308' : '#ef4444';

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px',
        backdropFilter: 'blur(12px)',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '0.08em', alignSelf: 'flex-start' }}>
        AI Score
      </h2>
      <svg width="220" height="140" viewBox="0 0 220 140">
        {/* Track */}
        <path
          d="M 20 130 A 80 80 0 0 1 200 130"
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="14"
          strokeLinecap="round"
        />
        {/* Filled arc */}
        <path
          d="M 20 130 A 80 80 0 0 1 200 130"
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={mounted ? offset : circumference}
          style={{
            transition: 'stroke-dashoffset 1.6s cubic-bezier(.22,1,.36,1) 0.3s',
            filter: `drop-shadow(0 0 8px ${color}88)`,
          }}
        />
        {/* Score number */}
        <text x="110" y="115" textAnchor="middle" fill="#fff" fontSize="42" fontWeight="800" fontFamily="inherit">
          {displayScore}
        </text>
        <text x="110" y="135" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="11">
          out of 100
        </text>
      </svg>
      <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
        Average candidate quality across all roles
      </p>
    </div>
  );
}

/* ─── Activity Feed ─── */
function ActivityFeed() {
  const borderColors = {
    stage: '#3b82f6',
    application: '#22c55e',
    offer: '#8b5cf6',
    interview: '#f59e0b',
    job: '#6b7280',
  };

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px',
        backdropFilter: 'blur(12px)',
        padding: '1.5rem',
      }}
    >
      <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Recent Activity
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {mockActivity.map((item, i) => {
          const bc = borderColors[item.type] || '#6b7280';
          const initials = (item.text.split(' ')[0] || 'A').slice(0, 2).toUpperCase();
          return (
            <div
              key={item.id}
              className="activity-item"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                borderLeft: `3px solid ${bc}`,
                padding: '0.75rem 1rem',
                borderRadius: '0 10px 10px 0',
                background: 'rgba(255,255,255,0.03)',
                animation: `slideInLeft 0.5s cubic-bezier(.22,1,.36,1) ${i * 100}ms both`,
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${bc}44, ${bc}22)`,
                  border: `1px solid ${bc}66`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: bc,
                  flexShrink: 0,
                }}
              >
                {initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.4 }}>{item.text}</p>
                <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.15rem' }}>{item.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Main Dashboard ─── */
export default function Dashboard() {
  return (
    <>
      <style>{`
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .stats-card:hover {
          transform: translateY(-6px) !important;
          box-shadow: 0 8px 40px rgba(139,92,246,0.25), 0 0 0 1px rgba(139,92,246,0.2) !important;
        }
        .dashboard-grid { animation: fadeInUp 0.6s cubic-bezier(.22,1,.36,1) both; }
        .dashboard-grid-d1 { animation-delay: 0.05s; }
        .dashboard-grid-d2 { animation-delay: 0.15s; }
        .dashboard-grid-d3 { animation-delay: 0.25s; }
      `}</style>

      <div
        style={{
          background: '#0a0a1a',
          minHeight: '100vh',
          padding: '2rem',
          color: 'white',
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        }}
      >
        {/* ── Header ── */}
        <h1
          style={{
            fontSize: '2rem',
            fontWeight: 900,
            marginBottom: '2rem',
            background: 'linear-gradient(135deg, #a78bfa 0%, #3b82f6 50%, #22d3ee 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em',
          }}
        >
          Dashboard
        </h1>

        {/* ── Stats Cards ── */}
        <div
          className="dashboard-grid dashboard-grid-d1"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
            marginBottom: '1.5rem',
          }}
        >
          <StatsCard3D title="Open Jobs" value={openJobs} subtitle="Active positions" setupFn={setupRotatingBox} delay={0} />
          <StatsCard3D title="Total Candidates" value={totalCandidates} subtitle="All applications" setupFn={setupOrbitingDots} delay={80} />
          <StatsCard3D title="In Interview" value={inInterview} subtitle="Currently interviewing" setupFn={setupPulsingSphere} delay={160} />
          <StatsCard3D title="Avg AI Score" value={avgScore} subtitle="Across all candidates" setupFn={setupRotatingTorus} delay={240} />
        </div>

        {/* ── Pipeline + Gauge ── */}
        <div
          className="dashboard-grid dashboard-grid-d2"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.25rem',
            marginBottom: '1.5rem',
          }}
        >
          <PipelineFunnel />
          <AIScoreGauge score={avgScore} />
        </div>

        {/* ── Activity Feed ── */}
        <div className="dashboard-grid dashboard-grid-d3">
          <ActivityFeed />
        </div>
      </div>
    </>
  );
}
