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
        brightGrey: "#ececec",
        redFill: "#952f2d",
        redBorder: "#b05447",
        panelBlack: "#121212",
        selectedBlack: "#212121",
        unSelectedBlack: "#000000",
        selectedBlue: "#2a79ff",
        buttonBg: "#C9C9C9",
      },
    },
  },
  plugins: [],
} satisfies Config;
