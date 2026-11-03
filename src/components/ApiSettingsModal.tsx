import React, { useState } from 'react';
import { useSimple } from '../context/SimpleContext';
import { X, Key, Bot, Volume2, Check, Sparkles, Sliders } from 'lucide-react';
import { callGroqChat, generateElevenLabsSpeech } from '../services/apiClients';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({ isOpen, onClose }) => {
  const { 
    groqApiKey, 
    setGroqApiKey, 
    elevenLabsApiKey, 
    setElevenLabsApiKey, 
    language,
    speakAudio 
  } = useSimple();

  const [groqInput, setGroqInput] = useState(groqApiKey);
  const [elevenLabsInput, setElevenLabsInput] = useState(elevenLabsApiKey);
  const [saveStatus, setSaveStatus] = useState(false);
  const [testingVoice, setTestingVoice] = useState(false);
  const [testingGroq, setTestingGroq] = useState(false);
  const [groqTestResult, setGroqTestResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setGroqApiKey(groqInput.trim());
    setElevenLabsApiKey(elevenLabsInput.trim());
    setSaveStatus(true);
    setTimeout(() => setSaveStatus(false), 2000);
  };

  const handleTestGroq = async () => {
    if (!groqInput.trim()) {
      alert("Please enter a Groq API Key first!");
      return;
    }
    setTestingGroq(true);
    setGroqTestResult(null);

    const testPrompt = language === 'hi'
      ? "उपयोगकर्ता ने कहा: मैंने 9 बजे 5 जावा प्रश्न हल किए। 1 छोटे वाक्य में हिंदी में बधाई दो।"
      : "User said: I solved 5 Java problems at 9 AM. Respond in 1 short encouraging sentence.";

    const res = await callGroqChat(
      testPrompt,
      "You are YaadBuddy, a helpful personal memory assistant.",
      groqInput.trim()
    );

    setTestingGroq(false);
    if (res) {
      setGroqTestResult(res);
      speakAudio(res);
    } else {
      setGroqTestResult("Groq API test failed. Please verify your key.");
    }
  };

  const handleTestElevenLabs = async () => {
    if (!elevenLabsInput.trim()) {
      alert("Please enter an ElevenLabs API Key first!");
      return;
    }
    setTestingVoice(true);

    const testText = language === 'hi'
      ? "नमस्ते! यह इलेवन लैब्स की ओर से शुद्ध और स्पष्ट हिंदी आवाज़ है।"
      : "Hello! This is ElevenLabs studio-quality voice speaking for YaadBuddy AI.";

    const audioUrl = await generateElevenLabsSpeech(testText, elevenLabsInput.trim(), language);
    setTestingVoice(false);

    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    } else {
      alert("ElevenLabs API test failed. Please check your API key.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#0F172A] border border-slate-700/80 shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Key size={16} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">
                Groq & ElevenLabs API Integration
              </h3>
              <p className="text-[11px] text-slate-400">
                Ultra-fast Llama-3 + Studio Human Voice
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 pt-4">
          {/* Groq API Key Input */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Bot size={14} />
                <span>Groq API Key (Llama-3 70B AI)</span>
              </label>
              <button
                type="button"
                onClick={handleTestGroq}
                disabled={testingGroq}
                className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30"
              >
                {testingGroq ? 'Testing...' : 'Test Groq'}
              </button>
            </div>
            <input
              type="password"
              value={groqInput}
              onChange={(e) => setGroqInput(e.target.value)}
              placeholder="gsk_..."
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
            />
            {groqTestResult && (
              <p className="text-[11px] text-amber-200 bg-amber-950/40 p-2 rounded-lg border border-amber-800/40">
                {groqTestResult}
              </p>
            )}
          </div>

          {/* ElevenLabs API Key Input */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                <Volume2 size={14} />
                <span>ElevenLabs API Key (Studio Human Voice)</span>
              </label>
              <button
                type="button"
                onClick={handleTestElevenLabs}
                disabled={testingVoice}
                className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/30"
              >
                {testingVoice ? 'Generating...' : 'Test Voice 🔊'}
              </button>
            </div>
            <input
              type="password"
              value={elevenLabsInput}
              onChange={(e) => setElevenLabsInput(e.target.value)}
              placeholder="xi_..."
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
            />
            <p className="text-[10px] text-slate-400">
              When configured, YaadBuddy speaks in real human-like Indian Hindi / English voice without browser voice breaking!
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <span className="text-[11px] text-emerald-400">
              {saveStatus ? 'Keys saved to browser LocalStorage!' : 'Stored safely in your browser.'}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-md flex items-center gap-1"
              >
                <Check size={14} />
                <span>Save Keys</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
