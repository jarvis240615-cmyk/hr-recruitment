import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockCandidates } from '../api/mockData';
import ScoreBar from '../components/ScoreBar';
import ResumeViewer from '../components/ResumeViewer';
import EmailModal from '../components/EmailModal';
import SlotPicker from '../components/SlotPicker';

const STYLE_ID = 'cdetail-styles';
const CSS = `
@keyframes slideInLeft { from{opacity:0;transform:translateX(-30px)} to{opacity:1;transform:translateX(0)} }
@keyframes slideInRight { from{opacity:0;transform:translateX(30px)} to{opacity:1;transform:translateX(0)} }
@keyframes slideInDown { from{opacity:0;transform:translateY(-20px)} to{opacity:1;transform:translateY(0)} }
@keyframes slideInUp2 { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
@keyframes progressFill { from{width:0} to{width:var(--target-w)} }
@keyframes ringFill { from{stroke-dashoffset:var(--full)} to{stroke-dashoffset:var(--offset)} }
@keyframes gradBg { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
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

/* ── Animated circular score ring ── */
function ScoreRing({ score, color }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 300); return () => clearTimeout(t); }, []);
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    if (!mounted) return;
    let s = null;
    const tick = (now) => {
      if (!s) s = now;
      const p = Math.min((now - s) / 1500, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setDisplayed(Math.round(e * score));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [mounted, score]);

  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width="130" height="130" viewBox="0 0 130 130">
        {/* Outer glow ring */}
        <circle cx="65" cy="65" r={r + 8} fill="none" stroke={color + '15'} strokeWidth="16" />
        {/* Track */}
        <circle cx="65" cy="65" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10" strokeLinecap="round" />
        {/* Fill */}
        <circle
          cx="65" cy="65" r={r} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={mounted ? offset : circ}
          style={{
            transformOrigin: '65px 65px', transform: 'rotate(-90deg)',
            transition: 'stroke-dashoffset 1.5s cubic-bezier(.22,1,.36,1) 0.3s',
            filter: `drop-shadow(0 0 12px ${color}88)`,
          }}
        />
        <text x="65" y="60" textAnchor="middle" fill="white" fontSize="26" fontWeight="900">{displayed}</text>
        <text x="65" y="78" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10">AI SCORE</text>
      </svg>
      <div style={{ color, fontWeight: 700, fontSize: '0.85rem', marginTop: '-4px', textShadow: `0 0 15px ${color}88` }}>
        {score >= 70 ? '⭐ Excellent' : score >= 50 ? '✓ Good' : '⚠ Needs Work'}
      </div>
    </div>
  );
}

/* ── Animated skill progress bar ── */
function SkillBar({ skill, level = 75, color, delay = 0 }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), delay + 200); return () => clearTimeout(t); }, [delay]);

  return (
    <div style={{ marginBottom: '0.7rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{skill}</span>
        <span style={{ fontSize: '0.72rem', color, fontWeight: 700 }}>{level}%</span>
      </div>
      <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: '3px',
          width: mounted ? `${level}%` : '0%',
          background: `linear-gradient(90deg, ${color}aa, ${color})`,
          boxShadow: `0 0 10px ${color}66`,
          transition: `width 1s cubic-bezier(.22,1,.36,1) ${delay}ms`,
        }} />
      </div>
    </div>
  );
}

export default function CandidateDetail() {
  const { id } = useParams();
  const candidate = mockCandidates.find((c) => c.id === Number(id));
  const [showEmail, setShowEmail] = useState(false);
  const [showSlotPicker, setShowSlotPicker] = useState(false);
  const [scorecard, setScorecard] = useState({ technical: '', cultural: '', communication: '', notes: '' });
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    if (!document.getElementById(STYLE_ID)) {
      const s = document.createElement('style'); s.id = STYLE_ID; s.textContent = CSS; document.head.appendChild(s);
    }
  }, []);

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

  // Synthetic skill levels from aiScore
  const skills = (candidate.skills || []).map((skill, i) => ({
    skill,
    level: Math.max(40, Math.min(95, candidate.aiScore + ((i * 17 + 11) % 30) - 10)),
  }));

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
      {/* Breadcrumb – slides down */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.75rem', fontSize: '0.85rem', animation: 'slideInDown 0.4s ease both' }}>
        <Link to="/candidates" style={{ color: '#60a5fa', textDecoration: 'none' }}>Candidates</Link>
        <span style={{ color: 'rgba(255,255,255,0.25)' }}>/</span>
        <span style={{ color: 'rgba(255,255,255,0.6)' }}>{candidate.name}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left column – slides in from left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'slideInLeft 0.5s cubic-bezier(.22,1,.36,1) 0.1s both' }}>
          {/* Profile card */}
          <div style={{ ...glassCard, padding: '1.5rem' }}>
            {/* Glowing avatar */}
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 0.75rem',
                background: `linear-gradient(135deg, ${scoreColor}cc, #8b5cf6)`,
                backgroundSize: '200% 200%',
                animation: 'gradBg 3s ease infinite, float 3s ease-in-out infinite',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.6rem', fontWeight: 700, color: 'white',
                boxShadow: `0 0 30px ${scoreColor}66, 0 0 60px ${scoreColor}22`,
              }}>{initials}</div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'rgba(255,255,255,0.95)', marginBottom: '0.25rem' }}>{candidate.name}</h2>
              <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)' }}>{candidate.jobTitle}</p>
              <span style={{ display: 'inline-block', marginTop: '0.6rem', padding: '4px 12px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, background: `${sc}22`, color: sc, border: `1px solid ${sc}44` }}>{candidate.stage}</span>
            </div>

            {/* Score ring */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <ScoreRing score={candidate.aiScore} color={scoreColor} />
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
                  <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)', textAlign: 'right', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.value}</span>
                </div>
              ))}
            </div>

            {/* Skill progress bars */}
            {skills.length > 0 && (
              <div style={{ marginTop: '1.25rem' }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.85rem' }}>Skills</p>
                {skills.map((s, i) => (
                  <SkillBar key={s.skill} skill={s.skill} level={s.level} color={scoreColor} delay={i * 100} />
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.25rem' }}>
              <button onClick={() => setShowEmail(true)} style={{ flex: 1, padding: '0.6rem', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', border: 'none', borderRadius: '10px', color: 'white', fontWeight: 700, fontSize: '0.78rem', cursor: 'none', boxShadow: '0 0 15px rgba(59,130,246,0.3)' }}>✉ Email</button>
              <button onClick={() => setShowSlotPicker(true)} style={{ flex: 1, padding: '0.6rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'rgba(255,255,255,0.7)', fontSize: '0.78rem', cursor: 'none' }}>📅 Schedule</button>
            </div>

            {selectedSlot && (
              <div style={{ marginTop: '0.75rem', padding: '0.65rem', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '10px', fontSize: '0.78rem', color: '#4ade80' }}>
                Interview: {selectedSlot.date} at {selectedSlot.time}
              </div>
            )}
          </div>

          {/* AI Reasoning card – slides up */}
          <div style={{ ...glassCard, padding: '1.25rem', animation: 'slideInUp2 0.5s cubic-bezier(.22,1,.36,1) 0.3s both' }}>
            <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.85rem' }}>AI Analysis</h3>
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '0.75rem' }}>
              <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{candidate.aiReasoning}</p>
            </div>
          </div>
        </div>

        {/* Right column – slides in from right */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'slideInRight 0.5s cubic-bezier(.22,1,.36,1) 0.15s both' }}>
          {/* Resume */}
          <div style={{ ...glassCard, padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>Resume</h3>
            <ResumeViewer url={candidate.resumeUrl} />
          </div>

          {/* Scorecard – slides up with delay */}
          <div style={{ ...glassCard, padding: '1.5rem', animation: 'slideInUp2 0.5s cubic-bezier(.22,1,.36,1) 0.4s both' }}>
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
              <textarea value={scorecard.notes} onChange={e => setScorecard({ ...scorecard, notes: e.target.value })} rows={3} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'rgba(255,255,255,0.9)', padding: '0.6rem 0.85rem', fontSize: '0.85rem', outline: 'none', width: '100%', boxSizing: 'border-box', resize: 'vertical' }} placeholder="Additional notes about this candidate..." />
            </div>
            <button onClick={() => alert('Scorecard saved!')} style={{ padding: '0.65rem 1.5rem', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', border: 'none', borderRadius: '10px', color: 'white', fontWeight: 700, fontSize: '0.85rem', cursor: 'none', boxShadow: '0 0 20px rgba(59,130,246,0.3)' }}>
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
