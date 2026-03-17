export default function StatsCard({ title, value, subtitle, color = 'blue' }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
  };

  return (
    <div className={`rounded-xl border p-5 ${colors[color] || colors.blue}`}>
      <p className="text-sm font-medium opacity-70">{title}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
      {subtitle && <p className="text-xs mt-2 opacity-60">{subtitle}</p>}
    </div>
  );
}
