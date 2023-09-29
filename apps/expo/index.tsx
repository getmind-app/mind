import * as Notifications from "expo-notifications";

// it's important that intl-locale/polyfill comes first
// ther other polyfill's require it.
import "@formatjs/intl-locale/polyfill";
import "@formatjs/intl-pluralrules/polyfill";
import "@formatjs/intl-pluralrules/locale-data/en";
import "@formatjs/intl-getcanonicallocales/polyfill";
import "intl-pluralrules";
import { useEffect, useState } from "react";
import { registerRootComponent } from "expo";
import { loadAsync, useFonts } from "expo-font";
import { ExpoRoot, SplashScreen } from "expo-router";
import {
    NunitoSans_400Regular,
    NunitoSans_700Bold,
} from "@expo-google-fonts/nunito-sans";
import { AntDesign, FontAwesome, MaterialIcons } from "@expo/vector-icons";

SplashScreen.preventAutoHideAsync();

export function App() {
    const ctx = require.context("./src/app");
    // https://docs.expo.dev/archive/classic-updates/preloading-and-caching-assets/#pre-loading-and-caching-assets
    const [appIsReady, setAppIsReady] = useState(false);
    const [fontsLoaded] = useFonts({
        NunitoSans: NunitoSans_400Regular,
        NunitoSansBold: NunitoSans_700Bold,
        AntDesign: AntDesign.font,
        FontAwesome: FontAwesome.font,
        MaterialIcons: MaterialIcons.font,
    });

    Notifications.setNotificationHandler({
        // eslint-disable-next-line @typescript-eslint/require-await
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
        }),
    });
    console.log(AntDesign);
    useEffect(() => {
        async function loadResourcesAndDataAsync() {
            try {
                const iconsFont = loadAsync({
                    AntDesign: AntDesign.font,
                    FontAwesome: FontAwesome.font,
                    MaterialIcons: MaterialIcons.font,
                });
                await AntDesign.loadFont();
                await FontAwesome.loadFont();
                await MaterialIcons.loadFont();

                await iconsFont;
            } catch (e) {
                console.warn(e);
            } finally {
                setAppIsReady(true);
                SplashScreen.hideAsync();
            }
        }

        void loadResourcesAndDataAsync();
    }, []);

    if (!fontsLoaded || !appIsReady) {
        return null;
    }
    // @ts-expect-error isso é um erro do expo-router com o webpack,
    // não temos como resolver
    return <ExpoRoot context={ctx} />;
}

registerRootComponent(App);
