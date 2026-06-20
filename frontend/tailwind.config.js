/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Ink — the base neutral scale, cool-violet-tinted near-black to soft white
        ink: {
          950: '#08070d',
          900: '#0d0c16',
          800: '#15131f',
          700: '#1e1b2b',
          600: '#2a2638',
          500: '#3d3850',
          400: '#5d5775',
          300: '#8a84a3',
          200: '#bdb8d1',
          100: '#e3e0ee',
          50: '#f5f4fa',
        },
        // Synapse — electric violet, the primary signal color (recall / active)
        synapse: {
          900: '#2a1065',
          700: '#4c1d95',
          600: '#6d28d9',
          500: '#7c3aed',
          400: '#9461fa',
          300: '#b794f6',
          200: '#dbc7fc',
        },
        // Recall — cyan-teal, secondary signal (success / consolidation)
        recall: {
          600: '#0e7490',
          500: '#0891b2',
          400: '#22d3ee',
          300: '#67e8f9',
        },
        // Forget — amber/coral, the decay signal (again / lapse / urgency)
        decay: {
          600: '#b45309',
          500: '#ea580c',
          400: '#fb923c',
          300: '#fdba74',
        },
        ease: {
          500: '#16a34a',
          400: '#4ade80',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'grain': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
        'mesh-synapse': 'radial-gradient(at 20% 20%, rgba(124,58,237,0.25) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(34,211,238,0.15) 0px, transparent 50%), radial-gradient(at 50% 100%, rgba(124,58,237,0.2) 0px, transparent 50%)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(8, 7, 13, 0.37)',
        'glow-synapse': '0 0 40px -10px rgba(124, 58, 237, 0.5)',
        'glow-recall': '0 0 40px -10px rgba(34, 211, 238, 0.4)',
        'inner-glass': 'inset 0 1px 0 0 rgba(255,255,255,0.06)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
    },
  },
  plugins: [],
}
