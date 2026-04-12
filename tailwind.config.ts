import type { Config } from "tailwindcss";

export default {
  theme: {
    extend: {
      colors: {
        primary: "#402940",
        secondary: "#F0E8F0",
        textLight: "#E0E2DF",
        accent: "#FBEEE2",
      },
      screens: {
        tablet: "768px",
        laptop: "1024px",
      },
    },
  },
  plugins: [],
} satisfies Config;