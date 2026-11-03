import React, { useState } from 'react';
import { ViewMode } from '../types';
import { 
  X, 
  Sparkles, 
  Play, 
  ArrowRight, 
  CheckCircle2, 
  Mic, 
  Brain, 
  Clock, 
  Flame, 
  Gift, 
  Volume2 
} from 'lucide-react';

interface HackathonDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: ViewMode) => void;
  onTriggerDemoStep: (stepNumber: number) => void;
}

export const HackathonDemoModal: React.FC<HackathonDemoModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onTriggerDemoStep
}) => {
  const [activeStep, setActiveStep] = useState(1);

  if (!isOpen) return null;

  const steps = [
    {
      step: 1,
      title: "1. Spoken Daily Activity Capture",
      tagline: "Natural Voice & Multi-Activity Statement",
      desc: 'User speaks: "Today I solved 5 Java questions, met Rahul and spent 250 rupees on lunch."',
      icon: Mic,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
      actionText: "Simulate Voice Input & Extract",
      targetView: 'assistant' as ViewMode
    },
    {
      step: 2,
      title: "2. AI Multi-Activity Memory Extraction",
      tagline: "Extracts 3 Distinct Structured Records",
      desc: 'Smart Engine extracts: 1. Coding (5 Java questions) 2. Friends (Rahul) 3. Expenses (₹250 lunch), tags & date.',
      icon: Brain,
      color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
      actionText: "View Extracted Breakdown",
      targetView: 'assistant' as ViewMode
    },
    {
      step: 3,
      title: "3. Past Memory Date Retrieval",
      tagline: "Time Travel Question & Audible Voice Answer",
      desc: 'User asks: "What did I do on November 3?" → AI answers: "Boss! On November 3, you solved 5 Java questions, met Rahul and spent ₹250 on lunch. Looks like a productive day! 😂"',
      icon: Clock,
      color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
      actionText: "Ask 'What did I do on Nov 3?'",
      targetView: 'search' as ViewMode
    },
    {
      step: 4,
      title: "4. Roast My Week (AI Personality)",
      tagline: "Data-Grounded Humorous Feedback",
      desc: 'User says: "Roast my productivity this week" → AI analyzes actual coding vs food delivery records for a hilarious, friendly roast.',
      icon: Flame,
      color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
      actionText: "Run Productivity Roast",
      targetView: 'roast' as ViewMode
    },
    {
      step: 5,
      title: "5. Spotify-Style Weekly Life Wrapped",
      tagline: "Visual Summary & Confetti Celebration",
      desc: 'Synthesizes total coding sessions, study hours, expenses, peak day, and friends into a shareable recap card.',
      icon: Gift,
      color: "text-pink-400 bg-pink-500/10 border-pink-500/20",
      actionText: "Launch Weekly Wrapped",
      targetView: 'wrapped' as ViewMode
    }
  ];

  const currentStepData = steps.find(s => s.step === activeStep) || steps[0];

  const handleExecuteCurrentStep = () => {
    onTriggerDemoStep(activeStep);
    onNavigate(currentStepData.targetView);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#0C1322] border-2 border-purple-500/40 shadow-2xl p-6 sm:p-8 overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative z-10 flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-400 flex items-center justify-center text-white shadow-md">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-display">
                Hackathon Presentation Tour
              </h3>
              <p className="text-xs text-purple-300">
                Interactive 5-step live demonstration of YaadBuddy AI capabilities
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Steps Progress Indicator */}
        <div className="relative z-10 grid grid-cols-5 gap-1.5 sm:gap-2 my-6">
          {steps.map(s => (
            <button
              key={s.step}
              onClick={() => setActiveStep(s.step)}
              className={`p-2 rounded-xl text-center border transition-all ${
                activeStep === s.step
                  ? 'bg-purple-600/30 border-purple-400 text-white font-bold shadow-md shadow-purple-600/20'
                  : activeStep > s.step
                  ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <span className="text-[11px] block font-mono">Step {s.step}</span>
            </button>
          ))}
        </div>

        {/* Active Step Showcase Card */}
        <div className="relative z-10 p-6 rounded-2xl bg-slate-900/90 border border-purple-500/30 shadow-xl space-y-4">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-2xl border shrink-0 ${currentStepData.color}`}>
              <currentStepData.icon size={24} />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400 block">
                {currentStepData.tagline}
              </span>
              <h4 className="text-lg font-extrabold text-white font-display mt-0.5">
                {currentStepData.title}
              </h4>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed font-mono">
            {currentStepData.desc}
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <CheckCircle2 size={14} className="text-emerald-400" />
              <span>Ready for instant evaluation</span>
            </div>

            <button
              onClick={handleExecuteCurrentStep}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all hover:scale-105"
            >
              <Play size={14} />
              <span>{currentStepData.actionText}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Quick Tour Auto-Nav */}
        <div className="relative z-10 mt-6 flex items-center justify-between text-xs text-slate-400">
          <span>Click any step above to jump directly</span>
          <div className="flex items-center gap-2">
            {activeStep > 1 && (
              <button
                onClick={() => setActiveStep(activeStep - 1)}
                className="hover:text-white"
              >
                ← Previous
              </button>
            )}
            {activeStep < 5 && (
              <button
                onClick={() => setActiveStep(activeStep + 1)}
                className="hover:text-purple-300 font-bold"
              >
                Next Step →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
