export default function KanbanCard({ candidate, onClick }) {
  const scoreColor =
    candidate.aiScore >= 80
      ? 'text-green-600 bg-green-50'
      : candidate.aiScore >= 60
        ? 'text-yellow-600 bg-yellow-50'
        : 'text-red-600 bg-red-50';

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 p-3 cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-900">{candidate.name}</h4>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${scoreColor}`}>
          {candidate.aiScore}
        </span>
      </div>
      <p className="text-xs text-gray-500">{candidate.jobTitle}</p>
      <p className="text-xs text-gray-400 mt-1">{candidate.appliedDate}</p>
    </div>
  );
}
