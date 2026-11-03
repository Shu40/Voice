import React, { useEffect, useState } from 'react';
import { ViewMode } from '../types';
import { useMemories } from '../context/MemoryContext';
import { formatFriendlyDate, getCurrentWeekRange } from '../utils/dateParser';
import confetti from 'canvas-confetti';
import { 
  Gift, 
  Sparkles, 
  Trophy, 
  Code, 
  BookOpen, 
  DollarSign, 
  Users, 
  Calendar, 
  Share2, 
  Copy, 
  Check, 
  TrendingUp, 
  Flame, 
  Zap, 
  Heart 
} from 'lucide-react';

interface WrappedPageProps {
  onNavigate: (view: ViewMode) => void;
}

export const WrappedPage: React.FC<WrappedPageProps> = ({ onNavigate }) => {
  const { memories, goals } = useMemories();
  const [copied, setCopied] = useState(false);

  // Trigger celebration confetti on mount
  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}
  }, []);

  const weekRange = getCurrentWeekRange();

  // Filter memories for the current week or recent (Nov 1 to Nov 5)
  const recentMemories = memories.filter(m => m.date >= '2026-11-01' || m.date >= weekRange.start);

  const totalActivities = recentMemories.length;
  const codingMemories = recentMemories.filter(m => m.category === 'Coding');
  const studyMemories = recentMemories.filter(m => m.category === 'Study');
  const expenseMemories = recentMemories.filter(m => m.amount && m.amount > 0);
  const totalSpent = expenseMemories.reduce((acc, m) => acc + (m.amount || 0), 0);

  // Group by date to find most productive day
  const dateCounts: Record<string, number> = {};
  recentMemories.forEach(m => {
    dateCounts[m.date] = (dateCounts[m.date] || 0) + 1;
  });

  let mostProductiveDate = '';
  let maxCount = 0;
  for (const [d, count] of Object.entries(dateCounts)) {
    if (count > maxCount) {
      maxCount = count;
      mostProductiveDate = d;
    }
  }

  // Most frequent category
  const catCounts: Record<string, number> = {};
  recentMemories.forEach(m => {
    catCounts[m.category] = (catCounts[m.category] || 0) + 1;
  });

  let topCategory = 'Coding';
  let topCatCount = 0;
  for (const [c, count] of Object.entries(catCounts)) {
    if (count > topCatCount) {
      topCatCount = count;
      topCategory = c;
    }
  }

  // Unique people met
  const peopleMet = Array.from(new Set(recentMemories.flatMap(m => m.people)));

  // Generate share text
  const shareSummary = `🎉 My YaadBuddy AI Weekly Life Wrapped!
✨ Total Recorded Activities: ${totalActivities}
💻 Coding Sessions: ${codingMemories.length}
📚 Study & Learning: ${studyMemories.length} sessions
💸 Total Spent: ₹${totalSpent}
🏆 Most Productive Day: ${mostProductiveDate ? formatFriendlyDate(mostProductiveDate) : 'Today'} (${maxCount} activities)
👥 People Connected: ${peopleMet.join(', ') || 'Solo deep work'}
⚡ Top Category: ${topCategory}
#YaadBuddyAI #WeeklyWrapped #PersonalAI`;

  const handleCopySummary = () => {
    navigator.clipboard.writeText(shareSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Wrapped Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-900/60 to-pink-900/60 border border-purple-500/30 text-purple-200 text-xs font-bold shadow-lg">
          <Gift size={14} className="text-pink-400" />
          <span>YOUR WEEK IN MEMORIES</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-white font-display tracking-tight">
          Weekly Life <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">Wrapped</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
          Here is your customized life report synthesized directly from your actual memories.
        </p>
      </div>

      {/* Main Wrapped Card (Spotify-Wrapped Style) */}
      <div className="relative rounded-3xl p-6 sm:p-10 bg-gradient-to-br from-[#1E1138] via-[#121A36] to-[#0A1224] border-2 border-purple-500/40 shadow-2xl overflow-hidden">
        {/* Glow ambient spots */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-8">
          {/* Top Brand Banner */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-amber-400" />
              <span className="text-sm font-extrabold uppercase tracking-wider text-white font-display">
                YaadBuddy.ai • November 2026 Edition
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-cyan-300 bg-white/5 px-3 py-1 rounded-full border border-white/10">
              {totalActivities} LOGGED ACTIVITIES
            </span>
          </div>

          {/* Big Stat Hero Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="flex items-center gap-2 text-purple-300 text-xs font-semibold mb-1">
                <Trophy size={14} />
                <span>Peak Productive Day</span>
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-white font-display">
                {mostProductiveDate ? formatFriendlyDate(mostProductiveDate) : 'Today'}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {maxCount} activities recorded in a single day
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="flex items-center gap-2 text-pink-300 text-xs font-semibold mb-1">
                <Code size={14} />
                <span>Coding Momentum</span>
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-white font-display">
                {codingMemories.length} Sessions
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Java LeetCode, DSA & Recursion solved
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold mb-1">
                <DollarSign size={14} />
                <span>Recorded Expenses</span>
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-emerald-300 font-display">
                ₹{totalSpent}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Lunch rolls, meals & college expenses
              </p>
            </div>
          </div>

          {/* Highlights Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top Companion & Social */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-300 mb-3">
                <Users size={14} />
                <span>People in Your Orbit</span>
              </div>
              {peopleMet.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {peopleMet.map((p, idx) => (
                      <span key={idx} className="px-3 py-1 rounded-xl bg-purple-600/30 border border-purple-400/30 text-white font-bold text-xs">
                        {p}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 pt-1">
                    Hackathon brainstorming at cafeteria, canteen study syncs.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-400">Deep solo focus sessions this week.</p>
              )}
            </div>

            {/* Dominant Category */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-300 mb-3">
                <Zap size={14} />
                <span>Primary Focus Zone</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-bold text-white">{topCategory}</h4>
                  <p className="text-xs text-slate-400">{topCatCount} activities recorded in this category</p>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 font-mono font-bold text-xs border border-cyan-500/30">
                  {Math.round((topCatCount / Math.max(1, totalActivities)) * 100)}% of memories
                </div>
              </div>
            </div>
          </div>

          {/* Memorable Milestone Quote */}
          <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-center gap-3">
            <Heart size={20} className="text-pink-400 shrink-0" />
            <p className="text-xs text-slate-200 leading-relaxed italic">
              "Every problem you solve and every connection you make becomes part of your story. Keep building, you're on fire!"
            </p>
          </div>

          {/* Action Row: Copy & Share */}
          <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopySummary}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/10 transition-colors"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Summary'}</span>
              </button>

              <button
                onClick={() => onNavigate('roast')}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 text-xs font-bold border border-rose-500/30 transition-colors"
              >
                <Flame size={14} className="text-rose-400" />
                <span>Want a Roast Instead?</span>
              </button>
            </div>

            <button
              onClick={() => onNavigate('dashboard')}
              className="text-xs text-slate-400 hover:text-white"
            >
              Back to Dashboard →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
