import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const RECOMMENDATIONS = [
  { value: 'strong_yes', label: 'Strong Yes', color: 'bg-green-100 text-green-700' },
  { value: 'yes', label: 'Yes', color: 'bg-green-50 text-green-600' },
  { value: 'neutral', label: 'Neutral', color: 'bg-gray-100 text-gray-600' },
  { value: 'no', label: 'No', color: 'bg-red-50 text-red-600' },
  { value: 'strong_no', label: 'Strong No', color: 'bg-red-100 text-red-700' },
];

function ScoreInput({ label, value, onChange, id }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-label={`${label} score ${n}`}
            className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
              value === n ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Scorecards() {
  const [scorecards, setScorecards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    application_id: '',
    technical_score: 3,
    communication_score: 3,
    culture_fit_score: 3,
    overall_score: 3,
    strengths: '',
    weaknesses: '',
    recommendation: 'neutral',
    notes: '',
  });

  useEffect(() => {
    loadScorecards();
  }, []);

  const loadScorecards = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/scorecards');
      setScorecards(Array.isArray(res.data) ? res.data : []);
    } catch {
      setScorecards([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.application_id) {
      toast.error('Please enter an application ID');
      return;
    }
    try {
      await api.post('/api/scorecards', {
        ...form,
        application_id: Number(form.application_id),
      });
      toast.success('Scorecard submitted!');
      setShowForm(false);
      setForm({
        application_id: '', technical_score: 3, communication_score: 3,
        culture_fit_score: 3, overall_score: 3, strengths: '', weaknesses: '',
        recommendation: 'neutral', notes: '',
      });
      loadScorecards();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit scorecard');
    }
  };

  const getRecLabel = (val) => RECOMMENDATIONS.find((r) => r.value === val) || RECOMMENDATIONS[2];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Scorecards</h1>
        <button
          onClick={() => setShowForm(true)}
          aria-label="New scorecard"
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
        >
          + New Scorecard
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border p-8 text-center" role="status" aria-label="Loading scorecards">
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      ) : scorecards.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            📋
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No scorecards yet</h3>
          <p className="text-sm text-gray-500 mb-4">Submit your first evaluation scorecard after an interview.</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
          >
            + New Scorecard
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {scorecards.map((sc) => {
            const rec = getRecLabel(sc.recommendation);
            return (
              <div key={sc.id} className="bg-white rounded-xl border p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-sm font-medium text-gray-900">Application #{sc.application_id}</span>
                    {sc.interviewer_name && (
                      <span className="text-sm text-gray-500 ml-2">by {sc.interviewer_name}</span>
                    )}
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${rec.color}`}>
                    {rec.label}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{sc.technical_score}</p>
                    <p className="text-xs text-gray-500">Technical</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{sc.communication_score}</p>
                    <p className="text-xs text-gray-500">Communication</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{sc.culture_fit_score}</p>
                    <p className="text-xs text-gray-500">Culture Fit</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{sc.overall_score}</p>
                    <p className="text-xs text-gray-500">Overall</p>
                  </div>
                </div>
                {(sc.strengths || sc.weaknesses) && (
                  <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-4 text-sm">
                    {sc.strengths && <div><span className="font-medium text-green-700">Strengths:</span> <span className="text-gray-600">{sc.strengths}</span></div>}
                    {sc.weaknesses && <div><span className="font-medium text-red-700">Weaknesses:</span> <span className="text-gray-600">{sc.weaknesses}</span></div>}
                  </div>
                )}
                {sc.created_at && (
                  <p className="text-xs text-gray-400 mt-2">{new Date(sc.created_at).toLocaleDateString()}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">New Scorecard</h2>
              <button onClick={() => setShowForm(false)} aria-label="Close" className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label htmlFor="sc-app-id" className="block text-sm font-medium text-gray-700 mb-1">Application ID</label>
                <input
                  id="sc-app-id"
                  type="number"
                  value={form.application_id}
                  onChange={(e) => setForm({ ...form, application_id: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="Enter application ID"
                />
              </div>
              <ScoreInput label="Technical" value={form.technical_score} onChange={(v) => setForm({ ...form, technical_score: v })} id="sc-tech" />
              <ScoreInput label="Communication" value={form.communication_score} onChange={(v) => setForm({ ...form, communication_score: v })} id="sc-comm" />
              <ScoreInput label="Culture Fit" value={form.culture_fit_score} onChange={(v) => setForm({ ...form, culture_fit_score: v })} id="sc-culture" />
              <ScoreInput label="Overall" value={form.overall_score} onChange={(v) => setForm({ ...form, overall_score: v })} id="sc-overall" />
              <div>
                <label htmlFor="sc-rec" className="block text-sm font-medium text-gray-700 mb-1">Recommendation</label>
                <select
                  id="sc-rec"
                  value={form.recommendation}
                  onChange={(e) => setForm({ ...form, recommendation: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  {RECOMMENDATIONS.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="sc-strengths" className="block text-sm font-medium text-gray-700 mb-1">Strengths</label>
                <textarea id="sc-strengths" value={form.strengths} onChange={(e) => setForm({ ...form, strengths: e.target.value })} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label htmlFor="sc-weaknesses" className="block text-sm font-medium text-gray-700 mb-1">Weaknesses</label>
                <textarea id="sc-weaknesses" value={form.weaknesses} onChange={(e) => setForm({ ...form, weaknesses: e.target.value })} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label htmlFor="sc-notes" className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea id="sc-notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
              <button onClick={handleSubmit} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Submit Scorecard</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
