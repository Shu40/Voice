import React, { useState } from 'react';
import { ViewMode, AssistantPersonality } from '../types';
import { useMemories } from '../context/MemoryContext';
import { 
  Sparkles, 
  Mic, 
  LayoutDashboard, 
  Calendar, 
  Search, 
  Flame, 
  Gift, 
  Target, 
  Settings, 
  Menu, 
  X, 
  Clock, 
  Laugh, 
  HeartHandshake, 
  Zap,
  RotateCcw
} from 'lucide-react';

interface NavbarProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  onQuickRecord: () => void;
  isListening?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onQuickRecord,
  isListening = false
}) => {
  const { personality, setPersonality, hasDemoData, clearDemoData, loadDemoData } = useMemories();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: ViewMode; label: string; icon: any; highlight?: boolean }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'assistant', label: 'AI Voice', icon: Mic, highlight: true },
    { id: 'search', label: 'Time Travel', icon: Clock },
    { id: 'timeline', label: 'Timeline', icon: Calendar },
    { id: 'detective', label: 'Detective', icon: Search },
    { id: 'wrapped', label: 'Wrapped', icon: Gift },
    { id: 'roast', label: 'Roast Me', icon: Flame },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const personalityIcons = {
    friendly: HeartHandshake,
    funny: Laugh,
    motivational: Zap
  };

  const PersonalityIcon = personalityIcons[personality];

  const cyclePersonality = () => {
    const list: AssistantPersonality[] = ['friendly', 'funny', 'motivational'];
    const nextIdx = (list.indexOf(personality) + 1) % list.length;
    setPersonality(list[nextIdx]);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-[#070B14]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2.5 group text-left cursor-pointer focus:outline-none"
        >
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-0.5 shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#0C1222] rounded-[10px] flex items-center justify-center">
              <Sparkles size={18} className="text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-purple-300 bg-clip-text text-transparent font-display">
                YaadBuddy<span className="text-cyan-400 font-black">.ai</span>
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide hidden sm:block">
              You live your life. I'll remember it.
            </p>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-white/5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                } ${item.highlight && !isActive ? 'text-cyan-300 bg-cyan-950/30 border border-cyan-800/40' : ''}`}
              >
                <Icon size={14} className={isActive ? 'text-white' : item.highlight ? 'text-cyan-400' : 'text-slate-400'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Personality Switcher Button */}
          <button
            onClick={cyclePersonality}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-slate-900 border border-slate-700/60 hover:border-purple-500/50 text-slate-300 hover:text-white transition-all shadow-sm"
            title="Click to switch AI Personality (Friendly, Funny, Motivational)"
          >
            <PersonalityIcon size={14} className={
              personality === 'funny' ? 'text-amber-400' :
              personality === 'motivational' ? 'text-emerald-400' : 'text-purple-400'
            } />
            <span className="capitalize hidden sm:inline">{personality}</span>
          </button>

          {/* Demo Data Toggle Pill */}
          {hasDemoData ? (
            <button
              onClick={clearDemoData}
              className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-indigo-950/50 text-indigo-300 border border-indigo-700/40 hover:bg-rose-950/40 hover:text-rose-300 hover:border-rose-700/40 transition-colors"
              title="Demo data loaded. Click to remove sample memories."
            >
              <span>Demo On</span>
              <span className="text-[10px] opacity-75">(Clear)</span>
            </button>
          ) : (
            <button
              onClick={loadDemoData}
              className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-900 text-slate-400 border border-slate-800 hover:text-cyan-300 hover:border-cyan-700/50 transition-colors"
              title="Click to load sample memories (Nov 1 to Nov 5 records)"
            >
              <RotateCcw size={11} />
              <span>Load Demo</span>
            </button>
          )}

          {/* Quick Voice Record Button */}
          <button
            onClick={onQuickRecord}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 shadow-md ${
              isListening
                ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse shadow-rose-600/40'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/30 hover:shadow-lg'
            }`}
          >
            <Mic size={14} className={isListening ? 'animate-bounce' : ''} />
            <span className="hidden sm:inline">{isListening ? 'Listening...' : 'Record Voice'}</span>
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-800 bg-[#0C1222]/98 backdrop-blur-2xl px-4 py-4 space-y-2 shadow-2xl">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-800">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                      : 'text-slate-300 bg-slate-900/80 border border-slate-800/80'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2 px-1 text-xs text-slate-400">
            <span className="font-medium">AI Personality:</span>
            <div className="flex items-center gap-1">
              {(['friendly', 'funny', 'motivational'] as AssistantPersonality[]).map(p => (
                <button
                  key={p}
                  onClick={() => setPersonality(p)}
                  className={`px-2 py-1 rounded-md text-[11px] capitalize ${
                    personality === p
                      ? 'bg-purple-600 text-white font-bold'
                      : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
