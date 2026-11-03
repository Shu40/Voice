import React, { useState } from 'react';
import { useSimple } from '../context/SimpleContext';
import { 
  Sparkles, 
  ShieldCheck, 
  Award, 
  User, 
  Mail, 
  Lock, 
  Calendar, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Eye, 
  EyeOff,
  Flame,
  Clock,
  BookOpen
} from 'lucide-react';

interface ModeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModeSelectionModal: React.FC<ModeSelectionModalProps> = ({ isOpen, onClose }) => {
  const { 
    userName, 
    setUserName, 
    userProfile, 
    setUserProfile, 
    isDemoMode, 
    setIsDemoMode, 
    language, 
    speakAudio 
  } = useSimple();

  const [step, setStep] = useState<'choose' | 'register' | 'demo_confirm'>('choose');
  const [name, setName] = useState(userProfile.name || 'Shubham');
  const [email, setEmail] = useState(userProfile.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [dob, setDob] = useState(userProfile.dob || '2002-05-15');
  const [demoName, setDemoName] = useState(userName || 'Shubham');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSelectReal = () => {
    setStep('register');
    setErrorMsg('');
  };

  const handleSelectDemo = () => {
    setStep('demo_confirm');
    setErrorMsg('');
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter your name');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid Gmail / Email address');
      return;
    }
    if (!password.trim() || password.length < 4) {
      setErrorMsg('Please enter a password (min 4 characters)');
      return;
    }
    if (!dob) {
      setErrorMsg('Please select your date of birth');
      return;
    }

    // Save profile and switch to Real Mode
    const profile = {
      name: name.trim(),
      email: email.trim(),
      dob,
      isRegistered: true
    };
    setUserProfile(profile);
    setIsDemoMode(false);
    localStorage.setItem('yaadbuddy_mode_selected', 'real');

    const welcomeSpeech = language === 'hi'
      ? `नमस्ते ${profile.name}! आपका असली पर्सनल मेमोरी वॉल्ट तैयार है। बोलिए आज आपने क्या काम किया!`
      : `Welcome ${profile.name}! Your private YaadBuddy assistant is ready. Speak what you did today!`;
    speakAudio(welcomeSpeech);

