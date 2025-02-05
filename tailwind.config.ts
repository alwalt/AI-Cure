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
				grey: "#393834",
				redFill: "#952f2d",
				redBorder: "#b05447",
			},
		},
	},
	plugins: [],
} satisfies Config;
