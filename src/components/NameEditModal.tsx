import React, { useState } from 'react';
import { useSimple } from '../context/SimpleContext';
import { User, X, Check, Sparkles } from 'lucide-react';

interface NameEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NameEditModal: React.FC<NameEditModalProps> = ({ isOpen, onClose }) => {
  const { userName, setUserName, language, speakAudio } = useSimple();
  const [nameInput, setNameInput] = useState(userName);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    
    setUserName(trimmed);
    const greeting = language === 'hi'
      ? `नमस्ते ${trimmed}! आपका नाम सफलतापूर्वक अपडेट हो गया है।`
      : `Hello ${trimmed}! Your name has been successfully updated.`;
    speakAudio(greeting);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-sm rounded-3xl bg-slate-900 border border-purple-500/30 p-5 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <User size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-display">
                {language === 'hi' ? 'अपना नाम बदलें' : 'Change Your Name'}
              </h3>
              <p className="text-[10px] text-slate-400">
                {language === 'hi' ? 'AI आपको इसी नाम से बुलाएगा' : 'AI will address you by this name'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 block">
              {language === 'hi' ? 'नाम दर्ज करें:' : 'Enter User Name:'}
            </label>
            <div className="relative">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="e.g. Shubham, Aryan, Priya"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 font-medium"
                autoFocus
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <Sparkles size={12} className="text-amber-400 shrink-0" />
            <span>
              {language === 'hi'
                ? 'उदाहरण: "शुभम", "राघव", "अमित"'
                : 'Default is "Shubham", used in morning nudges & audits.'}
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {language === 'hi' ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={!nameInput.trim()}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-all"
            >
              <Check size={13} />
              <span>{language === 'hi' ? 'नाम सहेजें' : 'Save Name'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
