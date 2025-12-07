/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,html}'],
  theme: {
    extend: {
      fontFamily: {
        raleway: ['Raleway', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#719CBF',
          100: '#F7FBFD',   // ultra-light
          200: '#E3F0F7',
          300: '#C2DDF0',
          400: '#9BC5E6',
          500: '#719CBF',   // DEFAULT
          600: '#5C91C4',
          700: '#42739A',
          800: '#2E4E68',
        },
        purple: {
          600: '#7658A0',
          700: '#4A3B5E',
        },
      },
      fontSize: {
        'display-lg': ['48px', { lineHeight: '1', letterSpacing: '0.04em', fontWeight: '700' }],
      },
      letterSpacing: { 'wide-4': '0.04em' },
      textTransform: { uppercase: 'uppercase' },
      backgroundImage: {
        'purple-gradient':
          'linear-gradient(115.5deg, #7658A0 36.15%, #4A3B5E 96.02%)',
      },
    },
  },
  plugins: [],
};