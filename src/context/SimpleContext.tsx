import React, { createContext, useContext, useState, useEffect } from 'react';
import { ActivityRecord, RoutineTask, AppMode, ChatLog, DetectedHabit, UserProfile } from '../types';
import { 
  extractTimeAndActivity, 
  processMorningGreeting, 
  generateStrictTok, 
  retrieveDateActivities,
  getTodayDateISO,
  getYesterdayDateISO,
  getWakeupNudge,
  getGoodNightMessage,
  analyzeDailyHabits,
  checkTimeSensitiveMissingRoutine
} from '../services/simpleEngine';
import { LanguageMode, useVoiceSpeaker } from '../hooks/useVoiceSpeaker';
import { 
  generateElevenLabsSpeech, 
  callGroqChat, 
  saveBackendMemory, 
  deleteBackendMemory, 
  resetBackendDemoMemories, 
  checkBackendHealth 
} from '../services/apiClients';
import { RICH_DEMO_RECORDS } from '../data/demoData';

interface SimpleContextType {
  mode: AppMode;
  setMode: (m: AppMode) => void;
  userName: string;
  setUserName: (name: string) => void;
  userProfile: UserProfile;
  setUserProfile: (p: UserProfile) => void;
  language: LanguageMode;
  setLanguage: (lang: LanguageMode) => void;
  strictCoachMode: boolean;
  setStrictCoachMode: (enabled: boolean) => void;
  isDemoMode: boolean;
  setIsDemoMode: (enabled: boolean) => void;
  backendOnline: boolean;
  groqApiKey: string;
  setGroqApiKey: (k: string) => void;
  elevenLabsApiKey: string;
  setElevenLabsApiKey: (k: string) => void;
  todayRecords: ActivityRecord[];
  yesterdayRecords: ActivityRecord[];
  allRecords: ActivityRecord[];
  routineTasks: RoutineTask[];
  detectedHabits: DetectedHabit[];
  selectedDate: string;
  setSelectedDate: (d: string) => void;
  chatLogs: ChatLog[];
  wakeupStage: number;
  hasRepliedGoodMorning: boolean;
  addActivity: (rawText: string, customDate?: string, customTime?: string) => Promise<{ targetDate: string; timeStr: string; activityStr: string; aiSpeech: string }>;
  askDateMemory: (dateStr: string) => Promise<{ speech: string; records: ActivityRecord[] }>;
  triggerGoodMorning: (simulatedLate?: boolean) => Promise<string>;
  triggerWakeupLoopStep: () => Promise<string>;
  acknowledgeGoodMorning: () => Promise<string>;
  triggerGoodNight: (hasResponded?: boolean) => Promise<string>;
  triggerStrictCheck: () => Promise<string>;
  triggerScheduleAudit6to6: () => Promise<string>;
  triggerHabitAnalysis: () => Promise<string>;
  triggerStudyRoutineReminder: () => Promise<string>;
  toggleRoutineTask: (id: string) => void;
  updateRoutineTaskTime: (id: string, newTimeSlot: string) => void;
  deleteRecord: (id: string) => void;
  clearTodayRecords: () => void;
  resetDemoData: () => void;
  speakAudio: (text: string) => Promise<void>;
  isAudioPlaying: boolean;
}

const SimpleContext = createContext<SimpleContextType | undefined>(undefined);

const DEFAULT_ROUTINE: RoutineTask[] = [
  { id: 'r1', timeSlot: '06:00 AM - 07:00 AM', title: '6:00 AM — Subah Uthna & Morning Walk', category: 'Morning', completed: true },
  { id: 'r2', timeSlot: '09:00 AM - 01:00 PM', title: '9:00 AM to 1:00 PM — Coding & Problem Solving', category: 'Coding', completed: true },
  { id: 'r3', timeSlot: '01:00 PM - 02:00 PM', title: '1:00 PM — Lunch & Rest Break', category: 'Food', completed: true },
  { id: 'r4', timeSlot: '05:00 PM - 06:00 PM', title: '5:00 PM — Evening Workout / Gym', category: 'Fitness', completed: false },
  { id: 'r5', timeSlot: '09:00 PM - 10:00 PM', title: '9:00 PM — Daily Review & Log', category: 'Review', completed: false },
];

