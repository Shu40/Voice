import React, { useState } from 'react';
import { ViewMode, MemoryItem } from '../types';
import { useMemories } from '../context/MemoryContext';
import { MemoryCard } from '../components/MemoryCard';
import { queryMemories } from '../services/queryEngine';
import { formatFriendlyDate, formatDateISO } from '../utils/dateParser';
import { 
  Search, 
  Calendar, 
  Clock, 
  Sparkles, 
  Bot, 
  Mic, 
  ArrowRight, 
  CalendarDays, 
  HelpCircle,
  Filter
} from 'lucide-react';

interface SearchPageProps {
  onNavigate: (view: ViewMode) => void;
  onEditMemory: (m: MemoryItem) => void;
  onSpeakQuery: (text: string) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({
  onNavigate,
  onEditMemory,
  onSpeakQuery
}) => {
  const { memories, goals, personality, deleteMemory } = useMemories();

  const [queryInput, setQueryInput] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-03');
  const [activeSearchResult, setActiveSearchResult] = useState<{
    spokenResponse: string;
    displayMarkdown: string;
    matchedMemories: MemoryItem[];
    searchedTerm: string;
  } | null>(() => {
    // Default search for Nov 3 to showcase sample records immediately
    const res = queryMemories("What did I do on November 3?", memories, goals, personality);
    return {
      spokenResponse: res.spokenResponse,
      displayMarkdown: res.displayMarkdown,
      matchedMemories: res.matchedMemories,
      searchedTerm: "What did I do on November 3?"
    };
  });

  const presetQuestions = [
    "What did I do on November 3?",
    "What happened yesterday?",
    "What did I learn last week?",
    "How much money did I spend on lunch?",
    "Whom did I meet in October?",
    "What were my achievements in October?",
    "When did I last study Python?",
    "What did I do on November 1?"
  ];

  const handleExecuteQuery = (textToQuery: string) => {
    if (!textToQuery.trim()) return;
    const res = queryMemories(textToQuery, memories, goals, personality);
    setActiveSearchResult({
      spokenResponse: res.spokenResponse,
      displayMarkdown: res.displayMarkdown,
      matchedMemories: res.matchedMemories,
      searchedTerm: textToQuery
    });
  };

  const handleDateJump = (dateVal: string) => {
    setSelectedDate(dateVal);
    const friendly = formatFriendlyDate(dateVal);
    handleExecuteQuery(`What did I do on ${friendly}?`);
  };

  // Group matched memories by date
  const groupedMemories: Record<string, MemoryItem[]> = {};
  if (activeSearchResult?.matchedMemories) {
    activeSearchResult.matchedMemories.forEach(m => {
      if (!groupedMemories[m.date]) groupedMemories[m.date] = [];
      groupedMemories[m.date].push(m);
    });
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900 border border-cyan-500/20 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2">
              <Clock size={14} />
              <span>Time Travel Memory Search</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display mb-1">
              Search Your Past History
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Query any past date, person, topic or expense. Grounded strictly in your verified memories.
            </p>
          </div>

          {/* Direct Date Picker Jump */}
          <div className="flex items-center gap-2 bg-slate-900/90 p-2 rounded-2xl border border-slate-700">
            <CalendarDays size={18} className="text-purple-400 ml-2" />
            <span className="text-xs font-semibold text-slate-300">Jump to Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateJump(e.target.value)}
              className="bg-slate-800 text-white text-xs px-2.5 py-1.5 rounded-xl border border-slate-700 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Natural Search Input Bar */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleExecuteQuery(queryInput);
          }}
          className="mt-6 relative flex items-center gap-2"
        >
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Ask anything: 'What did I do on Nov 3?', 'Whom did I meet?', 'How much spent on lunch?'..."
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-900/90 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-3.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm shadow-lg shadow-cyan-600/30 transition-all flex items-center gap-2 shrink-0"
          >
            <span>Search</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Preset Question Chips */}
        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <HelpCircle size={12} />
            <span>Popular Queries:</span>
          </span>
          {presetQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQueryInput(q);
                handleExecuteQuery(q);
              }}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Query Results Section */}
      {activeSearchResult && (
        <div className="space-y-4">
          {/* AI Response Callout Card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-purple-500/30 shadow-lg flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
              <Bot size={22} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                  YaadBuddy Answer
                </span>
                <button
                  onClick={() => onSpeakQuery(activeSearchResult.spokenResponse)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-950/60 hover:bg-purple-900 border border-purple-700/60 text-purple-300 transition-colors"
                >
                  <Mic size={12} />
                  <span>Listen Voice</span>
                </button>
              </div>
              <p className="text-base text-slate-100 font-medium leading-relaxed">
                "{activeSearchResult.spokenResponse}"
              </p>
              <p className="text-xs text-slate-400 mt-2">
                Query: <span className="text-slate-300 italic">"{activeSearchResult.searchedTerm}"</span> • {activeSearchResult.matchedMemories.length} matching records found
              </p>
            </div>
          </div>

          {/* Grouped Memories Display */}
          {activeSearchResult.matchedMemories.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-3xl bg-slate-900/40 border border-dashed border-slate-800">
              <Sparkles size={32} className="mx-auto text-purple-400 mb-3 opacity-60" />
              <h3 className="text-base font-bold text-white font-display mb-1">
                No Saved Memory Found
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
                "I don't have any saved memory for that date yet. Tell me what happened and I'll remember it!"
              </p>
              <button
                onClick={() => onNavigate('assistant')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md"
              >
                <Mic size={14} />
                <span>Record This Memory</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.keys(groupedMemories).sort().reverse().map(dateKey => (
                <div key={dateKey} className="space-y-3">
                  <div className="flex items-center gap-2 pb-1 border-b border-slate-800">
                    <Calendar size={15} className="text-cyan-400" />
                    <h3 className="text-sm font-bold text-white font-display">
                      {formatFriendlyDate(dateKey)}
                    </h3>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                      {groupedMemories[dateKey].length} {groupedMemories[dateKey].length === 1 ? 'record' : 'records'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {groupedMemories[dateKey].map(m => (
                      <MemoryCard
                        key={m.id}
                        memory={m}
                        onEdit={onEditMemory}
                        onDelete={deleteMemory}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
