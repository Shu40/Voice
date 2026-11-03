import React, { useState, useEffect } from 'react';
import { ViewMode, MemoryItem, MemoryCategory } from '../types';
import { useMemories } from '../context/MemoryContext';
import { MemoryCard, getCategoryConfig } from '../components/MemoryCard';
import { formatDateISO, formatFriendlyDate, getCurrentWeekRange } from '../utils/dateParser';
import { 
  Mic, 
  Search, 
  Calendar, 
  Clock, 
  TrendingUp, 
  Award, 
  DollarSign, 
  Code, 
  Plus, 
  Sparkles, 
  ArrowUpRight, 
  Flame, 
  Gift, 
  Target 
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (view: ViewMode) => void;
  onOpenAddModal: () => void;
  onEditMemory: (m: MemoryItem) => void;
  onQuickRecord: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onOpenAddModal,
  onEditMemory,
  onQuickRecord
}) => {
  const { memories, goals, personality, deleteMemory } = useMemories();

  // Live clock
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const todayStr = formatDateISO(new Date());
  const weekRange = getCurrentWeekRange();

  // Filter memories
  const todayMemories = memories.filter(m => m.date === todayStr);
  const weekMemories = memories.filter(m => m.date >= weekRange.start && m.date <= weekRange.end);
  const totalExpenses = memories.reduce((sum, m) => sum + (m.amount || 0), 0);
  const codingMemories = memories.filter(m => m.category === 'Coding');

  // Categories breakdown
  const categoryCounts: Record<MemoryCategory, number> = {
    Study: 0,
    Coding: 0,
    Friends: 0,
    Family: 0,
    Food: 0,
    Expenses: 0,
    Travel: 0,
    Work: 0,
    Achievements: 0,
    Mood: 0,
    Entertainment: 0,
    Personal: 0
  };

  memories.forEach(m => {
    if (categoryCounts[m.category] !== undefined) {
      categoryCounts[m.category]++;
    }
  });

  // Calculate weekly day distribution for the interactive chart (Mon to Sun)
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayStats = daysOfWeek.map((dayName, idx) => {
    // Generate dates for the current week
    const [startYear, startMonth, startDay] = weekRange.start.split('-').map(Number);
    const dayDate = new Date(startYear, startMonth - 1, startDay + idx);
    const dateStr = formatDateISO(dayDate);
    const count = memories.filter(m => m.date === dateStr).length;
    return {
      day: dayName,
      date: dateStr,
      count,
      isToday: dateStr === todayStr
    };
  });

  const maxWeeklyCount = Math.max(1, ...dayStats.map(d => d.count));

  // Companion greeting based on personality
  const getGreeting = () => {
    const hour = currentTime.getHours();
    const timeGreeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    
    if (personality === 'funny') {
      return `${timeGreeting}, Boss! Ready to make memories or just order snacks? 😂`;
    } else if (personality === 'motivational') {
      return `${timeGreeting}, Champion! Let's conquer today's goals and record history! 🚀`;
    }
    return `${timeGreeting}! I'm keeping your life's memories safe and sound.`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Welcome Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-purple-950/60 via-slate-900/90 to-slate-900 border border-purple-500/20 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-300 uppercase tracking-wider mb-2">
              <Sparkles size={14} className="text-cyan-400" />
              <span>Personal Memory Companion • {personality.toUpperCase()} MODE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display mb-2">
              {getGreeting()}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-300">
              <span className="flex items-center gap-1.5 font-medium bg-slate-800/80 px-3 py-1 rounded-lg border border-slate-700">
                <Calendar size={14} className="text-purple-400" />
                <span>{currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </span>
              <span className="flex items-center gap-1.5 font-mono text-cyan-300 bg-slate-800/80 px-3 py-1 rounded-lg border border-slate-700">
                <Clock size={14} className="text-cyan-400" />
                <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
              </span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onQuickRecord}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-purple-600/30 hover:scale-105 transition-all"
            >
              <Mic size={16} />
              <span>Voice Record</span>
            </button>
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-sm border border-slate-700 transition-all"
            >
              <Plus size={16} />
              <span>Manual Add</span>
            </button>
            <button
              onClick={() => onNavigate('search')}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-sm border border-slate-700 transition-all"
            >
              <Search size={16} />
              <span>Search Past</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Memories */}
        <div 
          onClick={() => onNavigate('timeline')}
          className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-purple-500/40 cursor-pointer transition-all hover:scale-[1.02]"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Memories</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Sparkles size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            {memories.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-purple-400 font-semibold">{memories.filter(m => m.source === 'voice').length}</span> recorded by voice
          </p>
        </div>

        {/* Today's Activities */}
        <div 
          onClick={() => onNavigate('search')}
          className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all hover:scale-[1.02]"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Today's Log</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <Calendar size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            {todayMemories.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {todayMemories.length > 0 ? 'Active day recorded' : 'No memories logged yet today'}
          </p>
        </div>

        {/* This Week */}
        <div 
          onClick={() => onNavigate('wrapped')}
          className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/40 cursor-pointer transition-all hover:scale-[1.02]"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">This Week</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            {weekMemories.length}
          </div>
          <p className="text-[11px] text-indigo-300 mt-1 flex items-center gap-1">
            <span>View Weekly Life Wrapped</span>
            <ArrowUpRight size={12} />
          </p>
        </div>

        {/* Total Expenses Logged */}
        <div 
          onClick={() => onNavigate('detective')}
          className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-all hover:scale-[1.02]"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Logged Expenses</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-display">
            ₹{totalExpenses.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Across {memories.filter(m => m.amount).length} spending items
          </p>
        </div>
      </div>

      {/* Main Grid: Weekly Chart & Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Activity Chart (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white font-display">Weekly Activity Distribution</h3>
              <p className="text-xs text-slate-400">Recorded memories across each day of the current week</p>
            </div>
            <button
              onClick={() => onNavigate('wrapped')}
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              <Gift size={13} />
              <span>Full Wrapped</span>
            </button>
          </div>

          {/* Bar Chart Visualization */}
          <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-44 pt-4 pb-2 border-b border-slate-800">
            {dayStats.map((stat, i) => {
              const heightPercent = Math.max(12, Math.round((stat.count / maxWeeklyCount) * 100));
              return (
                <div key={i} className="flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[11px] font-bold text-slate-400 group-hover:text-purple-300 transition-colors">
                    {stat.count}
                  </span>
                  <div className="w-full max-w-[42px] bg-slate-800 rounded-t-lg overflow-hidden h-full flex items-end">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        stat.isToday
                          ? 'bg-gradient-to-t from-cyan-500 to-purple-500 shadow-lg shadow-purple-500/20'
                          : stat.count > 0
                          ? 'bg-gradient-to-t from-purple-800 to-indigo-600 group-hover:from-purple-600 group-hover:to-indigo-500'
                          : 'bg-slate-800'
                      }`}
                      style={{ height: `${stat.count === 0 ? 8 : heightPercent}%` }}
                    />
                  </div>
                  <span className={`text-xs font-semibold ${stat.isToday ? 'text-cyan-400' : 'text-slate-400'}`}>
                    {stat.day}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <span>Today's active column</span>
            </span>
            <span className="text-slate-300">
              Peak day had <strong className="text-purple-400">{maxWeeklyCount}</strong> activities
            </span>
          </div>
        </div>

        {/* Categories Breakdown (1 col) */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white font-display">Memory Categories</h3>
              <span className="text-xs text-slate-400">{Object.values(categoryCounts).filter(c => c > 0).length} active</span>
            </div>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {(Object.keys(categoryCounts) as MemoryCategory[])
                .filter(cat => categoryCounts[cat] > 0)
                .sort((a, b) => categoryCounts[b] - categoryCounts[a])
                .map((cat) => {
                  const config = getCategoryConfig(cat);
                  const Icon = config.icon;
                  const count = categoryCounts[cat];
                  const percent = Math.round((count / memories.length) * 100);

                  return (
                    <div key={cat} className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${config.color}`}>
                          <Icon size={13} />
                        </div>
                        <span className="font-semibold text-slate-200">{cat}</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-purple-400 font-bold">{count}</span>
                        <span className="text-[10px] text-slate-400">({percent}%)</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Quick shortcuts to features */}
          <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between gap-2">
            <button
              onClick={() => onNavigate('roast')}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-950/60 border border-rose-800/40 text-rose-300 text-xs font-bold transition-colors"
            >
              <Flame size={14} className="text-rose-400" />
              <span>Roast My Week</span>
            </button>
            <button
              onClick={() => onNavigate('goals')}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-950/40 hover:bg-indigo-950/60 border border-indigo-800/40 text-indigo-300 text-xs font-bold transition-colors"
            >
              <Target size={14} className="text-indigo-400" />
              <span>Goal Tracker</span>
            </button>
          </div>
        </div>
      </div>

      {/* Today's Activities & Recent Memories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Activities */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <h3 className="text-base font-bold text-white font-display">Today's Activities ({todayMemories.length})</h3>
            </div>
            <button
              onClick={onQuickRecord}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <Plus size={13} />
              <span>Add to Today</span>
            </button>
          </div>

          {todayMemories.length === 0 ? (
            <div className="text-center py-8 px-4 rounded-2xl bg-slate-950/40 border border-dashed border-slate-800">
              <p className="text-sm text-slate-400 mb-2">No activities recorded for today yet.</p>
              <p className="text-xs text-slate-400 mb-4">Try speaking: "Today I solved 5 Java questions and met Rahul"</p>
              <button
                onClick={onQuickRecord}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold shadow-md"
              >
                <Mic size={14} />
                <span>Speak Now</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {todayMemories.map(m => (
                <MemoryCard
                  key={m.id}
                  memory={m}
                  onEdit={onEditMemory}
                  onDelete={deleteMemory}
                />
              ))}
            </div>
          )}
        </div>

        {/* Recent Memories Feed */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white font-display">Recent Saved Memories</h3>
            <button
              onClick={() => onNavigate('timeline')}
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight size={13} />
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {memories.slice(0, 4).map(m => (
              <MemoryCard
                key={m.id}
                memory={m}
                onEdit={onEditMemory}
                onDelete={deleteMemory}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
