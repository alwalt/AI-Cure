import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
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

        // PRIMARY COLOR TOKENS
        "gray-0": "var(--gray-0)", // primaryWhite
        "gray-150": "var(--gray-150)", // brightGray
        "gray-200": "var(--gray-200)", // buttonBg
        "gray-500": "var(--gray-500)", // 85% opacity black = rgb(128, 128, 128)
        "gray-700": "var(--gray-700", // column border
        "gray-800": "var(--gray-800)", // gray
        "gray-850": "var(--gray-850)", // selectedBlack
        "gray-900": "var(--gray-900)", // primaryBlack
        "gray-950": "var(--gray-950)", // panelBlack
        "gray-1000": "var(--gray-1000)", // unSelectedBlack

        "blue-300": "var(--blue-300)", // selectedBlue
        "blue-700": "var(--blue-700)", // primaryBlue

        "red-600": "var(--red-600)", // redBorder (lighter/muted)
        "red-700": "var(--red-700)", // redFill

        // SEMANTIC TOKENS (reference the primitives)
        // backgrounds
        "background-default": "var(--gray-900)", // default background

        // surface
        "surface-emphasis": "var(--gray-850)", // Access Database area
        "surface-navigation": "var(--blue-700)", // nav bar background color
        "surface-accent": "var(--blue-300)",
        "surface-card": "var(--gray-900)",
        "surface-card-expanded": "var(--gray-850)",

        // buttons
        "button-emphasis": "var(--gray-500)", // Access Database button
        "button-navigation": "var(--gray-0)", // nav buttons
        "button-close": "var(--red-700)", // redFill
        "button-card": "var(--blue-300)",

        // buttons:hover
        "button-hover-emphasis": "var(--gray-150)", // Access Database button
        "button-hover-navigation": "var(--blue-300)", // nav hover buttons
        "button-hover-close": "var(--blue-300)",
        "button-hover-card": "var(--blue-700)",

        // text
        "text-default": "var(--gray-0)", // primaryWhite
        "text-hover-emphasis": "var(--gray-1000)", // Access Database text button hover
        "text-accent": "var(--blue-300)",

        // border
        "border-emphasis": "var(--gray-1000)", // unSelectedBlack
        "border-accent": "var(--blue-300)", // selectedBlue
        "border-default": "var(--gray-0)", // primaryWhite
        "border-card": "var(--blue-700)",
        "border-column": "var(--gray-700)", // column border

        // focus
        "focus-default": "var(--gray-0)", // primaryWhite (all borders)
        "focus-emphasis-border": "var(--blue-300)", // bright blue border for focus only Access Database

        // overlay
        "overlay-default": "var(--gray-500)", // Semi-transparent backdrop

        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
} satisfies Config;
