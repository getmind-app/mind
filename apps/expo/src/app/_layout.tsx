import React, { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Constants from "expo-constants";
import { loadAsync } from "expo-font";
import { getLocales } from "expo-localization";
import * as Notifications from "expo-notifications";
import { Slot, SplashScreen, usePathname } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { StatusBar } from "expo-status-bar";
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/clerk-expo";
import {
    NunitoSans_400Regular,
    NunitoSans_700Bold,
    useFonts,
} from "@expo-google-fonts/nunito-sans";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { StripeProvider } from "@stripe/stripe-react-native";

import { messages as enMessages } from "../../src/locales/en/messages";
import { messages as ptMessages } from "../../src/locales/pt/messages";
import { TRPCProvider } from "../utils/api";

type Messages = Record<string, string>;

i18n.load({
    en: enMessages as Messages,
    pt: ptMessages as Messages,
});
i18n.activate(getLocales()[0]?.languageCode as string);

const tokenCache = {
    getToken(key: string) {
        try {
            return SecureStore.getItemAsync(key);
        } catch (err) {
            return Promise.resolve(null);
        }
    },
    saveToken(key: string, value: string) {
        try {
            return SecureStore.setItemAsync(key, value);
        } catch (err) {
            return Promise.resolve();
        }
    },
};

export default function RootLayout() {
    // https://docs.expo.dev/archive/classic-updates/preloading-and-caching-assets/#pre-loading-and-caching-assets
    const [appIsReady, setAppIsReady] = useState(false);
    const [fontsLoaded] = useFonts({
        "Nunito-Sans": NunitoSans_400Regular,
        "Nunito-Sans-Bold": NunitoSans_700Bold,
    });

    Notifications.setNotificationHandler({
        // eslint-disable-next-line @typescript-eslint/require-await
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
        }),
    });

    useEffect(() => {
        void (async function loadResourcesAndDataAsync() {
            try {
                SplashScreen.preventAutoHideAsync();
                const iconsFont = [
                    loadAsync(AntDesign.font),
                    loadAsync(FontAwesome.font),
                    loadAsync(MaterialIcons.font),
                ];

                await Promise.all([...iconsFont]);
            } catch (e) {
                console.warn(e);
            } finally {
                setAppIsReady(true);
                SplashScreen.hideAsync();
            }
        })();
    }, []);

    if (!fontsLoaded || !appIsReady) {
        return null;
    }

    if (!Constants.expoConfig?.extra?.CLERK_PUBLISHABLE_KEY) {
        throw new Error("Missing CLERK_PUBLISHABLE_KEY");
    }

    if (!Constants.expoConfig?.extra?.STRIPE_PUBLISHABLE_KEY) {
        throw new Error("Missing STRIPE_PUBLISHABLE_KEY");
    }

    const clerkPublishableKey = String(
        Constants.expoConfig.extra.CLERK_PUBLISHABLE_KEY,
    );
    const stripePublishableKey = String(
        Constants.expoConfig.extra.STRIPE_PUBLISHABLE_KEY,
    );

    return (
        <ClerkProvider
            publishableKey={clerkPublishableKey}
            tokenCache={tokenCache}
        >
            <TRPCProvider>
                <StripeProvider publishableKey={stripePublishableKey}>
                    <SafeAreaProvider>
                        <I18nProvider i18n={i18n}>
                            <SignedIn>
                                <Slot />
                                <StatusBar translucent />
                            </SignedIn>
                            <SignedOut>
                                <Slot />
                            </SignedOut>
                        </I18nProvider>
                    </SafeAreaProvider>
                </StripeProvider>
            </TRPCProvider>
        </ClerkProvider>
    );
}
