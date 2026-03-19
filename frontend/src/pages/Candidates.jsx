import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { mockCandidates } from '../api/mockData';
import ScoreBar from '../components/ScoreBar';
import { SkeletonTableRows } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';

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

  useEffect(() => {
    loadCandidates();
    loadJobs();
  }, []);

  const loadCandidates = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/candidates');
      const data = res.data.items || res.data;
      const mapped = (Array.isArray(data) ? data : []).map((c) => ({
        id: c.id,
        name: c.full_name || c.name,
        email: c.email,
        jobTitle: c.applications?.[0]?.job_title || '',
        stage: c.applications?.[0]?.stage || 'Applied',
        aiScore: c.applications?.[0]?.ai_score || 0,
        appliedDate: c.applications?.[0]?.applied_at?.split('T')[0] || '',
        source: 'Website',
      }));
      setCandidates(mapped);
    } catch {
      setCandidates(mockCandidates);
    } finally {
      setLoading(false);
    }
  };

  const loadJobs = async () => {
    try {
      const res = await api.get('/api/jobs/public');
      setJobs(Array.isArray(res.data) ? res.data : []);
    } catch {
      // silently ignore
    }
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
      await api.post(`/api/applications/apply/${form.job_id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Application submitted successfully!');
      setShowModal(false);
      setForm({ full_name: '', email: '', phone: '', job_id: '', cover_letter: '' });
      setResume(null);
      loadCandidates();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = useMemo(() => {
    return candidates.filter((c) => {
      const name = c.name || c.full_name || '';
      const email = c.email || '';
      const jobTitle = c.jobTitle || '';
      const matchesSearch =
        name.toLowerCase().includes(search.toLowerCase()) ||
        email.toLowerCase().includes(search.toLowerCase()) ||
        jobTitle.toLowerCase().includes(search.toLowerCase());

      const score = c.aiScore || 0;
      const matchesScore =
        scoreFilter === 'all' ||
        (scoreFilter === 'high' && score >= 80) ||
        (scoreFilter === 'medium' && score >= 60 && score < 80) ||
        (scoreFilter === 'low' && score < 60);

      return matchesSearch && matchesScore;
    });
  }, [candidates, search, scoreFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Candidates</h1>
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">+ Add Candidate</button>
      </div>

      <div className="flex items-center gap-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search candidates..."
          aria-label="Search candidates"
          className="flex-1 max-w-sm border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <label htmlFor="score-filter" className="sr-only">Filter by score</label>
        <select
          id="score-filter"
          value={scoreFilter}
          onChange={(e) => setScoreFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">All Scores</option>
          <option value="high">High (80+)</option>
          <option value="medium">Medium (60-79)</option>
          <option value="low">Low (&lt;60)</option>
        </select>
      </div>

      {!loading && filtered.length === 0 && candidates.length === 0 ? (
        <EmptyState
          icon="👥"
          title="No candidates yet"
          message="Candidates will appear here once they apply to your job postings."
        />
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Name</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Job</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Stage</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">AI Score</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Source</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Applied</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonTableRows rows={5} cols={6} />
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                    No candidates match your filters
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link to={`/candidates/${c.id}`} className="text-sm font-medium text-blue-600 hover:underline">
                        {c.name}
                      </Link>
                      <p className="text-xs text-gray-400">{c.email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{c.jobTitle}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                        c.stage === 'Rejected' ? 'bg-red-50 text-red-700' :
                        c.stage === 'Offer' ? 'bg-purple-50 text-purple-700' :
                        c.stage === 'Interview' ? 'bg-orange-50 text-orange-700' :
                        'bg-blue-50 text-blue-700'
                      }`}>
                        {c.stage}
                      </span>
                    </td>
                    <td className="px-4 py-3 w-40">
                      <ScoreBar score={c.aiScore} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{c.source}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{c.appliedDate}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-white/20">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Add Candidate</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
              </div>
              <form onSubmit={handleApply} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job to Apply For <span className="text-red-500">*</span></label>
                  <select
                    required
                    value={form.job_id}
                    onChange={(e) => setForm({ ...form, job_id: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a job...</option>
                    {jobs.map((job) => (
                      <option key={job.id} value={job.id}>{job.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cover Letter</label>
                  <textarea
                    value={form.cover_letter}
                    onChange={(e) => setForm({ ...form, cover_letter: e.target.value })}
                    rows={3}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tell us why you're a great fit..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Resume</label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setResume(e.target.files[0] || null)}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
