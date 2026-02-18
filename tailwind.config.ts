import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F2F4F6",
        surface: "#FFFFFF",
        foreground: "#191F28",
        muted: "#8B95A1",
      },
      boxShadow: {
        plastic: "0 2px 1px rgba(255,255,255,1), 0 -2px 1px rgba(0,0,0,0.1)",
      },
    },
  },
  plugins: [],
};
export default config;
