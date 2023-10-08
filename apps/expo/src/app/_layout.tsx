import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Constants from "expo-constants";
import { getLocales } from "expo-localization";
import * as Notifications from "expo-notifications";
import { Slot } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { StatusBar } from "expo-status-bar";
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/clerk-expo";
import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { StripeProvider } from "@stripe/stripe-react-native";

import { messages as enMessages } from "../../src/locales/en/messages";
import { messages as ptMessages } from "../../src/locales/pt/messages";
import { TRPCProvider } from "../utils/api";

type Messages = Record<string, string>;

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

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
