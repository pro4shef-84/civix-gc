import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f4f7ff",
          100: "#e3eaff",
          200: "#c7d3ff",
          300: "#a4b4ff",
          400: "#7f8cff",
          500: "#5f63ff",
          600: "#4b47eb",
          700: "#3d38c3",
          800: "#312f97",
          900: "#292977"
        }
      }
    }
  },
  plugins: []
};

export default config;
