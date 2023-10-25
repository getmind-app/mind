import { useEffect, useRef, useState } from "react";
import {
    Alert,
    Image,
    Platform,
    Pressable,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { requestTrackingPermissionsAsync } from "expo-tracking-transparency";
import { useUser } from "@clerk/clerk-expo";
import { Trans } from "@lingui/macro";

import { LargeButton } from "../components/LargeButton";
import { ScreenWrapper } from "../components/ScreenWrapper";
import { useUserMutations } from "../hooks/user/useUserMutations";

export default function Onboard() {
    const { user } = useUser();
    const router = useRouter();
    const [selectedRole, setSelectedRole] = useState<
        "patient" | "professional"
    >();
    const { setMetadata } = useUserMutations();
    const [expoPushToken, setExpoPushToken] =
        useState<Notifications.ExpoPushToken | null>(null);
    const [notification, setNotification] = useState<
        Notifications.Notification | boolean
    >(false);
    const notificationListener = useRef<Notifications.Subscription>();
    const responseListener = useRef<Notifications.Subscription>();
    const [loading, setLoading] = useState(false);

    async function handleNext() {
        setLoading(true);
        if (selectedRole) {
            try {
                await setMetadata.mutateAsync({
                    metadata: {
                        role: selectedRole,
                        expoPushToken: expoPushToken?.data,
                    },
                });
                await user?.reload();

                if (selectedRole === "patient") {
                    router.push("/(patient)/profile");
                } else {
                    router.push("/(psych)/profile");
                }
            } catch (e) {
                console.error("error setting metadata");
                console.error(e);
            } finally {
                setLoading(false);
            }
        } else {
            throw new Error("No role selected");
        }
    }

    useEffect(() => {
        (async () => {
            await requestTrackingPermissionsAsync();

            const { status } =
                await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                Alert.alert(
                    "Permission",
                    "Sorry, we need location permissions to make this work!",
                    [{ text: "OK", onPress: () => {} }],
                );
            }

            registerForPushNotificationsAsync().then((token) =>
                setExpoPushToken(token ?? null),
            );
        })();

        notificationListener.current =
            Notifications.addNotificationReceivedListener((notification) => {
                setNotification(notification);
            });

        responseListener.current =
            Notifications.addNotificationResponseReceivedListener(
                (response) => {
                    console.log(response);
                },
            );

        return () => {
            Notifications.removeNotificationSubscription(
                notificationListener.current as Notifications.Subscription,
            );
            Notifications.removeNotificationSubscription(
                responseListener.current as Notifications.Subscription,
            );
        };
    }, []);

    return (
        <ScreenWrapper>
            <View
                style={{
                    flex: 1,
                    justifyContent: "space-between",
                }}
            >
                <View
                    style={{
                        flex: 1,
                        rowGap: 16,
                    }}
                >
                    <Text className="font-nunito-sans text-3xl">
                        <Trans>Who are you?</Trans>
                    </Text>
                    <View
                        style={{
                            flex: 1,
                            justifyContent: "center",
                            rowGap: 16,
                        }}
                    >
                        <View
                            style={{
                                flex: 1,
                                maxHeight: "30%",
                            }}
                        >
                            <Pressable
                                onPress={() => setSelectedRole("patient")}
                                style={{
                                    flex: 1,
                                    opacity: setMetadata.isLoading ? 0.3 : 1,
                                    borderWidth: 2,
                                    borderColor:
                                        selectedRole === "patient"
                                            ? "#3b82f6"
                                            : "#f8f8f8",
                                    borderRadius: 16,
                                    flexDirection: "row",
                                    overflow: "hidden",
                                }}
                            >
                                <View
                                    className="items-center"
                                    style={{
                                        flex: 1,
                                        flexDirection: "row",
                                        alignItems: "center",
                                        paddingHorizontal: 12,
                                    }}
                                >
                                    <View
                                        style={{
                                            flex: 1,
                                        }}
                                    >
                                        <Text className="font-nunito-sans text-2xl">
                                            <Trans>Patient</Trans>
                                        </Text>
                                        <Text className="font-nunito-sans text-slate-500">
                                            <Trans>
                                                Looking for help or just want to
                                                talk
                                            </Trans>
                                        </Text>
                                    </View>
                                    <Image
                                        alt="Patient with a plant"
                                        source={require("../../assets/images/girl_flower.png")}
                                        style={{
                                            maxWidth: 180,
                                            maxHeight: 180,
                                            position: "relative",
                                            bottom: -24,
                                        }}
                                        resizeMode="contain"
                                    />
                                </View>
                            </Pressable>
                        </View>
                        <View
                            style={{
                                flex: 1,
                                maxHeight: "30%",
                            }}
                        >
                            <Pressable
                                onPress={() => setSelectedRole("professional")}
                                style={{
                                    flex: 1,
                                    opacity: setMetadata.isLoading ? 0.3 : 1,
                                    borderWidth: 2,
                                    borderColor:
                                        selectedRole === "professional"
                                            ? "#3b82f6"
                                            : "#f8f8f8",
                                    borderRadius: 16,
                                    flexDirection: "row",
                                    overflow: "hidden",
                                }}
                            >
                                <View
                                    className="items-center"
                                    style={{
                                        flex: 1,
                                        flexDirection: "row",
                                        alignItems: "center",
                                        paddingHorizontal: 12,
                                    }}
                                >
                                    <Image
                                        alt="Patient with a plant"
                                        source={require("../../assets/images/girl_book.png")}
                                        style={{
                                            // for some reason it looks better if this image if smaller
                                            maxWidth: 160,
                                            maxHeight: 160,
                                            position: "relative",
                                            bottom: -24,
                                        }}
                                        resizeMode="contain"
                                    />
                                    <View
                                        style={{
                                            flex: 1,
                                        }}
                                    >
                                        <Text className="font-nunito-sans text-2xl">
                                            <Trans>Professional</Trans>
                                        </Text>
                                        <Text className="font-nunito-sans text-slate-500">
                                            <Trans>
                                                Meet and help new patients
                                            </Trans>
                                        </Text>
                                    </View>
                                </View>
                            </Pressable>
                        </View>
                    </View>
                </View>

                <LargeButton
                    loading={loading}
                    onPress={handleNext}
                    disabled={!selectedRole}
                >
                    <Trans>Next</Trans>
                </LargeButton>
            </View>
        </ScreenWrapper>
    );
}

async function registerForPushNotificationsAsync() {
    let token;
    if (Device.isDevice) {
        const { status: existingStatus } =
            await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== "granted") {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== "granted") {
            alert("Failed to get push token for push notification!");
            return;
        }
        token = await Notifications.getExpoPushTokenAsync({
            projectId: Constants.expoConfig?.extra?.eas.projectId,
        });
    } else {
        alert("Must use physical device for Push Notifications");
    }

    if (Platform.OS === "android") {
        Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#FF231F7C",
        });
    }

    return token;
}
