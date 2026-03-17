import { useState } from 'react';
import { mockInterviewSlots } from '../api/mockData';

export default function SlotPicker({ onSelect, onClose }) {
  const [selected, setSelected] = useState(null);

  const handleConfirm = () => {
    if (selected) {
      onSelect(selected);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Select Interview Slot</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">
            &times;
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
          {mockInterviewSlots.map((day) => (
            <div key={day.date}>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">{day.date}</h3>
              <div className="grid grid-cols-4 gap-2">
                {day.slots.map((slot) => {
                  const key = `${day.date}-${slot}`;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelected({ date: day.date, time: slot })}
                      className={`px-2 py-1.5 text-xs rounded-lg border transition-colors ${
                        selected?.date === day.date && selected?.time === slot
                          ? 'bg-blue-50 border-blue-300 text-blue-700'
                          : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50/50'
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 p-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selected}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Confirm Slot
          </button>
        </div>
      </div>
    </div>
  );
}
