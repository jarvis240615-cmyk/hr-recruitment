import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import * as THREE from 'three';
import api from '../api/axios';

/* ── Dramatic Three.js background ── */
function useDramaticBackground(canvasId) {
  useEffect(() => {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: false, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x020817, 1);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.z = 8;

    // Ambient + point lights
    scene.add(new THREE.AmbientLight(0x0a1040, 1.5));
    const light1 = new THREE.PointLight(0x3b82f6, 3, 30);
    light1.position.set(5, 5, 5);
    scene.add(light1);
    const light2 = new THREE.PointLight(0x8b5cf6, 2, 30);
    light2.position.set(-5, -5, 3);
    scene.add(light2);

    const objects = [];

    // Large floating icosahedrons
    const icoGeo = new THREE.IcosahedronGeometry(1.8, 0);
    const icoMat = new THREE.MeshStandardMaterial({
      color: 0x3b82f6, emissive: 0x1e3a8a, emissiveIntensity: 0.5,
      metalness: 0.7, roughness: 0.2, wireframe: false, transparent: true, opacity: 0.3,
    });
    const ico1 = new THREE.Mesh(icoGeo, icoMat);
    ico1.position.set(-5, 2, -3);
    scene.add(ico1);
    objects.push({ mesh: ico1, rx: 0.004, ry: 0.006, floatAmp: 0.3, floatSpeed: 0.5, floatOff: 0 });

    const ico2 = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.2, 1),
      new THREE.MeshStandardMaterial({ color: 0x8b5cf6, emissive: 0x4c1d95, emissiveIntensity: 0.6, metalness: 0.6, roughness: 0.3, wireframe: true }),
    );
    ico2.position.set(5.5, -2, -2);
    scene.add(ico2);
    objects.push({ mesh: ico2, rx: -0.005, ry: 0.004, floatAmp: 0.4, floatSpeed: 0.7, floatOff: 1.5 });

    // Rotating rings (torus)
    const ring1 = new THREE.Mesh(
      new THREE.TorusGeometry(2.5, 0.06, 16, 80),
      new THREE.MeshStandardMaterial({ color: 0x22d3ee, emissive: 0x0891b2, emissiveIntensity: 0.7, metalness: 0.9, roughness: 0.1 }),
    );
    ring1.position.set(3, 3, -5);
    ring1.rotation.x = Math.PI / 3;
    scene.add(ring1);
    objects.push({ mesh: ring1, rx: 0.008, ry: 0.003, floatAmp: 0.2, floatSpeed: 0.4, floatOff: 2 });

    const ring2 = new THREE.Mesh(
      new THREE.TorusGeometry(1.8, 0.05, 8, 60),
      new THREE.MeshStandardMaterial({ color: 0xec4899, emissive: 0x9d174d, emissiveIntensity: 0.7, metalness: 0.8, roughness: 0.2 }),
    );
    ring2.position.set(-4, -3, -4);
    ring2.rotation.y = Math.PI / 4;
    scene.add(ring2);
    objects.push({ mesh: ring2, rx: 0.003, ry: 0.009, floatAmp: 0.25, floatSpeed: 0.6, floatOff: 3 });

    // Torus knot
    const knot = new THREE.Mesh(
      new THREE.TorusKnotGeometry(0.9, 0.25, 80, 12),
      new THREE.MeshStandardMaterial({ color: 0xa78bfa, emissive: 0x5b21b6, emissiveIntensity: 0.4, metalness: 0.5, roughness: 0.3, transparent: true, opacity: 0.5 }),
    );
    knot.position.set(0, 4, -6);
    scene.add(knot);
    objects.push({ mesh: knot, rx: 0.007, ry: 0.005, floatAmp: 0.5, floatSpeed: 0.35, floatOff: 0.8 });

    // Background particles
    const pCount = 1500;
    const pPos = new Float32Array(pCount * 3);
    const pCol = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 30;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 30;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5;
      const r = Math.random();
      if (r > 0.7) { pCol[i*3]=0.23; pCol[i*3+1]=0.51; pCol[i*3+2]=0.96; }
      else if (r > 0.4) { pCol[i*3]=0.55; pCol[i*3+1]=0.36; pCol[i*3+2]=0.96; }
      else { pCol[i*3]=0.02; pCol[i*3+1]=0.71; pCol[i*3+2]=0.83; }
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
    const pMesh = new THREE.Points(pGeo, new THREE.PointsMaterial({ size: 0.03, vertexColors: true, transparent: true, opacity: 0.6 }));
    scene.add(pMesh);

    let mx = 0, my = 0;
    const onMouse = (e) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouse);
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    let animId;
    function animate() {
      animId = requestAnimationFrame(animate);
      const t = Date.now() * 0.001;
      for (const obj of objects) {
        obj.mesh.rotation.x += obj.rx;
        obj.mesh.rotation.y += obj.ry;
        const baseY = obj.mesh.position.y;
        obj.mesh.position.y = baseY + Math.sin(t * obj.floatSpeed + obj.floatOff) * obj.floatAmp * 0.02;
      }
      pMesh.rotation.y += 0.0003;
      scene.rotation.x += (my * 0.015 - scene.rotation.x) * 0.05;
      scene.rotation.y += (mx * 0.015 - scene.rotation.y) * 0.05;
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

/* ── Typing animation hook ── */
function useTypingText(text, speed = 80, delay = 300) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    let i = 0;
    setDisplayed('');
    const timeout = setTimeout(() => {
      const iv = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) clearInterval(iv);
      }, speed);
      return () => clearInterval(iv);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, speed, delay]);
  return displayed;
}

