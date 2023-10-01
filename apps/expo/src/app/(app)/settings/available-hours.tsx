import { useState } from "react";
import {
    LayoutAnimation,
    RefreshControl,
    ScrollView,
    Text,
    View,
} from "react-native";
import { Trans } from "@lingui/macro";

import { AvailableHoursPicker } from "../../../components/AvailableHoursPicker";
import { CardSkeleton } from "../../../components/CardSkeleton";
import { Header } from "../../../components/Header";
import { api } from "../../../utils/api";

export default function AvailableHours() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    const [refreshing, setRefreshing] = useState(false);
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
        <>
            <Header />
            <ScrollView
                className="bg-off-white"
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
            >
                <View className="p-4 pb-12">
                    <Text className="font-nunito-sans-bold text-3xl">
                        <Trans>Available hours</Trans>
                    </Text>
                    <Text className="pb-4 font-nunito-sans text-base text-slate-500">
                        <Trans>
                            Set available hours for your appointments.
                        </Trans>
                    </Text>
                    <AvailableHoursPicker data={data} />
                </View>
            </ScrollView>
        </>
    );
}
