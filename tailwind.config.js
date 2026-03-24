/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue"
  ],
  theme: {
    extend: {
      colors: {
        'kelola-sea': '#c16fb0',
        'kelola-beige': '#f7fcf0',
        'kelola-lightgreen': '#ecffb6',
        'kelola-pink': '#c16fb0',
        'kelola-teal': '#00545f'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
