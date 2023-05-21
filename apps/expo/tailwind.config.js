// TODO: Add support for TS config files in Nativewind.

// import { type Config } from "tailwindcss";

// import baseConfig from "@acme/tailwind-config";

// export default {
//   presets: [baseConfig],
//   content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
// } satisfies Config;

const config = {
  content: ["./src/**/*.{ts,tsx}"],
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
};

module.exports = config;
