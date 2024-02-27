import type { ExpoConfig } from "@expo/config";

type Profile = "dev" | "production";

const profileConstants: {
    [key in Profile]: {
        CLERK_PUBLISHABLE_KEY: string;
        STRIPE_PUBLISHABLE_KEY: string;
    };
} = {
    dev: {
        CLERK_PUBLISHABLE_KEY:
            "pk_test_ZmFtb3VzLWh5ZW5hLTU1LmNsZXJrLmFjY291bnRzLmRldiQ",
        STRIPE_PUBLISHABLE_KEY:
            "pk_test_51NgDQEDtBWZzYd58qQAuw01NR3d2NOT0rC0FxVuMAsFVfQtzA2yjCij7qYcfQcse05pzm0pYGWirTW7mtZMb7oSa00IM1kPSO5",
    },
    production: {
        CLERK_PUBLISHABLE_KEY: "pk_live_Y2xlcmsuZ2V0bWluZC5hcHAk",
        STRIPE_PUBLISHABLE_KEY:
            "pk_live_51NgDQEDtBWZzYd58BDrce2MWbzF0a869k4MQsUb4Ug5akV20BfhVZzT6lmq6TVeclWJObRm3CSDGIj5C3cFUJ8BA00yDM5jp3S",
    },
};

const defineConfig = (): ExpoConfig => ({
    name: "Mind",
    slug: "mind",
    scheme: "mind",
    version: "2.2.4",
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
        buildNumber: "23",
        supportsTablet: true,
        bundleIdentifier: "app.getmind",
        infoPlist: {
            LSApplicationQueriesSchemes: ["mind"],
            NSCameraUsageDescription:
                "This app uses your camera to take photos for your profile.",
            NSPhotoLibraryUsageDescription:
                "This app uses your photos for your profile.",
            NSLocationAlwaysAndWhenInUseUsageDescription:
                "This app uses your location to help you find nearby therapists.",
            NSLocationWhenInUseUsageDescription:
                "This app uses your location to help you find nearby therapists.",
            NSUserTrackingUsageDescription:
                "This identifier will be used to create a better experience for you.",
            ITSAppUsesNonExemptEncryption: false,
        },
        entitlements: {
            "com.apple.developer.applesignin": ["Default"],
        },
    },
    android: {
        adaptiveIcon: {
            foregroundImage: "./assets/adaptive-icon.png",
            backgroundColor: "#fff",
        },
        package: "app.getmind",
        googleServicesFile: "./google-services.json",
        versionCode: 9,
        intentFilters: [
            {
                action: "VIEW",
                autoVerify: true,
                data: [
                    {
                        scheme: "https",
                        host: "*.getmind.app",
                        pathPrefix: "/records",
                    },
                ],
                category: ["BROWSABLE", "DEFAULT"],
            },
        ],
    },
    extra: {
        eas: {
            projectId: "99018e7e-9e9a-4064-82d0-dc3cfa6457d5",
        },
        ...profileConstants[process.env.PROFILE as Profile],
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
        [
            "expo-location",
            {
                locationAlwaysAndWhenInUsePermission:
                    "Allow $(PRODUCT_NAME) to use your location.",
            },
        ],
        [
            "expo-tracking-transparency",
            {
                userTrackingPermission:
                    "This identifier will be used to deliver personalized ads to you.",
            },
        ],
        [
            "expo-image-picker",
            {
                photosPermission: "This app uses your photos for your profile.",
            },
        ],
    ],
});

export default defineConfig;
