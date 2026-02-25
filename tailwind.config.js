/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6fffb',
          100: '#c8faf4',
          200: '#9ff2e9',
          300: '#71e7dc',
          400: '#49d9cf',
          500: '#2EC4B6',
          600: '#22a89b',
          700: '#1a8a80',
          800: '#166f67',
          900: '#105851',
        },
        brand: {
          50: '#edf4f9',
          100: '#d9e8f2',
          200: '#b8d2e5',
          300: '#8fb6d3',
          400: '#5f92bc',
          500: '#3e739f',
          600: '#2d5f86',
          700: '#1F5A82',
          800: '#1B4965',
          900: '#143D59',
        },
        accent: {
          500: '#1F5A82',
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #143D59 0%, #1B4965 100%)',
      },
    },
  },
  plugins: [],
}
