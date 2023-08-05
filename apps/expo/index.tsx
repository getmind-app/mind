import { registerRootComponent } from "expo";
import { ExpoRoot, SplashScreen } from "expo-router";
import { i18n } from "@lingui/core";

import { messages as enMessages } from "./src/locales/en/messages";
import { messages as ptMessages } from "./src/locales/pt/messages";
import "@formatjs/intl-pluralrules/polyfill";
import "@formatjs/intl-pluralrules/locale-data/en";
import "@formatjs/intl-locale/polyfill";
import { I18nProvider } from "@lingui/react";

SplashScreen.preventAutoHideAsync();

i18n.loadAndActivate({ locale: "en", messages: enMessages });

export function App() {
    const ctx = require.context("./src/app");

    return (
        <I18nProvider i18n={i18n}>
            <ExpoRoot context={ctx} />
        </I18nProvider>
    );
}

registerRootComponent(App);
