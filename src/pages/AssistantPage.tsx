import React, { useState, useEffect, useRef } from 'react';
import { ViewMode, MemoryItem } from '../types';
import { useMemories } from '../context/MemoryContext';
import { MemoryOrb } from '../components/MemoryOrb';
import { AudioWaveform } from '../components/AudioWaveform';
import { MemoryCard } from '../components/MemoryCard';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { useVoiceSpeaker } from '../hooks/useVoiceSpeaker';
import { extractMemoriesWithGemini } from '../services/memoryExtractor';
import { queryMemories } from '../services/queryEngine';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Send, 
  Sparkles, 
  Check, 
  X, 
  Trash2, 
  HelpCircle, 
  AlertCircle, 
  Bot, 
  User, 
  Flame, 
  Calendar 
} from 'lucide-react';

interface AssistantPageProps {
  onNavigate: (view: ViewMode) => void;
  presetQuery?: string | null;
  onClearPresetQuery?: () => void;
}

export const AssistantPage: React.FC<AssistantPageProps> = ({
  onNavigate,
  presetQuery,
  onClearPresetQuery
}) => {
  const { 
    memories, 
    goals, 
    chatMessages, 
    personality, 
    geminiApiKey, 
    speechLanguage,
    addMultipleMemories, 
    addChatMessage, 
    clearChatHistory 
  } = useMemories();

  const [textInput, setTextInput] = useState('');
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  const [pendingExtracted, setPendingExtracted] = useState<MemoryItem[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Voice speaker
  const { isSpeaking, isMuted, toggleMute, speak, stop: stopSpeaking, repeat } = useVoiceSpeaker({
    personality
  });

  // Voice recognition
  const {
    isListening,
    transcript,
    interimTranscript,
    audioLevel,
    error: recognitionError,
    startListening,
    stopListening,
    resetTranscript
  } = useVoiceRecognition({
    language: speechLanguage,
    onResult: (result, isFinal) => {
      if (isFinal && result.trim()) {
        handleUserSpokenSentence(result);
      }
    },
    onError: (err) => {
      setErrorMessage(err);
      setProcessingStatus('idle');
    }
  });

  // Sync overall processing status
  useEffect(() => {
    if (isListening) {
      setProcessingStatus('listening');
    } else if (isSpeaking) {
      setProcessingStatus('speaking');
    } else if (processingStatus !== 'processing') {
      setProcessingStatus('idle');
    }
  }, [isListening, isSpeaking]);

  // Handle preset query passed from other pages (e.g. landing page voice sample click)
  useEffect(() => {
    if (presetQuery) {
      handleUserSpokenSentence(presetQuery);
      onClearPresetQuery?.();
    }
  }, [presetQuery]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, pendingExtracted, interimTranscript]);

  /**
   * Main Dispatcher for spoken or typed input:
   * Checks if statement is a query ("What did I do on Nov 3?") or recording new memory ("I solved 5 Java questions...")
   */
  const handleUserSpokenSentence = async (userInput: string) => {
    if (!userInput.trim()) return;

    setErrorMessage(null);
    setProcessingStatus('processing');

    // Add user message to chat
    addChatMessage({
      sender: 'user',
      text: userInput
    });

    const lower = userInput.toLowerCase();

    // Check if user is asking a past question / query or requesting a roast
    const isQuery = 
      /^(what|when|where|whom|who|how\s+much|which|roast|how\s+close|tell\s+me|show|did\s+i|have\s+i)\b/i.test(lower) ||
      /\b(on\s+(?:november|nov|october|oct|yesterday|last|today))\b/i.test(lower) && /\?/i.test(userInput);

    if (isQuery) {
      // Execute Query Engine
      const result = queryMemories(userInput, memories, goals, personality);

      addChatMessage({
        sender: 'assistant',
        text: result.spokenResponse,
        intent: result.intent,
        matchedMemories: result.matchedMemories
      });

      setProcessingStatus('speaking');
      speak(result.spokenResponse);
      return;
    }

    // User is sharing activities to remember! (e.g. "Today I solved 5 Java questions, met Rahul and spent 250 on lunch")
    try {
      const extractedList = await extractMemoriesWithGemini(userInput, geminiApiKey);

      if (extractedList.length === 0) {
        const fallbackMsg = "I couldn't quite extract the activity. Could you please rephrase or mention what you did?";
        addChatMessage({
          sender: 'assistant',
          text: fallbackMsg
        });
        speak(fallbackMsg);
        setProcessingStatus('idle');
        return;
      }

      // Display pending confirmation
      setPendingExtracted(extractedList);

      let confirmationSpeech = "";
      if (extractedList.length === 1) {
        confirmationSpeech = `Got it! I extracted 1 activity: ${extractedList[0].description}. Should I save it?`;
      } else {
        confirmationSpeech = `Awesome! I found ${extractedList.length} distinct activities: ${extractedList.map(e => e.description.replace(/\.$/, '')).join(', ')}. Saving to your memories now!`;
      }

      if (personality === 'funny') {
        confirmationSpeech = `Boss! Extracted ${extractedList.length} memories for you! ${extractedList.map(e => e.description.replace(/\.$/, '')).join('; ')}. Ready to lock it down!`;
      }

      addChatMessage({
        sender: 'assistant',
        text: confirmationSpeech,
        intent: 'save_memory',
        extractedMemories: extractedList
      });

      setProcessingStatus('speaking');
      speak(confirmationSpeech);
    } catch (err) {
      console.error('Extraction error:', err);
      setErrorMessage("Something went wrong analyzing that memory. Please try again.");
      setProcessingStatus('idle');
    }
  };

  const handleConfirmSaveAll = () => {
    if (!pendingExtracted || pendingExtracted.length === 0) return;

    addMultipleMemories(pendingExtracted);

    const savedSpeech = personality === 'funny' 
      ? `Done boss! Saved all ${pendingExtracted.length} memories into your vault. Ask me anytime! 😂`
      : personality === 'motivational'
      ? `Locked in! ${pendingExtracted.length} new milestones committed to history! Keep crushing it! 🚀`
      : `Saved ${pendingExtracted.length} memories successfully.`;

    addChatMessage({
      sender: 'assistant',
      text: savedSpeech
    });

    speak(savedSpeech);
    setPendingExtracted(null);
    setProcessingStatus('idle');
  };

  const handleCancelPending = () => {
    setPendingExtracted(null);
    const cancelMsg = "No problem, I haven't saved those. What else can I help you remember?";
    addChatMessage({
      sender: 'assistant',
      text: cancelMsg
    });
    speak(cancelMsg);
    setProcessingStatus('idle');
  };

  const handleManualTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    const input = textInput;
    setTextInput('');
    handleUserSpokenSentence(input);
  };

  const toggleVoiceCapture = () => {
    if (isListening) {
      stopListening();
    } else {
      stopSpeaking();
      startListening();
    }
  };

  const sampleVoicePrompts = [
    "Today I solved 5 Java questions, met Rahul and spent 250 rupees on lunch.",
    "What did I do on November 3?",
    "When did I last meet Rahul?",
    "Roast my productivity this week 😂",
    "What did I spend the most money on?"
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col h-[calc(100vh-5rem)]">
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center text-white shadow-md">
            <Bot size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white font-display">YaadBuddy Voice Assistant</h2>
            <p className="text-[11px] text-slate-400 capitalize">Mode: {personality} • Language: {speechLanguage}</p>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className={`p-2 rounded-xl text-xs font-semibold border transition-all ${
              isMuted
                ? 'bg-rose-950/40 border-rose-800 text-rose-300'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title={isMuted ? 'Voice is Muted (Click to Unmute)' : 'Voice is Active (Click to Mute)'}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          <button
            onClick={repeat}
            className="p-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition-all"
            title="Repeat Last Response"
          >
            <RotateCcw size={16} />
          </button>

          <button
            onClick={clearChatHistory}
            className="p-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-700 text-slate-400 hover:text-rose-400 transition-all"
            title="Clear Chat Messages"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Main Split Layout: Orb & Visualizer (Top/Center) + Scrollable Conversation Log (Bottom) */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Central Orb & Status Zone */}
        <div className="flex flex-col items-center justify-center py-4 sm:py-6 bg-slate-900/40 rounded-3xl border border-slate-800/80 mb-4 shrink-0 shadow-inner">
          <MemoryOrb
            status={processingStatus}
            audioLevel={audioLevel}
            size="lg"
            onClick={toggleVoiceCapture}
          />

          {/* Audio Waveform */}
          <div className="mt-4">
            <AudioWaveform
              isActive={isListening || isSpeaking}
              color={isListening ? 'cyan' : isSpeaking ? 'emerald' : 'purple'}
              barsCount={22}
            />
          </div>

          {/* Current Live Status / Transcript */}
          <div className="mt-3 text-center px-4 max-w-lg">
            {isListening ? (
              <p className="text-xs sm:text-sm font-semibold text-cyan-300 animate-pulse">
                🎙️ Listening... {interimTranscript ? `"${interimTranscript}"` : 'Speak naturally now'}
              </p>
            ) : isSpeaking ? (
              <p className="text-xs sm:text-sm font-semibold text-emerald-300">
                🔊 Speaking response...
              </p>
            ) : processingStatus === 'processing' ? (
              <p className="text-xs sm:text-sm font-semibold text-purple-300">
                ⚡ Understanding & extracting activities...
              </p>
            ) : (
              <p className="text-xs text-slate-400">
                Click microphone orb above or use text box below
              </p>
            )}

            {recognitionError && (
              <p className="mt-2 text-xs text-rose-400 bg-rose-950/40 border border-rose-800/40 px-3 py-1.5 rounded-lg flex items-center justify-center gap-1.5">
                <AlertCircle size={13} />
                <span>{recognitionError}</span>
              </p>
            )}
          </div>

          {/* Quick Voice Prompt Chips */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3 px-4">
            {sampleVoicePrompts.slice(0, 3).map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleUserSpokenSentence(prompt)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-purple-950/60 border border-slate-700/60 hover:border-purple-500/40 text-slate-300 hover:text-white transition-all text-left truncate max-w-[280px]"
              >
                "{prompt}"
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Conversation & Extracted Items Zone */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-3">
          {chatMessages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center text-white shrink-0 shadow-md">
                    <Sparkles size={14} />
                  </div>
                )}

                <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 ${
                  isUser
                    ? 'bg-purple-600 text-white rounded-tr-none shadow-md shadow-purple-600/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-line">{msg.text}</p>
                  
                  {/* Extracted Memories Breakdown in Chat */}
                  {msg.extractedMemories && msg.extractedMemories.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
                      <p className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                        Extracted {msg.extractedMemories.length} Activity Memories:
                      </p>
                      <div className="space-y-2">
                        {msg.extractedMemories.map((em, idx) => (
                          <div key={idx} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-purple-300">#{idx + 1} {em.category}</span>
                              {em.amount && <span className="font-bold text-emerald-400">₹{em.amount}</span>}
                            </div>
                            <p className="text-slate-100">{em.description}</p>
                            {em.people.length > 0 && (
                              <p className="text-[11px] text-slate-400 mt-1">People: {em.people.join(', ')}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matched Past Memories Preview */}
                  {msg.matchedMemories && msg.matchedMemories.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
                      <p className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                        Verified Memory Records:
                      </p>
                      {msg.matchedMemories.map(m => (
                        <div key={m.id} className="text-xs p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                          <span className="text-slate-400 font-semibold">{m.date}:</span> {m.description}
                        </div>
                      ))}
                    </div>
                  )}

                  <span className="block mt-1 text-[10px] opacity-60 text-right">
                    {msg.timestamp}
                  </span>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                    <User size={14} />
                  </div>
                )}
              </div>
            );
          })}

          {/* Pending Confirmation Box */}
          {pendingExtracted && pendingExtracted.length > 0 && (
            <div className="p-5 rounded-2xl bg-indigo-950/60 border-2 border-indigo-500/50 shadow-2xl animate-fadeIn">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-cyan-400" />
                  <h4 className="text-sm font-bold text-white font-display">
                    Confirm Extracted Memories ({pendingExtracted.length})
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCancelPending}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-700"
                  >
                    <X size={13} />
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={handleConfirmSaveAll}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/30"
                  >
                    <Check size={14} />
                    <span>Save to Memories</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {pendingExtracted.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900/90 border border-indigo-500/30 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-900/80 text-purple-200 border border-purple-700">
                          {item.category}
                        </span>
                        {item.amount && (
                          <span className="font-bold text-emerald-400">
                            ₹{item.amount}
                          </span>
                        )}
                        {item.people.length > 0 && (
                          <span className="text-slate-400">
                            with {item.people.join(', ')}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-100 font-medium">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Text Input Fallback Bar */}
        <form onSubmit={handleManualTextSubmit} className="relative flex items-center gap-2 pt-2">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Type your activities or ask a past question... (e.g. 'What did I do on Nov 3?')"
            className="flex-1 rounded-2xl bg-slate-900 border border-slate-700/80 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
          />

          <button
            type="submit"
            disabled={!textInput.trim()}
            className="px-4 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:hover:bg-purple-600 text-white font-bold shadow-md transition-all flex items-center justify-center"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};
