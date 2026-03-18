export function SkeletonRow({ cols = 6 }) {
  return (
    <tr className="border-b animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </td>
      ))}
    </tr>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 animate-pulse" role="status" aria-label="Loading">
      <div className="flex items-center justify-between mb-2">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
        <div className="h-5 bg-gray-200 rounded-full w-8"></div>
      </div>
      <div className="h-3 bg-gray-200 rounded w-32 mb-1"></div>
      <div className="h-3 bg-gray-200 rounded w-20"></div>
    </div>
  );
}

export function SkeletonTableRows({ rows = 5, cols = 6 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} cols={cols} />
      ))}
    </>
  );
}

export function SkeletonKanbanColumn() {
  return (
    <div className="space-y-2" role="status" aria-label="Loading pipeline">
      {Array.from({ length: 3 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
