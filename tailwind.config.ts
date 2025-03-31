import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primaryWhite: "#ffffff",
        primaryBlack: "#1d1b19",
        primaryBlue: "#0b3d91",
        grey: "#393834",
        redFill: "#952f2d",
        redBorder: "#b05447",
        panelBlack: "#121212",
        selectedBlack: "#212121",
        unselectedBlack: "#000000",
      },
    },
  },
  plugins: [],
} satisfies Config;
