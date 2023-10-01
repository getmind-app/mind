// it's important that intl-locale/polyfill comes first
// ther other polyfill's require it.
import "@formatjs/intl-locale/polyfill";
import "@formatjs/intl-pluralrules/polyfill";
import "@formatjs/intl-pluralrules/locale-data/en";
import "@formatjs/intl-getcanonicallocales/polyfill";
import "intl-pluralrules";
import { registerRootComponent } from "expo";
import * as Notifications from "expo-notifications";
import { ExpoRoot } from "expo-router";
import {
    NunitoSans_400Regular,
    NunitoSans_700Bold,
    useFonts,
} from "@expo-google-fonts/nunito-sans";

export function App() {
    const ctx = require.context("./src/app");

    // https://docs.expo.dev/archive/classic-updates/preloading-and-caching-assets/#pre-loading-and-caching-assets
    const [fontsLoaded, fontError] = useFonts({
        NunitoSans_400Regular,
        NunitoSans_700Bold,
    });

    Notifications.setNotificationHandler({
        // eslint-disable-next-line @typescript-eslint/require-await
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
        }),
    });

    if (!fontError && !fontsLoaded) {
        return null;
    }

    // @ts-expect-error isso é um erro do expo-router com o webpack,
    // não temos como resolver
    return <ExpoRoot context={ctx} />;
}

registerRootComponent(App);
