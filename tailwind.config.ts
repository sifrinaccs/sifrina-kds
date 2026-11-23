import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        sifrina: {
          yellow: '#FACC15',
          gold: '#EAB308',
          dark: '#020617', // slate-950
          card: '#0f172a', // slate-900
          border: '#1e293b', // slate-800
          fire: '#F97316', // orange-500
          cyan: '#38BDF8', // sky-400
          amber: '#FBBF24', // amber-400
          emerald: '#34D399', // emerald-400
        },
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};

export default config;
