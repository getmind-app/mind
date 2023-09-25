import { Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { Trans, t } from "@lingui/macro";

import { getShareLink } from "../helpers/getShareLink";
import { api } from "../utils/api";

export default function DefaultHomeCard() {
    const router = useRouter();
    const { user } = useUser();

    // remove when we have a context provider
    const therapistId =
        user?.publicMetadata?.role == "professional"
            ? api.therapists.findByUserId.useQuery().data?.id
            : "";

    return (
        <View className="mt-4 rounded-xl bg-white shadow-sm">
            <View className="px-6 pt-6">
                <Text className="font-nunito-sans text-xl">
                    <Trans>Nothing for now!</Trans>
                </Text>
                <Text className="font-nunito-sans text-sm text-slate-500">
                    {user?.publicMetadata?.role === "professional"
                        ? t({
                              message:
                                  "Share your profile with your patients to get some appointments.",
                          })
                        : t({ message: "Search for your therapist!" })}
                </Text>
            </View>

            {user?.publicMetadata?.role === "professional" ? (
                <TouchableOpacity
                    onPress={() =>
                        void getShareLink({
                            id: therapistId,
                            name: user?.firstName ?? "",
                        })
                    }
                >
                    <View className="mt-6 flex w-full flex-row items-center justify-center rounded-bl-xl rounded-br-xl bg-blue-500 py-3 align-middle">
                        <MaterialIcons size={24} color="white" name="link" />
                        <Text className="ml-2 font-nunito-sans-bold text-lg text-white">
                            <Trans>Share your link</Trans>
                        </Text>
                    </View>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity onPress={() => router.push("/search")}>
                    <View className="mt-6 flex w-full flex-row items-center justify-center rounded-bl-xl rounded-br-xl bg-blue-500 py-3 align-middle">
                        <FontAwesome size={16} color="white" name="search" />
                        <Text className="ml-2 font-nunito-sans-bold text-lg text-white">
                            <Trans>Therapists</Trans>
                        </Text>
                    </View>
                </TouchableOpacity>
            )}
        </View>
    );
}
