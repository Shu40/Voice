import { useState, useEffect, useCallback, useRef } from 'react';

export type LanguageMode = 'hi' | 'hinglish' | 'en';

export interface UseVoiceSpeakerOptions {
  language?: LanguageMode;
  rate?: number;
  pitch?: number;
  personality?: string;
  onStart?: () => void;
  onEnd?: () => void;
}

export function useVoiceSpeaker(options: UseVoiceSpeakerOptions = {}) {
  const {
    language = 'hi',
    rate: defaultRate = 1.0,
    pitch: defaultPitch = 1.0,
    onStart,
    onEnd
  } = options;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [rate, setRate] = useState(defaultRate);
  const [pitch, setPitch] = useState(defaultPitch);

  const lastSpokenTextRef = useRef<string>('');
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const speakTimeoutRef = useRef<any>(null);

  // Pick best native voice based on language mode
  const pickBestVoice = useCallback((voices: SpeechSynthesisVoice[], langMode: LanguageMode) => {
    if (!voices || voices.length === 0) return null;

    if (langMode === 'hi') {
      const hiVoices = voices.filter(v => 
        v.lang.toLowerCase().startsWith('hi') || 
        v.name.toLowerCase().includes('hindi') || 
        v.name.toLowerCase().includes('kalpana') ||
        v.name.toLowerCase().includes('hemant') ||
        v.name.toLowerCase().includes('google हिन्दी')
      );
      if (hiVoices.length > 0) return hiVoices[0];

      const inVoices = voices.filter(v => v.lang.toLowerCase().includes('in'));
      if (inVoices.length > 0) return inVoices[0];
    } else if (langMode === 'hinglish') {
      const inVoices = voices.filter(v => 
        v.lang.toLowerCase().includes('in') || 
        v.name.toLowerCase().includes('india') ||
        v.name.toLowerCase().includes('hindi')
      );
      if (inVoices.length > 0) return inVoices[0];
    }

    const defaultLang = langMode === 'hi' ? 'hi' : 'en';
    const match = voices.find(v => v.lang.toLowerCase().startsWith(defaultLang));
    return match || voices[0];
  }, []);

  // Load available voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setAvailableVoices(voices);
        const best = pickBestVoice(voices, language);
        setSelectedVoice(best);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [language, pickBestVoice]);

  useEffect(() => {
    if (availableVoices.length > 0) {
      const best = pickBestVoice(availableVoices, language);
      setSelectedVoice(best);
    }
  }, [language, availableVoices, pickBestVoice]);

  // Stop any active speech or audio
  const stop = useCallback(() => {
    if (speakTimeoutRef.current) {
      clearTimeout(speakTimeoutRef.current);
      speakTimeoutRef.current = null;
    }

    if (activeAudioRef.current) {
      try {
        activeAudioRef.current.pause();
        activeAudioRef.current.currentTime = 0;
      } catch {}
      activeAudioRef.current = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    setIsSpeaking(false);
  }, []);

  // Play audio file or blob URL directly (e.g. from backend ElevenLabs)
  const playAudioUrl = useCallback((audioUrl: string): Promise<void> => {
    return new Promise((resolve) => {
      stop();
      if (isMuted) {
        resolve();
        return;
      }

      try {
        const audio = new Audio(audioUrl);
        activeAudioRef.current = audio;
        setIsSpeaking(true);
        onStart?.();

        audio.onended = () => {
          setIsSpeaking(false);
          activeAudioRef.current = null;
          onEnd?.();
          resolve();
        };

        audio.onerror = () => {
          setIsSpeaking(false);
          activeAudioRef.current = null;
          resolve();
        };

        audio.play().catch(() => {
          setIsSpeaking(false);
          activeAudioRef.current = null;
          resolve();
        });
      } catch (err) {
        setIsSpeaking(false);
        resolve();
      }
    });
  }, [isMuted, stop, onStart, onEnd]);

  // Speak text via browser SpeechSynthesis with error immunity
  const speak = useCallback((text: string, force = false) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isMuted && !force) {
      return;
    }

    // Stop active audio/speech first
    stop();

    // Clean text: strip markdown, emojis, asterisks, brackets
    const cleanSpeech = text
      .replace(/[#*_`~>\[\]\(\)]/g, '')
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      .replace(/₹\s*(\d+)/g, '$1 rupaye')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanSpeech) return;

    lastSpokenTextRef.current = cleanSpeech;

    // Small debounce to let browser speech engine unbind previous utterance cleanly
    speakTimeoutRef.current = setTimeout(() => {
      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }

        const utterance = new SpeechSynthesisUtterance(cleanSpeech);
        const voiceToUse = selectedVoice || pickBestVoice(availableVoices, language);
        if (voiceToUse) {
          utterance.voice = voiceToUse;
          utterance.lang = voiceToUse.lang || (language === 'hi' ? 'hi-IN' : 'en-IN');
        } else {
          utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
        }

        utterance.rate = language === 'hi' ? 0.95 : rate;
        utterance.pitch = pitch;

        utterance.onstart = () => {
          setIsSpeaking(true);
          onStart?.();
        };

        utterance.onend = () => {
          setIsSpeaking(false);
          onEnd?.();
        };

        // Immunize against 'interrupted' or 'canceled' errors
        utterance.onerror = (e: SpeechSynthesisErrorEvent) => {
          if (e.error === 'interrupted' || e.error === 'canceled') {
            // Normal behavior when new speech is invoked or user cancels
            setIsSpeaking(false);
            return;
          }
          // Non-fatal warning
          setIsSpeaking(false);
        };

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        setIsSpeaking(false);
      }
    }, 50);
  }, [isMuted, selectedVoice, language, availableVoices, pickBestVoice, rate, pitch, stop, onStart, onEnd]);

  const repeat = useCallback(() => {
    if (lastSpokenTextRef.current) {
      speak(lastSpokenTextRef.current, true);
    }
  }, [speak]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      if (next) stop();
      return next;
    });
  }, [stop]);

  return {
    isSpeaking,
    isMuted,
    toggleMute,
    speak,
    playAudioUrl,
    stop,
    repeat,
    selectedVoice,
    availableVoices,
    setSelectedVoice,
    rate,
    setRate,
    pitch,
    setPitch
  };
}
