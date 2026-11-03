import React, { useState } from 'react';
import { ViewMode, AssistantPersonality } from '../types';
import { useMemories } from '../context/MemoryContext';
import { useVoiceSpeaker } from '../hooks/useVoiceSpeaker';
import { 
  Settings, 
  Key, 
  Volume2, 
  Mic, 
  Database, 
  Trash2, 
  RotateCcw, 
  Download, 
  Upload, 
  Check, 
  AlertTriangle, 
  ShieldCheck, 
  Bot, 
  Sparkles, 
  Sliders 
} from 'lucide-react';

interface SettingsPageProps {
  onNavigate: (view: ViewMode) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate }) => {
  const { 
    geminiApiKey, 
    setGeminiApiKey, 
    personality, 
    setPersonality, 
    speechLanguage, 
    setSpeechLanguage,
    hasDemoData,
    loadDemoData,
    clearDemoData,
    clearAllMemories,
    exportBackup,
    importBackup,
    memories
  } = useMemories();

  const [inputKey, setInputKey] = useState(geminiApiKey);
  const [keySaved, setKeySaved] = useState(false);
  const [jsonImportText, setJsonImportText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const { availableVoices, selectedVoice, setSelectedVoice, rate, setRate, pitch, setPitch, speak } = useVoiceSpeaker({
    personality
  });

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    setGeminiApiKey(inputKey.trim());
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2500);
  };

  const handleTestSpeech = () => {
    speak("Hello! This is YaadBuddy AI speaking in your selected voice and speed.");
  };

  const handleImport = () => {
    if (!jsonImportText.trim()) return;
    const ok = importBackup(jsonImportText);
    if (ok) {
      setImportStatus("Import successful! Memories restored.");
      setJsonImportText('');
    } else {
      setImportStatus("Failed to parse JSON. Please check file format.");
    }
    setTimeout(() => setImportStatus(null), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
          Settings & Configuration
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Customize your voice engine, AI personality, API integrations, and backup your memory database.
        </p>
      </div>

      {/* Section 1: AI Personality Mode */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <Bot size={18} className="text-purple-400" />
          <h3 className="text-base font-bold text-white font-display">AI Companion Personality</h3>
        </div>
        <p className="text-xs text-slate-400">
          Determines the conversational tone, humor, and speech characteristics of YaadBuddy.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(['friendly', 'funny', 'motivational'] as AssistantPersonality[]).map(p => {
            const isSelected = personality === p;
            return (
              <button
                key={p}
                onClick={() => setPersonality(p)}
                className={`p-4 rounded-2xl text-left border transition-all ${
                  isSelected
                    ? 'bg-purple-900/40 border-purple-500 text-white shadow-lg shadow-purple-900/30'
                    : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                }`}
              >
                <span className="text-sm font-bold capitalize block">{p} Mode</span>
                <span className="text-xs text-slate-400 mt-1 block">
                  {p === 'friendly' && 'Warm, companionable, natural conversational partner.'}
                  {p === 'funny' && 'Playful Hinglish banter, light roasts, witty jokes ("Boss!").'}
                  {p === 'motivational' && 'High-energy productivity coach, celebrating every milestone!'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 2: Speech & Voice Settings */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <Volume2 size={18} className="text-cyan-400" />
          <h3 className="text-base font-bold text-white font-display">Voice & Speech Recognition</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Recognition Language */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Mic size={13} />
              <span>Speech Recognition Language</span>
            </label>
            <select
              value={speechLanguage}
              onChange={(e) => setSpeechLanguage(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="en-IN">English (India) — Recommended for Hinglish</option>
              <option value="en-US">English (US)</option>
              <option value="en-GB">English (UK)</option>
              <option value="hi-IN">Hindi (India)</option>
            </select>
          </div>

          {/* Voice selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Volume2 size={13} />
              <span>Browser Speech Voice</span>
            </label>
            <select
              value={selectedVoice?.name || ''}
              onChange={(e) => {
                const found = availableVoices.find(v => v.name === e.target.value);
                if (found) setSelectedVoice(found);
              }}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              {availableVoices.map(v => (
                <option key={v.name} value={v.name}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Speed / Rate slider */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Speech Rate: {rate}x</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.4"
              step="0.05"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
              className="w-full accent-cyan-400"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Speech Pitch: {pitch}</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.3"
              step="0.05"
              value={pitch}
              onChange={(e) => setPitch(parseFloat(e.target.value))}
              className="w-full accent-purple-500"
            />
          </div>
        </div>

        <button
          onClick={handleTestSpeech}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
        >
          <Volume2 size={14} />
          <span>Test Speech Voice</span>
        </button>
      </div>

      {/* Section 3: Gemini API Configuration */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <Key size={18} className="text-amber-400" />
          <h3 className="text-base font-bold text-white font-display">Gemini API Key (Optional)</h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          YaadBuddy AI features an automatic built-in zero-latency local NLP extraction engine that works offline and without an API key! You can optionally connect your Google Gemini API key for cloud reasoning.
        </p>

        <form onSubmit={handleSaveKey} className="space-y-3">
          <div className="flex gap-2">
            <input
              type="password"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="AIzaSy..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all shrink-0"
            >
              {keySaved ? 'Saved!' : 'Save Key'}
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            Keys are strictly saved in your local browser LocalStorage and never exposed or sent to third-party backends.
          </p>
        </form>
      </div>

      {/* Section 4: Database & Memory Vault Backup */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <Database size={18} className="text-emerald-400" />
          <h3 className="text-base font-bold text-white font-display">Database & Data Portability</h3>
        </div>
        <p className="text-xs text-slate-400">
          Currently managing <strong className="text-white">{memories.length}</strong> saved memories stored in browser LocalStorage.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={exportBackup}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all"
          >
            <Download size={14} />
            <span>Export Backup (JSON)</span>
          </button>

          {hasDemoData ? (
            <button
              onClick={clearDemoData}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-700 text-xs font-semibold transition-colors"
            >
              <Trash2 size={14} />
              <span>Remove Demo Data</span>
            </button>
          ) : (
            <button
              onClick={loadDemoData}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 text-xs font-semibold transition-colors"
            >
              <RotateCcw size={14} />
              <span>Restore Sample Demo Data</span>
            </button>
          )}

          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to delete ALL saved memories? This cannot be undone.")) {
                clearAllMemories();
              }
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-950/80 text-rose-300 border border-rose-800/60 text-xs font-semibold transition-colors"
          >
            <Trash2 size={14} />
            <span>Clear All Memories</span>
          </button>
        </div>

        {/* JSON Import Box */}
        <div className="pt-3 border-t border-slate-800 space-y-2">
          <label className="block text-xs font-semibold text-slate-300">Import Memories from JSON</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={jsonImportText}
              onChange={(e) => setJsonImportText(e.target.value)}
              placeholder='Paste exported JSON here...'
              className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-600 focus:outline-none"
            />
            <button
              onClick={handleImport}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 shrink-0"
            >
              Import
            </button>
          </div>
          {importStatus && (
            <p className="text-xs text-cyan-300">{importStatus}</p>
          )}
        </div>
      </div>
    </div>
  );
};
