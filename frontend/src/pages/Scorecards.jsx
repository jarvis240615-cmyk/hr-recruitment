import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const glassCard = {
  background: 'rgba(10,15,40,0.7)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '20px',
};

const RECOMMENDATIONS = [
  { value: 'strong_yes', label: 'Strong Yes', color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
  { value: 'yes', label: 'Yes', color: '#4ade80', bg: 'rgba(74,222,128,0.1)' },
  { value: 'neutral', label: 'Neutral', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
  { value: 'no', label: 'No', color: '#f87171', bg: 'rgba(248,113,113,0.1)' },
  { value: 'strong_no', label: 'Strong No', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
];

function ScoreInput({ label, value, onChange }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
      <div style={{ display: 'flex', gap: '0.4rem' }}>
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} type="button" onClick={() => onChange(n)} style={{
            width: '38px', height: '38px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700,
            background: value === n ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : 'rgba(255,255,255,0.05)',
            border: value === n ? 'none' : '1px solid rgba(255,255,255,0.1)',
            color: value === n ? 'white' : 'rgba(255,255,255,0.5)',
            cursor: 'pointer', transition: 'all 0.2s',
            boxShadow: value === n ? '0 0 15px rgba(59,130,246,0.4)' : 'none',
          }}>{n}</button>
        ))}
      </div>
    </div>
  );
}

const SCORE_METRICS = [
  { key: 'technical_score', label: 'Technical' },
  { key: 'communication_score', label: 'Communication' },
  { key: 'culture_fit_score', label: 'Culture Fit' },
  { key: 'overall_score', label: 'Overall' },
];

const metricColors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];

export default function Scorecards() {
  const [scorecards, setScorecards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    application_id: '', technical_score: 3, communication_score: 3,
    culture_fit_score: 3, overall_score: 3, strengths: '', weaknesses: '',
    recommendation: 'neutral', notes: '',
  });

  useEffect(() => { loadScorecards(); }, []);

  const loadScorecards = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/scorecards');
      setScorecards(Array.isArray(res.data) ? res.data : []);
    } catch {
      setScorecards([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.application_id) { toast.error('Please enter an application ID'); return; }
    try {
      await api.post('/api/scorecards', { ...form, application_id: Number(form.application_id) });
      toast.success('Scorecard submitted!');
      setShowForm(false);
      setForm({ application_id: '', technical_score: 3, communication_score: 3, culture_fit_score: 3, overall_score: 3, strengths: '', weaknesses: '', recommendation: 'neutral', notes: '' });
      loadScorecards();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit scorecard');
    }
  };

  const getRecLabel = (val) => RECOMMENDATIONS.find(r => r.value === val) || RECOMMENDATIONS[2];

  const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    color: 'rgba(255,255,255,0.9)',
    padding: '0.55rem 0.85rem',
    fontSize: '0.85rem',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ color: 'rgba(255,255,255,0.9)', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <h1 style={{
          fontSize: '2rem', fontWeight: 900,
          background: 'linear-gradient(135deg, #a78bfa 0%, #3b82f6 50%, #22d3ee 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.02em',
        }}>Scorecards</h1>
        <button onClick={() => setShowForm(true)} style={{ padding: '0.65rem 1.25rem', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', border: 'none', borderRadius: '12px', color: 'white', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 0 20px rgba(59,130,246,0.3)' }}>+ New Scorecard</button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ ...glassCard, height: '100px', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      ) : scorecards.length === 0 ? (
        <div style={{ ...glassCard, padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'rgba(255,255,255,0.8)', marginBottom: '0.5rem' }}>No scorecards yet</h3>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', marginBottom: '1.5rem' }}>Submit your first evaluation scorecard after an interview.</p>
          <button onClick={() => setShowForm(true)} style={{ padding: '0.65rem 1.5rem', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', border: 'none', borderRadius: '12px', color: 'white', fontWeight: 700, cursor: 'pointer' }}>+ New Scorecard</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {scorecards.map(sc => {
            const rec = getRecLabel(sc.recommendation);
            return (
              <div key={sc.id} style={{ ...glassCard, padding: '1.5rem', transition: 'all 0.3s' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 30px rgba(59,130,246,0.12)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>Application #{sc.application_id}</span>
                    {sc.interviewer_name && <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', marginLeft: '0.6rem' }}>by {sc.interviewer_name}</span>}
                  </div>
                  <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, background: rec.bg, color: rec.color, border: `1px solid ${rec.color}44` }}>{rec.label}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                  {SCORE_METRICS.map((metric, i) => (
                    <div key={metric.key} style={{ textAlign: 'center', padding: '0.85rem', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', border: `1px solid ${metricColors[i]}22` }}>
                      <p style={{ fontSize: '2rem', fontWeight: 900, color: metricColors[i], textShadow: `0 0 15px ${metricColors[i]}44` }}>{sc[metric.key]}</p>
                      <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.2rem' }}>{metric.label}</p>
                    </div>
                  ))}
                </div>
                {(sc.strengths || sc.weaknesses) && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {sc.strengths && (
                      <div style={{ background: 'rgba(34,197,94,0.06)', borderRadius: '10px', padding: '0.65rem', border: '1px solid rgba(34,197,94,0.15)' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#4ade80', display: 'block', marginBottom: '0.25rem' }}>✓ Strengths</span>
                        <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)' }}>{sc.strengths}</span>
                      </div>
                    )}
                    {sc.weaknesses && (
                      <div style={{ background: 'rgba(239,68,68,0.06)', borderRadius: '10px', padding: '0.65rem', border: '1px solid rgba(239,68,68,0.15)' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#f87171', display: 'block', marginBottom: '0.25rem' }}>✗ Weaknesses</span>
                        <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)' }}>{sc.weaknesses}</span>
                      </div>
                    )}
                  </div>
                )}
                {sc.created_at && <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', marginTop: '0.75rem' }}>{new Date(sc.created_at).toLocaleDateString()}</p>}
              </div>
            );
          })}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
          <div style={{ ...glassCard, width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 80px rgba(0,0,0,0.6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>New Scorecard</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1 }}>&times;</button>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Application ID</label>
                <input type="number" value={form.application_id} onChange={e => setForm({ ...form, application_id: e.target.value })} style={inputStyle} placeholder="Enter application ID" />
              </div>
              <ScoreInput label="Technical" value={form.technical_score} onChange={v => setForm({ ...form, technical_score: v })} />
              <ScoreInput label="Communication" value={form.communication_score} onChange={v => setForm({ ...form, communication_score: v })} />
              <ScoreInput label="Culture Fit" value={form.culture_fit_score} onChange={v => setForm({ ...form, culture_fit_score: v })} />
              <ScoreInput label="Overall" value={form.overall_score} onChange={v => setForm({ ...form, overall_score: v })} />
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Recommendation</label>
                <select value={form.recommendation} onChange={e => setForm({ ...form, recommendation: e.target.value })} style={inputStyle}>
                  {RECOMMENDATIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              {['strengths', 'weaknesses', 'notes'].map(field => (
                <div key={field}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: '0.4rem', textTransform: 'capitalize', letterSpacing: '0.06em' }}>{field}</label>
                  <textarea value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', padding: '1.25rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button onClick={() => setShowForm(false)} style={{ padding: '0.6rem 1.25rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '0.85rem' }}>Cancel</button>
              <button onClick={handleSubmit} style={{ padding: '0.6rem 1.25rem', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', border: 'none', borderRadius: '10px', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', boxShadow: '0 0 20px rgba(59,130,246,0.3)' }}>Submit Scorecard</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
