import { useState, useEffect, useRef, useCallback } from 'react';
import { callBackendTranscribe } from '../services/apiClients';

export interface UseVoiceRecognitionOptions {
  language?: string; // 'hi-IN' | 'en-IN' | 'en-US'
  continuous?: boolean;
  groqApiKey?: string;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
}

export function useVoiceRecognition(options: UseVoiceRecognitionOptions = {}) {
  const {
    language = 'en-US',
    continuous = false,
    groqApiKey = '',
    onResult,
    onError
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [isProcessingBackend, setIsProcessingBackend] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioAnimationRef = useRef<number | null>(null);
  
  // Track speech reliably so nothing is ever dropped
  const latestSpeechTextRef = useRef<string>('');
  const hasEmittedFinalRef = useRef<boolean>(false);

  // Stable references for callbacks to prevent WebSpeech re-init on parent state updates
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  // Initialize Web Speech Recognition
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(true);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = continuous;
      recognition.interimResults = true;
      recognition.lang = language;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = 0; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        const combined = (final || interim).trim();
        if (combined) {
          latestSpeechTextRef.current = combined;
          setInterimTranscript(combined);
          onResultRef.current?.(combined, false); // Real-time preview typing
        }

        if (final && final.trim()) {
          hasEmittedFinalRef.current = true;
          setTranscript(final.trim());
          setInterimTranscript('');
          onResultRef.current?.(final.trim(), true);
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'network') {
          console.info('WebSpeech network event; will use captured speech or backend fallback.');
          setError(null);
          return;
        }

        if (event.error === 'not-allowed') {
          setError('Microphone permission denied. Please allow microphone access in browser.');
          onErrorRef.current?.('Microphone permission denied.');
        } else if (event.error === 'no-speech') {
          setError(null);
        }
      };

      recognition.onend = () => {
        // If recognition ended naturally and we have text that hasn't been emitted as final
        if (latestSpeechTextRef.current.trim() && !hasEmittedFinalRef.current) {
          const text = latestSpeechTextRef.current.trim();
          hasEmittedFinalRef.current = true;
          setTranscript(text);
          setInterimTranscript('');
          onResultRef.current?.(text, true);
        }

        setIsListening(false);
        stopAudioWave();
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('SpeechRecognition init warning:', e);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      stopAudioWave();
    };
  }, [language, continuous]);

  // Audio wave animation
  const startAudioWave = () => {
    stopAudioWave();
    const update = () => {
      const rand = Math.sin(Date.now() / 90) * 0.4 + 0.5 + (Math.random() * 0.3 - 0.15);
      setAudioLevel(Math.max(0.15, Math.min(1.0, rand)));
      audioAnimationRef.current = requestAnimationFrame(update);
    };
    audioAnimationRef.current = requestAnimationFrame(update);
  };

  const stopAudioWave = () => {
    if (audioAnimationRef.current) {
      cancelAnimationFrame(audioAnimationRef.current);
      audioAnimationRef.current = null;
    }
    setAudioLevel(0);
  };

  // Start listening (Dual-Engine: Captures Web Speech & optional MediaRecorder)
  const startListening = useCallback(async () => {
    setError(null);
    setTranscript('');
    setInterimTranscript('');
    latestSpeechTextRef.current = '';
    hasEmittedFinalRef.current = false;
    audioChunksRef.current = [];

    // 1. Start Web Speech recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e: any) {
        if (e.name === 'InvalidStateError') {
          try {
            recognitionRef.current.stop();
            setTimeout(() => recognitionRef.current?.start(), 80);
          } catch {}
        }
      }
    }

    // 2. Start HTML5 MediaRecorder in background
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
          ? 'audio/webm' 
          : MediaRecorder.isTypeSupported('audio/mp4') 
          ? 'audio/mp4' 
          : '';

        const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        recorder.start(250);
      }
    } catch (mediaErr) {
      // Audio capture fallback handled gracefully
    }

    setIsListening(true);
    startAudioWave();
  }, []);

  // Stop listening and deliver the captured speech immediately
  const stopListening = useCallback(() => {
    setIsListening(false);
    stopAudioWave();

    // 1. If Web Speech captured words, USE THEM IMMEDIATELY! (Zero lag, zero failure)
    const spokenText = latestSpeechTextRef.current.trim();
    if (spokenText && !hasEmittedFinalRef.current) {
      hasEmittedFinalRef.current = true;
      setTranscript(spokenText);
      setInterimTranscript('');
      onResultRef.current?.(spokenText, true);

      // Clean up tracks
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
        mediaStreamRef.current = null;
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
      return;
    }

    // 2. Stop Web Speech
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    // 3. If Web Speech had no text AND user configured Groq Whisper, use backend
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = async () => {
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(t => t.stop());
          mediaStreamRef.current = null;
        }

        // Only call backend Whisper if no text was captured locally AND Groq API key is present!
        if (!hasEmittedFinalRef.current && !latestSpeechTextRef.current.trim() && groqApiKey.trim() && audioChunksRef.current.length > 0) {
          const mime = mediaRecorderRef.current?.mimeType || 'audio/webm';
          const audioBlob = new Blob(audioChunksRef.current, { type: mime });
          audioChunksRef.current = [];

          if (audioBlob.size > 2000) {
            setIsProcessingBackend(true);
            setInterimTranscript('Processing audio...');

            const langMode = language.startsWith('hi') ? 'hi' : 'en';
            const whisperText = await callBackendTranscribe(audioBlob, langMode, groqApiKey);

            setIsProcessingBackend(false);
            setInterimTranscript('');

            if (whisperText && whisperText.trim()) {
              hasEmittedFinalRef.current = true;
              setTranscript(whisperText);
              onResultRef.current?.(whisperText, true);
            }
          }
        }
      };

      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
  }, [language, groqApiKey]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    latestSpeechTextRef.current = '';
    hasEmittedFinalRef.current = false;
    setError(null);
  }, []);

  return {
    isListening: isListening || isProcessingBackend,
    isProcessingBackend,
    transcript,
    interimTranscript,
    audioLevel,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    setTranscript
  };
}
