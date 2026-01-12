import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // TreesAI & GCCC brand colors - greens and earthy tones
        primary: {
          50: "#f0f9f4",
          100: "#dcf2e3",
          200: "#bce4ca",
          300: "#8fcea8",
          400: "#5bb17e",
          500: "#3b7a57", // Primary green
          600: "#2d6246",
          700: "#254f3a",
          800: "#204030",
          900: "#1a3528",
          950: "#0d1c14"
        },
        // GCCC blue accents
        secondary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#2a5d84", // GCCC blue
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554"
        },
        // Earthy accent colors
        accent: {
          50: "#faf7f2",
          100: "#f4ede0",
          200: "#e8d9c0",
          300: "#d9bf96",
          400: "#c9a06a",
          500: "#a67c52", // Earthy brown
          600: "#8f6844",
          700: "#755339",
          800: "#604530",
          900: "#4f3a2a",
          950: "#2a1d15"
        },
        // Legacy forest color for compatibility
        forest: {
          50: "#f0f9f4",
          100: "#dcf2e3",
          500: "#3b7a57",
          600: "#2d6246",
          900: "#1a3528"
        }
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif"
        ]
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #3b7a57 0%, #2d6246 100%)",
        "gradient-secondary": "linear-gradient(135deg, #2a5d84 0%, #1d4ed8 100%)",
        "gradient-nature": "linear-gradient(135deg, #3b7a57 0%, #2a5d84 100%)"
      }
    }
  },
  plugins: []
};

export default config;

