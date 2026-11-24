/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#F0F5FA',
          100: '#E2EAF4',
          200: '#C5D6EA',
          300: '#9ABCE0',
          400: '#649BD1',
          500: '#3D7BC0',
          600: '#2C61A2',
          700: '#1E4A80',
          800: '#133560',
          900: '#0B2240',
          950: '#071529',
        },
        clay: {
          bg: '#EEF2F6',
          surface: '#FFFFFF',
          darkBg: '#0F172A',
          darkSurface: '#1E293B',
        }
      },
      boxShadow: {
        'soft-3d': '6px 6px 14px rgba(166, 180, 200, 0.35), -6px -6px 14px rgba(255, 255, 255, 0.95)',
        'soft-3d-hover': '8px 8px 18px rgba(166, 180, 200, 0.45), -8px -8px 18px rgba(255, 255, 255, 1)',
        'soft-3d-pressed': 'inset 4px 4px 8px rgba(166, 180, 200, 0.4), inset -4px -4px 8px rgba(255, 255, 255, 0.9)',
        'soft-3d-sm': '3px 3px 8px rgba(166, 180, 200, 0.3), -3px -3px 8px rgba(255, 255, 255, 0.9)',
        'soft-3d-dark': '6px 6px 16px rgba(0, 0, 0, 0.5), -4px -4px 12px rgba(255, 255, 255, 0.04)',
        'soft-3d-dark-pressed': 'inset 4px 4px 8px rgba(0, 0, 0, 0.6), inset -3px -3px 6px rgba(255, 255, 255, 0.05)',
        'pill': '0 4px 14px 0 rgba(37, 99, 235, 0.25)',
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
