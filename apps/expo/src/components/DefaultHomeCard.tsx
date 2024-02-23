import { TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { Trans, t } from "@lingui/macro";

import { type Therapist } from "../../../../packages/db";
import { getShareLink } from "../helpers/getShareLink";
import { useUserIsProfessional } from "../hooks/user/useUserIsProfessional";
import { api } from "../utils/api";
import { BasicText } from "./BasicText";
import { CheckBox } from "./CheckBox";

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
    const therapist = api.therapists.findByUserId.useQuery();

    if (therapist.isLoading) {
        <BasicText>
            <Trans>Loading..</Trans>
        </BasicText>;
    }
    if (therapist.isError) {
        return (
            <BasicText color="red">
                <Trans>Error fetching therapist</Trans>
            </BasicText>
        );
    }

    if (!therapist.data) {
        return (
            <BasicText color="yellow">
                <Trans>Couldn`&apos;`t find therapist</Trans>
            </BasicText>
        );
    }

    if (!user) {
        return (
            <BasicText color="yellow">
                <Trans>Couldn`&apos;`t find user</Trans>
            </BasicText>
        );
    }

    return (
        <View className="mt-4 rounded-xl bg-white shadow-sm">
            <View className="px-6 pt-6">
                <BasicText size="2xl" style={{ marginBottom: 2 }}>
                    <Trans>Nothing for now!</Trans>
                </BasicText>
                <BasicText color="gray">
                    {t({
                        message:
                            "Here are a few things you can do to get started:",
                    })}
                </BasicText>
                {!therapist.data.pixKey || !therapist.data.about ? (
                    <SetupGuide therapist={therapist.data} />
                ) : null}
            </View>

            <TouchableOpacity
                onPress={() =>
                    void getShareLink({
                        id: therapist.data.id,
                        name: user.firstName ?? "",
                    })
                }
            >
                <View
                    className="mt-6 flex w-full flex-row items-center justify-center rounded-bl-xl rounded-br-xl bg-blue-500 py-3 align-middle shadow-sm"
                    style={{ elevation: 2, gap: 8 }}
                >
                    <MaterialIcons size={24} color="white" name="link" />
                    <BasicText color="white" size="xl" fontWeight="bold">
                        <Trans>Share your link</Trans>
                    </BasicText>
                </View>
            </TouchableOpacity>
        </View>
    );
}

function DefaultPatientHomeCard() {
    const router = useRouter();

    return (
        <View
            style={{
                elevation: 2,
                marginHorizontal: 2,
            }}
            className="mt-4 rounded-xl bg-white shadow-sm"
        >
            <View className="px-6 pt-6">
                <BasicText size="2xl">
                    <Trans>Nothing for now!</Trans>
                </BasicText>
                <BasicText color="gray">
                    {t({ message: "Search for your therapist!" })}
                </BasicText>
            </View>

            <TouchableOpacity onPress={() => router.push("/search")}>
                <View
                    className="mt-6 flex w-full flex-row items-center justify-center rounded-bl-xl rounded-br-xl bg-blue-500 py-3 align-middle"
                    style={{ elevation: 2, gap: 8 }}
                >
                    <FontAwesome size={16} color="white" name="search" />
                    <BasicText color="white" size="2xl" fontWeight="bold">
                        <Trans>Therapists</Trans>
                    </BasicText>
                </View>
            </TouchableOpacity>
        </View>
    );
}

function SetupGuide({ therapist }: { therapist: Therapist }) {
    const router = useRouter();

    return (
        <View style={{ marginTop: 16, flex: 1, gap: 12 }}>
            <CheckBox
                checked={!!therapist.pixKey}
                label={t({
                    message: therapist.pixKey
                        ? "Pix key added!"
                        : "Add a pix key to receive payments",
                })}
                action={
                    therapist.pixKey
                        ? undefined
                        : () => router.push("/(psych)/payments-setup")
                }
            />
            <CheckBox
                checked={therapist.about ? true : false}
                label={t({
                    message: therapist.about
                        ? "About section added!"
                        : "Write a bit about yourself",
                })}
                action={
                    therapist.about
                        ? undefined
                        : () => router.push("/(psych)/update-profile")
                }
            />
        </View>
    );
}
