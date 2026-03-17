export default function ScoreBar({ score, label = 'AI Score' }) {
  const color =
    score >= 80
      ? 'bg-green-500'
      : score >= 60
        ? 'bg-yellow-500'
        : 'bg-red-500';

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-gray-600">{label}</span>
        <span className="text-sm font-bold text-gray-900">{score}/100</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full ${color} transition-all`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
