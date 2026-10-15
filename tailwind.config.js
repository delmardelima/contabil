/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Segoe UI Variable Display"', '"Segoe UI"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Consolas', 'monospace']
      },
      colors: {
        fluent: {
          dark: '#1c1c1c',
          darker: '#141414',
          darkest: '#0c0c0c',
          card: '#232323',
          border: 'rgba(255, 255, 255, 0.08)',
          light: '#f3f3f3',
          lightcard: '#ffffff',
          lightborder: '#e5e5e5',
          accent: '#0078d4',
          accentHover: '#1084d9',
          accentDark: '#005a9e',
          success: '#107c41',
          warning: '#d83b01',
          danger: '#c42b1c'
        }
      }
    },
  },
  plugins: [],
}
