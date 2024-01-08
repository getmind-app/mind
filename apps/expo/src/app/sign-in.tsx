import {
    Image,
    Linking,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    type ImageSourcePropType,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { Trans } from "@lingui/macro";

import { LogoSvg } from "../components/LogoSvg";
import { useAuthProviders } from "../hooks/auth/useAuthProviders";

const LoginImage =
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require("../../assets/images/login_mind.png") as ImageSourcePropType;

export default function SignInScreen() {
    const { onApplePress, onGooglePress } = useAuthProviders();

    return (
        <View style={styles.container}>
            <View style={styles.logo}>
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
                    <View
                        className="mt-8  flex w-full flex-row items-center justify-center rounded-xl bg-blue-500 px-8 py-4 font-bold shadow-sm"
                        style={{ elevation: 2 }}
                    >
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
                    <View
                        className="flex w-full flex-row items-center justify-center rounded-xl bg-white px-8 py-4 font-bold shadow-sm"
                        style={{ elevation: 2 }}
                    >
                        <FontAwesome size={22} name="apple" />
                        <Text className="ml-4 font-nunito-sans text-xl">
                            <Trans>Sign in with</Trans>{" "}
                        </Text>
                        <Text className="font-nunito-sans-bold text-xl">
                            Apple
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
            <Text className="mt-4 font-nunito-sans text-base text-gray-500">
                <Trans>
                    See our{" "}
                    <TouchableOpacity
                        onPress={() => {
                            void Linking.openURL(
                                "https://www.getmind.app/privacy",
                            );
                        }}
                    >
                        <Text className="underline">privacy policy.</Text>
                    </TouchableOpacity>
                </Trans>
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    buttonText: {
        color: "white",
        fontSize: 22,
        fontWeight: "bold",
    },
    container: {
        flex: 1,
        backgroundColor: "#f8f8f8",
        alignItems: "center",
        justifyContent: "center",
    },
    logo: {
        position: "relative",
        padding: 12,
        width: 32,
        height: 32,
        bottom: 48,
        justifyContent: "center",
        alignItems: "center",
    },
});
