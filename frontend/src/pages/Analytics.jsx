import { mockFunnelData, mockTimeToHire, mockSourceData } from '../api/mockData';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  FunnelChart, Funnel, LabelList, Cell,
  PieChart, Pie,
} from 'recharts';

const FUNNEL_COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#c084fc'];
const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Analytics() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recruitment Funnel */}
        <div className="bg-white rounded-xl border p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recruitment Funnel</h2>
          <ResponsiveContainer width="100%" height={300}>
            <FunnelChart>
              <Tooltip />
              <Funnel dataKey="count" data={mockFunnelData} isAnimationActive>
                <LabelList position="right" fill="#374151" stroke="none" dataKey="stage" fontSize={12} />
                <LabelList position="center" fill="#fff" stroke="none" dataKey="count" fontSize={14} fontWeight="bold" />
                {mockFunnelData.map((_, i) => (
                  <Cell key={i} fill={FUNNEL_COLORS[i]} />
                ))}
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </div>

        {/* Avg Time to Hire per Stage */}
        <div className="bg-white rounded-xl border p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Avg Time to Hire (Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockTimeToHire}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="days" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Source Breakdown */}
        <div className="bg-white rounded-xl border p-5 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Source Breakdown</h2>
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockSourceData}
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  dataKey="count"
                  nameKey="source"
                  label={({ source, percent }) => `${source} (${(percent * 100).toFixed(0)}%)`}
                  labelLine
                >
                  {mockSourceData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
