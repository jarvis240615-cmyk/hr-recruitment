import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { mockCandidates } from '../api/mockData';

const STYLE_ID = 'pipeline-styles';
const CSS = `
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
@keyframes gradUnder { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
@keyframes cardEnter3D { from { opacity:0; transform:translateZ(-30px) scale(0.95) } to { opacity:1; transform:translateZ(0) scale(1) } }
@keyframes particlePop { 0%{transform:scale(0) translate(var(--ptx),var(--pty));opacity:1} 100%{transform:scale(1.5) translate(calc(var(--ptx)*3),calc(var(--pty)*3));opacity:0} }
@keyframes dragGlow { 0%,100%{box-shadow:0 0 15px rgba(59,130,246,0.4)} 50%{box-shadow:0 0 35px rgba(59,130,246,0.8),0 0 60px rgba(139,92,246,0.4)} }
`;

const STAGE_COLORS = {
  Applied:   { accent: '#3b82f6', glow: 'rgba(59,130,246,0.25)' },
  Screened:  { accent: '#8b5cf6', glow: 'rgba(139,92,246,0.25)' },
  Interview: { accent: '#f59e0b', glow: 'rgba(245,158,11,0.25)' },
  Offer:     { accent: '#10b981', glow: 'rgba(16,185,129,0.25)' },
  Hired:     { accent: '#22c55e', glow: 'rgba(34,197,94,0.25)' },
};

/* ── Particle burst on drop ── */
function ParticleBurst({ x, y, color, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 700);
    return () => clearTimeout(t);
  }, [onDone]);

  const particles = Array.from({ length: 10 }, (_, i) => {
    const angle = (i / 10) * Math.PI * 2;
    const dist = 30 + Math.random() * 20;
    return { tx: Math.cos(angle) * dist, ty: Math.sin(angle) * dist };
  });

  return (
    <div style={{ position: 'fixed', left: x, top: y, pointerEvents: 'none', zIndex: 9999 }}>
      {particles.map((p, i) => (
        <div key={i} style={{
          position: 'absolute', width: '6px', height: '6px', borderRadius: '50%',
          background: color, left: '-3px', top: '-3px',
          '--ptx': `${p.tx}px`, '--pty': `${p.ty}px`,
          animation: `particlePop 0.6s ease-out ${i * 30}ms forwards`,
          boxShadow: `0 0 6px ${color}`,
        }} />
      ))}
    </div>
  );
}

function KanbanCardDark({ card, stage, stages, onMove, onClick, enterDelay = 0 }) {
  const sc = STAGE_COLORS[stage] || { accent: '#6b7280', glow: 'rgba(107,114,128,0.2)' };
  const score = card.ai_score ?? card.aiScore;
  const name = card.candidate_name || card.name;
  const jobTitle = card.job_title || card.jobTitle || '';
  const initials = name ? name.split(' ').map(p => p[0]).join('').slice(0,2).toUpperCase() : '??';
  const scoreColor = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : score > 0 ? '#ef4444' : '#6b7280';
  const [hov, setHov] = useState(false);
  const [dragging, setDragging] = useState(false);

  return (
    <div
      draggable
      onClick={onClick}
      onDragStart={e => { e.dataTransfer.setData('appId', card.id); setDragging(true); }}
      onDragEnd={() => setDragging(false)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: 'rgba(10,15,40,0.8)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${hov ? sc.accent + '44' : 'rgba(255,255,255,0.07)'}`,
        borderLeft: `3px solid ${sc.accent}`,
        borderRadius: '14px',
        padding: '0.85rem',
        cursor: 'none',
        marginBottom: '0.5rem',
        transformStyle: 'preserve-3d',
        transform: dragging
          ? `translateZ(20px) scale(1.04) rotate(1.5deg)`
          : hov
            ? `translateZ(8px) translateY(-3px)`
            : 'translateZ(0)',
        boxShadow: dragging
          ? `0 20px 50px ${sc.glow}, 0 0 30px ${sc.accent}55`
          : hov
            ? `0 8px 30px ${sc.glow}, 0 0 15px ${sc.accent}33`
            : 'none',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.2s',
        animation: `cardEnter3D 0.4s cubic-bezier(.22,1,.36,1) ${enterDelay}ms both`,
        opacity: dragging ? 0.7 : 1,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
        <div style={{
          width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
          background: `linear-gradient(135deg, ${sc.accent}44, ${sc.accent}22)`,
          border: `1px solid ${sc.accent}66`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.65rem', fontWeight: 700, color: sc.accent,
        }}>{initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</p>
          {jobTitle && <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: '1px' }}>{jobTitle}</p>}
        </div>
        {score > 0 && (
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: scoreColor, background: `${scoreColor}22`, padding: '2px 7px', borderRadius: '20px', border: `1px solid ${scoreColor}44`, flexShrink: 0 }}>{score}</span>
        )}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.5rem' }}>
        {stages.filter(s => s !== stage).map(s => {
          const stColor = (STAGE_COLORS[s] || { accent: '#6b7280' }).accent;
          return (
            <button key={s} onClick={e => { e.stopPropagation(); onMove(card.id, s); }}
              style={{ fontSize: '0.62rem', padding: '2px 8px', borderRadius: '20px', background: `${stColor}15`, border: `1px solid ${stColor}33`, color: stColor, cursor: 'none', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = `${stColor}30`}
              onMouseLeave={e => e.currentTarget.style.background = `${stColor}15`}
            >→ {s}</button>
          );
        })}
      </div>
    </div>
  );
}

