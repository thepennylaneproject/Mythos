import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "var(--ink-black)",
        wall: "var(--wall-white)",
        graffiti: "var(--graffiti-gold)",
      },
    },
  },
  plugins: [],
};

export default config;
