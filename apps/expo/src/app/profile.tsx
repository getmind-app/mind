import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { useClerk } from "@clerk/clerk-expo";
import { MaterialIcons } from "@expo/vector-icons";
import { t } from "@lingui/macro";

import { api } from "../utils/api";

export default function UserProfileScreen() {
    const router = useRouter();
    const { user, signOut } = useClerk();
    const { mutateAsync } = api.users.clearMetadata.useMutation({});

    async function clearUserMetaData(): Promise<void> {
        console.log("Clearing user metadata");
        await mutateAsync();
        await user?.reload();
        router.push("/onboard");
    }

    return (
        <View className="h-full bg-off-white px-4 pt-24">
            <View className="flex flex-row items-center gap-x-4 pt-4 align-middle">
                <Image
                    className="rounded-full"
                    alt={`${user?.firstName}'s profile picture`}
                    source={{
                        uri: user?.profileImageUrl,
                        width: 72,
                        height: 72,
                    }}
                />
                <View className="flex flex-col">
                    <View>
                        {user?.firstName && (
                            <Text className="font-nunito-sans-bold text-3xl">
                                {user?.firstName}
                            </Text>
                        )}
                    </View>
                    <View>
                        {user?.publicMetadata && (
                            <Text className="pl-1 font-nunito-sans text-lg text-slate-500">
                                {user.publicMetadata.role == "patient"
                                    ? t({ message: "Patient" })
                                    : t({ message: "Professional" })}
                            </Text>
                        )}
                    </View>
                </View>
            </View>
            <ScrollView className="pt-8" showsVerticalScrollIndicator={false}>
                <MenuItem
                    isFirst={true}
                    label={t({ message: "🗣️  Personal info" })}
                    onPress={signOut}
                />
                <MenuItem
                    label={t({ message: "⚙️  Settings" })}
                    onPress={signOut}
                />

                {user?.publicMetadata &&
                user.publicMetadata.role == "professional" ? (
                    <MenuItem
                        label={t({ message: "🕰️  Available hours" })}
                        onPress={() => router.push("/settings/available-hours")}
                    />
                ) : null}

                {process.env.NODE_ENV === "development" ? (
                    <MenuItem
                        label={t({ message: "❌  Reset user metadata" })}
                        onPress={clearUserMetaData}
                    />
                ) : null}

                <MenuItem
                    isLast={true}
                    label={t({ message: "🚪  Sign out" })}
                    onPress={signOut}
                />
            </ScrollView>
        </View>
    );
}

function MenuItem(props: {
    label: string;
    isFirst?: boolean;
    isLast?: boolean;
    onPress: () => void;
}) {
    return (
        <TouchableOpacity onPress={props.onPress}>
            <View
                className={`flex flex-row items-center justify-between bg-white px-6 py-4 align-middle shadow-sm ${
                    props.isFirst ? "rounded-t-xl" : ""
                } ${props.isLast ? "rounded-b-xl" : ""}`}
            >
                <Text className="font-nunito-sans text-xl">{props.label}</Text>
                <MaterialIcons size={24} name="chevron-right" />
            </View>
        </TouchableOpacity>
    );
}
