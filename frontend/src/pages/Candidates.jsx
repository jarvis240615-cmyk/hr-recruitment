import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
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

  useEffect(() => {
    loadCandidates();
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
      <h1 className="text-2xl font-bold text-gray-900">Candidates</h1>

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
    </div>
  );
}
