import React from "react";
import { router } from "expo-router";
import { useOAuth } from "@clerk/clerk-expo";

export function useAuthProviders() {
    const { startOAuthFlow: googleOAuthFlow } = useOAuth({
        strategy: "oauth_google",
    });
    const { startOAuthFlow: appleOAuthFlow } = useOAuth({
        strategy: "oauth_apple",
    });

    const onGooglePress = React.useCallback(async () => {
        try {
            const { createdSessionId, setActive } = await googleOAuthFlow({});
            if (createdSessionId && setActive) {
                await setActive({ session: createdSessionId });

                return router.replace("/");
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
            const { createdSessionId, setActive } = await appleOAuthFlow({});
            if (createdSessionId && setActive) {
                await setActive({ session: createdSessionId });

                return router.replace("/");
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
