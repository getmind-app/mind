import { useEffect, useState } from "react";
import { Linking, ScrollView, Switch, Text, View } from "react-native";
import * as Notifications from "expo-notifications";
import { Trans } from "@lingui/macro";

import { Header } from "../../../components/Header";
import { Loading } from "../../../components/Loading";
import { ProfileSkeleton } from "../../../components/ProfileSkeleton";
import { ScreenWrapper } from "../../../components/ScreenWrapper";

export default function NotificationsPage() {
    return (
        <>
            <Header />
            <ScreenWrapper>
                <ScrollView
                    className="min-h-max"
                    showsVerticalScrollIndicator={false}
                >
                    <Text className="font-nunito-sans-bold text-3xl">
                        <Trans>Notifications</Trans>
                    </Text>
                    <NotificationConfig />
                </ScrollView>
            </ScreenWrapper>
        </>
    );
}

function NotificationConfig() {
    const [notificationSettings, setNotificationSettings] =
        useState<Notifications.NotificationPermissionsStatus | null>(null);

    useEffect(() => {
        (async () => {
            const status = await Notifications.getPermissionsAsync();
            setNotificationSettings(status);
        })();
    }, []);

    if (!notificationSettings)
        return (
            <View className="mt-8">
                <Loading />
            </View>
        );

    return (
        <View
            style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingTop: 16,
            }}
        >
            <Text className="text-lg text-black">
                <Trans>Appointments and events </Trans>
            </Text>
            <Switch
                onChange={async () => {
                    await Linking.openSettings();
                }}
                style={{
                    marginRight: 16,
                }}
                trackColor={{ false: "#767577", true: "#3b82f6" }}
                value={notificationSettings.status === "granted"}
            />
        </View>
    );
}
