import { useState } from 'react';
import { mockEmailTemplates } from '../api/mockData';

export default function EmailModal({ candidate, onClose }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const applyTemplate = (template) => {
    setSelectedTemplate(template.id);
    setSubject(
      template.subject
        .replace('{{name}}', candidate.name)
        .replace('{{jobTitle}}', candidate.jobTitle)
    );
    setBody(
      template.body
        .replace(/\{\{name\}\}/g, candidate.name)
        .replace(/\{\{jobTitle\}\}/g, candidate.jobTitle)
    );
  };

  const handleSend = () => {
    alert(`Email sent to ${candidate.email}!\nSubject: ${subject}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Send Email to {candidate.name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">
            &times;
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Template</label>
            <div className="flex flex-wrap gap-2">
              {mockEmailTemplates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => applyTemplate(t)}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                    selectedTemplate === t.id
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <input
              type="text"
              value={candidate.email}
              readOnly
              className="w-full border rounded-lg px-3 py-2 bg-gray-50 text-sm text-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="Email subject..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="Email body..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Send Email
          </button>
        </div>
      </div>
    </div>
  );
}
