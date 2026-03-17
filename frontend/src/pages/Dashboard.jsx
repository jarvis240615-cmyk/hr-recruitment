import StatsCard from '../components/StatsCard';
import { mockJobs, mockCandidates, mockActivity, mockTimeToHire } from '../api/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const openJobs = mockJobs.filter((j) => j.status === 'open').length;
  const totalCandidates = mockCandidates.length;
  const inInterview = mockCandidates.filter((c) => c.stage === 'Interview').length;
  const avgScore = Math.round(
    mockCandidates.reduce((sum, c) => sum + c.aiScore, 0) / mockCandidates.length
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Open Jobs" value={openJobs} subtitle="Active positions" color="blue" />
        <StatsCard title="Total Candidates" value={totalCandidates} subtitle="All applications" color="green" />
        <StatsCard title="In Interview" value={inInterview} subtitle="Currently interviewing" color="purple" />
        <StatsCard title="Avg AI Score" value={avgScore} subtitle="Across all candidates" color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Time to Hire</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={mockTimeToHire}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="days" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {mockActivity.map((item) => (
              <div key={item.id} className="flex items-start gap-3 pb-3 border-b border-gray-50 last:border-0">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                  item.type === 'stage' ? 'bg-blue-500' :
                  item.type === 'application' ? 'bg-green-500' :
                  item.type === 'offer' ? 'bg-purple-500' :
                  item.type === 'interview' ? 'bg-orange-500' : 'bg-gray-400'
                }`} />
                <div>
                  <p className="text-sm text-gray-700">{item.text}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
