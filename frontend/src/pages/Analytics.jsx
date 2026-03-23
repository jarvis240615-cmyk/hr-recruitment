import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { mockFunnelData, mockTimeToHire, mockSourceData } from '../api/mockData';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  FunnelChart, Funnel, LabelList, Cell,
  PieChart, Pie,
} from 'recharts';

const STYLE_ID = 'analytics-styles';
const CSS = `
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
@keyframes countUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
@keyframes barGrow { from{transform:scaleY(0);transform-origin:bottom} to{transform:scaleY(1);transform-origin:bottom} }
@keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
`;

const FUNNEL_COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#c084fc'];
const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const glassCard = {
  background: 'rgba(10,15,40,0.7)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '20px',
  padding: '1.5rem',
};

function useCountUp(target, duration = 1400) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!target) return;
    let startTime = null;
    const tick = (now) => {
      if (!startTime) startTime = now;
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return value;
}

function GlowCounter({ value, label, color, delay = 0 }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t); }, [delay]);
  const displayed = useCountUp(visible ? value : 0, 1600);

  return (
    <div style={{
      textAlign: 'center', padding: '1.5rem',
      background: `${color}12`, border: `1px solid ${color}25`,
      borderRadius: '14px',
      animation: `slideUp 0.5s ease ${delay}ms both`,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Glow ring behind number */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        width: '80px', height: '80px', borderRadius: '50%',
        transform: 'translate(-50%, -50%)',
        background: `radial-gradient(circle, ${color}22 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />
      <p style={{
        fontSize: '2.8rem', fontWeight: 900, color,
        textShadow: `0 0 25px ${color}88`,
        animation: `countUp 0.4s ease ${delay + 200}ms both`,
        position: 'relative', zIndex: 1,
      }}>{displayed}</p>
      <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', marginTop: '0.4rem', position: 'relative', zIndex: 1 }}>{label}</p>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(6,10,30,0.95)', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '10px', color: 'rgba(255,255,255,0.9)', fontSize: '0.82rem',
    }}>
      <p style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ padding: '0.4rem 0.75rem', color: p.color || '#60a5fa', fontWeight: 700 }}>{p.value}</p>
      ))}
    </div>
  );
}

/* Animated bar that grows on mount */
function AnimatedBar({ x, y, width, height, fill }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 50); return () => clearTimeout(t); }, []);
  const h = mounted ? height : 0;
  const ty = mounted ? y : y + height;
  return (
    <rect
      x={x} y={ty} width={width} height={h} fill={fill} rx={6}
      style={{ transition: 'height 0.8s cubic-bezier(.22,1,.36,1), y 0.8s cubic-bezier(.22,1,.36,1)' }}
    />
  );
}

export default function Analytics() {
  const [timeToHire, setTimeToHire] = useState(null);
  const [funnelData, setFunnelData] = useState(mockFunnelData);
  const [sourceData] = useState(mockSourceData);
  const [timeToHireChart, setTimeToHireChart] = useState(mockTimeToHire);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshPulse, setRefreshPulse] = useState(false);

  useEffect(() => {
    if (!document.getElementById(STYLE_ID)) {
      const s = document.createElement('style'); s.id = STYLE_ID; s.textContent = CSS; document.head.appendChild(s);
    }
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setRefreshing(true);
    setRefreshPulse(true);
    try {
      const [tthRes, pipelineRes] = await Promise.all([
        api.get('/api/analytics/time-to-hire').catch(() => null),
        api.get('/api/analytics/pipeline').catch(() => null),
      ]);
      if (tthRes?.data) {
        setTimeToHire(tthRes.data);
        if (tthRes.data.stage_transitions) {
          setTimeToHireChart(tthRes.data.stage_transitions.map(s => ({ stage: s.stage, days: s.avg_days })));
        }
      }
      if (pipelineRes?.data?.pipeline) setFunnelData(pipelineRes.data.pipeline);
    } catch {}
    finally {
      setRefreshing(false);
      setTimeout(() => setRefreshPulse(false), 600);
    }
  };

  const totalCandidates = funnelData.reduce((s, d) => s + (d.count || 0), 0);
  const hiredCount = funnelData.find(d => d.stage === 'Hired')?.count || 0;
  const avgDays = timeToHire?.overall_avg_days || mockTimeToHire.reduce((s, d) => s + d.days, 0) / mockTimeToHire.length;

  return (
    <div style={{ color: 'rgba(255,255,255,0.9)', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <h1 style={{
          fontSize: '2rem', fontWeight: 900,
          background: 'linear-gradient(135deg, #a78bfa 0%, #3b82f6 50%, #22d3ee 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.02em',
        }}>Analytics</h1>

        {/* Live refresh indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'none' }} onClick={loadAnalytics}>
          <div style={{
            width: '20px', height: '20px',
            borderRadius: '50%',
            border: '2px solid rgba(59,130,246,0.3)',
            borderTopColor: '#3b82f6',
            animation: refreshing ? 'spin 0.8s linear infinite' : 'none',
            opacity: refreshing ? 1 : 0.5,
            transition: 'opacity 0.3s',
          }} />
          <span style={{ fontSize: '0.75rem', color: refreshing ? '#60a5fa' : 'rgba(255,255,255,0.35)', transition: 'color 0.3s' }}>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </span>
          {!refreshing && (
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e', animation: 'pulse 2s ease-in-out infinite' }} />
          )}
        </div>
      </div>

      {/* Glowing stat counters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <GlowCounter value={totalCandidates} label="Total Candidates" color="#3b82f6" delay={0} />
        <GlowCounter value={hiredCount} label="Total Hired" color="#22c55e" delay={150} />
        <GlowCounter value={Math.round(avgDays)} label="Avg Days to Hire" color="#f59e0b" delay={300} />
      </div>

      {/* Time to Hire Summary */}
      {timeToHire && (
        <div style={{ ...glassCard, marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.25rem' }}>Time to Hire</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {timeToHire.per_job?.slice(0, 3).map((j, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '1.25rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px' }}>
                <p style={{ fontSize: '2rem', fontWeight: 900, color: 'rgba(255,255,255,0.85)' }}>{j.avg_days} <span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.4)' }}>days</span></p>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)', marginTop: '0.4rem' }}>{j.job_title}</p>
                <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.2rem' }}>{j.count} hire{j.count !== 1 ? 's' : ''}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Recruitment Funnel */}
        <div style={glassCard}>
          <h2 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.25rem' }}>Recruitment Funnel</h2>
          <ResponsiveContainer width="100%" height={300}>
            <FunnelChart>
              <Tooltip content={<CustomTooltip />} />
              <Funnel dataKey="count" data={funnelData} isAnimationActive>
                <LabelList position="right" fill="rgba(255,255,255,0.6)" stroke="none" dataKey="stage" fontSize={12} />
                <LabelList position="center" fill="#fff" stroke="none" dataKey="count" fontSize={14} fontWeight="bold" />
                {funnelData.map((_, i) => <Cell key={i} fill={FUNNEL_COLORS[i % FUNNEL_COLORS.length]} />)}
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart with animated bars */}
        <div style={glassCard}>
          <h2 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.25rem' }}>Avg Time to Hire (Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={timeToHireChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="stage" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="days" radius={[6, 6, 0, 0]} shape={<AnimatedBar />}>
                {timeToHireChart.map((_, i) => <Cell key={i} fill={['#3b82f6','#6366f1','#8b5cf6','#a855f7','#06b6d4'][i % 5]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Source Breakdown */}
      <div style={glassCard}>
        <h2 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.25rem' }}>Source Breakdown</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'center' }}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sourceData} cx="50%" cy="50%" outerRadius={110}
                dataKey="count" nameKey="source"
                label={({ source, percent }) => `${source} (${(percent * 100).toFixed(0)}%)`}
                labelLine={{ stroke: 'rgba(255,255,255,0.2)' }}
              >
                {sourceData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {sourceData.map((item, i) => {
              const total = sourceData.reduce((s, d) => s + d.count, 0);
              const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
              const color = PIE_COLORS[i % PIE_COLORS.length];
              return (
                <div key={item.source}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: color, display: 'inline-block', boxShadow: `0 0 6px ${color}` }} />
                      {item.source}
                    </span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color }}>{item.count}</span>
                  </div>
                  <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: '3px', width: `${pct}%`, background: color, boxShadow: `0 0 8px ${color}66`, transition: 'width 1.2s cubic-bezier(.22,1,.36,1)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
