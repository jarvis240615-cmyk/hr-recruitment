import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { mockJobs } from '../api/mockData';
import EmptyState from '../components/EmptyState';

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

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [form, setForm] = useState({ title: '', department: '', location: '', type: 'Full-time', salary: '', description: '', requirements: '' });
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => { loadJobs(); }, []);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/jobs');
      const data = res.data.items || res.data;
      setJobs(Array.isArray(data) ? data : []);
    } catch {
      setJobs(mockJobs);
    } finally {
      setLoading(false);
    }
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
    } catch {
      setJobs(jobs.filter((j) => j.id !== id));
    }
  };

  const generateAIDescription = async () => {
    if (!form.title) return;
    setAiLoading(true);
    try {
      const res = await api.post('/api/jobs/generate-description', { title: form.title, department: form.department || 'General', requirements_brief: form.requirements });
      setForm((f) => ({ ...f, description: res.data.description || f.description, requirements: res.data.requirements || f.requirements }));
      toast.success('AI description generated!');
    } catch {
      setForm((f) => ({ ...f, description: `We are seeking a talented ${f.title} to join our ${f.department || 'team'}. The ideal candidate will bring strong expertise and a collaborative mindset.\n\nResponsibilities:\n- Lead key initiatives within the ${f.department || 'team'}\n- Collaborate cross-functionally to deliver high-quality results\n- Mentor junior team members\n\nRequirements:\n- 3+ years of relevant experience\n- Strong communication and problem-solving skills` }));
    } finally {
      setAiLoading(false);
    }
  };

  const statusColor = (job) => (job.is_active === false || job.status === 'closed') ? 'rgba(107,114,128,0.2)' : 'rgba(34,197,94,0.15)';
  const statusText = (job) => (job.is_active === false || job.status === 'closed') ? '#9ca3af' : '#4ade80';
  const statusLabel = (job) => job.is_active === false ? 'closed' : (job.status || 'open');

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
        <button
          onClick={() => openForm()}
          style={{
            padding: '0.65rem 1.25rem',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            border: 'none', borderRadius: '12px',
            color: 'white', fontWeight: 700, fontSize: '0.85rem',
            cursor: 'pointer', transition: 'all 0.3s',
            boxShadow: '0 0 20px rgba(59,130,246,0.3)',
          }}
        >+ New Job</button>
      </div>

      {!loading && jobs.length === 0 ? (
        <div style={{ ...glassCard, padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💼</div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'rgba(255,255,255,0.8)', marginBottom: '0.5rem' }}>No jobs yet</h3>
          <p style={{ fontSize: '0.85rem', marginBottom: '1.5rem' }}>Create your first job posting to start receiving applications.</p>
          <button onClick={() => openForm()} style={{ padding: '0.65rem 1.25rem', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', border: 'none', borderRadius: '12px', color: 'white', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>+ New Job</button>
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
                  <tr key={job.id} style={{
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    transition: 'background 0.2s',
                    cursor: 'default',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '0.9rem 1rem' }}>
                      <Link to={`/jobs/${job.id}`} style={{ fontSize: '0.88rem', fontWeight: 600, color: '#60a5fa', textDecoration: 'none' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#93c5fd'}
                        onMouseLeave={e => e.currentTarget.style.color = '#60a5fa'}
                      >{job.title}</Link>
                    </td>
                    <td style={{ padding: '0.9rem 1rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)' }}>{job.department}</td>
                    <td style={{ padding: '0.9rem 1rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)' }}>{job.location}</td>
                    <td style={{ padding: '0.9rem 1rem' }}>
                      <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, background: statusColor(job), color: statusText(job), border: `1px solid ${statusText(job)}44` }}>
                        {statusLabel(job)}
                      </span>
                    </td>
                    <td style={{ padding: '0.9rem 1rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)' }}>{job.application_count ?? job.applicants ?? 0}</td>
                    <td style={{ padding: '0.9rem 1rem', textAlign: 'right' }}>
                      <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/apply/${job.id}`); toast.success('Apply link copied!'); }} style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', marginRight: '0.75rem' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#60a5fa'}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                      >Copy Link</button>
                      <button onClick={() => openForm(job)} style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', marginRight: '0.75rem' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#60a5fa'}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                      >Edit</button>
                      <button onClick={() => handleDelete(job.id)} style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                      >Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
          <div style={{ ...glassCard, width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 80px rgba(0,0,0,0.6), 0 0 40px rgba(59,130,246,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>{editingJob ? 'Edit Job' : 'New Job'}</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1 }}>&times;</button>
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
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={{ ...inputStyle, width: 'auto', width: '100%' }}>
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
                  <button onClick={generateAIDescription} disabled={aiLoading || !form.title} style={{ fontSize: '0.75rem', color: '#60a5fa', background: 'none', border: 'none', cursor: 'pointer', opacity: aiLoading || !form.title ? 0.4 : 1 }}>
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
              <button onClick={() => setShowForm(false)} style={{ padding: '0.6rem 1.25rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '0.85rem' }}>Cancel</button>
              <button onClick={handleSave} style={{ padding: '0.6rem 1.25rem', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', border: 'none', borderRadius: '10px', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', boxShadow: '0 0 20px rgba(59,130,246,0.3)' }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
