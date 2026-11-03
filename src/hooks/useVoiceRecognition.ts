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
    language = 'hi-IN',
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
  const gotFinalTranscriptRef = useRef(false);

  // Initialize Web Speech Recognition
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(true); // Still supported via MediaRecorder + Whisper backend!
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

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (interim) {
          setInterimTranscript(interim);
          onResult?.(interim, false);
        }

        if (final) {
          gotFinalTranscriptRef.current = true;
          setTranscript(final);
          setInterimTranscript('');
          onResult?.(final, true);
        }
      };

      recognition.onerror = (event: any) => {
        // Prevent alarming the user on network glitch
        if (event.error === 'network') {
          console.info('WebSpeech network glitch detected; MediaRecorder audio will be transcribed via Whisper backend.');
          setError(null);
          return;
        }

        if (event.error === 'not-allowed') {
          setError('Microphone permission denied. Please allow microphone access.');
          onError?.('Microphone permission denied.');
        } else if (event.error === 'no-speech') {
          // Normal silence, don't show red error
          setError(null);
        }
      };

      recognition.onend = () => {
        // Recognition ended
        if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
          setIsListening(false);
          stopAudioWave();
        }
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('SpeechRecognition init error:', e);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      stopAudioWave();
    };
  }, [language, continuous, onResult, onError]);

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

  // Start listening (Dual Engine: Web Speech + MediaRecorder for Backend Whisper)
  const startListening = useCallback(async () => {
    setError(null);
    setTranscript('');
    setInterimTranscript('');
    gotFinalTranscriptRef.current = false;
    audioChunksRef.current = [];

    // 1. Start HTML5 MediaRecorder (Cross-platform: Windows + Android + iOS)
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

        recorder.start(250); // Record in 250ms chunks
      }
    } catch (mediaErr) {
      console.warn('MediaRecorder permission or device error:', mediaErr);
    }

    // 2. Start Web Speech recognition for live interim typing
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e: any) {
        if (e.name === 'InvalidStateError') {
          try {
            recognitionRef.current.stop();
            setTimeout(() => recognitionRef.current?.start(), 100);
          } catch {}
        }
      }
    }

    setIsListening(true);
    startAudioWave();
  }, []);

  // Stop listening and auto-fallback to Whisper backend if Web Speech failed or was empty
  const stopListening = useCallback(() => {
    setIsListening(false);
    stopAudioWave();

    // Stop Web Speech
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    // Stop MediaRecorder & process audio if needed
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = async () => {
        // Clean up tracks
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(t => t.stop());
          mediaStreamRef.current = null;
        }

        // If Web Speech already got the transcript, we're done!
        if (gotFinalTranscriptRef.current) {
          audioChunksRef.current = [];
          return;
        }

        // Otherwise, send recorded audio blob to Backend Whisper (/api/transcribe)
        if (audioChunksRef.current.length > 0) {
          const mime = mediaRecorderRef.current?.mimeType || 'audio/webm';
          const audioBlob = new Blob(audioChunksRef.current, { type: mime });
          audioChunksRef.current = [];

          if (audioBlob.size > 2000) { // More than 2KB audio
            setIsProcessingBackend(true);
            setInterimTranscript('AI से आवाज़ समझ रहा हूँ...');

            const langMode = language.startsWith('hi') ? 'hi' : language.startsWith('en') ? 'en' : 'hi';
            const whisperText = await callBackendTranscribe(audioBlob, langMode, groqApiKey);

            setIsProcessingBackend(false);
            setInterimTranscript('');

            if (whisperText && whisperText.trim()) {
              setTranscript(whisperText);
              onResult?.(whisperText, true);
            }
          }
        }
      };

      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
  }, [language, groqApiKey, onResult]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
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
