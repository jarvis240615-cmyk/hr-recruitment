import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { mockJobs, mockCandidates, mockActivity, mockFunnelData } from '../api/mockData';

/* ─── CSS Animations (injected once) ─── */
const STYLE_ID = 'dashboard-3d-styles';
const CSS = `
@keyframes slideInUp { from { opacity:0; transform:translateY(30px) } to { opacity:1; transform:translateY(0) } }
@keyframes slideInLeft { from { opacity:0; transform:translateX(-30px) } to { opacity:1; transform:translateX(0) } }
@keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.5 } }
@keyframes shimmer { 0% { background-position: -200% 0 } 100% { background-position: 200% 0 } }
@keyframes float { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-8px) } }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

.stat-card-3d {
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  background: rgba(10,15,40,0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.08);
  padding: 1.5rem;
  min-height: 170px;
  transition: transform 0.4s cubic-bezier(.22,1,.36,1), box-shadow 0.4s ease;
  cursor: default;
}
.stat-card-3d:hover {
  transform: translateY(-8px) scale(1.02) !important;
  box-shadow: 0 12px 48px rgba(139,92,246,0.3), 0 0 0 1px rgba(139,92,246,0.25) !important;
}
.glass-card {
  background: rgba(10,15,40,0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  padding: 1.5rem;
}
.activity-row {
  transition: background 0.2s;
}
.activity-row:hover {
  background: rgba(255,255,255,0.06) !important;
}
.quick-btn {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 14px;
  padding: 1rem;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.82rem;
  font-weight: 600;
}
.quick-btn:hover {
  background: rgba(255,255,255,0.12);
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
}
`;

/* ─── Animated counter hook ─── */
function useCountUp(target, duration = 1400) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!target) return;
    let startTime = null;
    function tick(now) {
      if (!startTime) startTime = now;
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

/* ─── Typing title hook ─── */
function useTypingTitle(text, speed = 80) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    let i = 0;
    setDisplayed('');
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);
  return displayed;
}

/* ─── Mini Three.js canvas hook ─── */
function useMiniThree(canvasRef, setupFn) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = 120, h = 80;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
    camera.position.z = 3;

    const ambient = new THREE.AmbientLight(0x404060, 0.8);
    scene.add(ambient);
    const point = new THREE.PointLight(0x8b5cf6, 1.2, 20);
    point.position.set(2, 2, 4);
    scene.add(point);

    const { mesh, tick } = setupFn(scene);
    let frameId;
    const clock = new THREE.Clock();
    function animate() {
      frameId = requestAnimationFrame(animate);
      tick(clock.getElapsedTime(), mesh);
      renderer.render(scene, camera);
    }
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      renderer.dispose();
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else obj.material.dispose();
        }
      });
    };
  }, []);
}

/* ─── Mini Three.js setup factories ─── */
function setupRotatingCube(scene) {
  const geo = new THREE.BoxGeometry(1, 1, 1);
  const mat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, emissive: 0x1e40af, emissiveIntensity: 0.5, metalness: 0.7, roughness: 0.3 });
  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);
  return { mesh, tick: (t, m) => { m.rotation.y = t * 0.8; m.rotation.x = Math.sin(t * 0.5) * 0.3; } };
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
  const mat = new THREE.PointsMaterial({ color: 0x22c55e, size: 0.08, sizeAttenuation: true });
  const mesh = new THREE.Points(geo, mat);
  scene.add(mesh);
  return { mesh, tick: (t, m) => { m.rotation.y = t * 0.5; m.rotation.x = t * 0.25; } };
}

function setupPulsingTorus(scene) {
  const geo = new THREE.TorusGeometry(0.6, 0.2, 16, 48);
  const mat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 0.5, metalness: 0.6, roughness: 0.3 });
  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);
  return { mesh, tick: (t, m) => { const s = 1 + Math.sin(t * 2) * 0.15; m.scale.set(s, s, s); m.rotation.x = t * 0.8; m.rotation.y = t * 0.5; } };
}

function setupSpinningIcosahedron(scene) {
  const geo = new THREE.IcosahedronGeometry(0.8, 0);
  const mat = new THREE.MeshStandardMaterial({ color: 0x8b5cf6, emissive: 0x6d28d9, emissiveIntensity: 0.6, metalness: 0.5, roughness: 0.4, wireframe: true });
  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);
  return { mesh, tick: (t, m) => { m.rotation.y = t * 0.6; m.rotation.x = t * 0.3; } };
}

