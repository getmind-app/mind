import { Linking, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { Trans, t } from "@lingui/macro";

import { getShareLink } from "../helpers/getShareLink";
import { useUserIsProfessional } from "../hooks/user/useUserIsProfessional";
import { api } from "../utils/api";

export default function DefaultHomeCard() {
    const userIsProfessional = useUserIsProfessional();

    return userIsProfessional ? (
        <DefaultTherapistHomeCard />
    ) : (
        <DefaultPatientHomeCard />
    );
}

function DefaultTherapistHomeCard() {
    const { user } = useUser();
    const router = useRouter();
    const therapist = api.therapists.findByUserId.useQuery();

    const bankAccountIsConfigured =
        therapist.data?.paymentAccountStatus !== "UNACTIVE";

    const therapistIsApproved = therapist.data?.status === "ACCEPTED";

    if (!therapist.data) {
        return (
            <View className="mt-4 rounded-xl bg-white shadow-sm">
                <View className="px-6 pt-6">
                    <TherapistMissingProfile />
                </View>

                <TouchableOpacity
                    onPress={() => router.push("/(psych)/profile/")}
                >
                    <View
                        className="mt-6 flex w-full flex-row items-center justify-center rounded-bl-xl rounded-br-xl bg-blue-500 py-3 align-middle shadow-sm"
                        style={{ elevation: 2 }}
                    >
                        <Text className="ml-2 font-nunito-sans-bold text-lg text-white">
                            <Trans>Edit profile</Trans>
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }

    if (!therapistIsApproved) {
        return (
            <View className="mt-4 rounded-xl bg-white shadow-sm">
                <View className="px-6 pt-6">
                    <TherapistNotApprovedWarning />
                </View>

                <TouchableOpacity
                    onPress={() =>
                        Linking.openURL("mailto:contact@getmind.app")
                    }
                >
                    <View
                        className="mt-6 flex w-full flex-row items-center justify-center rounded-bl-xl rounded-br-xl bg-blue-500 py-3 align-middle shadow-sm"
                        style={{ elevation: 2 }}
                    >
                        <Text className="ml-2 font-nunito-sans-bold text-lg text-white">
                            <Trans>Contact us</Trans>
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }

    if (!bankAccountIsConfigured) {
        return (
            <View className="mt-4 rounded-xl bg-white shadow-sm">
                <View className="px-6 pt-6">
                    <BankAccountNotSetUpWarning />
                </View>

                <TouchableOpacity
                    onPress={() => router.push("/(psych)/payments-setup")}
                >
                    <View
                        className="mt-6 flex w-full flex-row items-center justify-center rounded-bl-xl rounded-br-xl bg-blue-500 py-3 align-middle shadow-sm"
                        style={{ elevation: 2 }}
                    >
                        <Text className="ml-2 font-nunito-sans-bold text-lg text-white">
                            <Trans>Finish configuration</Trans>
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="mt-4 rounded-xl bg-white shadow-sm">
            <View className="px-6 pt-6">
                <NoNewAppointments />
            </View>

            <TouchableOpacity
                onPress={() =>
                    void getShareLink({
                        id: therapist?.data?.id ?? "",
                        name: user?.firstName ?? "",
                    })
                }
            >
                <View
                    className="mt-6 flex w-full flex-row items-center justify-center rounded-bl-xl rounded-br-xl bg-blue-500 py-3 align-middle shadow-sm"
                    style={{ elevation: 2 }}
                >
                    <MaterialIcons size={24} color="white" name="link" />
                    <Text className="ml-2 font-nunito-sans-bold text-lg text-white">
                        <Trans>Share your link</Trans>
                    </Text>
                </View>
            </TouchableOpacity>
        </View>
    );
}

function DefaultPatientHomeCard() {
    const router = useRouter();

    return (
        <View className="mt-4 rounded-xl bg-white shadow-sm">
            <View className="px-6 pt-6">
                <Text className="font-nunito-sans text-xl">
                    <Trans>Nothing for now!</Trans>
                </Text>
                <Text className="font-nunito-sans text-sm text-slate-500">
                    {t({ message: "Search for your therapist!" })}
                </Text>
            </View>

            <TouchableOpacity onPress={() => router.push("/search")}>
                <View className="mt-6 flex w-full flex-row items-center justify-center rounded-bl-xl rounded-br-xl bg-blue-500 py-3 align-middle">
                    <FontAwesome size={16} color="white" name="search" />
                    <Text className="ml-2 font-nunito-sans-bold text-lg text-white">
                        <Trans>Therapists</Trans>
                    </Text>
                </View>
            </TouchableOpacity>
        </View>
    );
}

function NoNewAppointments() {
    return (
        <>
            <Text className="font-nunito-sans text-xl">
                <Trans>Nothing for now!</Trans>
            </Text>
            <Text className="font-nunito-sans text-sm text-slate-500">
                {t({
                    message:
                        "Share your profile with your patients to get some appointments.",
                })}
            </Text>
        </>
    );
}

function BankAccountNotSetUpWarning() {
    return (
        <>
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                }}
            >
                <View
                    style={{
                        width: 10,
                        height: 10,
                        borderRadius: 100,
                        backgroundColor: "#F87171",
                    }}
                />
                <Text className="font-nunito-sans text-xl">
                    <Trans>Configure your bank account!</Trans>
                </Text>
            </View>
            <Text className="font-nunito-sans text-sm text-slate-500">
                <Trans>
                    You have to set up a bank account for receiving your
                    payments.
                </Trans>
            </Text>
        </>
    );
}

function TherapistNotApprovedWarning() {
    return (
        <>
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                }}
            >
                <Text className="font-nunito-sans text-xl">
                    <Trans>Your account is being setup!</Trans>
                </Text>
            </View>
            <Text className="font-nunito-sans text-sm text-slate-500">
                <Trans>
                    Our team is reviewing your account. You will be notified
                    when your account is ready.
                </Trans>
            </Text>
        </>
    );
}

function TherapistMissingProfile() {
    return (
        <>
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                }}
            >
                <View
                    style={{
                        width: 10,
                        height: 10,
                        borderRadius: 100,
                        backgroundColor: "#F87171",
                    }}
                />
                <Text className="font-nunito-sans text-xl">
                    <Trans>Your profile is incomplete</Trans>
                </Text>
            </View>
            <Text className="font-nunito-sans text-sm text-slate-500">
                <Trans>
                    Finish your profile to be able to receive appointments.
                </Trans>
            </Text>
        </>
    );
}
