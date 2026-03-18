import { useState, useEffect } from 'react';
import api from '../api/axios';
import { mockFunnelData, mockTimeToHire, mockSourceData } from '../api/mockData';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  FunnelChart, Funnel, LabelList, Cell,
  PieChart, Pie,
} from 'recharts';

const FUNNEL_COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#c084fc'];
const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Analytics() {
  const [timeToHire, setTimeToHire] = useState(null);
  const [funnelData, setFunnelData] = useState(mockFunnelData);
  const [sourceData] = useState(mockSourceData);
  const [timeToHireChart, setTimeToHireChart] = useState(mockTimeToHire);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const [tthRes, pipelineRes] = await Promise.all([
        api.get('/api/analytics/time-to-hire').catch(() => null),
        api.get('/api/analytics/pipeline').catch(() => null),
      ]);
      if (tthRes?.data) {
        setTimeToHire(tthRes.data);
        if (tthRes.data.stage_transitions) {
          setTimeToHireChart(tthRes.data.stage_transitions.map((s) => ({ stage: s.stage, days: s.avg_days })));
        }
      }
      if (pipelineRes?.data?.pipeline) {
        setFunnelData(pipelineRes.data.pipeline);
      }
    } catch {
      // Use mock data
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>

      {/* Time to Hire Summary Card */}
      {timeToHire && (
        <div className="bg-white rounded-xl border p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Time to Hire</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-blue-600">{timeToHire.overall_avg_days}</p>
              <p className="text-sm text-gray-600 mt-1">Avg Days to Hire</p>
            </div>
            {timeToHire.per_job?.slice(0, 2).map((j, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-gray-800">{j.avg_days} days</p>
                <p className="text-sm text-gray-600 mt-1">{j.job_title}</p>
                <p className="text-xs text-gray-400">{j.count} hire{j.count !== 1 ? 's' : ''}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recruitment Funnel */}
        <div className="bg-white rounded-xl border p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recruitment Funnel</h2>
          <ResponsiveContainer width="100%" height={300}>
            <FunnelChart>
              <Tooltip />
              <Funnel dataKey="count" data={funnelData} isAnimationActive>
                <LabelList position="right" fill="#374151" stroke="none" dataKey="stage" fontSize={12} />
                <LabelList position="center" fill="#fff" stroke="none" dataKey="count" fontSize={14} fontWeight="bold" />
                {funnelData.map((_, i) => (
                  <Cell key={i} fill={FUNNEL_COLORS[i % FUNNEL_COLORS.length]} />
                ))}
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </div>

        {/* Avg Time to Hire per Stage */}
        <div className="bg-white rounded-xl border p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Avg Time to Hire (Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={timeToHireChart}>
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
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  dataKey="count"
                  nameKey="source"
                  label={({ source, percent }) => `${source} (${(percent * 100).toFixed(0)}%)`}
                  labelLine
                >
                  {sourceData.map((_, i) => (
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
