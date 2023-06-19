import type { Config } from "tailwindcss";

export default {
  content: [""],
  theme: {
    extend: {
      colors: {
        "off-white": "#f8f8f8",
      },
      fontFamily: {
        "nunito-sans": ["Nunito-Sans"],
        "nunito-sans-bold": ["Nunito-Sans-Bold"],
      },
    },
  },
  plugins: [],
} satisfies Config;
