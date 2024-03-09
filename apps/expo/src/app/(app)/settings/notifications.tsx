import { useEffect, useState } from "react";
import { Linking, ScrollView, Switch, Text, View } from "react-native";
import { RefreshControl, TouchableOpacity } from "react-native-gesture-handler";
import * as Notifications from "expo-notifications";
import { useUser } from "@clerk/clerk-expo";
import { Trans, t } from "@lingui/macro";

import { Header } from "../../../components/Header";
import { Refreshable } from "../../../components/Refreshable";
import { ScreenWrapper } from "../../../components/ScreenWrapper";
import { registerForPushNotificationsAsync } from "../../../helpers/registerForPushNotifications";
import { useUserMutations } from "../../../hooks/user/useUserMutations";

export default function NotificationsPage() {
    const [notificationSettings, setNotificationSettings] =
        useState<Notifications.NotificationPermissionsStatus | null>(null);

    const [expoPushToken, setExpoPushToken] =
        useState<Notifications.ExpoPushToken | null>(null);

    const [switchActive, setSwitchActive] = useState(
        notificationSettings?.status === "granted",
    );

    const [refreshing, setRefreshing] = useState(false);
    const { setMetadata } = useUserMutations();
    const { user } = useUser();

    useEffect(() => {
        (async () => {
            const status = await Notifications.getPermissionsAsync();
            setNotificationSettings(status);
            setSwitchActive(status.status === "granted");
        })();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);

        const status = await Notifications.getPermissionsAsync();
        setNotificationSettings(status);
        setSwitchActive(status.status === "granted");

        if (
            status.status === "granted" &&
            !user?.publicMetadata.expoPushToken
        ) {
            await registerForPushNotificationsAsync().then((token) => {
                setExpoPushToken(token ?? null);

                setMetadata.mutate({
                    metadata: {
                        ...user?.publicMetadata,
                        expoPushToken: expoPushToken?.data,
                    },
                });
            });
        }

        setRefreshing(false);
    };

    return (
        <>
            <ScreenWrapper>
                <Refreshable
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                        />
                    }
                >
                    <Header title={t({ message: "Notifications" })} />
                    <ScrollView
                        className="min-h-max"
                        showsVerticalScrollIndicator={false}
                    >
                        {notificationSettings?.status === "denied" && (
                            <View
                                style={{
                                    paddingTop: 16,
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                }}
                            >
                                <Text className="w-72 font-nunito-sans text-lg">
                                    <Trans>
                                        To enable notifications, allow it in
                                        settings.
                                    </Trans>
                                </Text>
                                <TouchableOpacity
                                    onPress={async () => {
                                        await Linking.openSettings();

                                        const status =
                                            await Notifications.getPermissionsAsync();

                                        setNotificationSettings(status);
                                    }}
                                >
                                    <View>
                                        <Text
                                            style={{
                                                color: "#3b82f6",
                                                textDecorationLine: "underline",
                                            }}
                                            className="font-nunito-sans text-lg"
                                        >
                                            Settings
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        )}
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                opacity:
                                    notificationSettings?.status === "granted"
                                        ? 1
                                        : 0.5,
                            }}
                        >
                            <Text className="font-nunito-sans text-lg">
                                <Trans>Appointments and events </Trans>
                            </Text>
                            <Switch
                                value={switchActive}
                                disabled={
                                    notificationSettings?.status !== "granted"
                                }
                                trackColor={{
                                    false: "#767577",
                                    true: "#3b82f6",
                                }}
                                style={{
                                    marginRight: 16,
                                }}
                                onChange={async () => {
                                    setSwitchActive(!switchActive);

                                    await Linking.openSettings();

                                    const status =
                                        await Notifications.getPermissionsAsync();

                                    setNotificationSettings(status);

                                    await onRefresh();

                                    setSwitchActive(
                                        notificationSettings?.status ===
                                            "granted",
                                    );
                                }}
                            />
                        </View>
                    </ScrollView>
                </Refreshable>
            </ScreenWrapper>
        </>
    );
}
