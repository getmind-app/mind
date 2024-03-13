import { useState } from "react";
import {
    LayoutAnimation,
    RefreshControl,
    TouchableOpacity,
    View,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { Trans, t } from "@lingui/macro";
import { FlashList } from "@shopify/flash-list";

import { BasicText } from "../../../../components/BasicText";
import { CardSkeleton } from "../../../../components/CardSkeleton";
import { Header } from "../../../../components/Header";
import { Refreshable } from "../../../../components/Refreshable";
import { ScreenWrapper } from "../../../../components/ScreenWrapper";
import { Title } from "../../../../components/Title";
import { UserPhoto } from "../../../../components/UserPhotos";
import { api } from "../../../../utils/api";
import { colors } from "../../../../utils/colors";

export default function PatientsScreen() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();
    const therapistPatients = api.therapists.allPatients.useQuery();

    if (therapistPatients.isLoading)
        return (
            <View className="mx-4 mt-12">
                <CardSkeleton />
            </View>
        );

    if (therapistPatients.error)
        return (
            <View
                style={{
                    marginTop: 24,
                    marginHorizontal: 12,
                }}
            >
                <BasicText color="red">
                    {t({
                        message:
                            "Error fetching patients. Please try again later.",
                    })}
                </BasicText>
            </View>
        );

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await therapistPatients.refetch();
        } finally {
            setRefreshing(false);
        }
    };

    return (
        <ScreenWrapper>
            <Refreshable
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
            >
                <Header />
                <View
                    style={{
                        flex: 1,
                        minHeight: 300,
                        gap: 12,
                    }}
                >
                    <Title title={t({ message: "Your patients" })} />
                    {therapistPatients.data.length === 0 ? (
                        <View
                            style={{
                                flex: 1,
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <BasicText size="2xl" fontWeight="bold">
                                <Trans>You have no patients yet</Trans>
                            </BasicText>
                            <BasicText size="lg" color="gray">
                                <Trans>
                                    When you accept a session request, you will
                                    be able to see your patients here.
                                </Trans>
                            </BasicText>
                        </View>
                    ) : (
                        <FlashList
                            data={therapistPatients.data}
                            estimatedItemSize={60}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => {
                                        router.push(
                                            `/home/patients/${item.id}`,
                                        );
                                    }}
                                    style={{
                                        padding: 12,
                                        flex: 1,
                                        height: 48,
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        borderBottomColor: colors.lightGray,
                                        borderBottomWidth: 1,
                                    }}
                                >
                                    <View
                                        style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            gap: 12,
                                        }}
                                    >
                                        <UserPhoto
                                            alt={`${item.name} profile picture`}
                                            userId={item.userId}
                                        />
                                        <BasicText>{item.name}</BasicText>
                                    </View>
                                    <MaterialIcons
                                        size={24}
                                        name="chevron-right"
                                        color="#3b82f6"
                                    />
                                </TouchableOpacity>
                            )}
                        />
                    )}
                </View>
            </Refreshable>
        </ScreenWrapper>
    );
}
