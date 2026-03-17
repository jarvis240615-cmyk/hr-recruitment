import { useState } from 'react';
import { Link } from 'react-router-dom';
import { mockJobs } from '../api/mockData';

export default function Jobs() {
  const [jobs, setJobs] = useState(mockJobs);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [form, setForm] = useState({ title: '', department: '', location: '', type: 'Full-time', salary: '', description: '' });
  const [aiLoading, setAiLoading] = useState(false);

  const openForm = (job = null) => {
    if (job) {
      setEditingJob(job);
      setForm({ title: job.title, department: job.department, location: job.location, type: job.type, salary: job.salary, description: job.description });
    } else {
      setEditingJob(null);
      setForm({ title: '', department: '', location: '', type: 'Full-time', salary: '', description: '' });
    }
    setShowForm(true);
  };

  const handleSave = () => {
    if (editingJob) {
      setJobs(jobs.map((j) => (j.id === editingJob.id ? { ...j, ...form } : j)));
    } else {
      setJobs([...jobs, { ...form, id: Date.now(), status: 'open', applicants: 0, posted: new Date().toISOString().split('T')[0] }]);
    }
    setShowForm(false);
  };

  const handleDelete = (id) => {
    setJobs(jobs.filter((j) => j.id !== id));
  };

  const generateAIDescription = () => {
    if (!form.title) return;
    setAiLoading(true);
    setTimeout(() => {
      setForm((f) => ({
        ...f,
        description: `We are seeking a talented ${f.title} to join our ${f.department || 'team'}${f.location ? ` in ${f.location}` : ''}. The ideal candidate will bring strong expertise and a collaborative mindset. This ${f.type || 'full-time'} role offers competitive compensation${f.salary ? ` (${f.salary})` : ''} and the opportunity to make a significant impact.\n\nResponsibilities:\n- Lead key initiatives within the ${f.department || 'team'}\n- Collaborate cross-functionally to deliver high-quality results\n- Mentor junior team members and drive best practices\n\nRequirements:\n- 3+ years of relevant experience\n- Strong communication and problem-solving skills\n- Track record of delivering results in a fast-paced environment`,
      }));
      setAiLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
        <button
          onClick={() => openForm()}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
        >
          + New Job
        </button>
      </div>

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
            {jobs.map((job) => (
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
                    job.status === 'open' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {job.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{job.applicants}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openForm(job)} className="text-xs text-gray-500 hover:text-blue-600 mr-3">Edit</button>
                  <button onClick={() => handleDelete(job.id)} className="text-xs text-gray-500 hover:text-red-600">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">{editingJob ? 'Edit Job' : 'New Job'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Contract</option>
                    <option>Internship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salary</label>
                  <input value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="e.g. $100k-$130k" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <button
                    onClick={generateAIDescription}
                    disabled={aiLoading || !form.title}
                    className="text-xs text-blue-600 hover:text-blue-700 disabled:opacity-50"
                  >
                    {aiLoading ? 'Generating...' : '✨ AI Generate'}
                  </button>
                </div>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={6} className="w-full border rounded-lg px-3 py-2 text-sm" />
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
