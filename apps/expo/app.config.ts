import type { ExpoConfig } from "@expo/config";

const CLERK_PUBLISHABLE_KEY =
    "pk_test_ZmFtb3VzLWh5ZW5hLTU1LmNsZXJrLmFjY291bnRzLmRldiQ";

const defineConfig = (): ExpoConfig => ({
    name: "expo",
    slug: "mind",
    scheme: "expo",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
        image: "./assets/splash_screen.png",
        resizeMode: "contain",
        backgroundColor: "#fff",
    },
    updates: {
        fallbackToCacheTimeout: 0,
    },
    assetBundlePatterns: ["**/*", "assets/*"],
    ios: {
        supportsTablet: true,
        bundleIdentifier: "your.bundle.identifier",
    },
    android: {
        adaptiveIcon: {
            foregroundImage: "./assets/icon.png",
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
    },
    plugins: ["./expo-plugins/with-modify-gradle.js", "expo-localization"],
});

export default defineConfig;
