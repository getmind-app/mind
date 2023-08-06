// it's important that intl-locale/polyfill comes first
// ther other polyfill's require it.
import "@formatjs/intl-locale/polyfill";
import "@formatjs/intl-pluralrules/polyfill";
import "@formatjs/intl-pluralrules/locale-data/en";
import "@formatjs/intl-getcanonicallocales/polyfill";
import "intl-pluralrules";
import { registerRootComponent } from "expo";
import { ExpoRoot, SplashScreen } from "expo-router";

SplashScreen.preventAutoHideAsync();

export function App() {
    const ctx = require.context("./src/app");

    return <ExpoRoot context={ctx} />;
}

registerRootComponent(App);
