import { useEffect } from "react";
import {
    Alert,
    Image,
    Text,
    TouchableOpacity,
    View,
    type ImageSourcePropType,
} from "react-native";
import * as Location from "expo-location";
import { FontAwesome } from "@expo/vector-icons";
import { Trans } from "@lingui/macro";

import { LogoSvg } from "../components/LogoSvg";
import useAuthProviders from "../helpers/authProviders";

const LoginImage =
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require("../../assets/login_mind.png") as ImageSourcePropType;

export default function SignInScreen() {
    const { onApplePress, onGooglePress } = useAuthProviders();

    // ask for location permission
    useEffect(() => {
        getLocation();
    }, []);

    const getLocation = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
            Alert.alert(
                "Permission",
                "Sorry, we need location permissions to make this work!",
                [{ text: "OK", onPress: () => {} }],
            );
        }
    };

    return (
        <View className="flex h-full w-full items-center justify-center bg-off-white">
            <View className="relative bottom-12 right-4">
                <LogoSvg />
            </View>
            <Text className="pt-4 font-nunito-sans text-3xl">
                <Trans>Welcome</Trans>
            </Text>
            <Text className="font-nunito-sans text-base text-gray-500">
                <Trans>Let us help. Focus on connecting.</Trans>
            </Text>
            <View className="flex w-full gap-y-4 px-8">
                <View className="flex items-center justify-center pt-8">
                    <Image
                        alt=""
                        source={LoginImage}
                        style={{ width: 200, height: 200 }}
                        resizeMode="contain"
                    />
                </View>
                <TouchableOpacity onPress={onGooglePress} className="w-full">
                    <View className="mt-8  flex w-full flex-row items-center justify-center rounded-xl bg-blue-500 px-8 py-4 font-bold shadow-sm">
                        <FontAwesome color="white" size={22} name="google" />
                        <Text className="ml-4 font-nunito-sans text-xl text-white">
                            <Trans>Sign in with</Trans>{" "}
                        </Text>
                        <Text className="font-nunito-sans-bold text-xl text-white">
                            Google
                        </Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={onApplePress} className="w-full">
                    <View className="flex w-full flex-row items-center justify-center rounded-xl bg-white px-8 py-4 font-bold shadow-sm">
                        <FontAwesome size={22} name="apple" />
                        <Text className="ml-4 font-nunito-sans text-xl">
                            <Trans>Sign in with</Trans>{" "}
                        </Text>
                        <Text className="font-nunito-sans text-xl">Apple</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
}
