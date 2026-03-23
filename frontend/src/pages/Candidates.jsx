import { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { mockCandidates } from '../api/mockData';
import ScoreBar from '../components/ScoreBar';

const STYLE_ID = 'candidates-styles';
const CSS = `
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
@keyframes rowEnter { from{opacity:0;transform:translateX(-20px)} to{opacity:1;transform:translateX(0)} }
@keyframes shine { 0%{left:-60%} 100%{left:120%} }
@keyframes gradBg { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
@keyframes searchGlow { 0%,100%{box-shadow:0 0 8px rgba(59,130,246,0.3)} 50%{box-shadow:0 0 20px rgba(59,130,246,0.6),0 0 40px rgba(139,92,246,0.2)} }
`;

const glassCard = {
  background: 'rgba(10,15,40,0.7)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '20px',
};

const STAGE_COLORS = {
  Rejected: '#ef4444', Offer: '#8b5cf6', Interview: '#f59e0b',
  Applied: '#3b82f6', Screened: '#8b5cf6', Hired: '#22c55e',
};

const GRAD_PAIRS = [
  ['#3b82f6', '#8b5cf6'], ['#22c55e', '#06b6d4'], ['#f59e0b', '#ef4444'],
  ['#8b5cf6', '#ec4899'], ['#22d3ee', '#3b82f6'], ['#10b981', '#22c55e'],
];

function CandidateRow({ c, idx }) {
  const [hov, setHov] = useState(false);
  const sc = STAGE_COLORS[c.stage] || '#6b7280';
  const getInitials = (name) => name ? name.split(' ').map(p => p[0]).join('').slice(0,2).toUpperCase() : '??';
  const [g1, g2] = GRAD_PAIRS[c.id % GRAD_PAIRS.length] || GRAD_PAIRS[0];

  return (
    <tr
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        background: hov ? 'rgba(59,130,246,0.04)' : 'transparent',
        transition: 'background 0.2s',
        position: 'relative',
        overflow: 'hidden',
        animation: `rowEnter 0.4s cubic-bezier(.22,1,.36,1) ${idx * 50}ms both`,
      }}
    >
      {/* Sweep shine effect */}
      {hov && (
        <td colSpan={6} style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: 0, bottom: 0, width: '40%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)',
            transform: 'skewX(-20deg)',
            animation: 'shine 0.6s ease forwards',
          }} />
        </td>
      )}

      <td style={{ padding: '0.85rem 1rem', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
            background: `linear-gradient(135deg, ${g1}, ${g2})`,
            backgroundSize: '200% 200%',
            animation: hov ? 'gradBg 2s ease infinite' : 'none',
            border: hov ? `1px solid ${g1}88` : '1px solid rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.65rem', fontWeight: 700, color: 'white',
            boxShadow: hov ? `0 0 12px ${g1}55` : 'none',
            transition: 'box-shadow 0.2s',
          }}>
            {getInitials(c.name)}
          </div>
          <div>
            <Link to={`/candidates/${c.id}`} style={{ fontSize: '0.87rem', fontWeight: 600, color: '#60a5fa', textDecoration: 'none', display: 'block' }}>{c.name}</Link>
            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', marginTop: '1px' }}>{c.email}</p>
          </div>
        </div>
      </td>
      <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', position: 'relative', zIndex: 1 }}>{c.jobTitle}</td>
      <td style={{ padding: '0.85rem 1rem', position: 'relative', zIndex: 1 }}>
        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, background: `${sc}22`, color: sc, border: `1px solid ${sc}44` }}>{c.stage}</span>
      </td>
      <td style={{ padding: '0.85rem 1rem', width: '160px', position: 'relative', zIndex: 1 }}>
        <ScoreBar score={c.aiScore} />
      </td>
      <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', position: 'relative', zIndex: 1 }}>{c.source}</td>
      <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', position: 'relative', zIndex: 1 }}>{c.appliedDate}</td>
    </tr>
  );
}

