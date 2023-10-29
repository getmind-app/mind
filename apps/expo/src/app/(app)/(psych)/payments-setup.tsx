import { useEffect, useState } from "react";
import {
    LayoutAnimation,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import * as Linking from "expo-linking";
import { useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { FontAwesome } from "@expo/vector-icons";
import { Trans, t } from "@lingui/macro";

import { CardSkeleton } from "../../../components/CardSkeleton";
import { Header } from "../../../components/Header";
import { Refreshable } from "../../../components/Refreshable";
import { ScreenWrapper } from "../../../components/ScreenWrapper";
import { Title } from "../../../components/Title";
import { api } from "../../../utils/api";

export default function PaymentsSetup() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    const [refreshing, setRefreshing] = useState(false);
    const therapist = api.therapists.findByUserId.useQuery();
    const updateAccountStatus = api.stripe.updateAccountStatus.useMutation();
    const createAccount = api.stripe.createAccount.useMutation();
    const linkAccount = api.stripe.linkAccount.useMutation();
    const { success } = useLocalSearchParams();

    useEffect(() => {
        if (success) {
            (async () => {
                await updateAccountStatus.mutateAsync();
                await therapist.refetch();
            })().catch(console.error);
        }
    }, [success]);

    if (!therapist.data || therapist.isLoading)
        return (
            <View className="mx-4 mt-12">
                <CardSkeleton />
            </View>
        );

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await therapist.refetch();
        } finally {
            setRefreshing(false);
        }
    };

    const onCreateAccount = async () => {
        createAccount.mutate();
        await therapist.refetch();
    };

    return (
        <ScreenWrapper>
            <Refreshable
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={void onRefresh}
                    />
                }
            >
                <Header />
                <Title title={t({ message: "Payments Setup" })} />
                <Text className="pb-4 font-nunito-sans text-base text-slate-500">
                    <Trans>
                        We use Stripe as our payment provider. To receive
                        payments from Mind you must setup an account.
                    </Trans>
                </Text>
                <TouchableOpacity
                    onPress={onCreateAccount}
                    disabled={!!therapist.data.paymentAccountId}
                >
                    <View
                        style={{
                            elevation: 2,
                        }}
                        className={`mt-6 flex w-full flex-row items-center justify-center rounded-xl ${
                            therapist.data.paymentAccountId
                                ? "bg-gray-200"
                                : "bg-blue-500"
                        } py-3 align-middle shadow-sm`}
                    >
                        <FontAwesome size={16} color="green" name="check" />
                        <Text
                            className={`ml-2 font-nunito-sans-bold text-lg ${
                                therapist.data.paymentAccountId
                                    ? "text-black"
                                    : "text-white"
                            }`}
                        >
                            <Trans>
                                {therapist.data.paymentAccountId
                                    ? "You already have an account"
                                    : "Create Stripe Account"}
                            </Trans>
                        </Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={async () => {
                        if (therapist.data.paymentAccountId) {
                            const res = await linkAccount.mutateAsync({
                                therapistPaymentAccountId:
                                    therapist.data.paymentAccountId,
                            });
                            await WebBrowser.openAuthSessionAsync(
                                `${res.url}?linkingUri=${Linking.createURL(
                                    "/?",
                                )}`,
                            );
                        } else {
                            throw new Error("No payment account id");
                        }
                    }}
                >
                    <View
                        style={{
                            elevation: 2,
                        }}
                        className={`mt-6 flex w-full flex-row items-center justify-center rounded-xl bg-blue-500 py-3 align-middle shadow-sm`}
                    >
                        <FontAwesome size={16} color="white" name="link" />
                        <Text
                            className={`ml-2 font-nunito-sans-bold text-lg text-white`}
                        >
                            <Trans>Link Accounts</Trans>
                        </Text>
                    </View>
                </TouchableOpacity>
            </Refreshable>
        </ScreenWrapper>
    );
}
