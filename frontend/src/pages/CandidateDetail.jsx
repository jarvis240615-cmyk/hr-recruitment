import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockCandidates } from '../api/mockData';
import ScoreBar from '../components/ScoreBar';
import ResumeViewer from '../components/ResumeViewer';
import EmailModal from '../components/EmailModal';
import SlotPicker from '../components/SlotPicker';

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

export default function CandidateDetail() {
  const { id } = useParams();
  const candidate = mockCandidates.find((c) => c.id === Number(id));
  const [showEmail, setShowEmail] = useState(false);
  const [showSlotPicker, setShowSlotPicker] = useState(false);
  const [scorecard, setScorecard] = useState({ technical: '', cultural: '', communication: '', notes: '' });
  const [selectedSlot, setSelectedSlot] = useState(null);

  if (!candidate) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '0.75rem' }}>Candidate not found</p>
        <Link to="/candidates" style={{ color: '#60a5fa', fontSize: '0.9rem', textDecoration: 'none' }}>← Back to Candidates</Link>
      </div>
    );
  }

  const sc = STAGE_COLORS[candidate.stage] || '#6b7280';
  const initials = candidate.name ? candidate.name.split(' ').map(p => p[0]).join('').slice(0,2).toUpperCase() : '??';
  const scoreColor = candidate.aiScore >= 80 ? '#22c55e' : candidate.aiScore >= 60 ? '#f59e0b' : '#ef4444';

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
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.75rem', fontSize: '0.85rem' }}>
        <Link to="/candidates" style={{ color: '#60a5fa', textDecoration: 'none' }}>Candidates</Link>
        <span style={{ color: 'rgba(255,255,255,0.25)' }}>/</span>
        <span style={{ color: 'rgba(255,255,255,0.6)' }}>{candidate.name}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Profile card */}
          <div style={{ ...glassCard, padding: '1.5rem' }}>
            {/* Avatar */}
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%', margin: '0 auto 0.75rem',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', fontWeight: 700, color: 'white',
                boxShadow: '0 0 30px rgba(59,130,246,0.4)',
              }}>{initials}</div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'rgba(255,255,255,0.95)', marginBottom: '0.25rem' }}>{candidate.name}</h2>
              <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)' }}>{candidate.jobTitle}</p>
              <span style={{ display: 'inline-block', marginTop: '0.6rem', padding: '4px 12px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, background: `${sc}22`, color: sc, border: `1px solid ${sc}44` }}>{candidate.stage}</span>
            </div>

            {/* Info rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {[
                { label: 'Email', value: candidate.email },
                { label: 'Phone', value: candidate.phone },
                { label: 'Source', value: candidate.source },
                { label: 'Applied', value: candidate.appliedDate },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.label}</span>
                  <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)', textAlign: 'right', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.value}</span>
                </div>
              ))}
            </div>

            {/* Skills */}
            <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {candidate.skills?.map(skill => (
                <span key={skill} style={{ fontSize: '0.7rem', padding: '3px 9px', borderRadius: '20px', background: 'rgba(59,130,246,0.12)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.2)' }}>{skill}</span>
              ))}
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.25rem' }}>
              <button onClick={() => setShowEmail(true)} style={{ flex: 1, padding: '0.6rem', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', border: 'none', borderRadius: '10px', color: 'white', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', boxShadow: '0 0 15px rgba(59,130,246,0.3)' }}>✉ Email</button>
              <button onClick={() => setShowSlotPicker(true)} style={{ flex: 1, padding: '0.6rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'rgba(255,255,255,0.7)', fontSize: '0.78rem', cursor: 'pointer' }}>📅 Schedule</button>
            </div>

            {selectedSlot && (
              <div style={{ marginTop: '0.75rem', padding: '0.65rem', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '10px', fontSize: '0.78rem', color: '#4ade80' }}>
                Interview: {selectedSlot.date} at {selectedSlot.time}
              </div>
            )}
          </div>

          {/* AI Score card */}
          <div style={{ ...glassCard, padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.85rem' }}>AI Score</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: scoreColor, lineHeight: 1, textShadow: `0 0 20px ${scoreColor}66` }}>{candidate.aiScore}</div>
              <ScoreBar score={candidate.aiScore} />
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '0.75rem' }}>
              <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{candidate.aiReasoning}</p>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Resume */}
          <div style={{ ...glassCard, padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>Resume</h3>
            <ResumeViewer url={candidate.resumeUrl} />
          </div>

          {/* Scorecard */}
          <div style={{ ...glassCard, padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.25rem' }}>Evaluation Scorecard</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
              {['technical', 'cultural', 'communication'].map(field => (
                <div key={field}>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: '0.4rem', textTransform: 'capitalize' }}>{field} Fit</label>
                  <select value={scorecard[field]} onChange={e => setScorecard({ ...scorecard, [field]: e.target.value })} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'rgba(255,255,255,0.9)', padding: '0.5rem', fontSize: '0.83rem', outline: 'none', width: '100%' }}>
                    <option value="">Select...</option>
                    <option value="5">5 - Excellent</option>
                    <option value="4">4 - Good</option>
                    <option value="3">3 - Average</option>
                    <option value="2">2 - Below Avg</option>
                    <option value="1">1 - Poor</option>
                  </select>
                </div>
              ))}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Notes</label>
              <textarea value={scorecard.notes} onChange={e => setScorecard({ ...scorecard, notes: e.target.value })} rows={3} style={{ ...{background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'rgba(255,255,255,0.9)', padding: '0.6rem 0.85rem', fontSize: '0.85rem', outline: 'none', width: '100%', boxSizing: 'border-box', resize: 'vertical'} }} placeholder="Additional notes about this candidate..." />
            </div>
            <button onClick={() => alert('Scorecard saved!')} style={{ padding: '0.65rem 1.5rem', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', border: 'none', borderRadius: '10px', color: 'white', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 0 20px rgba(59,130,246,0.3)' }}>
              Save Scorecard
            </button>
          </div>
        </div>
      </div>

      {showEmail && <EmailModal candidate={candidate} onClose={() => setShowEmail(false)} />}
      {showSlotPicker && <SlotPicker onSelect={slot => setSelectedSlot(slot)} onClose={() => setShowSlotPicker(false)} />}
    </div>
  );
}
