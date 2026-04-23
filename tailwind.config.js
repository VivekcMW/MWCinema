/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'mw-blue': {
          50: '#eaf1f8',
          100: '#d5e3f0',
          200: '#abc6e1',
          300: '#81aad3',
          400: '#578dc4',
          500: '#1d65af',
          600: '#175289',
          700: '#113e67',
          800: '#0b2a45',
          900: '#061624'
        },
        'mw-teal': {
          50: '#e6faf7',
          100: '#ccf5ef',
          500: '#14b8a6',
          600: '#0f9488'
        },
        'mw-orange': {
          50: '#fff3e6',
          100: '#ffe7cc',
          500: '#ff8a00',
          600: '#cc6e00'
        },
        'mw-green': { 500: '#16a34a', 100: '#dcfce7' },
        'mw-red': { 500: '#dc2626', 100: '#fee2e2' },
        'mw-amber': { 500: '#f59e0b', 100: '#fef3c7' },
        'mw-gray': {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a'
        }
      },
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        'mw-card': '0 1px 2px rgba(15,23,42,0.04), 0 1px 3px rgba(15,23,42,0.06)',
        'mw-pop': '0 10px 30px rgba(15,23,42,0.12)'
      },
      borderRadius: { mw: '10px', 'mw-sm': '8px' }
    }
  },
  plugins: []
};
