import React, { useState } from 'react';
import { useSimple } from '../context/SimpleContext';
import { X, Clock, Sun, Check, Edit2 } from 'lucide-react';

interface EditRoutineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditRoutineModal: React.FC<EditRoutineModalProps> = ({ isOpen, onClose }) => {
  const { routineTasks, updateRoutineTaskTime, language } = useSimple();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTime, setNewTime] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl bg-[#0F172A] border border-slate-700/80 shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sun size={18} className="text-amber-400" />
            <div>
              <h3 className="text-base font-bold text-white font-display">
                {language === 'hi' ? 'दैनिक रूटीन समय बदलें' : 'Edit Daily Work Schedule'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {language === 'hi' ? 'टोकने वाला मोड इन समय के आधार पर काम करेगा' : 'Strict Mode monitors these exact time ranges'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3 pt-4">
          {routineTasks.map(task => (
            <div key={task.id} className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">{task.title}</span>
                {editingId === task.id ? (
                  <button
                    onClick={() => {
                      if (newTime.trim()) {
                        updateRoutineTaskTime(task.id, newTime.trim());
                      }
                      setEditingId(null);
                    }}
                    className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-600 text-white"
                  >
                    Save
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setEditingId(task.id);
                      setNewTime(task.timeSlot);
                    }}
                    className="p-1 text-slate-400 hover:text-cyan-400"
                    title="Edit time"
                  >
                    <Edit2 size={13} />
                  </button>
                )}
              </div>

              {editingId === task.id ? (
                <input
                  type="text"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-slate-950 border border-purple-500 text-xs text-white"
                />
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-cyan-300 font-mono">
                  <Clock size={12} />
                  <span>{task.timeSlot}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="pt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
