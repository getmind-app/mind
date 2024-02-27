import { useState } from "react";
import { RefreshControl, Text, View } from "react-native";
import { Trans, t } from "@lingui/macro";

import { AvailableHoursPicker } from "../../../../components/AvailableHoursPicker";
import { CardSkeleton } from "../../../../components/CardSkeleton";
import { Header } from "../../../../components/Header";
import { Refreshable } from "../../../../components/Refreshable";
import { ScreenWrapper } from "../../../../components/ScreenWrapper";
import { useTherapistByUserId } from "../../../../hooks/therapist/useTherapistByUserId";

export default function AvailableHours() {
    const [refreshing, setRefreshing] = useState(false);
    const therapist = useTherapistByUserId();

    if (!therapist.data || therapist.isLoading)
        return (
            <View className="mx-4 mt-12">
                <CardSkeleton />
            </View>
        );

    const onRefresh = async () => {
        setRefreshing(true);
        await therapist.refetch();
        setRefreshing(false);
    };

    return (
        <>
            <ScreenWrapper>
                <Header title={t({ message: "Available hours" })} />
                <Refreshable
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={void onRefresh}
                        />
                    }
                >
                    <Text className="pb-4 font-nunito-sans text-base text-slate-500">
                        <Trans>
                            Set available hours for your appointments.
                        </Trans>
                    </Text>
                    <AvailableHoursPicker data={therapist.data} />
                </Refreshable>
            </ScreenWrapper>
        </>
    );
}
