import React, { createContext, useContext, useState, useEffect } from 'react';
import { MemoryItem, GoalItem, AssistantPersonality, ChatMessage } from '../types';
import { INITIAL_DEMO_MEMORIES, INITIAL_DEMO_GOALS } from '../data/demoMemories';

interface MemoryContextType {
  memories: MemoryItem[];
  goals: GoalItem[];
  chatMessages: ChatMessage[];
  personality: AssistantPersonality;
  geminiApiKey: string;
  speechLanguage: string;
  hasDemoData: boolean;
  addMemory: (memory: MemoryItem) => void;
  addMultipleMemories: (newMemories: MemoryItem[]) => void;
  updateMemory: (memory: MemoryItem) => void;
  deleteMemory: (id: string) => void;
  clearAllMemories: () => void;
  loadDemoData: () => void;
  clearDemoData: () => void;
  addGoal: (goal: GoalItem) => void;
  updateGoal: (goal: GoalItem) => void;
  deleteGoal: (id: string) => void;
  addChatMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearChatHistory: () => void;
  setPersonality: (p: AssistantPersonality) => void;
  setGeminiApiKey: (key: string) => void;
  setSpeechLanguage: (lang: string) => void;
  exportBackup: () => void;
  importBackup: (jsonData: string) => boolean;
}

const STORAGE_KEY_MEMORIES = 'yaadbuddy_memories_v2';
const STORAGE_KEY_GOALS = 'yaadbuddy_goals_v2';
const STORAGE_KEY_PERSONALITY = 'yaadbuddy_personality_v2';
const STORAGE_KEY_APIKEY = 'yaadbuddy_gemini_key_v2';
const STORAGE_KEY_LANG = 'yaadbuddy_speech_lang_v2';

const MemoryContext = createContext<MemoryContextType | undefined>(undefined);

export const MemoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [memories, setMemories] = useState<MemoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MEMORIES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed reading memories from storage:', e);
    }
    return INITIAL_DEMO_MEMORIES;
  });

  const [goals, setGoals] = useState<GoalItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_GOALS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed reading goals from storage:', e);
    }
    return INITIAL_DEMO_GOALS;
  });

  const [personality, setPersonalityState] = useState<AssistantPersonality>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PERSONALITY) as AssistantPersonality;
      if (saved && ['friendly', 'funny', 'motivational'].includes(saved)) return saved;
    } catch {}
    return 'funny'; // Default to funny companion!
  });

  const [geminiApiKey, setGeminiApiKeyState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_APIKEY) || '';
  });

  const [speechLanguage, setSpeechLanguageState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_LANG) || 'en-IN';
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: "Namaste! I'm YaadBuddy AI. You live your life, I'll remember it! Speak or type anything you did today, or ask me about your past memories.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // Persist to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MEMORIES, JSON.stringify(memories));
    } catch (e) {
      console.error('Failed saving memories:', e);
    }
  }, [memories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_GOALS, JSON.stringify(goals));
    } catch (e) {
      console.error('Failed saving goals:', e);
    }
  }, [goals]);

  const setPersonality = (p: AssistantPersonality) => {
    setPersonalityState(p);
    localStorage.setItem(STORAGE_KEY_PERSONALITY, p);
  };

  const setGeminiApiKey = (key: string) => {
    setGeminiApiKeyState(key);
    localStorage.setItem(STORAGE_KEY_APIKEY, key);
  };

  const setSpeechLanguage = (lang: string) => {
    setSpeechLanguageState(lang);
    localStorage.setItem(STORAGE_KEY_LANG, lang);
  };

  const addMemory = (memory: MemoryItem) => {
    setMemories(prev => [memory, ...prev]);
  };

  const addMultipleMemories = (newMemories: MemoryItem[]) => {
    setMemories(prev => [...newMemories, ...prev]);
  };

  const updateMemory = (updated: MemoryItem) => {
    setMemories(prev => prev.map(m => m.id === updated.id ? updated : m));
  };

  const deleteMemory = (id: string) => {
    setMemories(prev => prev.filter(m => m.id !== id));
  };

  const clearAllMemories = () => {
    setMemories([]);
  };

  const loadDemoData = () => {
    // Add demo memories that are not already present
    setMemories(prev => {
      const existingIds = new Set(prev.map(m => m.id));
      const filteredDemo = INITIAL_DEMO_MEMORIES.filter(d => !existingIds.has(d.id));
      return [...filteredDemo, ...prev];
    });
    setGoals(INITIAL_DEMO_GOALS);
  };

  const clearDemoData = () => {
    setMemories(prev => prev.filter(m => !m.isDemo));
  };

  const hasDemoData = memories.some(m => m.isDemo);

  const addGoal = (goal: GoalItem) => {
    setGoals(prev => [goal, ...prev]);
  };

  const updateGoal = (updated: GoalItem) => {
    setGoals(prev => prev.map(g => g.id === updated.id ? updated : g));
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const addChatMessage = (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMsg: ChatMessage = {
      ...msg,
      id: `chat-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, newMsg]);
  };

  const clearChatHistory = () => {
    setChatMessages([
      {
        id: 'init-1',
        sender: 'assistant',
        text: "Chat cleared! How can I assist you with your memories today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const exportBackup = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      app: 'YaadBuddy AI',
      memories,
      goals
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yaadbuddy-memories-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importBackup = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (Array.isArray(parsed.memories)) {
        setMemories(parsed.memories);
        if (Array.isArray(parsed.goals)) {
          setGoals(parsed.goals);
        }
        return true;
      }
    } catch (e) {
      console.error('Import failed:', e);
    }
    return false;
  };

  return (
    <MemoryContext.Provider
      value={{
        memories,
        goals,
        chatMessages,
        personality,
        geminiApiKey,
        speechLanguage,
        hasDemoData,
        addMemory,
        addMultipleMemories,
        updateMemory,
        deleteMemory,
        clearAllMemories,
        loadDemoData,
        clearDemoData,
        addGoal,
        updateGoal,
        deleteGoal,
        addChatMessage,
        clearChatHistory,
        setPersonality,
        setGeminiApiKey,
        setSpeechLanguage,
        exportBackup,
        importBackup
      }}
    >
      {children}
    </MemoryContext.Provider>
  );
};

export const useMemories = () => {
  const context = useContext(MemoryContext);
  if (!context) {
    throw new Error('useMemories must be used within a MemoryProvider');
  }
  return context;
};