export default function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', job_id: '', cover_letter: '' });
  const [resume, setResume] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    if (!document.getElementById(STYLE_ID)) {
      const s = document.createElement('style'); s.id = STYLE_ID; s.textContent = CSS; document.head.appendChild(s);
    }
    loadCandidates(); loadJobs();
  }, []);

  const loadCandidates = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/candidates');
      const data = res.data.items || res.data;
      const mapped = (Array.isArray(data) ? data : []).map((c) => ({
        id: c.id, name: c.full_name || c.name, email: c.email,
        jobTitle: c.applications?.[0]?.job_title || '',
        stage: c.applications?.[0]?.stage || 'Applied',
        aiScore: c.applications?.[0]?.ai_score || 0,
        appliedDate: c.applications?.[0]?.applied_at?.split('T')[0] || '',
        source: 'Website',
      }));
      setCandidates(mapped);
    } catch { setCandidates(mockCandidates); } finally { setLoading(false); }
  };

  const loadJobs = async () => {
    try {
      const res = await api.get('/api/jobs/public');
      setJobs(Array.isArray(res.data) ? res.data : []);
    } catch {}
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!form.job_id) { toast.error('Please select a job'); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('full_name', form.full_name);
      fd.append('email', form.email);
      if (form.phone) fd.append('phone', form.phone);
      if (form.cover_letter) fd.append('cover_letter', form.cover_letter);
      if (resume) fd.append('resume', resume);
      await api.post(`/api/applications/apply/${form.job_id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Application submitted successfully!');
      setShowModal(false);
      setForm({ full_name: '', email: '', phone: '', job_id: '', cover_letter: '' });
      setResume(null);
      loadCandidates();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit application');
    } finally { setSubmitting(false); }
  };

  const filtered = useMemo(() => {
    return candidates.filter((c) => {
      const name = c.name || ''; const email = c.email || ''; const jobTitle = c.jobTitle || '';
      const matchesSearch = name.toLowerCase().includes(search.toLowerCase()) || email.toLowerCase().includes(search.toLowerCase()) || jobTitle.toLowerCase().includes(search.toLowerCase());
      const score = c.aiScore || 0;
      const matchesScore = scoreFilter === 'all' || (scoreFilter === 'high' && score >= 80) || (scoreFilter === 'medium' && score >= 60 && score < 80) || (scoreFilter === 'low' && score < 60);
      return matchesSearch && matchesScore;
    });
  }, [candidates, search, scoreFilter]);

  const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    color: 'rgba(255,255,255,0.9)',
    padding: '0.55rem 0.85rem',
    fontSize: '0.85rem',
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ color: 'rgba(255,255,255,0.9)', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1 style={{
          fontSize: '2rem', fontWeight: 900,
          background: 'linear-gradient(135deg, #a78bfa 0%, #3b82f6 50%, #22d3ee 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.02em',
        }}>Candidates</h1>
        <button onClick={() => setShowModal(true)} style={{ padding: '0.65rem 1.25rem', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', border: 'none', borderRadius: '12px', color: 'white', fontWeight: 700, fontSize: '0.85rem', cursor: 'none', boxShadow: '0 0 20px rgba(59,130,246,0.3)' }}>+ Add Candidate</button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '200px', maxWidth: '360px' }}>
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Search candidates..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={{
              ...inputStyle, width: '100%',
              border: searchFocused ? '1px solid rgba(59,130,246,0.6)' : '1px solid rgba(255,255,255,0.1)',
              boxShadow: searchFocused ? '0 0 20px rgba(59,130,246,0.3), 0 0 40px rgba(59,130,246,0.1)' : 'none',
              transition: 'all 0.3s',
              animation: searchFocused ? 'searchGlow 2s ease infinite' : 'none',
            }}
          />
          {searchFocused && (
            <div style={{
              position: 'absolute', bottom: '-2px', left: 0, right: 0, height: '2px', borderRadius: '1px',
              background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #22d3ee)',
              backgroundSize: '200% 100%',
              animation: 'gradBg 2s ease infinite',
              boxShadow: '0 0 8px rgba(59,130,246,0.6)',
            }} />
          )}
        </div>
        <select value={scoreFilter} onChange={e => setScoreFilter(e.target.value)} style={inputStyle}>
          <option value="all">All Scores</option>
          <option value="high">High (80+)</option>
          <option value="medium">Medium (60-79)</option>
          <option value="low">Low (&lt;60)</option>
        </select>
      </div>

      {!loading && filtered.length === 0 && candidates.length === 0 ? (
        <div style={{ ...glassCard, padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
          <h3 style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '0.5rem' }}>No candidates yet</h3>
          <p style={{ fontSize: '0.85rem' }}>Candidates will appear here once they apply.</p>
        </div>
      ) : (
        <div style={{ ...glassCard, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Name', 'Job', 'Stage', 'AI Score', 'Source', 'Applied'].map((h) => (
                  <th key={h} style={{ padding: '0.9rem 1rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    {[1,2,3,4,5,6].map(j => (
                      <td key={j} style={{ padding: '1rem' }}>
                        <div style={{ height: '16px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '2.5rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.88rem' }}>No candidates match your filters</td>
                </tr>
              ) : (
                filtered.map((c, idx) => <CandidateRow key={c.id} c={c} idx={idx} />)
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add candidate modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
          <div style={{ ...glassCard, width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 80px rgba(0,0,0,0.6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>Add Candidate</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '1.5rem', cursor: 'none', lineHeight: 1 }}>&times;</button>
            </div>
            <form onSubmit={handleApply} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { label: 'Full Name *', field: 'full_name', type: 'text', placeholder: 'John Doe', required: true },
                { label: 'Email *', field: 'email', type: 'email', placeholder: 'john@example.com', required: true },
                { label: 'Phone', field: 'phone', type: 'text', placeholder: '+1 (555) 123-4567', required: false },
              ].map(({ label, field, type, placeholder, required }) => (
                <div key={field}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.45)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</label>
                  <input type={type} required={required} value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} style={{ ...inputStyle, width: '100%' }} placeholder={placeholder} />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.45)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Job *</label>
                <select required value={form.job_id} onChange={e => setForm({ ...form, job_id: e.target.value })} style={{ ...inputStyle, width: '100%' }}>
                  <option value="">Select a job...</option>
                  {jobs.map(job => <option key={job.id} value={job.id}>{job.title}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.45)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Cover Letter</label>
                <textarea value={form.cover_letter} onChange={e => setForm({ ...form, cover_letter: e.target.value })} rows={3} style={{ ...inputStyle, width: '100%', resize: 'vertical' }} placeholder="Tell us why you're a great fit..." />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.45)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Resume</label>
                <input type="file" accept=".pdf,.doc,.docx" onChange={e => setResume(e.target.files[0] || null)} style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '0.6rem 1.25rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'rgba(255,255,255,0.6)', cursor: 'none', fontSize: '0.85rem' }}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ padding: '0.6rem 1.25rem', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', border: 'none', borderRadius: '10px', color: 'white', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'none', fontSize: '0.85rem', opacity: submitting ? 0.6 : 1, boxShadow: '0 0 20px rgba(59,130,246,0.3)' }}>
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
