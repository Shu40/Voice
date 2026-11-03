import React from 'react';

interface AudioWaveformProps {
  isActive: boolean;
  color?: 'cyan' | 'purple' | 'emerald';
  barsCount?: number;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  isActive,
  color = 'cyan',
  barsCount = 18
}) => {
  const colorMap = {
    cyan: 'bg-cyan-400 shadow-[0_0_10px_#06b6d4]',
    purple: 'bg-purple-400 shadow-[0_0_10px_#a855f7]',
    emerald: 'bg-emerald-400 shadow-[0_0_10px_#10b981]'
  };

  const selectedColor = colorMap[color];

  return (
    <div className="flex items-center justify-center gap-1.5 h-12 py-2 px-4 rounded-full bg-slate-900/60 border border-white/5 backdrop-blur-md">
      {Array.from({ length: barsCount }).map((_, i) => {
        // Calculate random height simulation if active
        const minHeight = 4;
        const animationDelay = `${(i % 6) * 0.15}s`;
        const animationDuration = `${0.6 + (i % 5) * 0.15}s`;

        return (
          <div
            key={i}
            className={`w-1 rounded-full transition-all duration-150 ${selectedColor} ${
              isActive ? 'animate-wave-bar' : 'h-1.5 opacity-30'
            }`}
            style={{
              height: isActive ? undefined : `${minHeight}px`,
              animationDelay: isActive ? animationDelay : '0s',
              animationDuration: isActive ? animationDuration : '1s'
            }}
          />
        );
      })}
    </div>
  );
};
