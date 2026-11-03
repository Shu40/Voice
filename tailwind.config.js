/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        yaad: {
          dark: '#070B14',
          navy: '#0C1322',
          card: '#121B30',
          cardHover: '#182440',
          border: 'rgba(255, 255, 255, 0.08)',
          borderHover: 'rgba(139, 92, 246, 0.3)',
          purple: '#8B5CF6',
          indigo: '#6366F1',
          cyan: '#06B6D4',
          pink: '#EC4899',
          amber: '#F59E0B',
          emerald: '#10B981'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'orb-glow': 'orbGlow 3s ease-in-out infinite',
        'orb-pulse': 'orbPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wave-bar': 'waveBar 1.2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        orbGlow: {
          '0%, 100%': { transform: 'scale(1)', filter: 'drop-shadow(0 0 25px rgba(139, 92, 246, 0.5))' },
          '50%': { transform: 'scale(1.06)', filter: 'drop-shadow(0 0 45px rgba(6, 182, 212, 0.7))' },
        },
        orbPulse: {
          '0%, 100%': { opacity: '0.9', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(1.08)' },
        },
        waveBar: {
          '0%': { height: '20%' },
          '100%': { height: '100%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
