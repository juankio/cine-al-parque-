/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // 👈 el toggle funcionará con la clase .dark en <html>
  theme: {
    extend: {
      colors: {
        ferrari: {
          red: '#FF2800',
          dark: '#C00000',
        },
        surface: {
          light: '#FFFFFF',
          dark: '#121212',
        },
        theme: '#FF2800',
      },
    },
  },
  plugins: [],
}
