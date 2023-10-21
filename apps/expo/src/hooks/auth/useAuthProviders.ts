import React from "react";
import * as Linking from "expo-linking";
import { useOAuth } from "@clerk/clerk-expo";

export function useAuthProviders() {
    const redirectUrl = Linking.createURL("/(app)/");
    const { startOAuthFlow: googleOAuthFlow } = useOAuth({
        strategy: "oauth_google",
    });
    const { startOAuthFlow: appleOAuthFlow } = useOAuth({
        strategy: "oauth_apple",
    });

    const onGooglePress = React.useCallback(async () => {
        try {
            const { createdSessionId, setActive } = await googleOAuthFlow({
                redirectUrl,
            });

            if (createdSessionId && setActive) {
                setActive({ session: createdSessionId });
            } else {
                throw new Error(
                    "There are unmet requirements, modifiy this else to handle them",
                );
            }
        } catch (err) {
            console.log(JSON.stringify(err, null, 2));
            console.log("error signing in", err);
        }
    }, []);

    const onApplePress = React.useCallback(async () => {
        try {
            const { createdSessionId, setActive } = await appleOAuthFlow({
                redirectUrl,
            });
            if (createdSessionId && setActive) {
                setActive({ session: createdSessionId });
            } else {
                throw new Error(
                    "There are unmet requirements, modifiy this else to handle them",
                );
            }
        } catch (err) {
            console.log(JSON.stringify(err, null, 2));
            console.log("error signing in", err);
        }
    }, []);

    return {
        onGooglePress,
        onApplePress,
    };
}
