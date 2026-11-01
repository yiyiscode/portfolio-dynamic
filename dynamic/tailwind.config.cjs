/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '"Noto Sans TC"', '"Microsoft JhengHei"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        accent: '#3b82f6',
        'accent-secondary': '#06b6d4',
        'bg-dark': '#0a1628',
        'bg-light': '#f8fafc',
      },
    },
  },
  plugins: [],
};
