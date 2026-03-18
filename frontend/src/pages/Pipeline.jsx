import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { mockCandidates, mockStages } from '../api/mockData';
import KanbanCard from '../components/KanbanCard';
import { SkeletonKanbanColumn } from '../components/SkeletonLoader';

export default function Pipeline() {
  const navigate = useNavigate();
  const [pipeline, setPipeline] = useState(null);
  const [loading, setLoading] = useState(true);
  const stages = ['Applied', 'Screened', 'Interview', 'Offer', 'Hired'];

  useEffect(() => {
    loadPipeline();
  }, []);

  const loadPipeline = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/applications/pipeline');
      setPipeline(res.data);
    } catch {
      // Fallback to mock data grouped by stage
      const grouped = {};
      stages.forEach((s) => { grouped[s] = []; });
      mockCandidates.forEach((c) => {
        const stage = c.stage === 'Screening' ? 'Screened' : c.stage;
        if (grouped[stage]) grouped[stage].push(c);
      });
      setPipeline(grouped);
    } finally {
      setLoading(false);
    }
  };

  const moveCandidate = async (appId, newStage) => {
    try {
      await api.put(`/api/applications/${appId}/stage`, { stage: newStage });
      toast.success(`Moved to ${newStage}`);
      loadPipeline();
    } catch {
      toast.error('Failed to move candidate');
    }
  };

  const handleDragStart = (e, id) => {
    e.dataTransfer.setData('appId', id.toString());
  };

  const handleDrop = (e, stage) => {
    e.preventDefault();
    const appId = Number(e.dataTransfer.getData('appId'));
    moveCandidate(appId, stage);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Pipeline</h1>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const cards = pipeline ? (pipeline[stage] || []) : [];
          return (
            <div
              key={stage}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, stage)}
              className="flex-shrink-0 w-72 bg-gray-50 rounded-xl p-3"
              role="region"
              aria-label={`${stage} stage`}
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-sm font-semibold text-gray-700">{stage}</h3>
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                  {loading ? '-' : cards.length}
                </span>
              </div>

              <div className="space-y-2 min-h-[200px]">
                {loading ? (
                  <SkeletonKanbanColumn />
                ) : cards.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-sm text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                    No candidates
                  </div>
                ) : (
                  cards.map((card) => {
                    const candidateData = {
                      id: card.id,
                      name: card.candidate_name || card.name,
                      jobTitle: card.job_title || card.jobTitle,
                      aiScore: card.ai_score ?? card.aiScore,
                      appliedDate: card.applied_at?.split('T')[0] || card.appliedDate,
                    };
                    return (
                      <div
                        key={card.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, card.id)}
                      >
                        <KanbanCard
                          candidate={candidateData}
                          onClick={() => navigate(`/candidates/${card.candidate_id || card.id}`)}
                        />
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {stages
                            .filter((s) => s !== stage)
                            .map((s) => (
                              <button
                                key={s}
                                onClick={() => moveCandidate(card.id, s)}
                                aria-label={`Move to ${s}`}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600"
                              >
                                {s}
                              </button>
                            ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
