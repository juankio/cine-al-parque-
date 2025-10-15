/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // activa modo oscuro por clase .dark
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#FF2800', // Ferrari Red
          50: '#FFE5DF',
          100: '#FFCFC4',
          200: '#FFAB95',
          300: '#FF8766',
          400: '#FF6237',
          500: '#FF2800',
          600: '#E52400',
          700: '#B51C00',
          800: '#851500',
          900: '#540D00'
        }
      }
    }
  },
  plugins: []
}
