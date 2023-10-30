import { useState } from "react";
import {
    LayoutAnimation,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import * as Linking from "expo-linking";
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
    const account = api.stripe.getAccount.useQuery({
        paymentAccountId: therapist.data?.paymentAccountId ?? "",
    });
    const therapistHasStripeAccount = therapist.data?.paymentAccountId !== null;
    const therapistHasBankAccountLinked =
        therapist.data?.paymentAccountStatus === "ACTIVE";

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
                    disabled={!!therapistHasStripeAccount}
                >
                    <View
                        style={{
                            elevation: 2,
                        }}
                        className={`mt-6 flex w-full flex-row items-center justify-center rounded-xl ${
                            therapistHasStripeAccount
                                ? "bg-gray-200"
                                : "bg-blue-500"
                        } py-3 align-middle shadow-sm`}
                    >
                        <FontAwesome
                            size={16}
                            color={`${
                                therapistHasStripeAccount ? "green" : "white"
                            }`}
                            name={`${
                                therapistHasStripeAccount ? "check" : "link"
                            }`}
                        />
                        <Text
                            className={`ml-2 font-nunito-sans-bold text-lg ${
                                therapistHasStripeAccount
                                    ? "text-black"
                                    : "text-white"
                            }`}
                        >
                            <Trans>
                                {therapistHasStripeAccount
                                    ? "You already have an account"
                                    : "Create Stripe Account"}
                            </Trans>
                        </Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    disabled={therapistHasBankAccountLinked}
                    onPress={async () => {
                        if (!therapistHasBankAccountLinked) {
                            const res = await linkAccount.mutateAsync({
                                therapistPaymentAccountId:
                                    therapist?.data?.paymentAccountId ?? "",
                            });
                            await WebBrowser.openAuthSessionAsync(
                                `${res.url}?linkingUri=${Linking.createURL(
                                    "/?",
                                )}`,
                            );

                            await account.refetch();

                            if (
                                account.data?.external_accounts?.data.length &&
                                account.data?.external_accounts?.data.length > 0
                            ) {
                                await updateAccountStatus.mutateAsync();
                                await therapist.refetch();
                            }
                        } else {
                            throw new Error("No payment account id");
                        }
                    }}
                >
                    <View
                        style={{
                            elevation: 2,
                        }}
                        className={`mt-6 flex w-full flex-row items-center justify-center rounded-xl ${
                            therapistHasBankAccountLinked
                                ? "bg-gray-200"
                                : "bg-blue-500"
                        }  py-3 align-middle shadow-sm`}
                    >
                        <FontAwesome
                            size={16}
                            color={`${
                                therapistHasBankAccountLinked
                                    ? "green"
                                    : "white"
                            }`}
                            name={`${
                                therapistHasBankAccountLinked ? "check" : "link"
                            }`}
                        />
                        <Text
                            className={`ml-2 font-nunito-sans-bold text-lg ${
                                therapistHasBankAccountLinked
                                    ? "text-black"
                                    : "text-white"
                            }`}
                        >
                            {therapistHasBankAccountLinked ? (
                                <Trans>Bank account linked</Trans>
                            ) : (
                                <Trans>Link Accounts</Trans>
                            )}
                        </Text>
                    </View>
                </TouchableOpacity>
            </Refreshable>
        </ScreenWrapper>
    );
}
