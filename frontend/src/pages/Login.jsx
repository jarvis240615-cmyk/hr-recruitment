import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import api from '../api/axios';

function useParticleBackground(canvasId) {
  useEffect(() => {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: false, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x020817, 1);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 5;

    const count = 2000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 25;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 25;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 15;
      const r = Math.random();
      if (r > 0.7) { colors[i*3]=0.23; colors[i*3+1]=0.51; colors[i*3+2]=0.96; }
      else if (r > 0.4) { colors[i*3]=0.55; colors[i*3+1]=0.36; colors[i*3+2]=0.96; }
      else { colors[i*3]=0.02; colors[i*3+1]=0.71; colors[i*3+2]=0.83; }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const mat = new THREE.PointsMaterial({ size: 0.04, vertexColors: true, transparent: true, opacity: 0.7 });
    const particles = new THREE.Points(geo, mat);
    scene.add(particles);

    let mx = 0, my = 0;
    const onMouse = (e) => { mx = (e.clientX / window.innerWidth - 0.5) * 2; my = -(e.clientY / window.innerHeight - 0.5) * 2; };
    window.addEventListener('mousemove', onMouse);
    const onResize = () => { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); };
    window.addEventListener('resize', onResize);

    let animId;
    function animate() {
      animId = requestAnimationFrame(animate);
      particles.rotation.y += 0.0003;
      particles.rotation.x += 0.0001;
      scene.rotation.x += (my * 0.02 - scene.rotation.x) * 0.04;
      scene.rotation.y += (mx * 0.02 - scene.rotation.y) * 0.04;
      renderer.render(scene, camera);
    }
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, []);
}

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');

  useParticleBackground('login-bg-canvas');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      navigate('/');
    } catch {
      if (email && password) {
        localStorage.setItem('token', 'mock-jwt-token');
        navigate('/');
      } else {
        setError('Please enter email and password');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (name) => ({
    width: '100%',
    padding: '0.75rem 1rem',
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${focused === name ? 'rgba(59,130,246,0.6)' : 'rgba(255,255,255,0.1)'}`,
    borderRadius: '12px',
    color: 'rgba(255,255,255,0.9)',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'all 0.3s',
    boxSizing: 'border-box',
    boxShadow: focused === name ? '0 0 20px rgba(59,130,246,0.15)' : 'none',
  });

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <canvas id="login-bg-canvas" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }} />

      {/* Radial glow */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: '600px', height: '600px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
        zIndex: 0, pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '420px', padding: '1.5rem', fontFamily: 'Inter, system-ui, sans-serif' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '20px', margin: '0 auto 1rem',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.8rem', boxShadow: '0 0 40px rgba(59,130,246,0.5)',
          }}>🚀</div>
          <h1 style={{
            fontSize: '2rem', fontWeight: 900, color: 'rgba(255,255,255,0.95)',
            background: 'linear-gradient(135deg, #a78bfa, #3b82f6, #22d3ee)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em',
          }}>HR Recruit</h1>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.4rem' }}>Sign in to your workspace</p>
        </div>

        {/* Glass card */}
        <form onSubmit={handleSubmit} style={{
          background: 'rgba(10,15,40,0.7)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 40px rgba(59,130,246,0.1)',
        }}>
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#fca5a5', fontSize: '0.82rem', padding: '0.65rem 1rem',
              borderRadius: '10px', marginBottom: '1rem',
            }}>{error}</div>
          )}

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused('')}
              style={inputStyle('email')}
              placeholder="admin@company.com"
              required
            />
          </div>

          <div style={{ marginBottom: '1.75rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocused('password')}
              onBlur={() => setFocused('')}
              style={inputStyle('password')}
              placeholder="Enter password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.85rem',
              background: loading ? 'rgba(59,130,246,0.4)' : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              border: 'none', borderRadius: '12px',
              color: 'white', fontWeight: 700, fontSize: '0.9rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              boxShadow: loading ? 'none' : '0 0 25px rgba(59,130,246,0.4)',
              letterSpacing: '0.04em',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>

        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)', textAlign: 'center', marginTop: '1rem' }}>
          Demo: enter any email/password to sign in
        </p>
      </div>
    </div>
  );
}
