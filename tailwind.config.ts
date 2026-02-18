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
    },
  },
  plugins: [],
};
export default config;
