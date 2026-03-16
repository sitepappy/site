import type { Config } from "tailwindcss"

export default {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        acid: "#39FF14",
        neon: "#7B2EFF",
        base: "#0a0a0f"
      },
      boxShadow: {
        neon: "0 0 10px #39FF14, 0 0 20px #7B2EFF"
      },
      backgroundImage: {
        cyber: "linear-gradient(135deg, rgba(10,10,15,0.9), rgba(10,10,15,1))",
        purpleGreen: "linear-gradient(135deg, #7B2EFF, #39FF14)"
      }
    }
  },
  plugins: []
} satisfies Config
