/**
 * Backend API Client for YaadBuddy AI
 * Routes all AI chat, Whisper STT, and ElevenLabs TTS through the secure backend server.
 * Frontend does NOT call third-party APIs directly, preventing key exposure and CORS/network errors.
 */

export interface BackendChatResponse {
  speech: string;
  source: string;
}

/**
 * Check backend server health and API readiness
 */
export async function checkBackendHealth(): Promise<{
  online: boolean;
  groqConfigured?: boolean;
  elevenLabsConfigured?: boolean;
}> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) return { online: false };
    const data = await res.json();
    return {
      online: true,
      groqConfigured: data.groqConfigured,
      elevenLabsConfigured: data.elevenLabsConfigured
    };
  } catch (err) {
    return { online: false };
  }
}

/**
 * Calls Backend /api/chat (Groq Llama-3.3-70B on server)
 */
export async function callBackendChat(
  message: string,
  options: {
    language?: 'hi' | 'hinglish' | 'en';
    userName?: string;
    strictCoachMode?: boolean;
    pastRecords?: any[];
    groqApiKey?: string;
  } = {}
): Promise<string | null> {
  const {
    language = 'hi',
    userName = 'Shubham',
    strictCoachMode = true,
    pastRecords = [],
    groqApiKey = ''
  } = options;

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (groqApiKey.trim()) {
      headers['x-groq-key'] = groqApiKey.trim();
    }

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message,
        language,
        userName,
        strictCoachMode,
        pastRecords
      })
    });

    if (!response.ok) {
      console.warn('Backend /api/chat error:', response.status);
      return null;
    }

    const data: BackendChatResponse = await response.json();
    return data.speech || null;
  } catch (err) {
    console.error('Backend /api/chat fetch failed:', err);
    return null;
  }
}

/**
 * Calls Backend /api/transcribe (Groq Whisper-Large-v3 on server)
 * Solves "SpeechRecognition error: network" completely by transcribing real audio via server!
 */
export async function callBackendTranscribe(
  audioBlob: Blob,
  language: 'hi' | 'hinglish' | 'en' = 'hi',
  groqApiKey: string = ''
): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'speech.webm');
    formData.append('language', language === 'hi' ? 'hi' : language === 'en' ? 'en' : 'hi');

    const headers: Record<string, string> = {};
    if (groqApiKey.trim()) {
      headers['x-groq-key'] = groqApiKey.trim();
    }

    const response = await fetch('/api/transcribe', {
      method: 'POST',
      headers,
      body: formData
    });

    if (!response.ok) {
      console.warn('Backend /api/transcribe error:', response.status);
      return null;
    }

    const data = await response.json();
    return data.text || null;
  } catch (err) {
    console.error('Backend /api/transcribe failed:', err);
    return null;
  }
}

/**
 * Calls Backend /api/tts (Server-side ElevenLabs Voice Synthesis)
 */
export async function callBackendTTS(
  text: string,
  language: 'hi' | 'hinglish' | 'en' = 'hi',
  elevenLabsApiKey: string = ''
): Promise<string | null> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (elevenLabsApiKey.trim()) {
      headers['x-elevenlabs-key'] = elevenLabsApiKey.trim();
    }

    const response = await fetch('/api/tts', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        text,
        language
      })
    });

    if (!response.ok) {
      return null;
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (err) {
    console.error('Backend /api/tts failed:', err);
    return null;
  }
}

/**
 * Fetch memories from backend
 */
export async function fetchBackendMemories(): Promise<any[] | null> {
  try {
    const res = await fetch('/api/memories');
    if (!res.ok) return null;
    const data = await res.json();
    return data.records || [];
  } catch (err) {
    return null;
  }
}

/**
 * Save memory to backend
 */
export async function saveBackendMemory(record: {
  date?: string;
  time?: string;
  description: string;
  category?: string;
  tags?: string[];
}): Promise<any | null> {
  try {
    const res = await fetch('/api/memories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.record || null;
  } catch (err) {
    return null;
  }
}

/**
 * Delete memory on backend
 */
export async function deleteBackendMemory(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/memories/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch (err) {
    return false;
  }
}

/**
 * Reset demo records on backend
 */
export async function resetBackendDemoMemories(): Promise<any[] | null> {
  try {
    const res = await fetch('/api/memories/reset-demo', { method: 'POST' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.records || [];
  } catch (err) {
    return null;
  }
}

// Backward-compatible exports
export const ELEVENLABS_VOICES = {
  hindi: 'pNInz6obpgDQGcFmaJgB',
  english: '21m00Tcm4TlvDq8ikWAM',
};

export async function generateElevenLabsSpeech(
  text: string,
  apiKey: string,
  lang: 'hi' | 'hinglish' | 'en' = 'hi'
): Promise<string | null> {
  return callBackendTTS(text, lang, apiKey);
}

export async function callGroqChat(
  prompt: string,
  systemPrompt: string,
  apiKey: string
): Promise<string | null> {
  return callBackendChat(prompt, { groqApiKey: apiKey });
}
