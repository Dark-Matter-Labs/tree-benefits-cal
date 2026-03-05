/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#e7fdf3",
          100: "#c2f7e0",
          200: "#98f0cc",
          300: "#6de9b5",
          400: "#4ee39f",
          500: "#3dd68c", // vivid mid-green accent
          600: "#2fb173",
          700: "#24855a",
          800: "#1a5a40",
          900: "#143a2b",
          950: "#0b2118"
        },
        secondary: {
          50: "#111827",
          100: "#1f2933",
          200: "#3d4a57",
          300: "#4b5c68",
          400: "#5b7180",
          500: "#6b8a77",
          600: "#8ea59a",
          700: "#a6b9ad",
          800: "#c0cdc2",
          900: "#dde6df"
        },
        accent: {
          50: "#141a16",
          100: "#1a2420",
          200: "#223029",
          300: "#2c3d34",
          400: "#36493f",
          500: "#41554b",
          600: "#4c6156",
          700: "#5a6e63",
          800: "#6b7e73",
          900: "#7d9084"
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
        "gradient-primary": "linear-gradient(135deg, #141a16 0%, #0d1210 100%)",
        "gradient-secondary": "linear-gradient(135deg, #141a16 0%, #0d1210 100%)",
        "gradient-nature": "linear-gradient(135deg, #141a16 0%, #0d1210 100%)"
      }
    }
  },
  plugins: []
};
