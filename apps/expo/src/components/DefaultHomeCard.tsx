import { TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { Trans, t } from "@lingui/macro";

import { getShareLink } from "../helpers/getShareLink";
import { useUserIsProfessional } from "../hooks/user/useUserIsProfessional";
import { api } from "../utils/api";
import { BasicText } from "./BasicText";

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
                <Trans>Couldn't find therapist</Trans>
            </BasicText>
        );
    }

    if (!user) {
        return (
            <BasicText color="yellow">
                <Trans>Couldn't find user</Trans>
            </BasicText>
        );
    }

    return (
        <View className="mt-4 rounded-xl bg-white shadow-sm">
            <View className="px-6 pt-6">
                <BasicText size="2xl">
                    <Trans>Nothing for now!</Trans>
                </BasicText>
                <BasicText color="gray">
                    {t({
                        message:
                            "Share your profile with your patients to get some appointments.",
                    })}
                </BasicText>
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
                    <BasicText color="white" size="2xl" fontWeight="bold">
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
