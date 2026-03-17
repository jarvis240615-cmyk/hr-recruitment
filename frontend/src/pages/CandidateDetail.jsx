import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockCandidates, mockStages } from '../api/mockData';
import ScoreBar from '../components/ScoreBar';
import ResumeViewer from '../components/ResumeViewer';
import EmailModal from '../components/EmailModal';
import SlotPicker from '../components/SlotPicker';

export default function CandidateDetail() {
  const { id } = useParams();
  const candidate = mockCandidates.find((c) => c.id === Number(id));
  const [showEmail, setShowEmail] = useState(false);
  const [showSlotPicker, setShowSlotPicker] = useState(false);
  const [scorecard, setScorecard] = useState({ technical: '', cultural: '', communication: '', notes: '' });
  const [selectedSlot, setSelectedSlot] = useState(null);

  if (!candidate) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Candidate not found</p>
        <Link to="/candidates" className="text-blue-600 text-sm mt-2 inline-block">Back to Candidates</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/candidates" className="hover:text-blue-600">Candidates</Link>
        <span>/</span>
        <span className="text-gray-900">{candidate.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: info + AI score */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl border p-5">
            <h2 className="text-xl font-bold text-gray-900">{candidate.name}</h2>
            <p className="text-sm text-gray-500 mt-1">{candidate.jobTitle}</p>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Email</span>
                <span className="text-gray-900">{candidate.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Phone</span>
                <span className="text-gray-900">{candidate.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Stage</span>
                <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-blue-50 text-blue-700">
                  {candidate.stage}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Source</span>
                <span className="text-gray-900">{candidate.source}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Applied</span>
                <span className="text-gray-900">{candidate.appliedDate}</span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-1">
              {candidate.skills.map((skill) => (
                <span key={skill} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                  {skill}
                </span>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setShowEmail(true)}
                className="flex-1 px-3 py-2 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Send Email
              </button>
              <button
                onClick={() => setShowSlotPicker(true)}
                className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Schedule Interview
              </button>
            </div>

            {selectedSlot && (
              <div className="mt-3 p-2 bg-green-50 rounded-lg text-xs text-green-700">
                Interview scheduled: {selectedSlot.date} at {selectedSlot.time}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">AI Score</h3>
            <ScoreBar score={candidate.aiScore} />
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 leading-relaxed">{candidate.aiReasoning}</p>
            </div>
          </div>
        </div>

        {/* Right column: resume + scorecard */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Resume</h3>
            <ResumeViewer url={candidate.resumeUrl} />
          </div>

          <div className="bg-white rounded-xl border p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Evaluation Scorecard</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              {['technical', 'cultural', 'communication'].map((field) => (
                <div key={field}>
                  <label className="block text-xs font-medium text-gray-500 mb-1 capitalize">{field} Fit</label>
                  <select
                    value={scorecard[field]}
                    onChange={(e) => setScorecard({ ...scorecard, [field]: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">Select...</option>
                    <option value="5">5 - Excellent</option>
                    <option value="4">4 - Good</option>
                    <option value="3">3 - Average</option>
                    <option value="2">2 - Below Average</option>
                    <option value="1">1 - Poor</option>
                  </select>
                </div>
              ))}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
              <textarea
                value={scorecard.notes}
                onChange={(e) => setScorecard({ ...scorecard, notes: e.target.value })}
                rows={3}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="Additional notes about this candidate..."
              />
            </div>
            <button
              onClick={() => alert('Scorecard saved!')}
              className="mt-3 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Scorecard
            </button>
          </div>
        </div>
      </div>

      {showEmail && <EmailModal candidate={candidate} onClose={() => setShowEmail(false)} />}
      {showSlotPicker && (
        <SlotPicker
          onSelect={(slot) => setSelectedSlot(slot)}
          onClose={() => setShowSlotPicker(false)}
        />
      )}
    </div>
  );
}
