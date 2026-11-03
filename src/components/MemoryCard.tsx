import React, { useState } from 'react';
import { 
  MemoryItem, 
  MemoryCategory 
} from '../types';
import { 
  BookOpen, 
  Code, 
  Users, 
  Heart, 
  Utensils, 
  DollarSign, 
  Compass, 
  Briefcase, 
  Award, 
  Smile, 
  Film, 
  User, 
  MapPin, 
  Calendar, 
  Clock, 
  Mic, 
  Edit2, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Tag
} from 'lucide-react';
import { formatFriendlyDate } from '../utils/dateParser';

interface MemoryCardProps {
  memory: MemoryItem;
  onEdit?: (memory: MemoryItem) => void;
  onDelete?: (id: string) => void;
  highlightQuery?: string;
}

export const getCategoryConfig = (category: MemoryCategory) => {
  switch (category) {
    case 'Coding':
      return { 
        icon: Code, 
        color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
        badge: 'bg-indigo-950/80 text-indigo-300 border-indigo-700/40' 
      };
    case 'Study':
      return { 
        icon: BookOpen, 
        color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
        badge: 'bg-blue-950/80 text-blue-300 border-blue-700/40' 
      };
    case 'Expenses':
      return { 
        icon: DollarSign, 
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
        badge: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/40' 
      };
    case 'Food':
      return { 
        icon: Utensils, 
        color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
        badge: 'bg-amber-950/80 text-amber-300 border-amber-700/40' 
      };
    case 'Friends':
      return { 
        icon: Users, 
        color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
        badge: 'bg-purple-950/80 text-purple-300 border-purple-700/40' 
      };
    case 'Achievements':
      return { 
        icon: Award, 
        color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
        badge: 'bg-yellow-950/80 text-yellow-300 border-yellow-700/40' 
      };
    case 'Work':
      return { 
        icon: Briefcase, 
        color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
        badge: 'bg-cyan-950/80 text-cyan-300 border-cyan-700/40' 
      };
    case 'Travel':
      return { 
        icon: Compass, 
        color: 'text-teal-400 bg-teal-500/10 border-teal-500/30',
        badge: 'bg-teal-950/80 text-teal-300 border-teal-700/40' 
      };
    case 'Family':
      return { 
        icon: Heart, 
        color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
        badge: 'bg-rose-950/80 text-rose-300 border-rose-700/40' 
      };
    case 'Entertainment':
      return { 
        icon: Film, 
        color: 'text-pink-400 bg-pink-500/10 border-pink-500/30',
        badge: 'bg-pink-950/80 text-pink-300 border-pink-700/40' 
      };
    case 'Mood':
      return { 
        icon: Smile, 
        color: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
        badge: 'bg-orange-950/80 text-orange-300 border-orange-700/40' 
      };
    case 'Personal':
    default:
      return { 
        icon: User, 
        color: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
        badge: 'bg-slate-900/80 text-slate-300 border-slate-700/40' 
      };
  }
};

export const MemoryCard: React.FC<MemoryCardProps> = ({
  memory,
  onEdit,
  onDelete
}) => {
  const [expanded, setExpanded] = useState(false);
  const catConfig = getCategoryConfig(memory.category);
  const IconComponent = catConfig.icon;

  return (
    <div className="group relative rounded-2xl p-4 sm:p-5 transition-all duration-300 glass-card bg-[#11192C]/80 border border-slate-800/80 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-950/20">
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Category Pill */}
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${catConfig.badge}`}>
            <IconComponent size={13} />
            <span>{memory.category}</span>
          </div>

          {/* Amount badge if applicable */}
          {memory.amount !== null && memory.amount !== undefined && (
            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              <span>{memory.currency || '₹'}</span>
              <span>{memory.amount}</span>
            </div>
          )}

          {/* Demo Badge */}
          {memory.isDemo && (
            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-slate-800 text-slate-400 border border-slate-700/60">
              Demo
            </span>
          )}

          {/* Source Icon */}
          {memory.source === 'voice' && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] text-cyan-400/80 bg-cyan-950/40 border border-cyan-800/30" title="Recorded by voice">
              <Mic size={10} />
              <span>Voice</span>
            </span>
          )}
        </div>

        {/* Date and actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
            <Calendar size={13} className="text-slate-500" />
            <span>{formatFriendlyDate(memory.date)}</span>
            {memory.time && (
              <span className="hidden sm:inline-flex items-center gap-1 text-slate-500 ml-1">
                <Clock size={11} />
                {memory.time}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity ml-2">
            {onEdit && (
              <button
                onClick={() => onEdit(memory)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
                title="Edit memory"
              >
                <Edit2 size={13} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(memory.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                title="Delete memory"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Description */}
      <p className="text-slate-100 text-sm sm:text-base leading-relaxed font-normal mb-3">
        {memory.description}
      </p>

      {/* Metadata Badges: People, Location */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-2">
        {memory.people && memory.people.length > 0 && (
          <div className="flex items-center gap-1 bg-purple-950/30 text-purple-300 border border-purple-800/30 px-2 py-0.5 rounded-md">
            <Users size={12} className="text-purple-400" />
            <span>{memory.people.join(', ')}</span>
          </div>
        )}

        {memory.location && (
          <div className="flex items-center gap-1 bg-slate-800/60 text-slate-300 border border-slate-700/50 px-2 py-0.5 rounded-md">
            <MapPin size={12} className="text-cyan-400" />
            <span>{memory.location}</span>
          </div>
        )}

        {/* Tags */}
        {memory.tags && memory.tags.map((tag, idx) => (
          <span 
            key={idx}
            className="flex items-center gap-0.5 text-[11px] text-slate-400 bg-slate-900/60 border border-slate-800 px-2 py-0.5 rounded"
          >
            <Tag size={10} className="text-slate-500" />
            {tag}
          </span>
        ))}
      </div>

      {/* Expandable Details */}
      {memory.details && (
        <div className="mt-2 pt-2 border-t border-slate-800/60">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 font-medium"
          >
            <span>{expanded ? 'Hide Details' : 'View Notes & Details'}</span>
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          {expanded && (
            <p className="mt-2 text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 italic">
              {memory.details}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
