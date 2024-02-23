import { useEffect, useState } from "react";
import {
    ActivityIndicator,
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

import { BasicText } from "../../components/BasicText";
import { ScreenWrapper } from "../../components/ScreenWrapper";
import { getShareLink } from "../../helpers/getShareLink";
import { useUpdateProfilePicture } from "../../hooks/user/useUpdateProfilePicture";
import { useUserHasProfileImage } from "../../hooks/user/useUserHasProfileImage";
import { useUserIsProfessional } from "../../hooks/user/useUserIsProfessional";
import { api } from "../../utils/api";

export default function UserProfileScreen() {
    const router = useRouter();
    const { user, signOut } = useClerk();
    const userHasProfileImage = useUserHasProfileImage({
        userId: String(user?.id),
    });
    const isProfessional = useUserIsProfessional();
    const updateProfileImage = useUpdateProfilePicture();
    const [imageUpdated, setImageUpdated] = useState(false);

    const pickImageAsync = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            quality: 1,
            base64: true,
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
        });

        if (result.canceled) return;

        const image = await user?.setProfileImage({
            file: `data:image/png;base64,${result.assets[0]?.base64}`,
        });

        if (image && image.publicUrl) {
            setImageUpdated(true);
            await updateProfileImage.mutateAsync({ url: image.publicUrl });
        }
    };

    useEffect(() => {
        return () => {
            setImageUpdated(false);
        };
    }, []);

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
                        {userHasProfileImage.data || imageUpdated ? (
                            <Image
                                className="rounded-full"
                                alt={`${user?.firstName}'s profile picture`}
                                source={{
                                    uri: user?.imageUrl,
                                    width: 72,
                                    height: 72,
                                }}
                            />
                        ) : userHasProfileImage.isLoading ? (
                            <View
                                style={{
                                    backgroundColor: "#e5e7eb",
                                    padding: 24,
                                    borderRadius: 100,
                                }}
                            >
                                <ActivityIndicator size={24} />
                            </View>
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
                                <BasicText size="3xl" fontWeight="bold">
                                    {user?.firstName}
                                </BasicText>
                            )}
                        </View>
                        <View>
                            <BasicText
                                size="lg"
                                color="gray"
                                style={{ marginLeft: 2 }}
                            >
                                {isProfessional
                                    ? t({ message: "Professional" })
                                    : t({ message: "Patient" })}
                            </BasicText>
                        </View>
                    </View>
                </View>
                {isProfessional && <ShareLink />}
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {isProfessional ? <ProfessionalOptions /> : null}
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

                {process.env.NODE_ENV === "development" && (
                    <DevelopmentOptions />
                )}
            </ScrollView>
        </ScreenWrapper>
    );
}

function DevelopmentOptions() {
    const { mutateAsync } = api.users.clearMetadata.useMutation({});
    const router = useRouter();
    const { user } = useClerk();

    async function clearUserMetaData(): Promise<void> {
        console.log("Clearing user metadata");
        await mutateAsync();
        await user?.reload();
        router.replace("/onboard");
    }

    return (
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
                icon="person"
                label={"Patient Profile"}
                onPress={() => {
                    router.push("/(patient)/update-profile");
                }}
            />
            <MenuItem
                isLast={true}
                icon="person"
                label={"Patient Onboard"}
                onPress={() => {
                    router.push("/(patient)/profile");
                }}
            />
        </>
    );
}

function ProfessionalOptions() {
    const router = useRouter();
    const { data } = api.therapists.findByUserId.useQuery();
    if (!data) return null;

    return (
        <>
            <MenuItem
                icon="person-outline"
                isFirst={true}
                label={t({ message: "Personal info" })}
                onPress={() => router.push("/(psych)/update-profile")}
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
                icon="description"
                label={t({ message: "Report" })}
                onPress={() => router.push("/settings/report")}
            />
            <MenuItem
                isLast
                icon="attach-money"
                label={t({ message: "Setup Payments" })}
                onPress={() => router.push("/(psych)/payments-setup")}
                alert={!data.pixKey}
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
                <MaterialIcons size={24} name="chevron-right" color={"gray"} />
            </View>
        </TouchableOpacity>
    );
}

function ShareLink() {
    const { data: therapist } = api.therapists.findByUserId.useQuery();

    const handleShareLink = async () => {
        await getShareLink({ id: therapist?.id, name: therapist?.name });
    };

    return (
        <View className="pr-4">
            <TouchableOpacity onPress={() => handleShareLink()}>
                <MaterialIcons size={24} name="ios-share" />
            </TouchableOpacity>
        </View>
    );
}
