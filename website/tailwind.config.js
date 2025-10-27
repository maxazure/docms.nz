/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary-color, #10B981)',
        secondary: 'var(--secondary-color, #059669)',
        accent: 'var(--accent-color, #34D399)',
      },
      fontFamily: {
        sans: 'var(--font-family, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
      },
      borderRadius: {
        DEFAULT: 'var(--border-radius, 0.375rem)',
      },
      boxShadow: {
        DEFAULT: 'var(--box-shadow, 0 1px 3px rgba(0,0,0,0.12))',
      },
    },
  },
  plugins: [],
}
