import React from 'react';
import { useSimple } from '../context/SimpleContext';
import { Brain, Sparkles, TrendingUp, Clock, Volume2, CheckCircle2 } from 'lucide-react';

export const DailyHabitCard: React.FC = () => {
  const { detectedHabits, triggerHabitAnalysis, userName, language } = useSimple();

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-purple-950/40 border border-indigo-500/30 text-xs shadow-md space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Brain size={16} className="text-cyan-400" />
          <div>
            <h4 className="text-xs font-bold text-white font-display">
              {language === 'hi' 
                ? `AI आदत विश्लेषण (Daily Habits Pattern for ${userName})` 
                : `AI Daily Habit Analysis (${userName})`}
            </h4>
            <p className="text-[10px] text-slate-400">
              {language === 'hi' 
                ? 'AI ने पहचाना कि आप रोज़ कितने बजे क्या काम करते हैं' 
                : 'AI auto-detects what you do every single day'}
            </p>
          </div>
        </div>

        <button
          onClick={triggerHabitAnalysis}
          className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-cyan-300 hover:text-white border border-indigo-500/40 font-bold text-[11px] transition-all"
        >
          <Volume2 size={12} />
          <span>{language === 'hi' ? 'आदतों का विश्लेषण सुनें 🔊' : 'Listen Habit Audit 🔊'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {detectedHabits.map((habit) => (
          <div
            key={habit.id}
            className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-[10px] text-purple-300 font-bold mb-1">
                <span>{habit.category}</span>
                <span className="px-1.5 py-0.5 rounded bg-purple-950 text-purple-200 border border-purple-800 font-mono">
                  {habit.daysDetected} Days Streak 🔥
                </span>
              </div>
              <p className="text-xs font-bold text-white mb-0.5">{habit.title}</p>
              <div className="flex items-center gap-1 text-[11px] text-cyan-300 font-mono">
                <Clock size={11} />
                <span>{habit.timeSlot}</span>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 mt-2 italic border-t border-slate-900 pt-1">
              {habit.insight}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
