import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import * as Linking from "expo-linking";
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

    // remove when we have a context provider
    const { data } =
        user?.publicMetadata?.role == "professional"
            ? api.therapists.findByUserId.useQuery()
            : { data: {} };

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

            <ScrollView showsVerticalScrollIndicator={false}>
                {user?.publicMetadata &&
                user.publicMetadata.role == "professional" ? (
                    <>
                        <View className="mb-4 mt-6 flex flex-row items-center justify-between rounded-xl bg-white px-6 py-4 align-middle shadow-sm">
                            <View className="flex flex-col gap-y-1">
                                <Text className="font-nunito-sans text-xl">
                                    {t({ message: "Your link" })}
                                </Text>
                                <Text className="w-72 font-nunito-sans text-slate-500">
                                    {Linking.createURL(`/psych/${data.id}`)}
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={() =>
                                    Clipboard.setStringAsync(
                                        Linking.createURL(`/psych/${data.id}`),
                                    )
                                }
                            >
                                <MaterialIcons size={24} name="content-copy" />
                            </TouchableOpacity>
                        </View>
                        <MenuItem
                            icon="person-outline"
                            isFirst={true}
                            label={t({ message: "Personal info" })}
                            onPress={() =>
                                router.push("/settings/personal-info")
                            }
                        />
                        {data.address && (
                            <MenuItem
                                icon="location-on"
                                label={t({ message: "Address" })} // merda de icon, ficou fora do padrão
                                onPress={() => router.push("/settings/address")}
                            />
                        )}

                        <MenuItem
                            icon="timer"
                            label={t({ message: "Available hours" })}
                            onPress={() =>
                                router.push("/settings/available-hours")
                            }
                        />
                    </>
                ) : null}

                <MenuItem
                    isFirst={
                        user?.publicMetadata.role == "professional"
                            ? false
                            : true
                    }
                    isLast={true}
                    icon="logout"
                    label={t({ message: "Sign out" })}
                    onPress={signOut}
                />

                {process.env.NODE_ENV === "development" ? (
                    <>
                        <Text className="mt-4 font-nunito-sans-bold text-2xl text-red-500">
                            Development only
                        </Text>
                        <MenuItem
                            isFirst={true}
                            icon="refresh"
                            label={t({ message: "Reset user metadata" })}
                            onPress={clearUserMetaData}
                        />
                    </>
                ) : null}
            </ScrollView>
        </View>
    );
}

function MenuItem(props: {
    label: string;
    icon: string;
    isFirst?: boolean;
    isLast?: boolean;
    onPress: () => void;
}) {
    return (
        <TouchableOpacity onPress={props.onPress}>
            <View
                className={`flex flex-row items-center justify-between bg-white px-6 py-4 align-middle shadow-sm ${
                    props.isFirst ? "mt-6 rounded-t-xl" : ""
                } ${props.isLast ? "rounded-b-xl" : ""}`}
            >
                <View className="flex flex-row items-center gap-4 align-middle">
                    <MaterialIcons size={20} color="gray" name={props.icon} />
                    <Text className="font-nunito-sans text-xl">
                        {props.label}
                    </Text>
                </View>
                <MaterialIcons size={24} name="chevron-right" />
            </View>
        </TouchableOpacity>
    );
}