export default function Login() {
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useDramaticBackground('login-bg-canvas');
  const typedTitle = useTypingText('HR Recruitment Platform', 65, 400);

  /* Card tilt on mouse move */
  const handleMouseMove = (e) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    setTilt({ x: dy * -8, y: dx * 8 });
  };
  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

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
    border: 'none',
    borderBottom: `2px solid ${focused === name ? '#3b82f6' : 'rgba(255,255,255,0.12)'}`,
    borderRadius: '12px 12px 0 0',
    color: 'rgba(255,255,255,0.9)',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'all 0.3s',
    boxSizing: 'border-box',
    boxShadow: focused === name ? `0 4px 20px rgba(59,130,246,0.2), 0 0 0 1px rgba(59,130,246,0.15)` : 'none',
  });

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <canvas id="login-bg-canvas" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }} />

      {/* Radial glow */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: '700px', height: '700px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(139,92,246,0.08) 40%, transparent 70%)',
        zIndex: 0, pointerEvents: 'none',
        animation: 'pulse 4s ease-in-out infinite',
      }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '440px', padding: '1.5rem', fontFamily: 'Inter, system-ui, sans-serif' }}>
        {/* Header with typing animation */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '22px', margin: '0 auto 1rem',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', boxShadow: '0 0 50px rgba(59,130,246,0.6), 0 0 100px rgba(59,130,246,0.2)',
            animation: 'float 3s ease-in-out infinite',
          }}>🚀</div>
          <h1 style={{
            fontSize: '1.6rem', fontWeight: 900, color: 'rgba(255,255,255,0.95)',
            background: 'linear-gradient(135deg, #a78bfa, #3b82f6, #22d3ee)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em', minHeight: '2.2rem',
            backgroundSize: '200% auto',
            animation: 'gradientShift 4s ease infinite',
          }}>
            {typedTitle}<span style={{ animation: 'blink 1s step-end infinite', WebkitTextFillColor: '#a78bfa', color: '#a78bfa' }}>|</span>
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.4rem' }}>Sign in to your workspace</p>
        </div>

        {/* Tiltable glass card */}
        <div ref={cardRef} style={{
          transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: tilt.x === 0 ? 'transform 0.6s ease' : 'transform 0.1s ease',
          transformStyle: 'preserve-3d',
        }}>
          <form onSubmit={handleSubmit} style={{
            background: 'rgba(10,15,40,0.75)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '24px',
            padding: '2rem',
            boxShadow: '0 30px 70px rgba(0,0,0,0.6), 0 0 50px rgba(59,130,246,0.15), inset 0 1px 0 rgba(255,255,255,0.08)',
          }}>
            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                color: '#fca5a5', fontSize: '0.82rem', padding: '0.65rem 1rem',
                borderRadius: '10px', marginBottom: '1rem',
              }}>{error}</div>
            )}

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Email</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
                style={inputStyle('email')} placeholder="admin@company.com" required
              />
              {focused === 'email' && (
                <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, #3b82f6, #8b5cf6, transparent)', animation: 'shimmer 1.5s ease infinite', backgroundSize: '200% 100%' }} />
              )}
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Password</label>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused('password')} onBlur={() => setFocused('')}
                style={inputStyle('password')} placeholder="Enter password" required
              />
              {focused === 'password' && (
                <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, #8b5cf6, #22d3ee, transparent)', animation: 'shimmer 1.5s ease infinite', backgroundSize: '200% 100%' }} />
              )}
            </div>

            {/* Shimmer button */}
            <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '14px' }}>
              <button
                type="submit" disabled={loading}
                style={{
                  width: '100%', padding: '0.9rem',
                  background: loading ? 'rgba(59,130,246,0.4)' : 'linear-gradient(135deg, #3b82f6, #8b5cf6, #3b82f6)',
                  backgroundSize: '200% auto',
                  border: 'none', borderRadius: '14px',
                  color: 'white', fontWeight: 800, fontSize: '0.95rem',
                  cursor: loading ? 'not-allowed' : 'none',
                  boxShadow: loading ? 'none' : '0 0 30px rgba(59,130,246,0.5), 0 0 60px rgba(59,130,246,0.2)',
                  letterSpacing: '0.06em', position: 'relative', overflow: 'hidden',
                  animation: loading ? 'none' : 'gradientShift 2s ease infinite',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 0 40px rgba(59,130,246,0.7), 0 0 80px rgba(139,92,246,0.3)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 0 30px rgba(59,130,246,0.5), 0 0 60px rgba(59,130,246,0.2)';
                }}
              >
                {/* Shimmer overlay */}
                {!loading && (
                  <span style={{
                    position: 'absolute', top: 0, left: '-60%', width: '50%', height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                    transform: 'skewX(-20deg)',
                    animation: 'shineSwipe 2.5s ease-in-out infinite',
                    pointerEvents: 'none',
                  }} />
                )}
                {loading ? 'Signing in...' : 'Sign In →'}
              </button>
            </div>
          </form>
        </div>

        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)', textAlign: 'center', marginTop: '1rem' }}>
          Demo: enter any email/password to sign in
        </p>

        {/* Footer nav */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          {[
            { to: '/about', label: 'About' },
            { to: '/contact', label: 'Contact' },
            { to: '/privacy', label: 'Privacy Policy' },
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.28)', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.65)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.28)'}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
