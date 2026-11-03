import React, { useState, useEffect } from 'react';
import { MemoryItem, MemoryCategory } from '../types';
import { X, Calendar, Clock, DollarSign, MapPin, Users, Tag, Check, Trash2 } from 'lucide-react';
import { formatDateISO } from '../utils/dateParser';

interface MemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (memory: MemoryItem) => void;
  onDelete?: (id: string) => void;
  initialMemory?: MemoryItem | null;
}

const CATEGORIES: MemoryCategory[] = [
  'Study',
  'Coding',
  'Friends',
  'Family',
  'Food',
  'Expenses',
  'Travel',
  'Work',
  'Achievements',
  'Mood',
  'Entertainment',
  'Personal'
];

export const MemoryModal: React.FC<MemoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialMemory
}) => {
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<MemoryCategory>('Personal');
  const [date, setDate] = useState(formatDateISO(new Date()));
  const [time, setTime] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [currency, setCurrency] = useState('₹');
  const [peopleStr, setPeopleStr] = useState('');
  const [location, setLocation] = useState('');
  const [tagsStr, setTagsStr] = useState('');
  const [details, setDetails] = useState('');

  useEffect(() => {
    if (initialMemory) {
      setDescription(initialMemory.description);
      setCategory(initialMemory.category);
      setDate(initialMemory.date);
      setTime(initialMemory.time || '');
      setAmount(initialMemory.amount ? String(initialMemory.amount) : '');
      setCurrency(initialMemory.currency || '₹');
      setPeopleStr(initialMemory.people.join(', '));
      setLocation(initialMemory.location || '');
      setTagsStr(initialMemory.tags.join(', '));
      setDetails(initialMemory.details || '');
    } else {
      setDescription('');
      setCategory('Personal');
      setDate(formatDateISO(new Date()));
      const now = new Date();
      setTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
      setAmount('');
      setCurrency('₹');
      setPeopleStr('');
      setLocation('');
      setTagsStr('');
      setDetails('');
    }
  }, [initialMemory, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const people = peopleStr
      .split(',')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    const tags = tagsStr
      .split(',')
      .map(t => t.trim().toLowerCase().replace(/^#/, ''))
      .filter(t => t.length > 0);

    const parsedAmount = amount ? parseFloat(amount) : null;

    const memoryItem: MemoryItem = {
      id: initialMemory?.id || `mem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      date,
      time: time || undefined,
      description: description.trim(),
      category,
      people,
      amount: parsedAmount,
      currency,
      location: location.trim() || null,
      tags,
      source: initialMemory?.source || 'manual',
      createdAt: initialMemory?.createdAt || new Date().toISOString(),
      isDemo: initialMemory?.isDemo || false,
      details: details.trim() || undefined
    };

    onSave(memoryItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0F172A] border border-slate-700/80 shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h3 className="text-lg font-bold text-white font-display">
            {initialMemory ? 'Edit Memory' : 'Add New Memory Manually'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4 overflow-y-auto pr-1">
          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Memory Description *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Solved 5 Java questions on LeetCode, met Rahul at library"
              className="w-full rounded-xl bg-slate-900 border border-slate-700 p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
          </div>

          {/* Category & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MemoryCategory)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Calendar size={12} />
                <span>Date</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Amount & Currency */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <DollarSign size={12} />
                <span>Amount (if spent)</span>
              </label>
              <div className="flex rounded-xl overflow-hidden border border-slate-700 bg-slate-900">
                <span className="px-2.5 py-2 text-xs font-bold text-slate-400 bg-slate-800">
                  {currency}
                </span>
                <input
                  type="number"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="250"
                  className="w-full bg-transparent px-3 py-2 text-sm text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Clock size={12} />
                <span>Time (Optional)</span>
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* People & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Users size={12} />
                <span>People Involved</span>
              </label>
              <input
                type="text"
                value={peopleStr}
                onChange={(e) => setPeopleStr(e.target.value)}
                placeholder="Rahul, Sneha (comma separated)"
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <MapPin size={12} />
                <span>Location</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="College Library, Dosa Plaza..."
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <Tag size={12} />
              <span>Tags</span>
            </label>
            <input
              type="text"
              value={tagsStr}
              onChange={(e) => setTagsStr(e.target.value)}
              placeholder="java, hackathon, lunch (comma separated)"
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Extra Notes / Reflections (Optional)
            </label>
            <textarea
              rows={2}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Any additional reflection or code problem notes..."
              className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
            {initialMemory && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(initialMemory.id);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-white hover:bg-rose-950/60 transition-colors"
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/80 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30 transition-all"
              >
                <Check size={14} />
                <span>Save Memory</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
