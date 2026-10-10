/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          950: '#08140c',
          900: '#102316',
          800: '#183822',
          700: '#225232',
          600: '#2d6d43',
          500: '#3b8b56',
          400: '#58aa73',
          200: '#a7d9b7',
          100: '#def0e4',
          50: '#f2f8f4',
        },
        charcoal: {
          950: '#0a0d0c',
          900: '#141816',
          800: '#1f2523',
          700: '#2e3733',
          600: '#47544f',
          500: '#65746e',
          400: '#8e9d97',
          300: '#b8c3be',
          200: '#d8e0dc',
          100: '#ebf0ed',
          50: '#f5f7f6',
        },
        canvas: '#f8f9f6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      gridTemplateColumns: {
        '24': 'repeat(24, minmax(0, 1fr))',
      },
    },
  },
  plugins: [],
}
