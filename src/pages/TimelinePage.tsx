import React, { useState } from 'react';
import { ViewMode, MemoryItem, MemoryCategory } from '../types';
import { useMemories } from '../context/MemoryContext';
import { MemoryCard, getCategoryConfig } from '../components/MemoryCard';
import { formatFriendlyDate } from '../utils/dateParser';
import { 
  Calendar, 
  Search, 
  Filter, 
  Plus, 
  Tag, 
  Users, 
  Clock, 
  ChevronRight, 
  SlidersHorizontal,
  X
} from 'lucide-react';

interface TimelinePageProps {
  onNavigate: (view: ViewMode) => void;
  onOpenAddModal: () => void;
  onEditMemory: (m: MemoryItem) => void;
}

const ALL_CATEGORIES: MemoryCategory[] = [
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

export const TimelinePage: React.FC<TimelinePageProps> = ({
  onNavigate,
  onOpenAddModal,
  onEditMemory
}) => {
  const { memories, deleteMemory } = useMemories();

  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'voice' | 'manual'>('all');
  const [viewStyle, setViewStyle] = useState<'timeline' | 'cards'>('timeline');

  // Filter memories
  const filteredMemories = memories.filter(m => {
    // Category match
    if (selectedCategory !== 'all' && m.category !== selectedCategory) {
      return false;
    }
    // Source match
    if (sourceFilter !== 'all' && m.source !== sourceFilter) {
      return false;
    }
    // Keyword match
    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase();
      const inDesc = m.description.toLowerCase().includes(q);
      const inCat = m.category.toLowerCase().includes(q);
      const inTags = m.tags.some(t => t.toLowerCase().includes(q));
      const inPeople = m.people.some(p => p.toLowerCase().includes(q));
      const inLoc = m.location?.toLowerCase().includes(q);
      if (!inDesc && !inCat && !inTags && !inPeople && !inLoc) {
        return false;
      }
    }
    return true;
  });

  // Sort memories descending by date
  const sortedMemories = [...filteredMemories].sort((a, b) => b.date.localeCompare(a.date));

  // Group by date
  const groupedByDate: Record<string, MemoryItem[]> = {};
  sortedMemories.forEach(m => {
    if (!groupedByDate[m.date]) groupedByDate[m.date] = [];
    groupedByDate[m.date].push(m);
  });

  const uniqueDates = Object.keys(groupedByDate).sort().reverse();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Life Memories Timeline
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Chronological archive of all your life activities, milestones, and reflections.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle view style */}
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewStyle('timeline')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewStyle === 'timeline'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Timeline
            </button>
            <button
              onClick={() => setViewStyle('cards')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewStyle === 'cards'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Grid
            </button>
          </div>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all"
          >
            <Plus size={14} />
            <span>Add Memory</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search keyword input */}
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Filter by keyword (e.g. 'Rahul', 'Java', 'AWS', 'lunch')..."
              className="w-full pl-10 pr-8 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
            {searchKeyword && (
              <button
                onClick={() => setSearchKeyword('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Source Filter */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs shrink-0">
            <button
              onClick={() => setSourceFilter('all')}
              className={`px-2.5 py-1 rounded-lg ${sourceFilter === 'all' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400'}`}
            >
              All Sources
            </button>
            <button
              onClick={() => setSourceFilter('voice')}
              className={`px-2.5 py-1 rounded-lg ${sourceFilter === 'voice' ? 'bg-cyan-950/60 text-cyan-300 font-bold border border-cyan-800/40' : 'text-slate-400'}`}
            >
              Voice
            </button>
            <button
              onClick={() => setSourceFilter('manual')}
              className={`px-2.5 py-1 rounded-lg ${sourceFilter === 'manual' ? 'bg-purple-950/60 text-purple-300 font-bold border border-purple-800/40' : 'text-slate-400'}`}
            >
              Manual
            </button>
          </div>
        </div>

        {/* Category Pills Slider */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-colors ${
              selectedCategory === 'all'
                ? 'bg-purple-600 text-white font-bold'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            All Categories ({memories.length})
          </button>
          {ALL_CATEGORIES.map(cat => {
            const count = memories.filter(m => m.category === cat).length;
            if (count === 0) return null;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-colors ${
                  selectedCategory === cat
                    ? 'bg-purple-600 text-white font-bold'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Memory Results */}
      {sortedMemories.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl bg-slate-900/40 border border-dashed border-slate-800">
          <Calendar size={36} className="mx-auto text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-white font-display mb-1">
            No Memories Found
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            No memories match your active filters. Try clearing filters or adding a new memory.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchKeyword('');
              setSourceFilter('all');
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700"
          >
            Reset Filters
          </button>
        </div>
      ) : viewStyle === 'timeline' ? (
        /* Vertical Chronological Timeline Layout */
        <div className="relative border-l-2 border-purple-900/50 ml-4 sm:ml-6 pl-4 sm:pl-8 space-y-8">
          {uniqueDates.map(dateKey => {
            const dateMemories = groupedByDate[dateKey];
            return (
              <div key={dateKey} className="relative group">
                {/* Timeline node dot */}
                <div className="absolute -left-[25px] sm:-left-[41px] top-1.5 w-4 h-4 rounded-full bg-purple-500 border-4 border-[#070B14] shadow-md shadow-purple-500/50 group-hover:scale-125 transition-transform" />

                {/* Date header */}
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-sm sm:text-base font-bold text-white font-display">
                    {formatFriendlyDate(dateKey)}
                  </h3>
                  <span className="text-[11px] font-semibold text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-full">
                    {dateMemories.length} {dateMemories.length === 1 ? 'activity' : 'activities'}
                  </span>
                </div>

                {/* Date memories stack */}
                <div className="space-y-3">
                  {dateMemories.map(m => (
                    <MemoryCard
                      key={m.id}
                      memory={m}
                      onEdit={onEditMemory}
                      onDelete={deleteMemory}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Grid Layout */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedMemories.map(m => (
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
  );
};
