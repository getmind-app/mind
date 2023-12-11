import { useEffect, useState } from "react";
import { Linking, ScrollView, Switch, Text, View } from "react-native";
import * as Notifications from "expo-notifications";
import { useUser } from "@clerk/clerk-expo";
import { Trans } from "@lingui/macro";

import { Header } from "../../../components/Header";
import { Loading } from "../../../components/Loading";
import { ScreenWrapper } from "../../../components/ScreenWrapper";
import { registerForPushNotificationsAsync } from "../../../helpers/registerForPushNotifications";
import { useUserMutations } from "../../../hooks/user/useUserMutations";

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

    const [expoPushToken, setExpoPushToken] =
        useState<Notifications.ExpoPushToken | null>(null);

    const [switchActive, setSwitchActive] = useState(
        notificationSettings?.status === "granted",
    );

    const { setMetadata } = useUserMutations();
    const { user } = useUser();

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
            <Text className="font-nunito-sans text-lg">
                <Trans>Appointments and events </Trans>
            </Text>
            <Switch
                onChange={async () => {
                    setSwitchActive(!switchActive);

                    if (notificationSettings.status !== "granted") {
                        await Notifications.requestPermissionsAsync();
                        const status =
                            await Notifications.getPermissionsAsync();

                        setNotificationSettings(status);

                        await registerForPushNotificationsAsync().then(
                            (token) => setExpoPushToken(token ?? null),
                        );

                        await setMetadata.mutateAsync({
                            metadata: {
                                ...user?.publicMetadata,
                                expoPushToken: expoPushToken?.data,
                            },
                        });
                    } else {
                        await Linking.openSettings();

                        const status =
                            await Notifications.getPermissionsAsync();

                        setNotificationSettings(status);
                    }

                    setSwitchActive(notificationSettings.status === "granted");
                }}
                style={{
                    marginRight: 16,
                }}
                trackColor={{ false: "#767577", true: "#3b82f6" }}
                value={switchActive}
            />
        </View>
    );
}
