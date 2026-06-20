/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Void — the base scale. Not neutral gray: cool violet-black, true near-#000 floor.
        void: {
          950: '#050309',
          900: '#0a0712',
          800: '#120d1f',
          700: '#1a1429',
          600: '#251c3a',
          500: '#382a55',
          400: '#5c4a7d',
          300: '#9385ad',
          200: '#c7bfd9',
          100: '#e9e4f2',
          50: '#f7f5fb',
        },
        // Synapse — electric violet. The "firing" signal: active, mid-recall, primary actions.
        synapse: {
          900: '#2e1065',
          700: '#5b21b6',
          600: '#7c3aed',
          500: '#8b5cf6',
          400: '#a78bfa',
          300: '#c4b1fb',
        },
        // Recall — cyan. The "consolidated" signal: success, fresh memory, secondary highlight.
        recall: {
          600: '#0891b2',
          500: '#06b6d4',
          400: '#22d3ee',
          300: '#67e8f9',
        },
        // Decay — ember orange-red. The "forgetting" signal: urgency, again/lapse, warnings.
        decay: {
          600: '#c2410c',
          500: '#ea580c',
          400: '#fb7037',
          300: '#fda571',
        },
        // Consolidation — mint green. The "locked in" signal: easy, mastery, streaks.
        mint: {
          500: '#0aefa0',
          400: '#3ff5b8',
        },
        ghost: '#f5f0ff',
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        'mega': ['clamp(3.5rem, 12vw, 11rem)', { lineHeight: '0.88', letterSpacing: '-0.04em' }],
        'huge': ['clamp(2.5rem, 7vw, 6rem)', { lineHeight: '0.92', letterSpacing: '-0.03em' }],
      },
      backgroundImage: {
        'grain': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\")",
        'void-radial': 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(124,58,237,0.25), transparent 60%)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(5, 3, 9, 0.5)',
        'glow-synapse': '0 0 60px -8px rgba(139, 92, 246, 0.55)',
        'glow-synapse-lg': '0 0 120px -10px rgba(139, 92, 246, 0.6)',
        'glow-recall': '0 0 50px -8px rgba(34, 211, 238, 0.45)',
        'glow-decay': '0 0 50px -8px rgba(251, 112, 55, 0.45)',
        'glow-mint': '0 0 50px -8px rgba(10, 239, 160, 0.4)',
        'inner-edge': 'inset 0 1px 0 0 rgba(255,255,255,0.08)',
        'edge-sharp': '0 0 0 1px rgba(255,255,255,0.08)',
      },
      animation: {
        'float': 'float 7s ease-in-out infinite',
        'float-slow': 'float 11s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'spin-slow': 'spin 14s linear infinite',
        'marquee': 'marquee 28s linear infinite',
        'reveal-up': 'reveal-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scale-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-16px) rotate(1deg)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: 1, filter: 'brightness(1)' },
          '50%': { opacity: 0.7, filter: 'brightness(1.4)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'reveal-up': {
          '0%': { opacity: 0, transform: 'translateY(40px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: 0, transform: 'scale(0.92)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '2rem',
        '4xl': '2.75rem',
      },
      transitionTimingFunction: {
        'snap': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}

