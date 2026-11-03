import React from 'react';
import { useSimple } from '../context/SimpleContext';
import { 
  Award, 
  Play, 
  RotateCcw, 
  Flame, 
  Sun, 
  Moon, 
  Brain, 
  CheckCircle2, 
  BellRing, 
  Clock 
} from 'lucide-react';

export const DemoShowcaseBar: React.FC = () => {
  const {
    isDemoMode,
    setIsDemoMode,
    addActivity,
    askDateMemory,
    triggerGoodMorning,
    triggerWakeupLoopStep,
    acknowledgeGoodMorning,
    triggerGoodNight,
    triggerScheduleAudit6to6,
    triggerHabitAnalysis,
    triggerStudyRoutineReminder,
    resetDemoData,
    language,
    userName,
    wakeupStage,
    hasRepliedGoodMorning
  } = useSimple();

  const handleAction1 = async () => {
    const text = language === 'hi' 
      ? "मैंने अभी 5:00 बजे जिम में 1 घंटा वर्कआउट किया" 
      : "Maine abhi 5:00 PM gym me 1 ghanta workout kiya";
    await addActivity(text);
  };

  const handleAction2 = async () => {
    await askDateMemory('2026-11-02');
  };

  const handleAction3 = async () => {
    await askDateMemory('2026-11-01');
  };

  const handleWakeupLoop = async () => {
    await triggerWakeupLoopStep();
  };

  const handleAcknowledgeMorning = async () => {
    await acknowledgeGoodMorning();
  };

  const handleGoodNight10PM = async (replied: boolean) => {
    await triggerGoodNight(replied);
  };

  return (
    <div className="rounded-2xl p-3.5 bg-gradient-to-r from-purple-950/70 via-slate-900 to-indigo-950/70 border border-purple-500/30 text-xs shadow-lg space-y-2.5">
      {/* Top Banner Row */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Award size={15} className="text-amber-400" />
          <span className="font-bold text-white uppercase tracking-wider font-display text-[11px]">
            {isDemoMode ? `⭐ HR & Hackathon Presentation Mode (${userName})` : `🟢 Real Data Mode (${userName})`}
          </span>
          <span className="hidden md:inline text-slate-400 text-[10px]">
            {isDemoMode ? '(Preloaded 3 Days of Coding, Study, Gym & Expenses)' : '(Your Private Records)'}
          </span>
        </div>

        {/* Toggle Real vs Demo Mode */}
        <button
          onClick={() => setIsDemoMode(!isDemoMode)}
          className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all border ${
            isDemoMode
              ? 'bg-purple-600/40 text-purple-200 border-purple-400/40 hover:bg-purple-600/60'
              : 'bg-emerald-600/30 text-emerald-200 border-emerald-500/40 hover:bg-emerald-600/50'
          }`}
        >
          {isDemoMode ? 'Switch to Real Data' : 'Switch to Demo Mode (HR)'}
        </button>
      </div>

      {/* 1-Click Interactive Showcase Triggers for HR / Evaluators */}
      {isDemoMode && (
        <div className="space-y-2 pt-1 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 mr-1 flex items-center gap-1">
              <Play size={10} className="text-cyan-400" />
              <span>Test Automation Triggers:</span>
            </span>

            {/* Wakeup Nudge Loop */}
            <button
              onClick={handleWakeupLoop}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold transition-all"
              title="AI keeps asking until Shubham replies Good Morning"
            >
              <BellRing size={11} className="animate-bounce" />
              <span>1. Wakeup Loop (Nudge {wakeupStage})</span>
            </button>

            {/* Shubham replies Good Morning */}
            <button
              onClick={handleAcknowledgeMorning}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 text-[10px] font-semibold transition-all"
              title="Shubham replies Good Morning"
            >
              <CheckCircle2 size={11} />
              <span>Reply: "Good morning AI"</span>
            </button>

            {/* 10 PM Good Night without reply */}
            <button
              onClick={() => handleGoodNight10PM(false)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/60 text-[11px] font-bold transition-all"
              title="10 PM Good Night: Shubham aapki aawaz pyaari hai..."
            >
              <Moon size={11} className="text-indigo-400" />
              <span>2. 10 PM Night Message</span>
            </button>

            {/* Tokne Mode 6 AM - 6 PM Audit */}
            <button
              onClick={triggerScheduleAudit6to6}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-800/60 text-[11px] font-bold transition-all"
              title="Audit 6 AM to 6 PM Schedule"
            >
              <Flame size={11} />
              <span>3. 6 AM - 6 PM Audit</span>
            </button>

            {/* Habit Analysis */}
            <button
              onClick={triggerHabitAnalysis}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 text-[11px] font-bold transition-all"
              title="Analyze Daily Recurring Habits"
            >
              <Brain size={11} />
              <span>4. Daily Habits Audit</span>
            </button>

            {/* Proactive Study / Routine Check */}
            <button
              onClick={triggerStudyRoutineReminder}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 text-[11px] font-bold transition-all"
              title="Proactive Study Reminder: If not studied today, AI urges user now!"
            >
              <Award size={11} className="text-emerald-400" />
              <span>5. Study & Routine Check</span>
            </button>
          </div>

          {/* Quick Memory Queries */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-900">
            <span className="text-[10px] text-slate-500 mr-1">Memory Queries:</span>
            <button
              onClick={handleAction1}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px]"
            >
              + Log 5 PM Gym Today
            </button>
            <button
              onClick={handleAction2}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px]"
            >
              Ask Yesterday's 5 Records (कल)
            </button>
            <button
              onClick={handleAction3}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px]"
            >
              Ask Nov 1 Records
            </button>
            <button
              onClick={resetDemoData}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 text-slate-400 hover:text-white border border-slate-800 text-[10px] ml-auto"
            >
              <RotateCcw size={10} />
              <span>Reset 3-Day Demo</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
