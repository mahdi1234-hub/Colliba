import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx,js,jsx,mdx}"],
  theme: {
    extend: {
      colors: {
        parchment: "#f4f0e9",
        parchment2: "#e9e2d8",
        rule: "#d9d1c5",
        ink: "#181512",
        muted: "#5f5851",
        subtle: "#7a7268",
        quiet: "#8a8178",
        accent: "#2F5D50"
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Instrument Serif", "ui-serif", "serif"],
        sans: ["var(--font-sans)", "Plus Jakarta Sans", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      letterSpacing: {
        tightest: "-0.04em"
      }
    }
  },
  plugins: []
} satisfies Config;
