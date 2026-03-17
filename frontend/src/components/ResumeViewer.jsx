export default function ResumeViewer({ url }) {
  if (!url || url === '#') {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
        <div className="text-4xl mb-3">📄</div>
        <p className="text-sm text-gray-500">No resume uploaded</p>
        <p className="text-xs text-gray-400 mt-1">Resume will appear here once uploaded</p>
      </div>
    );
  }

  return (
    <div className="border rounded-xl overflow-hidden">
      <iframe
        src={url}
        title="Resume"
        className="w-full h-[600px]"
      />
    </div>
  );
}
