import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { mockCandidates } from '../api/mockData';

const STAGE_COLORS = {
  Applied:   { accent: '#3b82f6', glow: 'rgba(59,130,246,0.25)' },
  Screened:  { accent: '#8b5cf6', glow: 'rgba(139,92,246,0.25)' },
  Interview: { accent: '#f59e0b', glow: 'rgba(245,158,11,0.25)' },
  Offer:     { accent: '#10b981', glow: 'rgba(16,185,129,0.25)' },
  Hired:     { accent: '#22c55e', glow: 'rgba(34,197,94,0.25)' },
};

function KanbanCardDark({ card, stage, stages, onMove, onClick }) {
  const sc = STAGE_COLORS[stage] || { accent: '#6b7280', glow: 'rgba(107,114,128,0.2)' };
  const score = card.ai_score ?? card.aiScore;
  const name = card.candidate_name || card.name;
  const jobTitle = card.job_title || card.jobTitle || '';
  const initials = name ? name.split(' ').map(p => p[0]).join('').slice(0,2).toUpperCase() : '??';
  const scoreColor = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : score > 0 ? '#ef4444' : '#6b7280';

  return (
    <div
      draggable
      onClick={onClick}
      style={{
        background: 'rgba(10,15,40,0.8)',
        backdropFilter: 'blur(20px)',
        border: `1px solid rgba(255,255,255,0.07)`,
        borderLeft: `3px solid ${sc.accent}`,
        borderRadius: '14px',
        padding: '0.85rem',
        cursor: 'pointer',
        transition: 'all 0.3s',
        marginBottom: '0.5rem',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 8px 30px ${sc.glow}`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
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
              style={{ fontSize: '0.62rem', padding: '2px 8px', borderRadius: '20px', background: `${stColor}15`, border: `1px solid ${stColor}33`, color: stColor, cursor: 'pointer', transition: 'all 0.2s' }}
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
  const stages = ['Applied', 'Screened', 'Interview', 'Offer', 'Hired'];

  useEffect(() => { loadPipeline(); }, []);

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
    } finally {
      setLoading(false);
    }
  };

  const moveCandidate = async (appId, newStage) => {
    try {
      await api.put(`/api/applications/${appId}/stage`, { stage: newStage });
      toast.success(`Moved to ${newStage}`);
      loadPipeline();
    } catch {
      toast.error('Failed to move candidate');
    }
  };

  const handleDrop = (e, stage) => {
    e.preventDefault();
    const appId = Number(e.dataTransfer.getData('appId'));
    moveCandidate(appId, stage);
  };

  return (
    <div style={{ color: 'rgba(255,255,255,0.9)', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <h1 style={{
        fontSize: '2rem', fontWeight: 900, marginBottom: '1.75rem',
        background: 'linear-gradient(135deg, #a78bfa 0%, #3b82f6 50%, #22d3ee 100%)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        letterSpacing: '-0.02em',
      }}>Pipeline</h1>

      <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem', alignItems: 'flex-start' }}>
        {stages.map((stage) => {
          const sc = STAGE_COLORS[stage] || { accent: '#6b7280', glow: 'rgba(107,114,128,0.2)' };
          const cards = pipeline ? (pipeline[stage] || []) : [];

          return (
            <div
              key={stage}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, stage)}
              style={{
                flexShrink: 0,
                width: '260px',
                background: 'rgba(10,15,40,0.5)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderTop: `3px solid ${sc.accent}`,
                borderRadius: '16px',
                padding: '1rem',
                minHeight: '300px',
                boxShadow: `0 0 30px ${sc.glow}40`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: sc.accent, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{stage}</h3>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, background: `${sc.accent}22`, color: sc.accent, padding: '2px 8px', borderRadius: '20px', border: `1px solid ${sc.accent}33` }}>
                  {loading ? '—' : cards.length}
                </span>
              </div>

              <div style={{ minHeight: '200px' }}>
                {loading ? (
                  [1,2,3].map(i => (
                    <div key={i} style={{ height: '70px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', marginBottom: '0.5rem', animation: 'pulse 1.5s ease-in-out infinite' }} />
                  ))
                ) : cards.length === 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '120px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.2)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                    No candidates
                  </div>
                ) : (
                  cards.map((card) => (
                    <KanbanCardDark
                      key={card.id}
                      card={card}
                      stage={stage}
                      stages={stages}
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
