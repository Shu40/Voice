import React, { useState } from 'react';
import { ViewMode, GoalItem, MemoryCategory } from '../types';
import { useMemories } from '../context/MemoryContext';
import { 
  Target, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Trash2, 
  Sparkles, 
  Code, 
  BookOpen, 
  DollarSign, 
  TrendingUp 
} from 'lucide-react';

interface GoalsPageProps {
  onNavigate: (view: ViewMode) => void;
}

export const GoalsPage: React.FC<GoalsPageProps> = ({ onNavigate }) => {
  const { goals, memories, addGoal, deleteGoal } = useMemories();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<MemoryCategory>('Coding');
  const [newTarget, setNewTarget] = useState('100');
  const [newUnit, setNewUnit] = useState('problems');

  // Dynamically calculate verified actual progress for each goal from saved memories
  const enrichedGoals = goals.map(goal => {
    let actualCount = 0;

    if (goal.category === 'Coding') {
      const codingMems = memories.filter(m => m.category === 'Coding' && m.date.startsWith(goal.month));
      for (const m of codingMems) {
        const numMatch = m.description.match(/(\d+)\s+(?:problems?|questions?|dsa|java|leetcode)/i);
        actualCount += numMatch ? parseInt(numMatch[1], 10) : 1;
      }
    } else if (goal.category === 'Expenses') {
      const expMems = memories.filter(m => m.category === 'Expenses' && m.date.startsWith(goal.month));
      actualCount = expMems.reduce((sum, m) => sum + (m.amount || 0), 0);
    } else {
      actualCount = memories.filter(m => m.category === goal.category && m.date.startsWith(goal.month)).length;
    }

    const percent = Math.min(100, Math.round((actualCount / Math.max(1, goal.targetCount)) * 100));
    const isCompleted = actualCount >= goal.targetCount;
    const isBehind = percent < 25;

    return {
      ...goal,
      actualCount,
      percent,
      statusBadge: isCompleted ? 'Completed 🎉' : isBehind ? 'Needs Focus' : 'On Track 🚀'
    };
  });

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const parsedTarget = parseInt(newTarget, 10) || 10;
    const goalItem: GoalItem = {
      id: `goal-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      targetCount: parsedTarget,
      currentCount: 0,
      unit: newUnit.trim() || 'items',
      month: '2026-11',
      status: 'on_track'
    };

    addGoal(goalItem);
    setShowAddForm(false);
    setNewTitle('');
    setNewTarget('100');
    setNewUnit('problems');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1">
            <Target size={14} />
            <span>Future Me vs Present Me</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Goal Tracker & Habit Auditor
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Compare what you intended to achieve against what you actually verified and recorded in your memories.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>Set New Goal</span>
        </button>
      </div>

      {/* Add Goal Form Drawer */}
      {showAddForm && (
        <form onSubmit={handleCreateGoal} className="p-5 rounded-2xl bg-slate-900 border border-purple-500/40 shadow-xl space-y-4 animate-fadeIn">
          <h3 className="text-sm font-bold text-white font-display">
            Create Monthly Target for November 2026
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Goal Title *</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Solve 100 Java Problems in November"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as MemoryCategory)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="Coding">Coding</option>
                <option value="Study">Study</option>
                <option value="Expenses">Expenses</option>
                <option value="Personal">Personal</option>
                <option value="Work">Work</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Number</label>
              <input
                type="number"
                required
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value)}
                placeholder="100"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Unit</label>
              <input
                type="text"
                required
                value={newUnit}
                onChange={(e) => setNewUnit(e.target.value)}
                placeholder="problems / hours / ₹ / sessions"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-md"
            >
              Save Goal
            </button>
          </div>
        </form>
      )}

      {/* Goals Cards Stack */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {enrichedGoals.map(goal => (
          <div key={goal.id} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 transition-all space-y-4 shadow-lg">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-950/60 border border-purple-800/40 px-2 py-0.5 rounded-md">
                  {goal.category}
                </span>
                <h3 className="text-base font-bold text-white font-display mt-1.5">
                  {goal.title}
                </h3>
              </div>

              <div className="flex items-center gap-1.5">
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                  goal.percent >= 100
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/50'
                    : goal.percent < 25
                    ? 'bg-amber-950/60 text-amber-300 border-amber-700/50'
                    : 'bg-indigo-950/60 text-indigo-300 border-indigo-700/50'
                }`}>
                  {goal.statusBadge}
                </span>

                <button
                  onClick={() => deleteGoal(goal.id)}
                  className="p-1 rounded-lg text-slate-500 hover:text-rose-400 transition-colors"
                  title="Delete goal"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Progress Numbers */}
            <div className="flex items-baseline justify-between text-xs">
              <div className="space-x-1">
                <span className="text-2xl font-extrabold text-white font-display">
                  {goal.actualCount}
                </span>
                <span className="text-slate-400">
                  / {goal.targetCount} {goal.unit} verified
                </span>
              </div>
              <span className="font-mono font-bold text-purple-400 text-sm">
                {goal.percent}%
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  goal.percent >= 100
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-400 shadow-md shadow-emerald-500/30'
                    : 'bg-gradient-to-r from-purple-600 to-cyan-400 shadow-md shadow-purple-600/30'
                }`}
                style={{ width: `${goal.percent}%` }}
              />
            </div>

            {/* Real verified disclaimer */}
            <div className="text-[11px] text-slate-400 pt-1 flex items-center justify-between border-t border-slate-800/60">
              <span className="flex items-center gap-1">
                <CheckCircle2 size={12} className="text-emerald-400" />
                <span>Computed from actual saved memories</span>
              </span>
              <span className="text-slate-500">Month: {goal.month}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
