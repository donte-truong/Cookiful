import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1e1f1d",
        oat: "#f6f0e5",
        tomato: "#d95f43",
        sage: "#9caf88",
        moss: "#5e6f52",
        butter: "#f1cf77",
        hearth: {
          surface: "#fff8ef",
          paper: "#ffffff",
          low: "#fbf3e4",
          container: "#f5edde",
          high: "#efe7d9",
          highest: "#e9e2d3",
          text: "#1e1b13",
          muted: "#594238",
          copper: "#9d3f00",
          copperSoft: "#be561a",
          accent: "#8c4f10",
          outline: "#8c7166",
          ghost: "#e0c0b2",
          blush: "#ffdbcc"
        }
      },
      fontFamily: {
        sans: ["Manrope", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Noto Serif", "Georgia", "serif"]
      },
      boxShadow: {
        card: "0 20px 60px rgba(30, 31, 29, 0.12)",
        hearth: "0 20px 40px rgba(30, 27, 19, 0.06)"
      },
      backgroundImage: {
        "copper-gradient": "linear-gradient(135deg, #9d3f00 0%, #be561a 100%)",
        "hearth-glow":
          "radial-gradient(circle at top left, rgba(190, 86, 26, 0.18), transparent 34%), radial-gradient(circle at 80% 20%, rgba(255, 219, 204, 0.35), transparent 30%), linear-gradient(180deg, #fff8ef 0%, #fff8ef 100%)"
      }
    }
  },
  plugins: []
};

export default config;
