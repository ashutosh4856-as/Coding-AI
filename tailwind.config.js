/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: "#0a0a0f",
          800: "#12121a",
          700: "#1a1a27",
          600: "#22223a",
          500: "#2d2d4a",
        },
        accent: {
          purple: "#7c3aed",
          blue: "#2563eb",
          green: "#10b981",
          red: "#ef4444",
        }
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      }
    },
  },
  plugins: [],
}
