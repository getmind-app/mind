import type { ExpoConfig } from "@expo/config";

const CLERK_PUBLISHABLE_KEY =
    "pk_test_ZmFtb3VzLWh5ZW5hLTU1LmNsZXJrLmFjY291bnRzLmRldiQ";

const STRIPE_PUBLISHABLE_KEY =
    "pk_test_51NgDQEDtBWZzYd58qQAuw01NR3d2NOT0rC0FxVuMAsFVfQtzA2yjCij7qYcfQcse05pzm0pYGWirTW7mtZMb7oSa00IM1kPSO5";

const defineConfig = (): ExpoConfig => ({
    name: "expo",
    slug: "mind",
    scheme: "mind",
    version: "1.0.0",
    orientation: "portrait",
    owner: "mind-therapy",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
        image: "./assets/splash.png",
        resizeMode: "contain",
        backgroundColor: "#fff",
    },
    updates: {
        fallbackToCacheTimeout: 0,
    },
    assetBundlePatterns: ["**/*", "assets/*"],
    ios: {
        supportsTablet: true,
        bundleIdentifier: "app.getmind",
        infoPlist: {
            LSApplicationQueriesSchemes: ["mind"],
        },
    },
    android: {
        adaptiveIcon: {
            foregroundImage: "./assets/adaptive-icon.png",
            backgroundColor: "#fff",
        },
        package: "app.getmind",
        googleServicesFile: "./google-services.json",
    },
    extra: {
        eas: {
            projectId: "99018e7e-9e9a-4064-82d0-dc3cfa6457d5",
        },
        CLERK_PUBLISHABLE_KEY,
        STRIPE_PUBLISHABLE_KEY,
    },
    plugins: [
        "./expo-plugins/with-modify-gradle.js",
        "expo-localization",
        [
            "@stripe/stripe-react-native",
            {
                //   "merchantIdentifier": string | string [], ** Required for Apple Pay **
                enableGooglePay: true,
            },
        ],
        "expo-router",
    ],
});

export default defineConfig;
