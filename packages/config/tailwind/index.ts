import type { Config } from "tailwindcss";

export default {
    content: [""],
    theme: {
        extend: {
            colors: {
                "off-white": "#f8f8f8",
            },
            fontFamily: {
                "nunito-sans": ["NunitoSans_400Regular"],
                "nunito-sans-bold": ["NunitoSans_700Bold"],
            },
        },
    },
    plugins: [],
} satisfies Config;
