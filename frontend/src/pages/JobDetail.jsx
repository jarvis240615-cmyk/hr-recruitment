import { useParams, Link } from 'react-router-dom';
import { mockJobs, mockCandidates } from '../api/mockData';
import ScoreBar from '../components/ScoreBar';

export default function JobDetail() {
  const { id } = useParams();
  const job = mockJobs.find((j) => j.id === Number(id));
  const applicants = mockCandidates.filter((c) => c.jobId === Number(id));

  if (!job) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Job not found</p>
        <Link to="/jobs" className="text-blue-600 text-sm mt-2 inline-block">Back to Jobs</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/jobs" className="hover:text-blue-600">Jobs</Link>
        <span>/</span>
        <span className="text-gray-900">{job.title}</span>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span>{job.department}</span>
              <span>{job.location}</span>
              <span>{job.type}</span>
              <span>{job.salary}</span>
            </div>
          </div>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${
            job.status === 'open' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
          }`}>
            {job.status}
          </span>
        </div>
        <p className="mt-4 text-sm text-gray-600 whitespace-pre-line">{job.description}</p>
        <div className="mt-4 text-xs text-gray-400">Posted: {job.posted}</div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Applicants ({applicants.length})
        </h2>
        {applicants.length === 0 ? (
          <div className="bg-white rounded-xl border p-8 text-center text-sm text-gray-500">
            No applicants yet
          </div>
        ) : (
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Name</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Stage</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">AI Score</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Applied</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Source</th>
                </tr>
              </thead>
              <tbody>
                {applicants
                  .sort((a, b) => b.aiScore - a.aiScore)
                  .map((c) => (
                    <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Link to={`/candidates/${c.id}`} className="text-sm font-medium text-blue-600 hover:underline">
                          {c.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-blue-50 text-blue-700">
                          {c.stage}
                        </span>
                      </td>
                      <td className="px-4 py-3 w-48">
                        <ScoreBar score={c.aiScore} />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{c.appliedDate}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{c.source}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
