import React from 'react';
import { ViewMode } from '../types';
import { MemoryOrb } from '../components/MemoryOrb';
import { 
  Sparkles, 
  Mic, 
  ShieldCheck, 
  Brain, 
  Flame, 
  Gift, 
  Clock, 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  Award 
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (view: ViewMode) => void;
  onTryVoiceQuery: (sampleText: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onTryVoiceQuery
}) => {
  const sampleCommands = [
    "Today I solved 5 Java questions, met Rahul and spent 250 rupees on lunch.",
    "What did I do on November 3?",
    "When did I last meet Rahul?",
    "When did I last study Python?",
    "Roast my productivity this week 😂",
    "How close am I to my November goal?"
  ];

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between overflow-hidden">
      {/* Background Decorative Gradient Blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-purple-700/15 via-indigo-600/15 to-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-10 -right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -left-10 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-16 text-center">
        {/* Top Announcement Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-6 shadow-lg shadow-purple-950/40 backdrop-blur-md">
          <Sparkles size={14} className="text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Next-Gen Voice-First Personal Memory Companion</span>
          <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-cyan-400" />
          <span className="text-cyan-300 hidden sm:inline">Zero Hallucination Guaranteed</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white font-display mb-4">
          You live your life.{' '}
          <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
            I'll remember it.
          </span>
        </h1>

        {/* Tagline & Subtitle */}
        <p className="max-w-2xl mx-auto text-base sm:text-xl text-slate-300 font-normal leading-relaxed mb-8">
          Speak naturally about your day, coding sessions, meetings, and expenses. 
          <span className="text-white font-semibold"> YaadBuddy AI</span> categorizes every memory with accurate dates and brings it back whenever you ask.
        </p>

        {/* Central Glowing AI Memory Orb */}
        <div className="my-8 flex flex-col items-center justify-center">
          <MemoryOrb 
            status="idle" 
            size="lg" 
            onClick={() => onNavigate('assistant')} 
          />
          <p className="mt-4 text-xs font-medium text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Click orb or say: "Today I solved 5 Java questions..."</span>
          </p>
        </div>

        {/* Primary CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-12">
          <button
            onClick={() => onNavigate('assistant')}
            className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-105 transition-all duration-300"
          >
            <Mic size={18} />
            <span>Start Remembering</span>
            <ArrowRight size={18} />
          </button>

          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-sm sm:text-base border border-slate-700/80 transition-all shadow-md"
          >
            <span>Open Dashboard</span>
          </button>

          <button
            onClick={() => onTryVoiceQuery("What did I do on November 3?")}
            className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-indigo-950/50 hover:bg-indigo-900/60 text-cyan-300 font-semibold text-sm border border-cyan-700/40 transition-all"
          >
            <Zap size={16} className="text-cyan-400" />
            <span>Try Demo Query</span>
          </button>
        </div>

        {/* Clickable Voice Commands Carousel */}
        <div className="max-w-4xl mx-auto mb-16">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            ✨ Try asking these voice commands (Click to test):
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
            {sampleCommands.map((cmd, idx) => (
              <button
                key={idx}
                onClick={() => onTryVoiceQuery(cmd)}
                className="group flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-900/80 hover:bg-purple-950/60 border border-slate-800 hover:border-purple-500/50 text-slate-300 hover:text-white transition-all text-left shadow-sm"
              >
                <Mic size={12} className="text-purple-400 group-hover:scale-110 transition-transform" />
                <span>"{cmd}"</span>
              </button>
            ))}
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left max-w-5xl mx-auto">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md hover:border-purple-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
              <Brain size={20} />
            </div>
            <h3 className="text-base font-bold text-white mb-2 font-display">Multi-Activity Extraction</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Say: <span className="text-slate-200">"I studied Java, met Rahul and bought coffee."</span> YaadBuddy extracts 3 distinct structured memories with categories, people, and expense amounts.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md hover:border-cyan-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
              <Clock size={20} />
            </div>
            <h3 className="text-base font-bold text-white mb-2 font-display">Time Travel Retrieval</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ask: <span className="text-slate-200">"What did I do on November 3?"</span> or <span className="text-slate-200">"What happened yesterday?"</span> and receive voice answers strictly based on actual records.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md hover:border-rose-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
              <Flame size={20} />
            </div>
            <h3 className="text-base font-bold text-white mb-2 font-display">Roast My Week & Wrapped</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Humorous, friendly roasts analyzing your study vs snacking habits, plus Spotify-style Weekly Life Wrapped reports with real stats and charts.
            </p>
          </div>
        </div>

        {/* Trust & Guarantee Banner */}
        <div className="mt-12 p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/30 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-300">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <ShieldCheck size={18} />
            <span>The YaadBuddy Memory Promise:</span>
          </div>
          <span>Strictly grounded in your saved memories. Never invents facts or fabricates past history.</span>
        </div>
      </div>
    </div>
  );
};
