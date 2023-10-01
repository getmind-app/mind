import { useState } from "react";
import {
    LayoutAnimation,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { FontAwesome } from "@expo/vector-icons";
import { Trans } from "@lingui/macro";

import { CardSkeleton } from "../../../components/CardSkeleton";
import { Header } from "../../../components/Header";
import { api } from "../../../utils/api";

export default function AvailableHours() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    const [refreshing, setRefreshing] = useState(false);
    const { data, isLoading, refetch } = api.therapists.findByUserId.useQuery();
    const createAccount = api.stripe.createAccount.useMutation();
    const linkAccount = api.stripe.linkAccount.useMutation();

    if (!data || isLoading)
        return (
            <View className="mx-4 mt-12">
                <CardSkeleton />
            </View>
        );

    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 500);
    };

    const onCreateAccount = async () => {
        await createAccount.mutate();
        await refetch();
    };

    return (
        <ScrollView
            className="bg-off-white"
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <Header />
            <View className="p-4 pb-12">
                <Text className="font-nunito-sans-bold text-3xl">
                    <Trans>Payments Setup</Trans>
                </Text>
                <Text className="pb-4 font-nunito-sans text-base text-slate-500">
                    <Trans>
                        We use Stripe as our payment provider, to receive
                        payments via Mind you have to setup an account.
                    </Trans>
                </Text>
                <TouchableOpacity
                    onPress={onCreateAccount}
                    disabled={!!data.paymentAccountId}
                >
                    <View
                        style={{
                            elevation: 2,
                        }}
                        className={`mt-6 flex w-full flex-row items-center justify-center rounded-xl ${
                            data.paymentAccountId
                                ? "bg-gray-200"
                                : "bg-blue-500"
                        } py-3 align-middle shadow-md`}
                    >
                        <FontAwesome size={16} color="white" name="search" />
                        <Text
                            className={`ml-2 font-nunito-sans-bold text-lg ${
                                data.paymentAccountId
                                    ? "text-black"
                                    : "text-white"
                            }`}
                        >
                            <Trans>
                                {data.paymentAccountId
                                    ? "You already have an account"
                                    : "Create Stripe Account"}
                            </Trans>
                        </Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={async () => {
                        if (data.paymentAccountId) {
                            const res = await linkAccount.mutateAsync({
                                therapistPaymentAccountId:
                                    data.paymentAccountId,
                            });
                            await WebBrowser.openAuthSessionAsync(
                                `${res.url}?linkingUri=${Linking.createURL(
                                    "/?",
                                )}`,
                            );
                        }
                    }}
                >
                    <View
                        style={{
                            elevation: 2,
                        }}
                        className={`mt-6 flex w-full flex-row items-center justify-center rounded-xl bg-blue-500 py-3 align-middle shadow-md`}
                    >
                        <FontAwesome size={16} color="white" name="search" />
                        <Text
                            className={`ml-2 font-nunito-sans-bold text-lg text-white`}
                        >
                            <Trans>Link Accounts</Trans>
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}
