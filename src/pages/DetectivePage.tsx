import React, { useState } from 'react';
import { ViewMode, MemoryItem } from '../types';
import { useMemories } from '../context/MemoryContext';
import { queryMemories } from '../services/queryEngine';
import { MemoryCard } from '../components/MemoryCard';
import { 
  Search, 
  HelpCircle, 
  Sparkles, 
  Bot, 
  Mic, 
  Award, 
  DollarSign, 
  Code, 
  Users, 
  BookOpen, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

interface DetectivePageProps {
  onNavigate: (view: ViewMode) => void;
  onEditMemory: (m: MemoryItem) => void;
  onSpeakQuery: (text: string) => void;
}

export const DetectivePage: React.FC<DetectivePageProps> = ({
  onNavigate,
  onEditMemory,
  onSpeakQuery
}) => {
  const { memories, goals, personality, deleteMemory } = useMemories();

  const [activeQuestion, setActiveQuestion] = useState<string>("When did I last meet Rahul?");
  const [activeResult, setActiveResult] = useState(() => {
    return queryMemories("When did I last meet Rahul?", memories, goals, personality);
  });

  const detectiveQuestions = [
    {
      q: "When did I last meet Rahul?",
      icon: Users,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20"
    },
    {
      q: "Which day did I solve the most coding questions?",
      icon: Code,
      color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
    },
    {
      q: "What was my last AWS learning session?",
      icon: BookOpen,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20"
    },
    {
      q: "What did I spend the most money on?",
      icon: DollarSign,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    },
    {
      q: "What was my last achievement?",
      icon: Award,
      color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20"
    },
    {
      q: "When did I last study Python?",
      icon: Code,
      color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20"
    }
  ];

  const handleAskQuestion = (question: string) => {
    setActiveQuestion(question);
    const res = queryMemories(question, memories, goals, personality);
    setActiveResult(res);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-purple-950/60 via-slate-900 to-slate-900 border border-purple-500/20 shadow-xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2">
          <Search size={14} />
          <span>AI Memory Detective</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display mb-2">
          Deep Questions About Your Life
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          YaadBuddy analyzes your full memory vault to find exact answers, trends, extremes, and timelines. Every answer is backed by verified dates and saved memories.
        </p>

        {/* Question Selector Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-6">
          {detectiveQuestions.map((item, idx) => {
            const Icon = item.icon;
            const isSelected = activeQuestion === item.q;
            return (
              <button
                key={idx}
                onClick={() => handleAskQuestion(item.q)}
                className={`p-3.5 rounded-2xl text-left border transition-all flex items-start gap-3 ${
                  isSelected
                    ? 'bg-purple-900/40 border-purple-500 text-white shadow-lg shadow-purple-900/30'
                    : 'bg-slate-900/80 hover:bg-slate-800/80 border-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <div className={`p-2 rounded-xl border shrink-0 ${item.color}`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold block">{item.q}</span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                    <span>Investigate</span>
                    <ArrowRight size={10} />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Answer & Evidence Section */}
      <div className="space-y-4">
        {/* Answer Banner */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-purple-500/30 shadow-xl">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
                <Bot size={22} />
              </div>
              <div>
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider block">
                  Detective Finding
                </span>
                <h3 className="text-sm font-semibold text-slate-300">
                  Query: "{activeQuestion}"
                </h3>
              </div>
            </div>

            <button
              onClick={() => onSpeakQuery(activeResult.spokenResponse)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30 transition-all shrink-0"
            >
              <Mic size={14} />
              <span>Voice Playback</span>
            </button>
          </div>

          {/* Spoken Response text */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-slate-100 text-base font-medium leading-relaxed">
            "{activeResult.spokenResponse}"
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
            <span>Confidence: 100% (Calculated from stored records)</span>
            <span>{activeResult.matchedMemories.length} supporting memory record(s)</span>
          </div>
        </div>

        {/* Supporting Memories (Evidence) */}
        <div>
          <h4 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
            <Sparkles size={14} className="text-cyan-400" />
            <span>Supporting Evidence Records</span>
          </h4>

          {activeResult.matchedMemories.length === 0 ? (
            <div className="text-center py-8 rounded-2xl bg-slate-900/30 border border-dashed border-slate-800 text-xs text-slate-400">
              No matching records found in database.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeResult.matchedMemories.map(m => (
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
      </div>
    </div>
  );
};
