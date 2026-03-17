import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { mockJobs } from '../api/mockData';

export default function Apply() {
  const { jobId } = useParams();
  const job = mockJobs.find((j) => j.id === Number(jobId));
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', coverLetter: '' });
  const [file, setFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    // In production, this would POST to the backend
    setSubmitted(true);
  };

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h1>
          <p className="text-sm text-gray-500">This position may no longer be available.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h1>
          <p className="text-sm text-gray-500">
            Thank you for applying for the <strong>{job.title}</strong> position.
            We'll review your application and get back to you soon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Apply for Position</h1>
          <p className="text-sm text-gray-500 mt-1">HR Recruit</p>
        </div>

        <div className="bg-white rounded-xl border p-5 mb-6">
          <h2 className="text-lg font-semibold text-gray-900">{job.title}</h2>
          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
            <span>{job.department}</span>
            <span>{job.location}</span>
            <span>{job.type}</span>
          </div>
          {job.salary && <p className="text-sm text-gray-600 mt-2">{job.salary}</p>}
          <p className="text-sm text-gray-600 mt-3 whitespace-pre-line">{job.description}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resume (PDF) *</label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full border rounded-lg px-3 py-2 text-sm file:mr-3 file:px-3 file:py-1 file:border-0 file:rounded-lg file:bg-blue-50 file:text-blue-600 file:text-sm"
              required
            />
            {file && <p className="text-xs text-gray-500 mt-1">Selected: {file.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cover Letter</label>
            <textarea
              value={form.coverLetter}
              onChange={(e) => setForm({ ...form, coverLetter: e.target.value })}
              rows={4}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="Tell us why you're a great fit for this role..."
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Submit Application
          </button>
        </form>
      </div>
    </div>
  );
}
