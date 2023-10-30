import { Alert, Share } from "react-native";
import * as Linking from "expo-linking";
import { t } from "@lingui/macro";

export const getShareLink = async ({
    id,
    name,
}: {
    id?: string;
    name?: string;
}) => {
    await Share.share({
        message: t({
            message: `Hey! Check ${name}'s profile: https://getmind.app/redirect?redirectUrl=${Linking.createURL(
                `/psych/${id}`,
            )}`,
        }),
    }).catch((error) =>
        Alert.alert(
            t({
                message: "Error sharing link",
            }),
            error,
        ),
    );
};