export default function Pipeline() {
  const navigate = useNavigate();
  const [pipeline, setPipeline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dropBursts, setDropBursts] = useState([]);
  const [dragOver, setDragOver] = useState(null);
  const stages = ['Applied', 'Screened', 'Interview', 'Offer', 'Hired'];

  useEffect(() => {
    if (!document.getElementById(STYLE_ID)) {
      const s = document.createElement('style'); s.id = STYLE_ID; s.textContent = CSS; document.head.appendChild(s);
    }
    loadPipeline();
  }, []);

  const loadPipeline = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/applications/pipeline');
      setPipeline(res.data);
    } catch {
      const grouped = {};
      stages.forEach((s) => { grouped[s] = []; });
      mockCandidates.forEach((c) => {
        const stage = c.stage === 'Screening' ? 'Screened' : c.stage;
        if (grouped[stage]) grouped[stage].push(c);
      });
      setPipeline(grouped);
    } finally { setLoading(false); }
  };

  const moveCandidate = async (appId, newStage) => {
    try {
      await api.put(`/api/applications/${appId}/stage`, { stage: newStage });
      toast.success(`Moved to ${newStage}`);
      loadPipeline();
    } catch { toast.error('Failed to move candidate'); }
  };

  const handleDrop = (e, stage) => {
    e.preventDefault();
    setDragOver(null);
    const appId = Number(e.dataTransfer.getData('appId'));
    const sc = STAGE_COLORS[stage] || { accent: '#3b82f6' };
    const burst = { id: Date.now(), x: e.clientX, y: e.clientY, color: sc.accent };
    setDropBursts(prev => [...prev, burst]);
    moveCandidate(appId, stage);
  };

  return (
    <div style={{ color: 'rgba(255,255,255,0.9)', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Particle bursts */}
      {dropBursts.map(b => (
        <ParticleBurst key={b.id} x={b.x} y={b.y} color={b.color} onDone={() => setDropBursts(prev => prev.filter(p => p.id !== b.id))} />
      ))}

      <h1 style={{
        fontSize: '2rem', fontWeight: 900, marginBottom: '1.75rem',
        background: 'linear-gradient(135deg, #a78bfa 0%, #3b82f6 50%, #22d3ee 100%)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        letterSpacing: '-0.02em',
      }}>Pipeline</h1>

      <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem', alignItems: 'flex-start', perspective: '1200px' }}>
        {stages.map((stage) => {
          const sc = STAGE_COLORS[stage] || { accent: '#6b7280', glow: 'rgba(107,114,128,0.2)' };
          const cards = pipeline ? (pipeline[stage] || []) : [];
          const isDragOver = dragOver === stage;

          return (
            <div
              key={stage}
              onDragOver={(e) => { e.preventDefault(); setDragOver(stage); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(e) => handleDrop(e, stage)}
              style={{
                flexShrink: 0,
                width: '260px',
                background: isDragOver ? `rgba(${sc.accent === '#3b82f6' ? '59,130,246' : sc.accent === '#8b5cf6' ? '139,92,246' : sc.accent === '#f59e0b' ? '245,158,11' : sc.accent === '#10b981' ? '16,185,129' : '34,197,94'},0.12)` : 'rgba(10,15,40,0.5)',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${isDragOver ? sc.accent + '55' : 'rgba(255,255,255,0.07)'}`,
                borderTop: `3px solid ${sc.accent}`,
                borderRadius: '16px',
                padding: '1rem',
                minHeight: '300px',
                boxShadow: isDragOver ? `0 0 40px ${sc.glow}, 0 0 80px ${sc.glow}` : `0 0 30px ${sc.glow}40`,
                transition: 'all 0.25s ease',
              }}
            >
              {/* Column header with animated gradient underline */}
              <div style={{ marginBottom: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: sc.accent, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{stage}</h3>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, background: `${sc.accent}22`, color: sc.accent, padding: '2px 8px', borderRadius: '20px', border: `1px solid ${sc.accent}33` }}>
                    {loading ? '—' : cards.length}
                  </span>
                </div>
                {/* Animated gradient underline */}
                <div style={{
                  height: '2px', borderRadius: '1px',
                  background: `linear-gradient(90deg, ${sc.accent}, transparent, ${sc.accent})`,
                  backgroundSize: '200% 100%',
                  animation: 'gradUnder 2s ease infinite',
                  boxShadow: `0 0 8px ${sc.accent}66`,
                }} />
              </div>

              <div style={{ minHeight: '200px' }}>
                {loading ? (
                  [1,2,3].map(i => (
                    <div key={i} style={{ height: '70px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', marginBottom: '0.5rem', animation: 'pulse 1.5s ease-in-out infinite' }} />
                  ))
                ) : cards.length === 0 ? (
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', height: '120px',
                    fontSize: '0.8rem', color: isDragOver ? sc.accent : 'rgba(255,255,255,0.2)',
                    border: `1px dashed ${isDragOver ? sc.accent + '66' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '12px', transition: 'all 0.2s',
                  }}>
                    {isDragOver ? '⬇ Drop here' : 'No candidates'}
                  </div>
                ) : (
                  cards.map((card, ci) => (
                    <KanbanCardDark
                      key={card.id}
                      card={card}
                      stage={stage}
                      stages={stages}
                      enterDelay={ci * 60}
                      onMove={moveCandidate}
                      onClick={() => navigate(`/candidates/${card.candidate_id || card.id}`)}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
