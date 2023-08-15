import { Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { Trans } from "@lingui/macro";

export default function DefaultCard() {
    const router = useRouter();

    return (
        <View className="mt-4 rounded-xl bg-white shadow-sm">
            <View className="px-6 pt-6">
                <Text className="font-nunito-sans text-xl">
                    <Trans>Nothing for now!</Trans>
                </Text>
                <Text className="font-nunito-sans text-sm text-slate-500">
                    <Trans>Search for you new therapist</Trans>
                </Text>
            </View>
            <TouchableOpacity onPress={() => router.push("/search")}>
                <View className="mt-6 flex w-full flex-row items-center justify-center rounded-bl-xl rounded-br-xl bg-blue-500 py-3 align-middle">
                    <FontAwesome size={16} color="white" name="search" />
                    <Text className="ml-4 font-nunito-sans-bold text-lg text-white">
                        <Trans>Therapists</Trans>
                    </Text>
                </View>
            </TouchableOpacity>
        </View>
    );
}