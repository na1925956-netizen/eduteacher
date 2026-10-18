/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Montserrat', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eef5ff',
          100: '#d9e8ff',
          200: '#bcd6ff',
          300: '#8ebcff',
          400: '#5996ff',
          500: '#2f6ff6',
          600: '#1f56e6',
          700: '#1a44c4',
          800: '#1b3a9e',
          900: '#13286b',
          950: '#0c1a4a',
        },
      },
      boxShadow: {
        soft: '0 2px 10px -2px rgba(30, 58, 138, 0.08), 0 8px 24px -8px rgba(30, 58, 138, 0.10)',
        lift: '0 6px 16px -4px rgba(30, 58, 138, 0.14), 0 18px 40px -12px rgba(30, 58, 138, 0.22)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};
