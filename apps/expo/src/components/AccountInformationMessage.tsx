import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Trans } from "@lingui/macro";

import { useTherapistByUserId } from "../hooks/therapist/useTherapistByUserId";
import { useUserIsProfessional } from "../hooks/user/useUserIsProfessional";
import { Card } from "./Card";
import { LargeButton } from "./LargeButton";

export function AccountInformationMessage() {
    const userIsProfessional = useUserIsProfessional();
    const therapist = useTherapistByUserId();

    if (!userIsProfessional || therapist.isLoading) return null;

    if (therapist.isError) {
        return <ErrorMessage />;
    }

    if (therapist.data?.status === "PENDENT") {
        return <PendentAccountMessage />;
    }

    if (therapist.data?.paymentAccountStatus === "UNACTIVE") {
        return <MissingStripeSetupMessage />;
    }
}

function ErrorMessage() {
    return (
        <Card color="red">
            <Text>
                <Trans>
                    There was an error while fetching your account information
                </Trans>
            </Text>
        </Card>
    );
}

function PendentAccountMessage() {
    return (
        <Card color="orange">
            <Text
                style={{
                    fontFamily: "NunitoSans_400Regular",
                }}
            >
                <Trans>
                    Your account is pendant, we will get in touch soon to
                    activate it.
                </Trans>
            </Text>
        </Card>
    );
}

function MissingStripeSetupMessage() {
    const router = useRouter();

    return (
        <Card color="orange">
            <View
                style={{
                    gap: 12,
                }}
            >
                <Text
                    style={{
                        fontFamily: "NunitoSans_400Regular",
                    }}
                >
                    <Trans>
                        Your account is missing the payments setup, configure it
                        to be able to accept payments through Mind.
                    </Trans>
                </Text>
                <LargeButton
                    color="white"
                    textStyle={{
                        fontFamily: "NunitoSans_400Regular",
                    }}
                    onPress={() => {
                        router.push("/(psych)/payments-setup");
                    }}
                >
                    <Trans>Setup Payments</Trans>
                </LargeButton>
            </View>
        </Card>
    );
}
