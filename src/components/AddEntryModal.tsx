import React, { useState } from 'react';
import { useSimple } from '../context/SimpleContext';
import { getTodayDateISO, getYesterdayDateISO } from '../services/simpleEngine';
import { X, Calendar, Clock, Plus, Check } from 'lucide-react';

interface AddEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddEntryModal: React.FC<AddEntryModalProps> = ({ isOpen, onClose }) => {
  const { addActivity, language } = useSimple();

  const [dateChoice, setDateChoice] = useState<'today' | 'yesterday' | 'custom'>('today');
  const [customDate, setCustomDate] = useState(getTodayDateISO());
  const [time, setTime] = useState('09:00 AM');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const targetDate = dateChoice === 'today' 
    ? getTodayDateISO() 
    : dateChoice === 'yesterday' 
    ? getYesterdayDateISO() 
    : customDate;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    addActivity(description, targetDate, time);
    onClose();
    setDescription('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl bg-[#0F172A] border border-slate-700/80 shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white font-display">
              {language === 'hi' ? 'नया काम जोड़ें (Add Manual Entry)' : 'Add Activity Record'}
            </h3>
            <p className="text-[11px] text-slate-400">
              {language === 'hi' ? 'आज या कल का काम मैन्युअल रूप से सेव करें' : 'Record for today or yesterday'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Quick Date Switcher */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {language === 'hi' ? 'तारीख चुनें (Date):' : 'Select Date:'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDateChoice('today')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  dateChoice === 'today'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                {language === 'hi' ? 'आज (Today)' : 'Today'}
              </button>

              <button
                type="button"
                onClick={() => setDateChoice('yesterday')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  dateChoice === 'yesterday'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                {language === 'hi' ? 'कल (Yesterday)' : 'Yesterday'}
              </button>

              <button
                type="button"
                onClick={() => setDateChoice('custom')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  dateChoice === 'custom'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                {language === 'hi' ? 'अन्य तारीख' : 'Custom'}
              </button>
            </div>

            {dateChoice === 'custom' && (
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="mt-2 w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
              />
            )}
          </div>

          {/* Time */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <Clock size={12} className="text-cyan-400" />
              <span>{language === 'hi' ? 'समय (Time):' : 'Time:'}</span>
            </label>
            <input
              type="text"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="e.g. 09:30 AM, 05:00 PM"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {language === 'hi' ? 'क्या काम किया? (Activity Description):' : 'What did you do?'}
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                language === 'hi'
                  ? 'उदा. 5 जावा प्रश्न हल किए, राहुल से मिला, 1 घंटा जिम किया...'
                  : 'e.g. Solved 5 Java problems, met Rahul for lunch...'
              }
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              {language === 'hi' ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-md flex items-center gap-1.5"
            >
              <Check size={14} />
              <span>{language === 'hi' ? 'सेव करें' : 'Save Entry'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
