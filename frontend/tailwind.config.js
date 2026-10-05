/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0f1117",
        card: "#1a1f2e",
        accent: "#2563eb",
        accentHover: "#1d4ed8",
        success: "#10b981",
        danger: "#ef4444",
        muted: "#94a3b8"
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
