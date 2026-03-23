import { useState, useEffect } from 'react';
import api from '../api/axios';
import { mockFunnelData, mockTimeToHire, mockSourceData } from '../api/mockData';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  FunnelChart, Funnel, LabelList, Cell,
  PieChart, Pie,
} from 'recharts';

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

const customTooltipStyle = {
  background: 'rgba(6,10,30,0.95)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '10px',
  color: 'rgba(255,255,255,0.9)',
  fontSize: '0.82rem',
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={customTooltipStyle}>
      <p style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ padding: '0.4rem 0.75rem', color: p.color || '#60a5fa', fontWeight: 700 }}>{p.value}</p>
      ))}
    </div>
  );
}

export default function Analytics() {
  const [timeToHire, setTimeToHire] = useState(null);
  const [funnelData, setFunnelData] = useState(mockFunnelData);
  const [sourceData] = useState(mockSourceData);
  const [timeToHireChart, setTimeToHireChart] = useState(mockTimeToHire);

  useEffect(() => { loadAnalytics(); }, []);

  const loadAnalytics = async () => {
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
  };

  return (
    <div style={{ color: 'rgba(255,255,255,0.9)', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <h1 style={{
        fontSize: '2rem', fontWeight: 900, marginBottom: '1.75rem',
        background: 'linear-gradient(135deg, #a78bfa 0%, #3b82f6 50%, #22d3ee 100%)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        letterSpacing: '-0.02em',
      }}>Analytics</h1>

      {/* Time to Hire Summary */}
      {timeToHire && (
        <div style={{ ...glassCard, marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.25rem' }}>Time to Hire</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div style={{ textAlign: 'center', padding: '1.25rem', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '14px' }}>
              <p style={{ fontSize: '2.5rem', fontWeight: 900, color: '#60a5fa', textShadow: '0 0 20px rgba(59,130,246,0.5)' }}>{timeToHire.overall_avg_days}</p>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', marginTop: '0.4rem' }}>Avg Days to Hire</p>
            </div>
            {timeToHire.per_job?.slice(0, 2).map((j, i) => (
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

        {/* Bar Chart */}
        <div style={glassCard}>
          <h2 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.25rem' }}>Avg Time to Hire (Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={timeToHireChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="stage" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="days" fill="url(#barGrad)" radius={[6, 6, 0, 0]}>
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
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: color, display: 'inline-block' }} />
                      {item.source}
                    </span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color }}>{item.count}</span>
                  </div>
                  <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: '3px', width: `${pct}%`, background: color, boxShadow: `0 0 8px ${color}66`, transition: 'width 1s ease' }} />
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
