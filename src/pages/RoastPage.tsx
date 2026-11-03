import React, { useState } from 'react';
import { ViewMode, AssistantPersonality } from '../types';
import { useMemories } from '../context/MemoryContext';
import { generateRoast } from '../services/queryEngine';
import { 
  Flame, 
  Laugh, 
  Mic, 
  RotateCcw, 
  Sparkles, 
  Share2, 
  Copy, 
  Check, 
  Bot, 
  Zap, 
  HeartHandshake 
} from 'lucide-react';

interface RoastPageProps {
  onNavigate: (view: ViewMode) => void;
  onSpeakRoast: (text: string) => void;
}

export const RoastPage: React.FC<RoastPageProps> = ({
  onNavigate,
  onSpeakRoast
}) => {
  const { memories, personality, setPersonality } = useMemories();
  const [copied, setCopied] = useState(false);
  const [selectedPersonality, setSelectedPersonality] = useState<AssistantPersonality>('funny');

  const roastResult = generateRoast(memories, selectedPersonality);

  const handleCopy = () => {
    navigator.clipboard.writeText(`🔥 YaadBuddy AI Roast:\n"${roastResult.spokenResponse}"\n#YaadBuddyAI #RoastMyWeek`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const recentCoding = memories.filter(m => m.category === 'Coding').length;
  const recentExpenses = memories.reduce((acc, m) => acc + (m.amount || 0), 0);
  const recentMeals = memories.filter(m => m.category === 'Food' || m.tags.includes('food') || m.tags.includes('lunch')).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-bold shadow-lg">
          <Flame size={14} className="text-rose-400 animate-pulse" />
          <span>HUMOROUS AI PERSONALITY FEATURE</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-white font-display tracking-tight">
          Roast My <span className="bg-gradient-to-r from-rose-400 via-amber-400 to-pink-500 bg-clip-text text-transparent">Week</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
          Say: <span className="text-slate-100 font-semibold">"Roast my productivity this week"</span>. 
          YaadBuddy creates a hilarious, good-natured roast based purely on your real recorded data!
        </p>
      </div>

      {/* Tone Switcher */}
      <div className="flex items-center justify-center gap-2">
        <span className="text-xs text-slate-400 font-medium mr-1">Roast Flavor:</span>
        <button
          onClick={() => setSelectedPersonality('funny')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            selectedPersonality === 'funny'
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30'
              : 'bg-slate-900 text-slate-300 border border-slate-800'
          }`}
        >
          <Laugh size={14} />
          <span>Savage Bro (Funny)</span>
        </button>

        <button
          onClick={() => setSelectedPersonality('motivational')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            selectedPersonality === 'motivational'
              ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/30'
              : 'bg-slate-900 text-slate-300 border border-slate-800'
          }`}
        >
          <Zap size={14} />
          <span>Tough Coach</span>
        </button>

        <button
          onClick={() => setSelectedPersonality('friendly')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            selectedPersonality === 'friendly'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'bg-slate-900 text-slate-300 border border-slate-800'
          }`}
        >
          <HeartHandshake size={14} />
          <span>Gentle Reality Check</span>
        </button>
      </div>

      {/* Main Roast Card */}
      <div className="relative rounded-3xl p-6 sm:p-10 bg-gradient-to-br from-[#2D0B1E] via-[#1A0E2E] to-[#0A0E1A] border-2 border-rose-500/40 shadow-2xl overflow-hidden">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-rose-500/20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <Flame size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-display uppercase tracking-wide">
                  Weekly Productivity Roast
                </h3>
                <span className="text-[11px] text-rose-300/80">Strictly 100% data-verified facts</span>
              </div>
            </div>

            <button
              onClick={() => onSpeakRoast(roastResult.spokenResponse)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all"
            >
              <Mic size={14} />
              <span>Hear AI Speak It 🔊</span>
            </button>
          </div>

          {/* Roast Punchline Quote */}
          <div className="p-6 rounded-2xl bg-black/40 border border-rose-500/30 shadow-inner">
            <blockquote className="text-xl sm:text-2xl font-bold text-white font-display leading-snug">
              "{roastResult.spokenResponse}"
            </blockquote>
          </div>

          {/* The Data Behind The Roast */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              The Hard Data Used For This Roast:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs">
                <span className="text-slate-400 block mb-1">Coding Output:</span>
                <span className="text-base font-bold text-indigo-400">{recentCoding} Sessions</span>
                <p className="text-[10px] text-slate-500 mt-0.5">LeetCode Java problems</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs">
                <span className="text-slate-400 block mb-1">Canteen & Lunch Spend:</span>
                <span className="text-base font-bold text-emerald-400">₹{recentExpenses}</span>
                <p className="text-[10px] text-slate-500 mt-0.5">Across {recentMeals} meals</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs">
                <span className="text-slate-400 block mb-1">Social Meetings:</span>
                <span className="text-base font-bold text-purple-400">Cafeteria with Rahul</span>
                <p className="text-[10px] text-slate-500 mt-0.5">Brainstorming + eating</p>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pt-4 border-t border-rose-500/20 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copied ? 'Copied Roast!' : 'Share Roast with Friends'}</span>
            </button>

            <button
              onClick={() => onNavigate('assistant')}
              className="text-xs text-rose-300 hover:text-white"
            >
              Ask AI in Voice Assistant →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
