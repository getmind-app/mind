import { useState } from "react";
import {
    LayoutAnimation,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { Trans } from "@lingui/macro";

import { CardSkeleton } from "../../../components/CardSkeleton";
import { Header } from "../../../components/Header";
import { api } from "../../../utils/api";

export default function AvailableHours() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();
    const { data, isLoading } = api.therapists.findByUserId.useQuery();

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
                <TouchableOpacity onPress={() => router.push("/search")}>
                    <View
                        style={{
                            elevation: 2,
                        }}
                        className="mt-6 flex w-full flex-row items-center justify-center rounded-xl bg-blue-500 py-3 align-middle shadow-md"
                    >
                        <FontAwesome size={16} color="white" name="search" />
                        <Text className="ml-2 font-nunito-sans-bold text-lg text-white">
                            <Trans>Create Stripe Account</Trans>
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}
