import {
    Image,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useClerk } from "@clerk/clerk-expo";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { type Icon } from "@expo/vector-icons/build/createIconSet";
import { t } from "@lingui/macro";

import { ScreenWrapper } from "../../components/ScreenWrapper";
import { getShareLink } from "../../helpers/getShareLink";
import { useUserHasProfileImage } from "../../hooks/user/useUserHasProfileImage";
import { useUserIsProfessional } from "../../hooks/user/useUserIsProfessional";
import { api } from "../../utils/api";

export default function UserProfileScreen() {
    const router = useRouter();
    const { user, signOut } = useClerk();
    const { mutateAsync } = api.users.clearMetadata.useMutation({});
    const userHasProfileImage = useUserHasProfileImage({ userId: null });
    const isProfessional = useUserIsProfessional();

    async function clearUserMetaData(): Promise<void> {
        console.log("Clearing user metadata");
        await mutateAsync();
        await user?.reload();
        router.replace("/onboard");
    }

    const pickImageAsync = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            quality: 1,
            base64: true,
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
        });

        if (result.canceled) return;

        await user?.setProfileImage({
            file: `data:image/png;base64,${result.assets[0]?.base64}`,
        });
    };

    return (
        <ScreenWrapper>
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <View className="flex flex-row items-center gap-x-4 pt-4 align-middle">
                    <TouchableOpacity onPress={() => pickImageAsync()}>
                        {userHasProfileImage.data ? (
                            <Image
                                className="rounded-full"
                                alt={`${user?.firstName}'s profile picture`}
                                source={{
                                    uri: user?.imageUrl,
                                    width: 72,
                                    height: 72,
                                }}
                            />
                        ) : (
                            <View
                                style={{
                                    backgroundColor: "#e5e7eb",
                                    padding: 24,
                                    borderRadius: 100,
                                }}
                            >
                                <AntDesign
                                    name="user"
                                    size={24}
                                    color="black"
                                />
                            </View>
                        )}
                    </TouchableOpacity>
                    <View className="flex flex-col">
                        <View>
                            {user?.firstName && (
                                <Text className="font-nunito-sans-bold text-3xl">
                                    {user?.firstName}
                                </Text>
                            )}
                        </View>
                        <View>
                            <Text className="pl-1 font-nunito-sans text-lg text-slate-500">
                                {isProfessional
                                    ? t({ message: "Professional" })
                                    : t({ message: "Patient" })}
                            </Text>
                        </View>
                    </View>
                </View>
                {isProfessional && (
                    <ShareLink
                        therapistId={user?.id ?? ""}
                        therapistName={user?.firstName ?? ""}
                    />
                )}
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {isProfessional ? <ProfessionalMenuItems /> : null}
                <MenuItem
                    isFirst
                    icon="notifications"
                    label={t({ message: "Notifications" })}
                    onPress={() => router.push("/settings/notifications")}
                />
                <MenuItem
                    icon="repeat"
                    label={t({ message: "Recurrences" })}
                    onPress={() => router.push("/settings/recurrences")}
                />
                <MenuItem
                    isLast
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
                        <MenuItem
                            isLast={true}
                            icon="person"
                            label={"Patient Profile"}
                            onPress={() => {
                                router.push("/(patient)/profile");
                            }}
                        />
                    </>
                ) : null}
            </ScrollView>
        </ScreenWrapper>
    );
}

function ProfessionalMenuItems() {
    const router = useRouter();
    const { data } = api.therapists.findByUserId.useQuery();
    if (!data) return null;

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
            <MenuItem
                isLast
                icon="attach-money"
                label={t({ message: "Setup Payments" })}
                onPress={() => router.push("/(psych)/payments-setup")}
                alert={data.paymentAccountStatus !== "ACTIVE"}
            />
        </>
    );
}

type PossibleMaterialIcons = typeof MaterialIcons extends Icon<infer K, string>
    ? K
    : never;

function MenuItem(props: {
    label: string;
    icon: PossibleMaterialIcons;
    alert?: boolean;
    disabled?: boolean;
    isFirst?: boolean;
    isLast?: boolean;
    onPress: () => void;
}) {
    return (
        <TouchableOpacity onPress={props.onPress} disabled={props.disabled}>
            <View
                className={`flex flex-row items-center justify-between bg-white px-6 py-4 align-middle shadow-sm ${
                    props.isFirst ? "mt-6 rounded-t-xl" : ""
                } ${props.isLast ? "rounded-b-xl" : ""}`}
                style={{
                    elevation: Platform.OS === "android" ? 2 : 0,
                }}
            >
                <View className="flex flex-row items-center gap-4 align-middle">
                    <MaterialIcons size={20} color="gray" name={props.icon} />
                    <Text className="font-nunito-sans text-xl">
                        {props.label}
                    </Text>
                    {props.alert && (
                        <View
                            style={{
                                width: 10,
                                height: 10,
                                borderRadius: 100,
                                backgroundColor: "#F87171",
                            }}
                        />
                    )}
                </View>
                <MaterialIcons size={24} name="chevron-right" />
            </View>
        </TouchableOpacity>
    );
}

function ShareLink({
    therapistId,
    therapistName,
}: {
    therapistId: string;
    therapistName: string;
}) {
    const handleShareLink = async () => {
        await getShareLink({ id: therapistId, name: therapistName });
    };

    return (
        <View className="pr-4">
            <TouchableOpacity onPress={() => handleShareLink()}>
                <MaterialIcons size={24} name="ios-share" />
            </TouchableOpacity>
        </View>
    );
}
