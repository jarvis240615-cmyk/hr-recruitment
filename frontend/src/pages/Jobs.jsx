import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { mockJobs } from '../api/mockData';
import { SkeletonTableRows } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [form, setForm] = useState({ title: '', department: '', location: '', type: 'Full-time', salary: '', description: '', requirements: '' });
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

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
        await api.put(`/api/jobs/${editingJob.id}`, {
          title: form.title, department: form.department, location: form.location,
          description: form.description, requirements: form.requirements, salary_range: form.salary,
        });
        toast.success('Job updated successfully');
      } else {
        await api.post('/api/jobs', {
          title: form.title, department: form.department, location: form.location,
          description: form.description, requirements: form.requirements || 'See description', salary_range: form.salary,
        });
        toast.success('Job created successfully');
      }
      loadJobs();
    } catch {
      // Fallback to local state
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
      const res = await api.post('/api/jobs/generate-description', {
        title: form.title,
        department: form.department || 'General',
        requirements_brief: form.requirements,
      });
      setForm((f) => ({
        ...f,
        description: res.data.description || f.description,
        requirements: res.data.requirements || f.requirements,
      }));
      toast.success('AI description generated!');
    } catch {
      // Fallback to template
      setForm((f) => ({
        ...f,
        description: `We are seeking a talented ${f.title} to join our ${f.department || 'team'}. The ideal candidate will bring strong expertise and a collaborative mindset.\n\nResponsibilities:\n- Lead key initiatives within the ${f.department || 'team'}\n- Collaborate cross-functionally to deliver high-quality results\n- Mentor junior team members and drive best practices\n\nRequirements:\n- 3+ years of relevant experience\n- Strong communication and problem-solving skills\n- Track record of delivering results`,
      }));
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
        <button
          onClick={() => openForm()}
          aria-label="Create new job"
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
        >
          + New Job
        </button>
      </div>

      {!loading && jobs.length === 0 ? (
        <EmptyState
          icon="💼"
          title="No jobs yet"
          message="Create your first job posting to start receiving applications."
          actionLabel="+ New Job"
          onAction={() => openForm()}
        />
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Title</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Department</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Location</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Applicants</th>
                <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonTableRows rows={5} cols={6} />
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link to={`/jobs/${job.id}`} className="text-sm font-medium text-blue-600 hover:underline">
                        {job.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{job.department}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{job.location}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                        (job.is_active !== false && job.status !== 'closed') ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {job.is_active === false ? 'closed' : (job.status || 'open')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{job.application_count ?? job.applicants ?? 0}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => openForm(job)} aria-label={`Edit ${job.title}`} className="text-xs text-gray-500 hover:text-blue-600 mr-3">Edit</button>
                      <button onClick={() => handleDelete(job.id)} aria-label={`Delete ${job.title}`} className="text-xs text-gray-500 hover:text-red-600">Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">{editingJob ? 'Edit Job' : 'New Job'}</h2>
              <button onClick={() => setShowForm(false)} aria-label="Close form" className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label htmlFor="job-title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input id="job-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="job-dept" className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <input id="job-dept" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label htmlFor="job-location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input id="job-location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="job-type" className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select id="job-type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Contract</option>
                    <option>Internship</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="job-salary" className="block text-sm font-medium text-gray-700 mb-1">Salary</label>
                  <input id="job-salary" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="e.g. $100k-$130k" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="job-desc" className="block text-sm font-medium text-gray-700">Description</label>
                  <button
                    onClick={generateAIDescription}
                    disabled={aiLoading || !form.title}
                    aria-label="Generate description with AI"
                    className="text-xs text-blue-600 hover:text-blue-700 disabled:opacity-50 flex items-center gap-1"
                  >
                    {aiLoading ? (
                      <span role="status" aria-label="Generating">Generating...</span>
                    ) : (
                      'Generate with AI ✨'
                    )}
                  </button>
                </div>
                <textarea id="job-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={6} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label htmlFor="job-reqs" className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
                <textarea id="job-reqs" value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} rows={3} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Key requirements for this role..." />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
