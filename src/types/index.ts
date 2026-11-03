export type MemoryCategory = 
  | 'Study' 
  | 'Coding' 
  | 'Friends' 
  | 'Family' 
  | 'Food' 
  | 'Expenses' 
  | 'Travel' 
  | 'Work' 
  | 'Achievements' 
  | 'Mood' 
  | 'Entertainment' 
  | 'Personal';

export interface MemoryItem {
  id: string;
  date: string;
  time?: string;
  description: string;
  category: MemoryCategory;
  people: string[];
  amount?: number | null;
  currency?: string;
  location?: string | null;
  tags: string[];
  source: 'voice' | 'manual';
  createdAt: string;
  isDemo?: boolean;
  details?: string;
  mood?: 'productive' | 'happy' | 'tired' | 'excited' | 'neutral' | 'accomplished';
}

export interface GoalItem {
  id: string;
  title: string;
  category: MemoryCategory;
  targetCount: number;
  currentCount: number;
  unit: string;
  month: string;
  status: 'on_track' | 'completed' | 'behind';
}

export type AssistantPersonality = 'friendly' | 'funny' | 'motivational';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  intent?: 'save_memory' | 'query_memory' | 'retrieval' | 'detective' | 'roast' | 'goal' | 'not_found' | 'general';
  extractedMemories?: MemoryItem[];
  matchedMemories?: MemoryItem[];
  roastData?: {
    roast: string;
    statsHighlight: string;
    verdict: string;
  };
}

export type ViewMode = 
  | 'landing'
  | 'dashboard'
  | 'assistant'
  | 'search'
  | 'timeline'
  | 'detective'
  | 'wrapped'
  | 'roast'
  | 'goals'
  | 'settings';

/* Simplified Routine & Memory Types */
export interface ActivityRecord {
  id: string;
  date: string;
  time: string;
  description: string;
  category: string;
  createdAt: string;
}

export interface RoutineTask {
  id: string;
  timeSlot: string;
  title: string;
  category: string;
  completed: boolean;
}

export interface DetectedHabit {
  id: string;
  title: string;
  timeSlot: string;
  daysDetected: number;
  category: string;
  insight: string;
}

export type AppMode = 'hear' | 'remember';

export interface ChatLog {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

export interface UserProfile {
  name: string;
  email: string;
  dob: string;
  password?: string;
  isRegistered: boolean;
}

