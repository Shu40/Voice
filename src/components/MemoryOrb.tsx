import React from 'react';
import { Mic, MicOff, Volume2, Sparkles, Loader2 } from 'lucide-react';

interface MemoryOrbProps {
  status: 'idle' | 'listening' | 'processing' | 'speaking';
  audioLevel?: number;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export const MemoryOrb: React.FC<MemoryOrbProps> = ({
  status,
  audioLevel = 0,
  onClick,
  size = 'lg'
}) => {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-28 h-28',
    lg: 'w-44 h-44 sm:w-52 sm:h-52'
  };

  const iconSizes = {
    sm: 20,
    md: 32,
    lg: 48
  };

  const isListening = status === 'listening';
  const isProcessing = status === 'processing';
  const isSpeaking = status === 'speaking';

  // Dynamic scale based on simulated or real audio level
  const dynamicScale = isListening ? 1 + audioLevel * 0.22 : 1;

  return (
    <div className="relative flex items-center justify-center select-none">
      {/* Outer Glow Rings for Listening */}
      {isListening && (
        <>
          <div 
            className="absolute -inset-8 rounded-full bg-gradient-to-r from-purple-600/30 via-cyan-500/30 to-indigo-600/30 blur-2xl animate-pulse"
            style={{ transform: `scale(${1 + audioLevel * 0.4})` }}
          />
          <div className="absolute -inset-4 rounded-full border border-cyan-400/40 animate-ping opacity-60" />
          <div className="absolute -inset-10 rounded-full border border-purple-500/30 animate-pulse opacity-40" />
        </>
      )}

      {/* Speaking Glow Rings */}
      {isSpeaking && (
        <div className="absolute -inset-6 rounded-full bg-gradient-to-r from-emerald-500/20 via-cyan-500/30 to-purple-500/20 blur-xl animate-pulse" />
      )}

      {/* Processing Spinner */}
      {isProcessing && (
        <div className="absolute -inset-5 rounded-full border-2 border-dashed border-purple-400 animate-spin opacity-70" />
      )}

      {/* Main Interactive Orb Body */}
      <button
        onClick={onClick}
        type="button"
        aria-label="Activate Voice Assistant"
        className={`group relative rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 transform active:scale-95 shadow-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/40 ${sizeClasses[size]}`}
        style={{
          transform: `scale(${dynamicScale})`,
          background: isListening
            ? 'radial-gradient(circle, #06B6D4 0%, #6366F1 50%, #1E1B4B 100%)'
            : isSpeaking
            ? 'radial-gradient(circle, #10B981 0%, #6366F1 60%, #0F172A 100%)'
            : isProcessing
            ? 'radial-gradient(circle, #EC4899 0%, #8B5CF6 60%, #0F172A 100%)'
            : 'radial-gradient(circle, #8B5CF6 0%, #4F46E5 50%, #0F172A 100%)',
          boxShadow: isListening
            ? '0 0 60px rgba(6, 182, 212, 0.7), inset 0 0 25px rgba(255, 255, 255, 0.6)'
            : isSpeaking
            ? '0 0 50px rgba(16, 185, 129, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.5)'
            : '0 0 40px rgba(139, 92, 246, 0.45), inset 0 0 15px rgba(255, 255, 255, 0.25)'
        }}
      >
        {/* Inner rotating gradient layer */}
        <div className="absolute inset-1 rounded-full opacity-60 mix-blend-screen bg-gradient-to-tr from-cyan-400 via-transparent to-pink-400 animate-spin" style={{ animationDuration: isListening ? '3s' : '9s' }} />

        {/* Center Icon */}
        <div className="relative z-10 flex flex-col items-center justify-center text-white">
          {isProcessing ? (
            <Loader2 size={iconSizes[size]} className="animate-spin text-white drop-shadow-md" />
          ) : isListening ? (
            <Mic size={iconSizes[size]} className="animate-pulse text-cyan-100 drop-shadow-lg" />
          ) : isSpeaking ? (
            <Volume2 size={iconSizes[size]} className="animate-bounce text-emerald-200 drop-shadow-lg" />
          ) : (
            <Mic size={iconSizes[size]} className="group-hover:scale-110 transition-transform duration-200 text-purple-100 drop-shadow-md" />
          )}

          {size === 'lg' && (
            <span className="mt-2 text-xs font-semibold tracking-wider uppercase text-white/90 drop-shadow">
              {isListening ? 'Listening...' : isProcessing ? 'Thinking...' : isSpeaking ? 'Speaking...' : 'Tap to Speak'}
            </span>
          )}
        </div>
      </button>
    </div>
  );
};
