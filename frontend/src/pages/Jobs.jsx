import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { mockJobs } from '../api/mockData';

const STYLE_ID = 'jobs-styles';
const CSS = `
@keyframes cardEnter { from { opacity:0; transform:translateY(30px) scale(0.96) } to { opacity:1; transform:translateY(0) scale(1) } }
@keyframes glowSweep { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
@keyframes fabPulse { 0%,100%{ box-shadow:0 0 20px rgba(59,130,246,0.5),0 0 40px rgba(59,130,246,0.2) } 50%{ box-shadow:0 0 30px rgba(59,130,246,0.8),0 0 60px rgba(139,92,246,0.4) } }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
`;

const glassCard = {
  background: 'rgba(10,15,40,0.7)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '20px',
};

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

function JobRow({ job, idx, onEdit, onDelete, onCopyLink }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hov, setHov] = useState(false);
  const rowRef = useRef(null);

  const handleMouseMove = (e) => {
    const rect = rowRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    setTilt({ x: ((e.clientY - cy) / (rect.height / 2)) * -3, y: ((e.clientX - cx) / (rect.width / 2)) * 3 });
  };

  const statusColor = (job.is_active === false || job.status === 'closed') ? '#9ca3af' : '#4ade80';
  const statusBg = (job.is_active === false || job.status === 'closed') ? 'rgba(107,114,128,0.15)' : 'rgba(34,197,94,0.12)';
  const statusLabel = job.is_active === false ? 'closed' : (job.status || 'open');

  return (
    <tr
      ref={rowRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); setTilt({ x: 0, y: 0 }); }}
      style={{
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        transform: hov ? `perspective(600px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` : 'none',
        transition: hov ? 'box-shadow 0.2s' : 'transform 0.4s ease, box-shadow 0.4s ease',
        background: hov ? 'rgba(59,130,246,0.05)' : 'transparent',
        boxShadow: hov ? '0 4px 30px rgba(59,130,246,0.1)' : 'none',
        animation: `cardEnter 0.5s cubic-bezier(.22,1,.36,1) ${idx * 80}ms both`,
        position: 'relative',
        cursor: 'none',
      }}
    >
      {/* Glow border overlay */}
      {hov && (
        <td colSpan={6} style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(90deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1), rgba(34,211,238,0.1))',
          backgroundSize: '200% 100%',
          animation: 'glowSweep 1.5s ease infinite',
          borderRadius: '4px',
          zIndex: 0,
        }} />
      )}
      <td style={{ padding: '0.9rem 1rem', position: 'relative', zIndex: 1 }}>
        <Link to={`/jobs/${job.id}`} style={{ fontSize: '0.88rem', fontWeight: 600, color: '#60a5fa', textDecoration: 'none', transition: 'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color = '#93c5fd'}
          onMouseLeave={e => e.currentTarget.style.color = '#60a5fa'}
        >{job.title}</Link>
      </td>
      <td style={{ padding: '0.9rem 1rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)', position: 'relative', zIndex: 1 }}>{job.department}</td>
      <td style={{ padding: '0.9rem 1rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)', position: 'relative', zIndex: 1 }}>{job.location}</td>
      <td style={{ padding: '0.9rem 1rem', position: 'relative', zIndex: 1 }}>
        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, background: statusBg, color: statusColor, border: `1px solid ${statusColor}44` }}>
          {statusLabel}
        </span>
      </td>
      <td style={{ padding: '0.9rem 1rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)', position: 'relative', zIndex: 1 }}>{job.application_count ?? job.applicants ?? 0}</td>
      <td style={{ padding: '0.9rem 1rem', textAlign: 'right', position: 'relative', zIndex: 1 }}>
        <button onClick={() => onCopyLink(job.id)} style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'none', marginRight: '0.75rem', transition: 'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color = '#60a5fa'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
        >Copy Link</button>
        <button onClick={() => onEdit(job)} style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'none', marginRight: '0.75rem', transition: 'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color = '#60a5fa'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
        >Edit</button>
        <button onClick={() => onDelete(job.id)} style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'none', transition: 'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
        >Delete</button>
      </td>
    </tr>
  );
}

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [form, setForm] = useState({ title: '', department: '', location: '', type: 'Full-time', salary: '', description: '', requirements: '' });
  const [aiLoading, setAiLoading] = useState(false);
  const [fabHov, setFabHov] = useState(false);

  useEffect(() => {
    if (!document.getElementById(STYLE_ID)) {
      const s = document.createElement('style'); s.id = STYLE_ID; s.textContent = CSS; document.head.appendChild(s);
    }
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/jobs');
      const data = res.data.items || res.data;
      setJobs(Array.isArray(data) ? data : []);
    } catch { setJobs(mockJobs); } finally { setLoading(false); }
  };

  const openForm = (job = null) => {
    if (job) {
      setEditingJob(job);
      setForm({ title: job.title, department: job.department, location: job.location, type: job.type || 'Full-time', salary: job.salary_range || job.salary || '', description: job.description, requirements: job.requirements || '' });
    } else {
      setEditingJob(null);
      setForm({ title: '', department: '', location: '', type: 'Full-time', salary: '', description: '', requirements: '' });
    }
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      if (editingJob) {
        await api.put(`/api/jobs/${editingJob.id}`, { title: form.title, department: form.department, location: form.location, description: form.description, requirements: form.requirements, salary_range: form.salary });
        toast.success('Job updated successfully');
      } else {
        await api.post('/api/jobs', { title: form.title, department: form.department, location: form.location, description: form.description, requirements: form.requirements || 'See description', salary_range: form.salary });
        toast.success('Job created successfully');
      }
      loadJobs();
    } catch {
      if (editingJob) {
        setJobs(jobs.map((j) => (j.id === editingJob.id ? { ...j, ...form } : j)));
      } else {
        setJobs([...jobs, { ...form, id: Date.now(), status: 'open', applicants: 0, posted: new Date().toISOString().split('T')[0] }]);
      }
    }
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/jobs/${id}`);
      toast.success('Job deleted');
      loadJobs();
    } catch { setJobs(jobs.filter((j) => j.id !== id)); }
  };

  const handleCopyLink = (jobId) => {
    navigator.clipboard.writeText(`${window.location.origin}/apply/${jobId}`);
    toast.success('Apply link copied!');
  };

  const generateAIDescription = async () => {
    if (!form.title) return;
    setAiLoading(true);
    try {
      const res = await api.post('/api/jobs/generate-description', { title: form.title, department: form.department || 'General', requirements_brief: form.requirements });
      setForm((f) => ({ ...f, description: res.data.description || f.description, requirements: res.data.requirements || f.requirements }));
      toast.success('AI description generated!');
    } catch {
      setForm((f) => ({ ...f, description: `We are seeking a talented ${f.title} to join our ${f.department || 'team'}. The ideal candidate will bring strong expertise and a collaborative mindset.\n\nResponsibilities:\n- Lead key initiatives within the ${f.department || 'team'}\n- Collaborate cross-functionally\n- Mentor junior team members\n\nRequirements:\n- 3+ years of relevant experience\n- Strong communication and problem-solving skills` }));
    } finally { setAiLoading(false); }
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
        }}>Jobs</h1>
      </div>

      {!loading && jobs.length === 0 ? (
        <div style={{ ...glassCard, padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💼</div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'rgba(255,255,255,0.8)', marginBottom: '0.5rem' }}>No jobs yet</h3>
          <p style={{ fontSize: '0.85rem', marginBottom: '1.5rem' }}>Create your first job posting to start receiving applications.</p>
          <button onClick={() => openForm()} style={{ padding: '0.65rem 1.25rem', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', border: 'none', borderRadius: '12px', color: 'white', fontWeight: 700, fontSize: '0.85rem', cursor: 'none' }}>+ New Job</button>
        </div>
      ) : (
        <div style={{ ...glassCard, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Title', 'Department', 'Location', 'Status', 'Applicants', 'Actions'].map((h, i) => (
                  <th key={h} style={{ padding: '1rem', textAlign: i === 5 ? 'right' : 'left', fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    {[1,2,3,4,5,6].map(j => (
                      <td key={j} style={{ padding: '1rem' }}>
                        <div style={{ height: '16px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                jobs.map((job, idx) => (
                  <JobRow key={job.id} job={job} idx={idx} onEdit={openForm} onDelete={handleDelete} onCopyLink={handleCopyLink} />
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => openForm()}
        onMouseEnter={() => setFabHov(true)}
        onMouseLeave={() => setFabHov(false)}
        style={{
          position: 'fixed', bottom: '2rem', right: '2rem',
          width: '56px', height: '56px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          border: 'none', color: 'white', fontSize: '1.5rem',
          cursor: 'none', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fabPulse 2.5s ease-in-out infinite',
          transform: fabHov ? 'scale(1.15) rotate(45deg)' : 'scale(1) rotate(0deg)',
          transition: 'transform 0.3s cubic-bezier(.22,1,.36,1)',
        }}
        title="New Job"
      >+</button>

      {/* Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
          <div style={{ ...glassCard, width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 80px rgba(0,0,0,0.6), 0 0 40px rgba(59,130,246,0.1)', animation: 'cardEnter 0.3s ease both' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>{editingJob ? 'Edit Job' : 'New Job'}</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '1.5rem', cursor: 'none', lineHeight: 1 }}>&times;</button>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.45)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Title</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.45)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Department</label>
                  <input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.45)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Location</label>
                  <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.45)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Type</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={{ ...inputStyle }}>
                    <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.45)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Salary</label>
                  <input value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} style={inputStyle} placeholder="e.g. $100k-$130k" />
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Description</label>
                  <button onClick={generateAIDescription} disabled={aiLoading || !form.title} style={{ fontSize: '0.75rem', color: '#60a5fa', background: 'none', border: 'none', cursor: 'none', opacity: aiLoading || !form.title ? 0.4 : 1 }}>
                    {aiLoading ? 'Generating...' : '✨ Generate with AI'}
                  </button>
                </div>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={6} style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.45)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Requirements</label>
                <textarea value={form.requirements} onChange={e => setForm({ ...form, requirements: e.target.value })} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Key requirements for this role..." />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', padding: '1.25rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button onClick={() => setShowForm(false)} style={{ padding: '0.6rem 1.25rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'rgba(255,255,255,0.6)', cursor: 'none', fontSize: '0.85rem' }}>Cancel</button>
              <button onClick={handleSave} style={{ padding: '0.6rem 1.25rem', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', border: 'none', borderRadius: '10px', color: 'white', fontWeight: 700, cursor: 'none', fontSize: '0.85rem', boxShadow: '0 0 20px rgba(59,130,246,0.3)' }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