    onClose();
  };

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalDemoName = demoName.trim() || 'Shubham';
    setUserName(finalDemoName);
    setIsDemoMode(true);
    localStorage.setItem('yaadbuddy_mode_selected', 'demo');

    const demoSpeech = language === 'hi'
      ? `नमस्ते ${finalDemoName}! यादबडी डेमो टूर में स्वागत है। 3 दिनों का कोडिंग और रूटीन डेटा लोड हो चुका है!`
      : `Welcome ${finalDemoName}! YaadBuddy Demo Tour is active. 3 days of rich records are loaded for you!`;
    speakAudio(demoSpeech);

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#070B14]/90 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div 
        className="w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#0D1527] border border-purple-500/30 p-5 sm:p-8 shadow-2xl relative my-auto scrollbar-thin"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Branding */}
        <div className="text-center space-y-1.5 sm:space-y-2 pb-4 sm:pb-5 border-b border-slate-800/80">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-600/40 text-purple-300 text-xs font-semibold">
            <Sparkles size={14} className="text-cyan-300" />
            <span>YaadBuddy AI (याद दोस्त)</span>
          </div>
          <h2 className="text-lg sm:text-2xl font-extrabold text-white tracking-tight font-display">
            {step === 'choose' && 'Choose Your Mode / मोड चुनें'}
            {step === 'register' && 'Personal Profile Setup (Real Mode)'}
            {step === 'demo_confirm' && 'Demo Showcase Mode'}
          </h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {step === 'choose' && 'Select whether you want to use your private memory assistant or test the preloaded interactive demo showcase.'}
            {step === 'register' && 'Enter your details below to activate your personal memory assistant.'}
            {step === 'demo_confirm' && 'Experience the full 3-day history of coding, workouts, expenses, and strict coach audits.'}
          </p>
        </div>

        {/* STEP 1: CHOOSE BETWEEN REAL & DEMO */}
        {step === 'choose' && (
          <div className="pt-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* REAL MODE CARD */}
              <div 
                onClick={handleSelectReal}
                className="group p-5 rounded-2xl bg-slate-900/90 border border-emerald-500/30 hover:border-emerald-400 cursor-pointer transition-all hover:scale-[1.02] shadow-lg flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                      <ShieldCheck size={20} />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                      🟢 100% Private
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                      1. Real Mode (असली मोड)
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      For daily personal use. Log real memories, track your study habits, and set strict 6 AM routines.
                    </p>
                  </div>

                  <ul className="text-[10px] text-slate-300 space-y-1.5 pt-1">
                    <li className="flex items-center gap-1.5">
                      <Check size={12} className="text-emerald-400 shrink-0" />
                      <span>Saves your real daily activities</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check size={12} className="text-emerald-400 shrink-0" />
                      <span>Requires Name, Email & Password</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check size={12} className="text-emerald-400 shrink-0" />
                      <span>Persistent private storage</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 group-hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
                >
                  <span>Select Real Mode</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              {/* DEMO MODE CARD */}
              <div 
                onClick={handleSelectDemo}
                className="group p-5 rounded-2xl bg-slate-900/90 border border-purple-500/30 hover:border-purple-400 cursor-pointer transition-all hover:scale-[1.02] shadow-lg flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-cyan-300">
                      <Award size={20} />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800">
                      ⭐ Interactive Showcase
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                      2. Demo Mode (डेमो टूर)
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      Preloaded with 3 days of rich historical data (Nov 1-3). Instant 1-click test triggers for evaluators.
                    </p>
                  </div>

                  <ul className="text-[10px] text-slate-300 space-y-1.5 pt-1">
                    <li className="flex items-center gap-1.5">
                      <Check size={12} className="text-cyan-400 shrink-0" />
                      <span>Preloaded Nov 1-3 (Coding, Gym, Expenses)</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check size={12} className="text-cyan-400 shrink-0" />
                      <span>1-Click test for Wakeup & 10 PM night</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check size={12} className="text-cyan-400 shrink-0" />
                      <span>Instant evaluation with zero setup</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  className="w-full py-2.5 px-3 rounded-xl bg-purple-600 group-hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
                >
                  <span>Select Demo Tour</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: REGISTRATION FORM FOR REAL MODE */}
        {step === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="pt-5 space-y-3.5">
            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-semibold text-center">
                {errorMsg}
              </div>
            )}

            {/* 1. Name */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                <User size={13} className="text-cyan-400" />
                <span>Full Name (नाम):</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Shubham"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-medium"
                required
                autoFocus
              />
            </div>

            {/* 2. Gmail / Email */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                <Mail size={13} className="text-cyan-400" />
                <span>Gmail / Email (ईमेल):</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. shubham@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-medium"
                required
              />
            </div>

            {/* 3. Password */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                <Lock size={13} className="text-cyan-400" />
                <span>Password (पासवर्ड):</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create your secure password"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* 4. Date of Birth */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                <Calendar size={13} className="text-cyan-400" />
                <span>Date of Birth (जन्म तिथि):</span>
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-medium"
                required
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setStep('choose')}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <ArrowLeft size={13} />
                <span>Back</span>
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg transition-all"
              >
                <span>Launch My Personal Assistant 🚀</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: CONFIRMATION FOR DEMO MODE */}
        {step === 'demo_confirm' && (
          <form onSubmit={handleDemoSubmit} className="pt-5 space-y-4">
            <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-xs text-slate-300 space-y-2">
              <div className="flex items-center gap-2 text-cyan-300 font-bold">
                <Award size={16} />
                <span>Demo Showcase Ready</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                You will enter with 3 full days of historical records (Nov 1-3). You can test the 6:00 AM wakeup loop, 10 PM night routine, habit analysis, and date queries instantly.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                <User size={13} className="text-cyan-400" />
                <span>Your Name (नाम):</span>
              </label>
              <input
                type="text"
                value={demoName}
                onChange={(e) => setDemoName(e.target.value)}
                placeholder="e.g. Shubham"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-medium"
                required
              />
              <span className="text-[10px] text-slate-500">
                Default is "Shubham", but you can enter any name for the demo tour.
              </span>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setStep('choose')}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <ArrowLeft size={13} />
                <span>Back</span>
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg transition-all"
              >
                <span>Enter Demo Showcase ⭐</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
