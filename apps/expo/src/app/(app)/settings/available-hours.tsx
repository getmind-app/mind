import { useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { Trans, t } from "@lingui/macro";

import { AvailableHoursPicker } from "../../../components/AvailableHoursPicker";
import { CardSkeleton } from "../../../components/CardSkeleton";
import { Header } from "../../../components/Header";
import { Refreshable } from "../../../components/Refreshable";
import { ScreenWrapper } from "../../../components/ScreenWrapper";
import { Title } from "../../../components/Title";
import { api } from "../../../utils/api";

export default function AvailableHours() {
    const [refreshing, setRefreshing] = useState(false);
    const utils = api.useContext();
    const { data, isLoading } = api.therapists.findByUserId.useQuery();

    if (!data || isLoading)
        return (
            <View className="mx-4 mt-12">
                <CardSkeleton />
            </View>
        );

    const onRefresh = async () => {
        setRefreshing(true);
        await utils.therapists.findByUserId.invalidate();
        setRefreshing(false);
    };

    return (
        <>
            <ScreenWrapper>
                <Header />
                <Refreshable
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={void onRefresh}
                        />
                    }
                >
                    <Title title={t({ message: "Available hours" })} />
                    <Text className="pb-4 font-nunito-sans text-base text-slate-500">
                        <Trans>
                            Set available hours for your appointments.
                        </Trans>
                    </Text>
                    <AvailableHoursPicker data={data} />
                </Refreshable>
            </ScreenWrapper>
        </>
    );
}
