import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockCandidates, mockStages } from '../api/mockData';
import KanbanCard from '../components/KanbanCard';

export default function Pipeline() {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState(mockCandidates);
  const stages = mockStages.filter((s) => s !== 'Rejected');

  const moveCandidate = (candidateId, newStage) => {
    setCandidates(
      candidates.map((c) => (c.id === candidateId ? { ...c, stage: newStage } : c))
    );
  };

  const handleDragStart = (e, candidateId) => {
    e.dataTransfer.setData('candidateId', candidateId.toString());
  };

  const handleDrop = (e, stage) => {
    e.preventDefault();
    const candidateId = Number(e.dataTransfer.getData('candidateId'));
    moveCandidate(candidateId, stage);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Pipeline</h1>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const stageCandidates = candidates.filter((c) => c.stage === stage);
          return (
            <div
              key={stage}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, stage)}
              className="flex-shrink-0 w-72 bg-gray-50 rounded-xl p-3"
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-sm font-semibold text-gray-700">{stage}</h3>
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                  {stageCandidates.length}
                </span>
              </div>

              <div className="space-y-2 min-h-[200px]">
                {stageCandidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, candidate.id)}
                  >
                    <KanbanCard
                      candidate={candidate}
                      onClick={() => navigate(`/candidates/${candidate.id}`)}
                    />
                    <div className="flex gap-1 mt-1">
                      {stages
                        .filter((s) => s !== stage)
                        .map((s) => (
                          <button
                            key={s}
                            onClick={() => moveCandidate(candidate.id, s)}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600"
                          >
                            {s}
                          </button>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
