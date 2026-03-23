import { useParams, Link } from 'react-router-dom';
import { mockJobs, mockCandidates } from '../api/mockData';
import ScoreBar from '../components/ScoreBar';

const glassCard = {
  background: 'rgba(10,15,40,0.7)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '20px',
};

export default function JobDetail() {
  const { id } = useParams();
  const job = mockJobs.find((j) => j.id === Number(id));
  const applicants = mockCandidates.filter((c) => c.jobId === Number(id));

  if (!job) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '0.75rem' }}>Job not found</p>
        <Link to="/jobs" style={{ color: '#60a5fa', fontSize: '0.9rem', textDecoration: 'none' }}>← Back to Jobs</Link>
      </div>
    );
  }

  const isOpen = job.status === 'open';
  const stageColors = { Applied: '#3b82f6', Screened: '#8b5cf6', Interview: '#f59e0b', Offer: '#10b981', Hired: '#22c55e', Rejected: '#ef4444' };

  return (
    <div style={{ color: 'rgba(255,255,255,0.9)', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.75rem', fontSize: '0.85rem' }}>
        <Link to="/jobs" style={{ color: '#60a5fa', textDecoration: 'none' }}>Jobs</Link>
        <span style={{ color: 'rgba(255,255,255,0.25)' }}>/</span>
        <span style={{ color: 'rgba(255,255,255,0.6)' }}>{job.title}</span>
      </div>

      {/* Job header card */}
      <div style={{ ...glassCard, padding: '2rem', marginBottom: '1.5rem', boxShadow: '0 0 40px rgba(59,130,246,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{
              fontSize: '2rem', fontWeight: 900,
              background: 'linear-gradient(135deg, #a78bfa, #3b82f6)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em', marginBottom: '0.75rem',
            }}>{job.title}</h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {[
                { icon: '🏢', text: job.department },
                { icon: '📍', text: job.location },
                { icon: '⏰', text: job.type },
                { icon: '💰', text: job.salary },
              ].filter(x => x.text).map((item) => (
                <span key={item.text} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)', background: 'rgba(255,255,255,0.05)', padding: '0.3rem 0.75rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {item.icon} {item.text}
                </span>
              ))}
            </div>
          </div>
          <span style={{ padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, background: isOpen ? 'rgba(34,197,94,0.15)' : 'rgba(107,114,128,0.15)', color: isOpen ? '#4ade80' : '#9ca3af', border: `1px solid ${isOpen ? '#4ade8044' : '#9ca3af44'}` }}>
            {job.status}
          </span>
        </div>
        <div style={{ marginTop: '1.5rem', padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{job.description}</p>
        </div>
        <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', marginTop: '1rem' }}>Posted: {job.posted}</p>
      </div>

      {/* Applicants section */}
      <div>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'rgba(255,255,255,0.85)', marginBottom: '1rem' }}>
          Applicants <span style={{ color: '#60a5fa' }}>({applicants.length})</span>
        </h2>

        {applicants.length === 0 ? (
          <div style={{ ...glassCard, padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.35)' }}>
            No applicants yet
          </div>
        ) : (
          <div style={{ ...glassCard, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Name', 'Stage', 'AI Score', 'Applied', 'Source'].map((h) => (
                    <th key={h} style={{ padding: '0.9rem 1rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {applicants.sort((a, b) => b.aiScore - a.aiScore).map((c) => {
                  const sc = stageColors[c.stage] || '#6b7280';
                  return (
                    <tr key={c.id}
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '0.9rem 1rem' }}>
                        <Link to={`/candidates/${c.id}`} style={{ fontSize: '0.88rem', fontWeight: 600, color: '#60a5fa', textDecoration: 'none' }}>{c.name}</Link>
                      </td>
                      <td style={{ padding: '0.9rem 1rem' }}>
                        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, background: `${sc}22`, color: sc, border: `1px solid ${sc}44` }}>{c.stage}</span>
                      </td>
                      <td style={{ padding: '0.9rem 1rem', width: '180px' }}>
                        <ScoreBar score={c.aiScore} />
                      </td>
                      <td style={{ padding: '0.9rem 1rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>{c.appliedDate}</td>
                      <td style={{ padding: '0.9rem 1rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>{c.source}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