export const SimpleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<AppMode>('hear');
  const [userName, setUserNameState] = useState<string>(() => {
    return localStorage.getItem('yaadbuddy_user_name') || 'Shubham';
  });

  const [userProfile, setUserProfileState] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('yaadbuddy_user_profile');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      name: localStorage.getItem('yaadbuddy_user_name') || 'Shubham',
      email: localStorage.getItem('yaadbuddy_user_email') || '',
      dob: localStorage.getItem('yaadbuddy_user_dob') || '',
      isRegistered: !!localStorage.getItem('yaadbuddy_user_email')
    };
  });

  const setUserProfile = (p: UserProfile) => {
    setUserProfileState(p);
    setUserNameState(p.name);
    try {
      localStorage.setItem('yaadbuddy_user_profile', JSON.stringify(p));
      localStorage.setItem('yaadbuddy_user_name', p.name);
      localStorage.setItem('yaadbuddy_user_email', p.email);
      localStorage.setItem('yaadbuddy_user_dob', p.dob);
    } catch {}
  };

  const [language, setLanguageState] = useState<LanguageMode>(() => {
    try {
      const saved = localStorage.getItem('yaadbuddy_language');
      if (saved === 'hi' || saved === 'hinglish' || saved === 'en') return saved;
    } catch {}
    return 'en';
  });

  const [strictCoachMode, setStrictCoachModeState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('yaadbuddy_strict_mode');
      return saved === 'true';
    } catch {
      return true;
    }
  });

  const [isDemoMode, setIsDemoModeState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('yaadbuddy_is_demo_mode');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const [groqApiKey, setGroqApiKeyState] = useState<string>(() => {
    return localStorage.getItem('yaadbuddy_groq_key') || '';
  });

  const [elevenLabsApiKey, setElevenLabsApiKeyState] = useState<string>(() => {
    return localStorage.getItem('yaadbuddy_elevenlabs_key') || '';
  });

  const [backendOnline, setBackendOnline] = useState<boolean>(false);

  useEffect(() => {
    checkBackendHealth().then(res => {
      setBackendOnline(res.online);
    });
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateISO());
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Persistent Wakeup Loop state (until Shubham says Good Morning)
  const [wakeupStage, setWakeupStage] = useState<number>(1);
  const [hasRepliedGoodMorning, setHasRepliedGoodMorning] = useState<boolean>(false);

  // Separate storage for Demo vs Real records
  const [demoRecords, setDemoRecords] = useState<ActivityRecord[]>(() => {
    try {
      const saved = localStorage.getItem('yaadbuddy_demo_records_v3');
      if (saved) return JSON.parse(saved);
    } catch {}
    return RICH_DEMO_RECORDS;
  });

  const [realUserRecords, setRealUserRecords] = useState<ActivityRecord[]>(() => {
    try {
      const saved = localStorage.getItem('yaadbuddy_real_records_v3');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const allRecords = isDemoMode ? demoRecords : realUserRecords;

  const [routineTasks, setRoutineTasks] = useState<RoutineTask[]>(() => {
    try {
      const saved = localStorage.getItem('yaadbuddy_routine_tasks');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_ROUTINE;
  });

  const detectedHabits = React.useMemo<DetectedHabit[]>(() => {
    return analyzeDailyHabits(allRecords, userName, language).habits;
  }, [allRecords, userName, language]);

  const [chatLogs, setChatLogs] = useState<ChatLog[]>([
    {
      id: 'c-1',
      sender: 'ai',
      text: `नमस्ते ${userName}! मैं यादबडी AI हूँ। बोलिए आपने कितने बजे क्या काम किया, मैं तुरंत सेव करूँगा!`,
      time: '6:00 AM'
    }
  ]);

  const browserSpeaker = useVoiceSpeaker({ language });

  useEffect(() => {
    try {
      localStorage.setItem('yaadbuddy_user_name', userName);
    } catch {}
  }, [userName]);

  useEffect(() => {
    try {
      localStorage.setItem('yaadbuddy_language', language);
    } catch {}
  }, [language]);

  useEffect(() => {
    try {
      localStorage.setItem('yaadbuddy_demo_records_v3', JSON.stringify(demoRecords));
    } catch {}
  }, [demoRecords]);

  useEffect(() => {
    try {
      localStorage.setItem('yaadbuddy_real_records_v3', JSON.stringify(realUserRecords));
    } catch {}
  }, [realUserRecords]);

  useEffect(() => {
    try {
      localStorage.setItem('yaadbuddy_routine_tasks', JSON.stringify(routineTasks));
    } catch {}
  }, [routineTasks]);

  const setUserName = (name: string) => {
    setUserNameState(name);
  };

  const setIsDemoMode = (enabled: boolean) => {
    setIsDemoModeState(enabled);
    localStorage.setItem('yaadbuddy_is_demo_mode', String(enabled));
  };

  const setLanguage = (lang: LanguageMode) => {
    setLanguageState(lang);
  };

  const setStrictCoachMode = (enabled: boolean) => {
    setStrictCoachModeState(enabled);
    localStorage.setItem('yaadbuddy_strict_mode', String(enabled));
  };

  const setGroqApiKey = (k: string) => {
    setGroqApiKeyState(k);
    localStorage.setItem('yaadbuddy_groq_key', k);
  };

  const setElevenLabsApiKey = (k: string) => {
    setElevenLabsApiKeyState(k);
    localStorage.setItem('yaadbuddy_elevenlabs_key', k);
  };

  const todayStr = getTodayDateISO();
  const yesterdayStr = getYesterdayDateISO();

  const todayRecords = allRecords.filter(r => r.date === todayStr);
  const yesterdayRecords = allRecords.filter(r => r.date === yesterdayStr);

  const speakAudio = async (text: string) => {
    setIsAudioPlaying(true);

    if (elevenLabsApiKey.trim()) {
      try {
        const audioUrl = await generateElevenLabsSpeech(text, elevenLabsApiKey, language);
        if (audioUrl) {
          const audio = new Audio(audioUrl);
          audio.onended = () => setIsAudioPlaying(false);
          audio.onerror = () => {
            setIsAudioPlaying(false);
            browserSpeaker.speak(text);
          };
          await audio.play();
          return;
        }
      } catch (e) {
        console.warn('ElevenLabs speech fallback:', e);
      }
    }

    browserSpeaker.speak(text);
    setIsAudioPlaying(false);
  };

  const addActivity = async (rawText: string, customDate?: string, customTime?: string) => {
    const extracted = extractTimeAndActivity(rawText, todayStr);
    const targetDate = customDate || extracted.dateStr;
    const timeStr = customTime || extracted.timeStr;
    const activityStr = extracted.activityStr;
    const category = extracted.category;

    const newRecord: ActivityRecord = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      date: targetDate,
      time: timeStr,
      description: activityStr,
      category,
      createdAt: new Date().toISOString()
    };

    if (isDemoMode) {
      setDemoRecords(prev => [newRecord, ...prev]);
    } else {
      setRealUserRecords(prev => [newRecord, ...prev]);
    }

    // Persist to backend server asynchronously
    saveBackendMemory({
      date: targetDate,
      time: timeStr,
      description: activityStr,
      category
    }).catch(() => {});

    if (targetDate === todayStr) {
      setRoutineTasks(prev => prev.map(t => {
        if (t.category.toLowerCase() === category.toLowerCase()) {
          return { ...t, completed: true };
        }
        return t;
      }));
    }

    let aiSpeech = "";
    const isYesterdayLog = targetDate === yesterdayStr;

    if (language === 'hi') {
      aiSpeech = isYesterdayLog
        ? `नोट कर लिया ${userName}! कल ${timeStr} बजे: ${activityStr} सुरक्षित हो गया है।`
        : `नोट कर लिया ${userName}! ${timeStr} बजे: ${activityStr}। सुरक्षित हो गया है!`;
    } else if (language === 'en') {
      aiSpeech = isYesterdayLog
        ? `Noted for yesterday, ${userName}! At ${timeStr}: ${activityStr}.`
        : `Noted ${userName}! At ${timeStr}: ${activityStr}. Recorded!`;
    } else {
      aiSpeech = isYesterdayLog
        ? `Kal ka record note ho gaya ${userName}! ${timeStr} baje: ${activityStr}. Save kar liya!`
        : `Note ho gaya ${userName}! ${timeStr} baje: ${activityStr}. Save ho gaya!`;
    }

    if (groqApiKey.trim()) {
      try {
        const groqReply = await callGroqChat(
          `User ${userName} logged activity: "${activityStr}" at ${timeStr} on ${targetDate}. Acknowledge personally in 1 friendly sentence in ${language}.`,
          `You are YaadBuddy, personal companion of ${userName}.`,
          groqApiKey
        );
        if (groqReply) aiSpeech = groqReply;
      } catch {}
    }

    setChatLogs(prev => [
      ...prev,
      {
        id: `chat-u-${Date.now()}`,
        sender: 'user',
        text: rawText,
        time: timeStr
      },
      {
        id: `chat-a-${Date.now()}`,
        sender: 'ai',
        text: aiSpeech,
        time: timeStr
      }
    ]);

    await speakAudio(aiSpeech);

    return { targetDate, timeStr, activityStr, aiSpeech };
  };

  const askDateMemory = async (dateStr: string) => {
    const result = retrieveDateActivities(dateStr, allRecords, language);

    setChatLogs(prev => [
      ...prev,
      {
        id: `chat-u-${Date.now()}`,
        sender: 'user',
        text: `${dateStr} ko kya kiya tha?`,
        time: 'Now'
      },
      {
        id: `chat-a-${Date.now()}`,
        sender: 'ai',
        text: result.speech,
        time: 'Now'
      }
    ]);

    await speakAudio(result.speech);

    return result;
  };

  // Persistent Wakeup Nudge Loop (until Shubham says Good Morning)
  const triggerWakeupLoopStep = async () => {
    const speech = getWakeupNudge(userName, wakeupStage, language);
    setWakeupStage(prev => (prev % 3) + 1);

    setChatLogs(prev => [
      ...prev,
      {
        id: `chat-a-${Date.now()}`,
        sender: 'ai',
        text: speech,
        time: '6:00 AM'
      }
    ]);

    await speakAudio(speech);
    return speech;
  };

  const acknowledgeGoodMorning = async () => {
    setHasRepliedGoodMorning(true);
    setWakeupStage(1);

    let speech = "";
    if (language === 'hi') {
      speech = `शाबाश ${userName}! वेरी गुड मॉर्निंग! उठ गए आप। चलिए अब फ्रेश हो जाइए, 6:00 बजे की वॉक और 9:00 बजे की कोडिंग समय पर करनी है!`;
    } else if (language === 'en') {
      speech = `Awesome ${userName}! Very good morning! Great to hear you're awake. Let's start the day with the 6:00 AM walk and 9:00 AM coding on time!`;
    } else {
      speech = `Shaabash ${userName}! Very good morning! Uth gaye aap. Chalo ab fresh ho jao aur 6 AM walk aur 9 AM coding time pe karni hai!`;
    }

    setChatLogs(prev => [
      ...prev,
      {
        id: `chat-u-${Date.now()}`,
        sender: 'user',
        text: `Good morning AI!`,
        time: '6:00 AM'
      },
      {
        id: `chat-a-${Date.now()}`,
        sender: 'ai',
        text: speech,
        time: '6:00 AM'
      }
    ]);

    await speakAudio(speech);
    return speech;
  };

  const triggerGoodMorning = async (simulatedLate = false) => {
    const simulatedHour = simulatedLate ? 7 : undefined;
    const speech = processMorningGreeting(strictCoachMode, language, simulatedHour, userName);

    setChatLogs(prev => [
      ...prev,
      {
        id: `chat-u-${Date.now()}`,
        sender: 'user',
        text: simulatedLate ? `Good morning AI! (7:00 AM Late)` : `Good morning AI!`,
        time: simulatedLate ? '7:00 AM' : '6:00 AM'
      },
      {
        id: `chat-a-${Date.now()}`,
        sender: 'ai',
        text: speech,
        time: simulatedLate ? '7:00 AM' : '6:00 AM'
      }
    ]);

    await speakAudio(speech);
    return speech;
  };

  // 10:00 PM Good Night Routine
  const triggerGoodNight = async (hasResponded = false) => {
    const speech = getGoodNightMessage(userName, hasResponded, language);

    setChatLogs(prev => [
      ...prev,
      {
        id: `chat-u-${Date.now()}`,
        sender: 'user',
        text: hasResponded ? `Good night AI!` : `(10:00 PM Check - No response yet)`,
        time: '10:00 PM'
      },
      {
        id: `chat-a-${Date.now()}`,
        sender: 'ai',
        text: speech,
        time: '10:00 PM'
      }
    ]);

    await speakAudio(speech);
    return speech;
  };

  const triggerStrictCheck = async () => {
    const speech = generateStrictTok(todayRecords, language, userName);

    setChatLogs(prev => [
      ...prev,
      {
        id: `chat-u-${Date.now()}`,
        sender: 'user',
        text: "Tokne wala mode check karo!",
        time: 'Now'
      },
      {
        id: `chat-a-${Date.now()}`,
        sender: 'ai',
        text: speech,
        time: 'Now'
      }
    ]);

    await speakAudio(speech);
    return speech;
  };

  const triggerScheduleAudit6to6 = async () => {
    let auditSpeech = "";
    if (language === 'hi') {
      auditSpeech = `टोकने वाला मोड ऑडिट ${userName}: आपका 6:00 AM से 6:00 PM का रूटीन शेड्यूल—सुबह 6:00 बजे वॉक हो गई, 9:00 बजे कोडिंग पूरी हो गई, 1:00 बजे लंच हो गया। लेकिन शाम 5:00 से 6:00 बजे वाला जिम अभी बाकी है! उसको जल्दी पूरा करो!`;
    } else if (language === 'en') {
      auditSpeech = `Strict Coach Audit ${userName}: Your 6:00 AM to 6:00 PM schedule—6:00 AM walk is done, 9:00 AM coding is done, 1:00 PM lunch is done. But 5:00 PM workout is pending! Complete it on time!`;
    } else {
      auditSpeech = `Tokne wala mode audit ${userName}: 6:00 AM se 6:00 PM routine check—subah walk aur coding complete hai, lekin shaam 5:00 PM wala gym abhi pending hai! Usko jaldi complete karo!`;
    }

    setChatLogs(prev => [
      ...prev,
      {
        id: `chat-u-${Date.now()}`,
        sender: 'user',
        text: "6 AM to 6 PM schedule audit karo!",
        time: 'Now'
      },
      {
        id: `chat-a-${Date.now()}`,
        sender: 'ai',
        text: auditSpeech,
        time: 'Now'
      }
    ]);

    await speakAudio(auditSpeech);
    return auditSpeech;
  };

  // Daily Habit Analysis Trigger
  const triggerHabitAnalysis = async () => {
    const { speech } = analyzeDailyHabits(allRecords, userName, language);

    setChatLogs(prev => [
      ...prev,
      {
        id: `chat-u-${Date.now()}`,
        sender: 'user',
        text: "Meri daily habits analyse karke batao!",
        time: 'Now'
      },
      {
        id: `chat-a-${Date.now()}`,
        sender: 'ai',
        text: speech,
        time: 'Now'
      }
    ]);

    await speakAudio(speech);
    return speech;
  };

  // Time-Sensitive Proactive Study / Work / Gym Reminder
  const triggerStudyRoutineReminder = async () => {
    const result = checkTimeSensitiveMissingRoutine(todayRecords, allRecords, userName, language);

    setChatLogs(prev => [
      ...prev,
      {
        id: `chat-u-${Date.now()}`,
        sender: 'user',
        text: "Padhai / Routine check karo!",
        time: 'Now'
      },
      {
        id: `chat-a-${Date.now()}`,
        sender: 'ai',
        text: result.speech,
        time: 'Now'
      }
    ]);

    await speakAudio(result.speech);
    return result.speech;
  };

  const toggleRoutineTask = (id: string) => {
    setRoutineTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const updateRoutineTaskTime = (id: string, newTimeSlot: string) => {
    setRoutineTasks(prev => prev.map(t => t.id === id ? { ...t, timeSlot: newTimeSlot } : t));
  };

  const deleteRecord = (id: string) => {
    if (isDemoMode) {
      setDemoRecords(prev => prev.filter(r => r.id !== id));
    } else {
      setRealUserRecords(prev => prev.filter(r => r.id !== id));
    }
    deleteBackendMemory(id).catch(() => {});
  };

  const clearTodayRecords = () => {
    if (isDemoMode) {
      setDemoRecords(prev => prev.filter(r => r.date !== todayStr));
    } else {
      setRealUserRecords(prev => prev.filter(r => r.date !== todayStr));
    }
  };

  const resetDemoData = () => {
    setDemoRecords(RICH_DEMO_RECORDS);
    resetBackendDemoMemories().catch(() => {});
  };

  return (
    <SimpleContext.Provider
      value={{
        mode,
        setMode,
        userName,
        setUserName,
        userProfile,
        setUserProfile,
        language,
        setLanguage,
        strictCoachMode,
        setStrictCoachMode,
        isDemoMode,
        setIsDemoMode,
        backendOnline,
        groqApiKey,
        setGroqApiKey,
        elevenLabsApiKey,
        setElevenLabsApiKey,
        todayRecords,
        yesterdayRecords,
        allRecords,
        routineTasks,
        detectedHabits,
        selectedDate,
        setSelectedDate,
        chatLogs,
        wakeupStage,
        hasRepliedGoodMorning,
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
        updateRoutineTaskTime,
        deleteRecord,
        clearTodayRecords,
        resetDemoData,
        speakAudio,
        isAudioPlaying
      }}
    >
      {children}
    </SimpleContext.Provider>
  );
};

export const useSimple = () => {
  const context = useContext(SimpleContext);
  if (!context) throw new Error('useSimple must be used within SimpleProvider');
  return context;
};
