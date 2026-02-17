import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
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