/* ─── Stat Card with mini 3D ─── */
function StatCard3D({ title, value, subtitle, color, setupFn, delay = 0 }) {
  const canvasRef = useRef(null);
  const displayValue = useCountUp(value, 1400);
  useMiniThree(canvasRef, setupFn);

  return (
    <div
      className="stat-card-3d"
      style={{
        borderLeft: `4px solid ${color}`,
        animation: `slideInUp 0.6s cubic-bezier(.22,1,.36,1) ${delay}ms both`,
      }}
    >
      <canvas
        ref={canvasRef}
        width={120}
        height={80}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          width: '120px',
          height: '80px',
          opacity: 0.5,
          pointerEvents: 'none',
        }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <p style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)', marginBottom: '0.4rem' }}>
          {title}
        </p>
        <p style={{
          fontSize: '2.6rem', fontWeight: 800, lineHeight: 1.1,
          background: `linear-gradient(135deg, #fff 0%, ${color} 100%)`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          {displayValue}
        </p>
        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.5rem' }}>{subtitle}</p>
      </div>
    </div>
  );
}

/* ─── Pipeline Funnel ─── */
function PipelineFunnel({ data }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const id = setTimeout(() => setMounted(true), 100); return () => clearTimeout(id); }, []);

  const maxCount = Math.max(...data.map(d => d.count), 1);
  const stageColors = { Applied: '#3b82f6', Screened: '#8b5cf6', Screening: '#8b5cf6', Interview: '#f59e0b', Offer: '#10b981', Hired: '#22c55e', Rejected: '#ef4444' };

  return (
    <div className="glass-card">
      <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Hiring Pipeline
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {data.map((d, i) => {
          const pct = (d.count / maxCount) * 100;
          const color = stageColors[d.stage] || '#6b7280';
          return (
            <div key={d.stage}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.65)' }}>{d.stage}</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color }}>{d.count}</span>
              </div>
              <div style={{ height: '30px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', overflow: 'hidden', cursor: 'pointer' }}>
                <div style={{
                  height: '100%',
                  borderRadius: '10px',
                  width: mounted ? `${pct}%` : '0%',
                  background: `linear-gradient(90deg, ${color}aa, ${color})`,
                  transition: `width 1s cubic-bezier(.22,1,.36,1) ${i * 120}ms`,
                  display: 'flex', alignItems: 'center', paddingLeft: '0.75rem',
                  boxShadow: `0 0 20px ${color}44`,
                }}>
                  {pct > 15 && <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>{d.count}</span>}
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
function ScoreGauge({ score }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const id = setTimeout(() => setMounted(true), 200); return () => clearTimeout(id); }, []);
  const displayScore = useCountUp(score, 1800);
  const radius = 80;
  const circumference = Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '0.08em', alignSelf: 'flex-start' }}>
        AI Score
      </h2>
      <svg width="200" height="120" viewBox="0 0 200 120">
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" strokeLinecap="round" />
        <path d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={mounted ? offset : circumference}
          style={{ transition: 'stroke-dashoffset 1.5s ease-out 0.3s', filter: `drop-shadow(0 0 10px ${color}88)` }}
        />
        <text x="100" y="90" textAnchor="middle" fill="white" fontSize="28" fontWeight="900">{displayScore}</text>
        <text x="100" y="108" textAnchor="middle" fill="#64748b" fontSize="12">AI Score</text>
      </svg>
      <div style={{ color, fontWeight: 700, marginTop: '-8px', fontSize: '0.9rem' }}>
        {score >= 70 ? 'Excellent' : score >= 50 ? 'Good' : 'Needs Work'}
      </div>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem', marginTop: '0.6rem', textAlign: 'center' }}>
        Average candidate quality across all roles
      </p>
    </div>
  );
}

