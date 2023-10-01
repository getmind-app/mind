import {
    Alert,
    Image,
    ScrollView,
    Share,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import * as Linking from "expo-linking";
import { Link, useRouter } from "expo-router";
import { useClerk } from "@clerk/clerk-expo";
import { MaterialIcons } from "@expo/vector-icons";
import { type Icon } from "@expo/vector-icons/build/createIconSet";
import { t } from "@lingui/macro";

import { api } from "../../utils/api";

export default function UserProfileScreen() {
    const router = useRouter();
    const { user, signOut } = useClerk();
    const { mutateAsync } = api.users.clearMetadata.useMutation({});

    async function clearUserMetaData(): Promise<void> {
        console.log("Clearing user metadata");
        await mutateAsync();
        await user?.reload();
        router.replace("/onboard");
    }

    // remove when we have a context provider
    const isProfessional = user?.publicMetadata?.role === "professional";

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
                {isProfessional ? <ProfessionalMenuItems /> : null}

                <MenuItem
                    isFirst={!isProfessional}
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
                            isLast={true}
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

function ProfessionalMenuItems() {
    const router = useRouter();
    const { data } = api.therapists.findByUserId.useQuery();

    if (!data) return null;

    const handleShareLink = async () => {
        const therapistUrl = Linking.createURL(`/psych/${data.id}`);

        await Share.share({
            message: t({
                message: `Hey, I'm a therapist in Mind! Check out my profile: ${therapistUrl}`,
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

    return (
        <>
            <MenuItem
                icon="person-outline"
                isFirst={true}
                label={t({ message: "Personal info" })}
                onPress={() => router.push("/settings/personal-info")}
            />
            {data.modalities.includes("ON_SITE") && (
                <MenuItem
                    icon="location-on"
                    label={t({ message: "Address" })} // merda de icon, ficou fora do padrão
                    onPress={() => router.push("/settings/address")}
                />
            )}
            <MenuItem
                icon="timer"
                label={t({ message: "Available hours" })}
                onPress={() => router.push("/settings/available-hours")}
            />
            <ShareLinkMenuItem handleShareLink={handleShareLink} />
        </>
    );
}

type PossibleMaterialIcons = typeof MaterialIcons extends Icon<infer K, string>
    ? K
    : never;

function MenuItem(props: {
    label: string;
    icon: PossibleMaterialIcons;
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

function ShareLinkMenuItem({
    handleShareLink,
}: {
    handleShareLink: () => void;
}) {
    return (
        <MenuItem
            icon="share"
            label={t({ message: "Share your link" })}
            onPress={handleShareLink}
        />
    );
}
