import React, { useState, useEffect } from 'react';
import { useSimple } from './context/SimpleContext';
import { useVoiceRecognition } from './hooks/useVoiceRecognition';
import { LanguageMode } from './hooks/useVoiceSpeaker';
import { AddEntryModal } from './components/AddEntryModal';
import { ApiSettingsModal } from './components/ApiSettingsModal';
import { EditRoutineModal } from './components/EditRoutineModal';
import { DemoShowcaseBar } from './components/DemoShowcaseBar';
import { DailyHabitCard } from './components/DailyHabitCard';
import { NameEditModal } from './components/NameEditModal';
import { ModeSelectionModal } from './components/ModeSelectionModal';
import { 
  Mic, 
  Volume2, 
  VolumeX, 
  Calendar, 
  Clock, 
  Sun, 
  Moon,
  Flame, 
  CheckCircle2, 
  Circle, 
  Headphones, 
  Brain, 
  Trash2, 
  Send, 
  RotateCcw, 
  Sparkles, 
  Play,
  Languages,
  Plus,
  Key,
  Sliders,
  AlertTriangle,
  User,
  ShieldCheck,
  Award
} from 'lucide-react';

export const SimpleApp: React.FC = () => {
  const {
    mode,
    setMode,
    userName,
    setUserName,
    language,
    setLanguage,
    strictCoachMode,
    setStrictCoachMode,
    isDemoMode,
    setIsDemoMode,
    backendOnline,
    todayRecords,
    yesterdayRecords,
    allRecords,
    routineTasks,
    selectedDate,
    setSelectedDate,
    addActivity,
    askDateMemory,
    triggerGoodMorning,
    triggerWakeupLoopStep,
    acknowledgeGoodMorning,
    triggerGoodNight,
    triggerStrictCheck,
    triggerScheduleAudit6to6,
    triggerHabitAnalysis,
    triggerStudyRoutineReminder,
    toggleRoutineTask,
    deleteRecord,
    clearTodayRecords,
    resetDemoData,
    speakAudio,
    isAudioPlaying,
    elevenLabsApiKey,
    groqApiKey
  } = useSimple();

  const [textInput, setTextInput] = useState('');
  const [activeDateTab, setActiveDateTab] = useState<'today' | 'yesterday' | 'all'>('today');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [isRoutineModalOpen, setIsRoutineModalOpen] = useState(false);
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [isModeModalOpen, setIsModeModalOpen] = useState(() => {
    return !localStorage.getItem('yaadbuddy_mode_selected');
  });

  const [aiLastSpeech, setAiLastSpeech] = useState<string>(() => {
    if (language === 'hi') {
      return `नमस्ते ${userName}! मैं यादबडी (YaadBuddy) AI हूँ। बोलिए आपने कितने बजे क्या काम किया, मैं तुरंत सेव करूँगा!`;
    } else if (language === 'en') {
      return `Hello ${userName}! I am YaadBuddy AI. Tell me what you did and at what time, I will remember it!`;
    }
    return `Namaste ${userName}! Main hoon YaadBuddy AI. Boliye aapne kitne baje kya kaam kiya, main save karunga!`;
  });

  // Digital Clock
  const [nowTime, setNowTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNowTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Web Speech Recognition
  const recognitionLang = language === 'hi' ? 'hi-IN' : language === 'en' ? 'en-US' : 'en-IN';
  const {
    isListening,
    interimTranscript,
    startListening,
    stopListening,
    error: micError
  } = useVoiceRecognition({
    language: recognitionLang,
    groqApiKey,
    onResult: (res, isFinal) => {
      if (isFinal && res.trim()) {
        handleUserSpeech(res);
      }
    }
  });

  const handleUserSpeech = async (speechText: string) => {
    const lower = speechText.toLowerCase().trim();

    // 1. Good Morning trigger & Wakeup loop acknowledgement
    if (
      lower.includes('good morning') || 
      lower.includes('सुप्रभात') || 
      lower.includes('शुभ प्रभात') || 
      lower.includes('subah') || 
      lower.includes('namaste') ||
      lower.includes('नमस्ते')
    ) {
      await acknowledgeGoodMorning();
      const speech = await triggerGoodMorning(false);
      setAiLastSpeech(speech);
      return;
    }

    // 2. Good Night trigger (10:00 PM routine check)
    if (
      lower.includes('good night') || 
      lower.includes('शुभ रात्रि') || 
      lower.includes('shubh ratri') || 
      lower.includes('so raha') || 
      lower.includes('sone ja raha') || 
      lower.includes('so rha') || 
      lower.includes('sleep')
    ) {
      const speech = await triggerGoodNight(true);
      setAiLastSpeech(speech);
      return;
    }

    // 3. Afternoon Greeting
    if (
      lower.includes('good afternoon') ||
      lower.includes('shubh dopahar') ||
      lower.includes('शुभ दोपहर') ||
      lower.includes('dopahar')
    ) {
      const greet = language === 'hi'
        ? `शुभ दोपहर ${userName}! आशा है आपका लंच अच्छा रहा और दोपहर का काम बढ़िया चल रहा है!`
        : `Good afternoon ${userName}! Hope your lunch went well and your afternoon work is on track!`;
      setAiLastSpeech(greet);
      speakAudio(greet);
      return;
    }

    // 4. Evening Greeting
    if (
      lower.includes('good evening') ||
      lower.includes('shubh sandhya') ||
      lower.includes('शुभ संध्या') ||
      lower.includes('shaam')
    ) {
      const greet = language === 'hi'
        ? `शुभ संध्या ${userName}! शाम हो गई है, 5:00 PM वाला वर्कआउट या जिम याद है ना?`
        : `Good evening ${userName}! It's evening time—remember your 5:00 PM workout routine!`;
      setAiLastSpeech(greet);
      speakAudio(greet);
      return;
    }

    // 5. Daily Habit Pattern Audit trigger
    if (
      lower.includes('habit') ||
      lower.includes('आदत') ||
      lower.includes('aadat') ||
      lower.includes('pattern') ||
      lower.includes('roz kya karta hu') ||
      lower.includes('रोज क्या करता')
    ) {
      const speech = await triggerHabitAnalysis();
      setAiLastSpeech(speech);
      return;
    }

    // 6. 6 AM to 6 PM Schedule Audit
    if (
      lower.includes('6 to 6') ||
      lower.includes('6 baje se') ||
      lower.includes('schedule') ||
      lower.includes('routine audit') ||
      lower.includes('रूटीन')
    ) {
      const speech = await triggerScheduleAudit6to6();
      setAiLastSpeech(speech);
      return;
    }

    // 6b. Study / Padhai Routine Proactive Reminder
    if (
      lower.includes('padhai') ||
      lower.includes('पढ़ाई') ||
      lower.includes('study') ||
      lower.includes('coding reminder')
    ) {
      const speech = await triggerStudyRoutineReminder();
      setAiLastSpeech(speech);
      return;
    }

    // 7. Strict Check / Tokne wala check
    if (
      lower.includes('tokne') || 
      lower.includes('टोकने') || 
      lower.includes('scold') || 
      lower.includes('kya nahi kiya') || 
      lower.includes('audit') ||
      lower.includes('क्या नहीं किया')
    ) {
      const speech = await triggerStrictCheck();
      setAiLastSpeech(speech);
      return;
    }

    // 8. Remember Mode query (Past date)
    if (
      mode === 'remember' || 
      lower.includes('kya kiya tha') || 
      lower.includes('क्या किया था') || 
      lower.includes('tarikh') || 
      lower.includes('तारीख') || 
      (lower.includes('kal') && lower.includes('kya'))
    ) {
      let targetDate = selectedDate;
      if (lower.includes('kal') || lower.includes('कल') || lower.includes('yesterday')) {
        targetDate = '2026-11-02';
        setSelectedDate('2026-11-02');
      } else if (lower.includes('3 november') || lower.includes('nov 3') || lower.includes('3 nov') || lower.includes('3 नवंबर')) {
        targetDate = '2026-11-03';
        setSelectedDate('2026-11-03');
      } else if (lower.includes('2 november') || lower.includes('nov 2') || lower.includes('2 नवंबर')) {
        targetDate = '2026-11-02';
        setSelectedDate('2026-11-02');
      } else if (lower.includes('1 november') || lower.includes('nov 1') || lower.includes('1 नवंबर')) {
        targetDate = '2026-11-01';
        setSelectedDate('2026-11-01');
      }

      const res = await askDateMemory(targetDate);
      setAiLastSpeech(res.speech);
      return;
    }

    // 9. Hear Me Mode: User shares activity (e.g. "Maine 9 baje 5 Java questions solve kiye" or "Kal maine 5 baje...")
    const result = await addActivity(speechText);
    setAiLastSpeech(result.aiSpeech);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    const t = textInput;
    setTextInput('');
    handleUserSpeech(t);
  };

  const handleLanguageChange = (newLang: LanguageMode) => {
    setLanguage(newLang);
    let sampleGreet = "";
    if (newLang === 'hi') {
      sampleGreet = `नमस्ते ${userName}! अब आप शुद्ध हिंदी में बोल सकते हैं। आवाज़ पूरी तरह हिंदी में आएगी!`;
    } else if (newLang === 'en') {
      sampleGreet = `Hello ${userName}! English mode is active. Speak your routine or activities!`;
    } else {
      sampleGreet = `Namaste ${userName}! Hinglish mode active ho gaya hai. Aap natural boliye!`;
    }
    setAiLastSpeech(sampleGreet);
    speakAudio(sampleGreet);
  };

  // Sample prompt chips
  const samplePrompts = {
    hi: [
      "मैंने 9 बजे 5 जावा प्रश्न हल किए",
      "कल मैंने शाम 5 बजे 10 जावा प्रश्न हल किए",
      "मेरी आदतें बताओ (Habits)",
      "Good night AI 🌙",
      "मैंने 1:30 बजे राहुल के साथ लंच किया और ₹250 खर्च किए"
    ],
    hinglish: [
      "Maine 9 baje 5 Java questions solve kiye",
      "Kal maine shaam 5 baje 10 Java questions solve kiye",
      "Meri daily habits batao",
      "Good night AI 🌙",
      "Maine 1:30 baje Rahul ke saath lunch kiya aur ₹250 kharch kiye"
    ],
    en: [
      "I solved 5 Java problems at 9 AM",
      "Yesterday at 5 PM I solved 10 Java problems",
      "Analyze my daily habits",
      "Good night AI 🌙",
      "Had lunch with Rahul at 1:30 PM and spent 250 rupees"
    ]
  };

  const sampleDates = [
    { label: language === 'hi' ? "आज (3 Nov)" : "Today (Nov 3)", date: "2026-11-03" },
    { label: language === 'hi' ? "कल (2 Nov)" : "Yesterday (Nov 2)", date: "2026-11-02" },
    { label: "1 November", date: "2026-11-01" },
  ];

  // Activities filtered for view
  const displayedRecords = activeDateTab === 'today'
    ? todayRecords
    : activeDateTab === 'yesterday'
    ? yesterdayRecords
    : allRecords;

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col font-sans antialiased selection:bg-purple-600 selection:text-white">
      {/* 1. TOP HEADER */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#0C1222]/90 backdrop-blur-xl px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Logo & User Name */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-purple-600/30">
              <Sparkles size={16} className="text-cyan-300" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-white tracking-tight font-display">
                YaadBuddy <span className="text-cyan-400 font-normal text-xs">{language === 'hi' ? 'याद दोस्त' : 'AI'}</span>
              </h1>
              <p className="text-[10px] text-slate-400">
                {language === 'hi' ? 'दैनिक रूटीन और याददाश्त सहायक' : 'Daily Routine & Memory Assistant'}
              </p>
            </div>
          </div>

          {/* User Name Pill */}
          <button
            onClick={() => setIsNameModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-950/70 border border-purple-800/70 text-purple-200 hover:text-white hover:border-purple-500/70 text-xs font-semibold transition-all group"
            title={language === 'hi' ? 'नाम बदलें' : 'Change user name'}
          >
            <User size={13} className="text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-white">{userName}</span>
            <span className="text-[10px] text-purple-400 font-normal">({language === 'hi' ? 'बदलें' : 'Edit'})</span>
          </button>

          {/* Mode Switcher (Real vs Demo) */}
          <button
            onClick={() => setIsModeModalOpen(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-bold transition-all shadow-sm ${
              isDemoMode
                ? 'bg-purple-950/80 border-purple-600/70 text-purple-200 hover:border-purple-400'
                : 'bg-emerald-950/80 border-emerald-600/70 text-emerald-200 hover:border-emerald-400'
            }`}
            title="Click to switch between Real Mode and Demo Tour"
          >
            {isDemoMode ? <Award size={13} className="text-cyan-300" /> : <ShieldCheck size={13} className="text-emerald-400" />}
            <span>{isDemoMode ? '⭐ Demo Mode' : '🟢 Real Mode'}</span>
            <span className="text-[10px] text-slate-400 font-normal">({language === 'hi' ? 'मोड' : 'Switch'})</span>
          </button>
        </div>

        {/* Right Controls: Language Selector + Tokne Mode + API */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Language Selector Pills */}
          <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
            <Languages size={13} className="text-slate-400 ml-1.5 mr-1" />
            <button
              onClick={() => handleLanguageChange('hi')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                language === 'hi'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="शुद्ध हिंदी आवाज और पहचान (Devanagari)"
            >
              🇮🇳 हिंदी
            </button>
            <button
              onClick={() => handleLanguageChange('hinglish')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                language === 'hinglish'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Natural Hinglish style"
            >
              Hinglish
            </button>
            <button
              onClick={() => handleLanguageChange('en')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                language === 'en'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="English"
            >
              English
            </button>
          </div>

          {/* Tokne Wala Mode (Strict Coach) Switch */}
          <button
            onClick={() => {
              const next = !strictCoachMode;
              setStrictCoachMode(next);
              const msg = next 
                ? (language === 'hi' ? "टोकने वाला मोड चालू हो गया है! अब लेट उठे या काम छोड़ा तो डाँट पड़ेगी!" : "Tokne wala mode ON ho gaya!")
                : (language === 'hi' ? "टोकने वाला मोड बंद हो गया है।" : "Tokne wala mode OFF ho gaya.");
              setAiLastSpeech(msg);
              speakAudio(msg);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
              strictCoachMode
                ? 'bg-rose-950/80 text-rose-300 border border-rose-700/80 ring-1 ring-rose-500/50'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <Flame size={14} className={strictCoachMode ? 'text-amber-400 animate-pulse' : ''} />
            <span>{language === 'hi' ? 'टोकने वाला मोड' : 'Tokne Mode'}: {strictCoachMode ? 'ON 🔥' : 'OFF'}</span>
          </button>

          {/* Backend Status Badge */}
          <div 
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-mono"
            title={backendOnline ? "Node.js Express Backend is connected" : "Connecting to backend server..."}
          >
            <span className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className={backendOnline ? 'text-emerald-300 font-bold' : 'text-slate-400'}>
              {backendOnline ? 'Backend API' : 'Local'}
            </span>
          </div>

          {/* API Settings Button */}
          <button
            onClick={() => setIsApiModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 text-slate-300 hover:text-white text-xs font-semibold"
            title="Configure Groq Llama-3 & ElevenLabs Voice APIs"
          >
            <Key size={13} className={elevenLabsApiKey || groqApiKey ? 'text-emerald-400' : 'text-slate-400'} />
            <span className="hidden sm:inline">APIs</span>
          </button>

          {/* Clock */}
          <div className="hidden md:flex items-center gap-1 text-xs text-slate-400 font-mono bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
            <Clock size={12} className="text-cyan-400" />
            <span>{nowTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </header>

      {/* 2. BODY CONTENT (Optimized Full-Width Windows + Mobile Responsive) */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 space-y-4 flex-1">
        {/* Demo Showcase Tour Bar */}
        <DemoShowcaseBar />

        {/* Morning Greeting & Late Wakeup Ribbon */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/20 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Sun size={15} className="text-amber-400 animate-spin" style={{ animationDuration: '14s' }} />
              <span className="font-bold text-slate-200">
                {language === 'hi' ? '6:00 AM मॉर्निंग रूटीन पार्टनर' : 'Daily 6:00 AM Morning Routine Partner'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {language === 'hi'
                ? '6:00 AM वॉक • 9:00 AM कोडिंग • 1:00 PM लंच • 5:00 PM जिम'
                : '6:00 AM Walk • 9:00 AM Coding • 1:00 PM Lunch • 5:00 PM Gym'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Standard Good Morning */}
            <button
              onClick={async () => {
                const s = await triggerGoodMorning(false);
                setAiLastSpeech(s);
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold transition-all text-xs"
            >
              <span>{language === 'hi' ? 'गुड मॉर्निंग AI 🌅' : 'Good Morning AI 🌅'}</span>
            </button>

            {/* Simulated 7:00 AM Late Wakeup Button */}
            {strictCoachMode && (
              <button
                onClick={async () => {
                  const s = await triggerGoodMorning(true);
                  setAiLastSpeech(s);
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-700/60 font-bold transition-all text-xs"
                title="Simulate 7:00 AM late wakeup to hear the scold"
              >
                <AlertTriangle size={12} className="text-amber-400" />
                <span>{language === 'hi' ? 'टेस्ट 7 AM लेट उठना' : 'Test 7 AM Late Wakeup'}</span>
              </button>
            )}

            {/* Audit Button */}
            {strictCoachMode && (
              <button
                onClick={async () => {
                  const s = await triggerStrictCheck();
                  setAiLastSpeech(s);
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold transition-all text-xs"
              >
                <Flame size={12} className="text-rose-400" />
                <span>{language === 'hi' ? 'ऑडिट करो' : 'Audit Me'}</span>
              </button>
            )}
          </div>
        </div>

        {/* 2-Column Responsive Windows Layout (Fills Browser Space Beautifully, Stacks on Mobile) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT COLUMN: Voice & Input Hub (5 Cols on Desktop) */}
          <div className="lg:col-span-5 space-y-4">
            {/* The 2 Primary Clean Modes Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-900/80 border border-slate-800">
              <button
                onClick={() => setMode('hear')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  mode === 'hear'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Headphones size={15} className={mode === 'hear' ? 'text-cyan-300' : ''} />
                <span>{language === 'hi' ? '1. सुनो मुझे (काम जोड़ें)' : '1. HEAR ME (Add Task)'}</span>
              </button>

              <button
                onClick={() => setMode('remember')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  mode === 'remember'
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Brain size={15} className={mode === 'remember' ? 'text-yellow-300' : ''} />
                <span>{language === 'hi' ? '2. याद दिलाओ (पिछला)' : '2. REMEMBER (Past)'}</span>
              </button>
            </div>

            {/* Central Voice & Input Zone */}
            <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 flex flex-col items-center justify-center text-center space-y-4 shadow-xl">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">
                  {mode === 'hear' 
                    ? (language === 'hi' ? 'आज या कल का काम बोलें' : 'Speak Today or Yesterday\'s Activity')
                    : (language === 'hi' ? 'तारीख का हिसाब पूछें' : 'Query Past Memories')}
                </span>
                <h2 className="text-sm sm:text-base font-bold text-white font-display">
                  {mode === 'hear'
                    ? (language === 'hi' ? 'बोलिए: "मैंने 9 बजे..." या "कल मैंने शाम 5 बजे..."' : 'Say: "I did coding at 9:30 AM" or "Yesterday at 5 PM..."')
                    : (language === 'hi' ? 'पूछिए: "मैंने 3 नवंबर को क्या किया था?"' : 'Ask: "What did I do on November 2?"')}
                </h2>
              </div>

              {/* Big Sleek Mic Button */}
              <button
                onClick={() => {
                  if (isListening) stopListening();
                  else startListening();
                }}
                className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex flex-col items-center justify-center cursor-pointer transition-all duration-300 active:scale-95 shadow-xl ${
                  isListening
                    ? 'bg-gradient-to-tr from-cyan-500 to-purple-600 animate-pulse ring-8 ring-cyan-500/20'
                    : 'bg-gradient-to-tr from-purple-600 to-indigo-600 hover:scale-105'
                }`}
              >
                <Mic size={32} className="text-white" />
                <span className="text-[10px] font-bold text-white/90 mt-1 uppercase">
                  {isListening ? (language === 'hi' ? 'सुन रहा हूँ...' : 'Listening...') : (language === 'hi' ? 'माइक दबाएँ' : 'Tap & Speak')}
                </span>
              </button>

              {/* Listening Transcript Feedback */}
              <div className="min-h-[22px]">
                {isListening ? (
                  <p className="text-xs font-semibold text-cyan-300 animate-pulse">
                    🎙️ {language === 'hi' ? 'सुन रहा हूँ...' : 'Listening...'} {interimTranscript ? `"${interimTranscript}"` : ''}
                  </p>
                ) : (
                  <p className="text-xs text-slate-400">
                    {language === 'hi' 
                      ? 'माइक से बोलें या नीचे टेक्स्ट में लिखें' 
                      : 'Speak into mic or type in the input box'}
                  </p>
                )}
                {micError && <p className="text-xs text-rose-400 mt-1">{micError}</p>}
              </div>

              {/* Quick Clickable Chips in Active Language */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 w-full">
                {mode === 'hear' ? (
                  samplePrompts[language].map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleUserSpeech(prompt)}
                      className="text-[11px] px-2.5 py-1 rounded-xl bg-slate-950 hover:bg-purple-950/60 border border-slate-800 hover:border-purple-500/40 text-slate-300 hover:text-white transition-all text-left truncate max-w-[260px]"
                    >
                      "{prompt}"
                    </button>
                  ))
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    {sampleDates.map(d => (
                      <button
                        key={d.date}
                        onClick={async () => {
                          setSelectedDate(d.date);
                          const res = await askDateMemory(d.date);
                          setAiLastSpeech(res.speech);
                        }}
                        className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all ${
                          selectedDate === d.date
                            ? 'bg-cyan-600 text-white shadow-md'
                            : 'bg-slate-950 text-slate-300 border border-slate-800'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Text Input Bar with Manual Add Button */}
              <div className="flex items-center gap-2 w-full pt-1">
                <form onSubmit={handleFormSubmit} className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder={
                      mode === 'hear'
                        ? (language === 'hi' ? 'लिखिए: मैंने 10 बजे कोडिंग की, कल 5 बजे जिम...' : 'Type: I coded at 10 AM, gym yesterday at 5 PM...')
                        : (language === 'hi' ? 'लिखिए: मैंने 3 नवंबर को क्या किया था?...' : 'Type: What did I do on Nov 3?...')
                    }
                    className="flex-1 px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="submit"
                    disabled={!textInput.trim()}
                    className="px-3.5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold text-xs shadow-md shrink-0 flex items-center gap-1"
                  >
                    <Send size={13} />
                    <span>{language === 'hi' ? 'सेव' : 'Send'}</span>
                  </button>
                </form>

                {/* Manual Add Modal Button */}
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-3 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-bold shrink-0 flex items-center gap-1"
                  title="Add activity manually with date picker"
                >
                  <Plus size={14} />
                  <span>{language === 'hi' ? 'मैन्युअल' : 'Add'}</span>
                </button>
              </div>
            </div>

            {/* AI Voice Output Speech Bubble */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-purple-500/30 flex items-start gap-3 shadow-md">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center text-white shrink-0 mt-0.5">
                <Volume2 size={16} className={isAudioPlaying ? 'animate-bounce' : ''} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wide">
                    {language === 'hi' ? 'यादबडी आवाज़ (AI Voice)' : 'YaadBuddy Response'}
                  </span>
                  <button
                    onClick={() => speakAudio(aiLastSpeech)}
                    className="flex items-center gap-1 text-[11px] font-bold text-cyan-300 hover:text-cyan-200"
                  >
                    <Play size={11} />
                    <span>{language === 'hi' ? 'फिर से सुनें 🔊' : 'Replay 🔊'}</span>
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed">
                  "{aiLastSpeech}"
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Habits, Records & Routine (7 Cols on Desktop) */}
          <div className="lg:col-span-7 space-y-4">
            {/* AI Auto-Detected Daily Habits Pattern Widget */}
            <DailyHabitCard />

            {/* 3. SAVED RECORDS FEED & DAILY ROUTINE (2-Column Grid on Desktop) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Saved Records List */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  {/* Date Filter Tabs (Today vs Yesterday vs All) */}
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
                    <button
                      onClick={() => setActiveDateTab('today')}
                      className={`px-2 py-0.5 rounded-lg font-bold ${activeDateTab === 'today' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}
                    >
                      {language === 'hi' ? 'आज (Today)' : 'Today'}
                    </button>
                    <button
                      onClick={() => setActiveDateTab('yesterday')}
                      className={`px-2 py-0.5 rounded-lg font-bold ${activeDateTab === 'yesterday' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}
                    >
                      {language === 'hi' ? 'कल (Yesterday)' : 'Yesterday'}
                    </button>
                    <button
                      onClick={() => setActiveDateTab('all')}
                      className={`px-2 py-0.5 rounded-lg font-bold ${activeDateTab === 'all' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}
                    >
                      {language === 'hi' ? 'सभी' : 'All'}
                    </button>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400">
                    {displayedRecords.length} records
                  </span>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
                  {displayedRecords.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-500">
                      {language === 'hi' ? 'कोई रिकॉर्ड नहीं है। बोलिए: "मैंने 9 बजे यह काम किया"' : 'No records yet. Say: "I coded at 9 AM"'}
                    </div>
                  ) : (
                    displayedRecords.map(rec => (
                      <div
                        key={rec.id}
                        className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="flex flex-col items-start">
                            <span className="px-2 py-0.5 rounded-md bg-purple-950 text-purple-300 font-mono font-bold text-[10px] border border-purple-800/50">
                              {rec.time}
                            </span>
                            {activeDateTab === 'all' && (
                              <span className="text-[9px] text-slate-500 mt-0.5">{rec.date}</span>
                            )}
                          </div>
                          <span className="text-slate-100 font-medium">{rec.description}</span>
                        </div>

                        <button
                          onClick={() => deleteRecord(rec.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 border-t border-slate-800/60">
                  <button onClick={resetDemoData} className="hover:text-purple-300">
                    {language === 'hi' ? 'सैंपल डेटा रीसेट (Nov 1-3)' : 'Reset Demo Records'}
                  </button>
                  <button onClick={clearTodayRecords} className="hover:text-rose-400">
                    {language === 'hi' ? 'आज का साफ़ करें' : 'Clear Today'}
                  </button>
                </div>
              </div>

              {/* Daily Work Routine Schedule */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sun size={13} className="text-amber-400" />
                    <span>{language === 'hi' ? 'दैनिक रूटीन (Schedule)' : 'Daily Routine Schedule'}</span>
                  </span>
                  <button
                    onClick={() => setIsRoutineModalOpen(true)}
                    className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    <Sliders size={11} />
                    <span>{language === 'hi' ? 'समय बदलें' : 'Edit Times'}</span>
                  </button>
                </div>

                <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
                  {routineTasks.map(t => (
                    <div
                      key={t.id}
                      onClick={() => toggleRoutineTask(t.id)}
                      className={`p-2 rounded-xl border cursor-pointer flex items-center justify-between text-xs transition-colors ${
                        t.completed
                          ? 'bg-emerald-950/20 border-emerald-800/30 text-emerald-200'
                          : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {t.completed ? (
                          <CheckCircle2 size={15} className="text-emerald-400" />
                        ) : (
                          <Circle size={15} className="text-slate-600" />
                        )}
                        <span className={t.completed ? 'line-through text-slate-400' : 'text-slate-200 font-medium'}>
                          {t.title}
                        </span>
                      </div>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        t.completed ? 'bg-emerald-900/50 text-emerald-300' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {t.completed ? (language === 'hi' ? 'हो गया' : 'Done') : (language === 'hi' ? 'बाकी' : 'Pending')}
                      </span>
                    </div>
                  ))}
                </div>

                {strictCoachMode && (
                  <p className="text-[10px] text-rose-300 pt-1">
                    {language === 'hi' 
                      ? '🔥 टोकने वाला मोड: 6 AM वॉक, 9 AM कोडिंग, 5 PM जिम पर नज़र रखता है।' 
                      : '🔥 Strict Mode: Monitors 6 AM walk, 9 AM code, 5 PM workout.'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <AddEntryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <ApiSettingsModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
      />

      <EditRoutineModal
        isOpen={isRoutineModalOpen}
        onClose={() => setIsRoutineModalOpen(false)}
      />

      <NameEditModal
        isOpen={isNameModalOpen}
        onClose={() => setIsNameModalOpen(false)}
      />

      <ModeSelectionModal
        isOpen={isModeModalOpen}
        onClose={() => setIsModeModalOpen(false)}
      />
    </div>
  );
};