/* ─── Activity Feed ─── */
function ActivityFeed({ items }) {
  const borderColors = { stage: '#3b82f6', application: '#22c55e', offer: '#8b5cf6', interview: '#f59e0b', job: '#6b7280' };

  return (
    <div className="glass-card">
      <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Recent Activity
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '340px', overflowY: 'auto' }}>
        {items.map((item, i) => {
          const bc = borderColors[item.type] || '#6b7280';
          const initials = (item.text?.split(' ')[0] || 'A').slice(0, 2).toUpperCase();
          return (
            <div key={item.id || i} className="activity-row" style={{
              display: 'flex', alignItems: 'center', gap: '0.85rem',
              borderLeft: `3px solid ${bc}`, padding: '0.75rem 1rem',
              borderRadius: '0 12px 12px 0', background: 'rgba(255,255,255,0.03)',
              animation: `slideInLeft 0.5s cubic-bezier(.22,1,.36,1) ${i * 100}ms both`,
            }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: `linear-gradient(135deg, ${bc}44, ${bc}22)`,
                border: `1px solid ${bc}66`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 700, color: bc, flexShrink: 0,
              }}>
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

/* ─── Quick Actions ─── */
function QuickActions() {
  const navigate = useNavigate();
  const [exporting, setExporting] = useState(false);

  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      const res = await api.get('/api/analytics/overview');
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'analytics-report.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // fallback: export mock data
      const blob = new Blob([JSON.stringify({ jobs: mockJobs, candidates: mockCandidates, funnel: mockFunnelData }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'analytics-report.json';
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }, []);

  const actions = [
    { label: 'Screen Resume', icon: '📄', color: '#3b82f6', onClick: () => navigate('/candidates') },
    { label: 'Add Candidate', icon: '➕', color: '#22c55e', onClick: () => navigate('/candidates') },
    { label: 'Schedule Interview', icon: '📅', color: '#f59e0b', onClick: () => navigate('/pipeline') },
    { label: 'Export Report', icon: '📊', color: '#8b5cf6', onClick: handleExport },
  ];

  return (
    <div className="glass-card">
      <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Quick Actions
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        {actions.map(a => (
          <button key={a.label} className="quick-btn" onClick={a.onClick}
            disabled={a.label === 'Export Report' && exporting}
            style={{ borderLeft: `3px solid ${a.color}` }}>
            <span style={{ fontSize: '1.5rem' }}>{a.icon}</span>
            <span>{a.label === 'Export Report' && exporting ? 'Exporting...' : a.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Background Three.js Scene ─── */
function useBackgroundScene() {
  useEffect(() => {
    const canvas = document.getElementById('dashboard-bg-canvas');
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 5;

    // 3000 particles
    const pGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(3000 * 3);
    const colors = new Float32Array(3000 * 3);
    for (let i = 0; i < 3000; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
      const r = Math.random();
      if (r > 0.7) { colors[i * 3] = 0.24; colors[i * 3 + 1] = 0.51; colors[i * 3 + 2] = 1; }
      else if (r > 0.4) { colors[i * 3] = 0.55; colors[i * 3 + 1] = 0.36; colors[i * 3 + 2] = 0.97; }
      else { colors[i * 3] = 0.93; colors[i * 3 + 1] = 0.28; colors[i * 3 + 2] = 0.60; }
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const pMat = new THREE.PointsMaterial({ size: 0.04, vertexColors: true, transparent: true, opacity: 0.6 });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // 5 floating geometric shapes
    const shapes = [];
    const geos = [
      new THREE.IcosahedronGeometry(0.3, 0),
      new THREE.OctahedronGeometry(0.35),
      new THREE.TetrahedronGeometry(0.4),
      new THREE.TorusGeometry(0.3, 0.08, 8, 20),
      new THREE.TorusKnotGeometry(0.2, 0.06, 50, 6),
    ];
    const shapeColors = [0x3b82f6, 0x8b5cf6, 0xec4899, 0x22d3ee, 0x10b981];
    geos.forEach((geo, i) => {
      const mat = new THREE.MeshBasicMaterial({ color: shapeColors[i], wireframe: i % 2 === 0, transparent: true, opacity: 0.3 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 5);
      mesh.userData = { floatSpeed: 0.3 + Math.random() * 0.5, floatOffset: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 0.01 };
      scene.add(mesh);
      shapes.push(mesh);
    });

    // Mouse parallax
    let mx = 0, my = 0;
    const onMouse = (e) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouse);

    // Resize
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    // Animation loop
    let animId;
    function animate() {
      animId = requestAnimationFrame(animate);
      const t = Date.now() * 0.001;
      particles.rotation.y += 0.0003;
      particles.rotation.x += 0.0001;
      shapes.forEach(s => {
        s.rotation.x += s.userData.rotSpeed;
        s.rotation.y += s.userData.rotSpeed * 1.3;
        s.position.y += Math.sin(t * s.userData.floatSpeed + s.userData.floatOffset) * 0.003;
      });
      scene.rotation.x += (my * 0.03 - scene.rotation.x) * 0.05;
      scene.rotation.y += (mx * 0.03 - scene.rotation.y) * 0.05;
      renderer.render(scene, camera);
    }
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else obj.material.dispose();
        }
      });
    };
  }, []);
}

/* ─── Main Dashboard ─── */
export default function Dashboard() {
  const [stats, setStats] = useState({ openJobs: 0, totalCandidates: 0, inInterview: 0, avgScore: 0 });
  const [pipeline, setPipeline] = useState(mockFunnelData);
  const [activity, setActivity] = useState(mockActivity);
  const title = useTypingTitle('Dashboard', 90);

  useBackgroundScene();

  // Inject styles once
  useEffect(() => {
    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent = CSS;
      document.head.appendChild(style);
    }
  }, []);

  // Fetch real data
  useEffect(() => {
    async function fetchData() {
      // Stats
      try {
        const res = await api.get('/api/dashboard/stats');
        const d = res.data;
        setStats({
          openJobs: d.open_jobs ?? d.openJobs ?? 0,
          totalCandidates: d.total_candidates ?? d.totalCandidates ?? 0,
          inInterview: d.in_interview ?? d.inInterview ?? 0,
          avgScore: d.avg_score ?? d.avgScore ?? 0,
        });
      } catch {
        try {
          const res = await api.get('/api/analytics/overview');
          const d = res.data;
          setStats({
            openJobs: d.open_jobs ?? d.openJobs ?? mockJobs.filter(j => j.status === 'open').length,
            totalCandidates: d.total_candidates ?? d.totalCandidates ?? mockCandidates.length,
            inInterview: d.in_interview ?? d.inInterview ?? mockCandidates.filter(c => c.stage === 'Interview').length,
            avgScore: d.avg_ai_score ?? d.avgScore ?? Math.round(mockCandidates.reduce((s, c) => s + c.aiScore, 0) / mockCandidates.length),
          });
        } catch {
          setStats({
            openJobs: mockJobs.filter(j => j.status === 'open').length,
            totalCandidates: mockCandidates.length,
            inInterview: mockCandidates.filter(c => c.stage === 'Interview').length,
            avgScore: Math.round(mockCandidates.reduce((s, c) => s + c.aiScore, 0) / mockCandidates.length),
          });
        }
      }

      // Pipeline
      try {
        const res = await api.get('/api/applications/pipeline');
        const d = res.data;
        if (Array.isArray(d) && d.length > 0) setPipeline(d);
        else if (d.pipeline) setPipeline(d.pipeline);
      } catch {
        // keep mockFunnelData
      }

      // Activity
      try {
        const res = await api.get('/api/dashboard/activity');
        if (Array.isArray(res.data) && res.data.length > 0) setActivity(res.data);
      } catch {
        try {
          const res = await api.get('/api/analytics/overview');
          if (res.data.recent_activity) setActivity(res.data.recent_activity);
        } catch {
          // keep mockActivity
        }
      }
    }
    fetchData();
  }, []);

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Background Three.js canvas */}
      <canvas
        id="dashboard-bg-canvas"
        style={{
          position: 'absolute',
          top: 0, left: 0,
          width: '100%', height: '100%',
          zIndex: 0,
          pointerEvents: 'none',
          background: '#020817',
        }}
      />

      {/* Dashboard content */}
      <div style={{ position: 'relative', zIndex: 1, padding: '24px', color: 'white', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
        {/* Typing title */}
        <h1 style={{
          fontSize: '2.2rem', fontWeight: 900, marginBottom: '2rem',
          background: 'linear-gradient(135deg, #a78bfa 0%, #3b82f6 50%, #22d3ee 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.02em', minHeight: '2.8rem',
        }}>
          {title}<span style={{ animation: 'blink 1s step-end infinite', color: '#a78bfa' }}>|</span>
        </h1>

        {/* Stat cards grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
          <StatCard3D title="Open Jobs" value={stats.openJobs} subtitle="Active positions" color="#3b82f6" setupFn={setupRotatingCube} delay={0} />
          <StatCard3D title="Candidates" value={stats.totalCandidates} subtitle="All applications" color="#22c55e" setupFn={setupOrbitingDots} delay={100} />
          <StatCard3D title="In Interview" value={stats.inInterview} subtitle="Currently interviewing" color="#f59e0b" setupFn={setupPulsingTorus} delay={200} />
          <StatCard3D title="AI Score" value={stats.avgScore} subtitle="Average quality score" color="#8b5cf6" setupFn={setupSpinningIcosahedron} delay={300} />
        </div>

        {/* Middle row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
          <PipelineFunnel data={pipeline} />
          <ScoreGauge score={stats.avgScore} />
        </div>

        {/* Bottom row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <ActivityFeed items={activity} />
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
