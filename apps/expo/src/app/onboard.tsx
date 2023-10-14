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

import { usePatientMutations } from "../hooks/patient/usePatientMutations";
import { useUserMutations } from "../hooks/user/useUserMutations";

export default function Onboard() {
    const { user } = useUser();
    const router = useRouter();
    const [selectedRole, setSelectedRole] = useState<
        "patient" | "professional"
    >();
    const { createPatient } = usePatientMutations();
    const { setMetadata } = useUserMutations();
    const [expoPushToken, setExpoPushToken] =
        useState<Notifications.ExpoPushToken | null>(null);
    const [notification, setNotification] = useState<
        Notifications.Notification | boolean
    >(false);
    const notificationListener = useRef<Notifications.Subscription>();
    const responseListener = useRef<Notifications.Subscription>();

    async function handleNext() {
        if (selectedRole) {
            try {
                await setMetadata.mutateAsync({
                    metadata: {
                        role: selectedRole,
                        expoPushToken: expoPushToken?.data,
                    },
                });
                await user?.reload();

                if (selectedRole === "patient" && user) {
                    await createPatient.mutateAsync({
                        name: String(user.fullName),
                        email: String(user.emailAddresses[0]?.emailAddress),
                        profilePictureUrl: user.profileImageUrl,
                        userId: user.id,
                    });
                }

                if (selectedRole === "patient") {
                    router.push("/");
                } else {
                    router.push("/(psych)/profile");
                }
            } catch (e) {
                console.error("error setting metadata");
                console.error(e);
            }
        } else {
            throw new Error("No role selected");
        }
    }

    useEffect(() => {
        const getLocation = async () => {
            const { status } =
                await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                Alert.alert(
                    "Permission",
                    "Sorry, we need location permissions to make this work!",
                    [{ text: "OK", onPress: () => {} }],
                );
            }
        };

        getLocation();

        (async () => {
            const { status } = await requestTrackingPermissionsAsync();
            if (status !== "granted") {
                Alert.alert(
                    "Permission required",
                    "You need to grant permission to track your data in order to use this app.",
                    [
                        {
                            text: "OK",
                            onPress: async () => {
                                await requestTrackingPermissionsAsync();
                            },
                        },
                    ],
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
        <SafeAreaView className="flex-1 flex-wrap items-center justify-center bg-off-white">
            <View className="flex w-full gap-y-4 px-4">
                <Text className="mb-2 px-4 font-nunito-sans text-3xl">
                    <Trans>Who are you?</Trans>
                </Text>
                <View className="items-center">
                    <Pressable
                        onPress={() => setSelectedRole("patient")}
                        className={`w-full ${
                            setMetadata.isLoading ? "opacity-30" : ""
                        } relative overflow-hidden`}
                    >
                        <View
                            className={`flex w-full flex-row rounded-xl border-2 bg-white ${
                                selectedRole === "patient"
                                    ? "border-blue-500"
                                    : "border-white"
                            }`}
                        >
                            <View className="items-center">
                                <View className="gap-y-2 px-4 py-10">
                                    <Text className="ml-4 font-nunito-sans text-2xl">
                                        <Trans>Patient</Trans>
                                    </Text>
                                    <Text className="ml-4 font-nunito-sans text-lg text-slate-500">
                                        <Trans>Looking for help or</Trans>
                                        {"\n"}
                                        <Trans>just want to talk</Trans>
                                    </Text>
                                </View>
                            </View>
                            <Image
                                alt="Patient with a plant"
                                source={require("../../assets/images/girl_flower.png")}
                                className="absolute -bottom-2 right-4 h-36 w-36"
                                resizeMode="contain"
                            />
                        </View>
                    </Pressable>
                </View>
                <View className="items-center">
                    <Pressable
                        onPress={() => setSelectedRole("professional")}
                        className={`w-full ${
                            setMetadata.isLoading ? "opacity-30" : ""
                        } relative overflow-hidden`}
                    >
                        <View
                            className={`flex w-full flex-row justify-end rounded-xl border-2 bg-white ${
                                selectedRole === "professional"
                                    ? "border-blue-500"
                                    : "border-white"
                            }`}
                        >
                            <Image
                                alt="Psychologist reading a book"
                                source={require("../../assets/images/girl_book.png")}
                                className="absolute -bottom-2 left-6 h-36 w-36"
                                resizeMode="contain"
                            />
                            <View className="w-3/4 items-center">
                                <View className="ml-12 gap-y-2 px-4 py-10">
                                    <Text className="font-nunito-sans text-2xl">
                                        <Trans>Professional</Trans>
                                    </Text>
                                    <Text className="font-nunito-sans text-lg text-slate-500">
                                        <Trans>Meet and help</Trans>
                                        {"\n"}
                                        <Trans>new patients</Trans>
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </Pressable>
                    <TouchableOpacity
                        className="w-full"
                        disabled={!selectedRole}
                        onPress={handleNext}
                    >
                        <View
                            className={` mt-12 flex w-full items-center  justify-center rounded-xl py-2 ${
                                selectedRole
                                    ? "bg-blue-500"
                                    : "bg-gray-300 opacity-50"
                            }`}
                        >
                            <Text
                                className={`font-nunito-sans-bold text-lg ${
                                    selectedRole ? "text-white" : "text-black"
                                }`}
                            >
                                <Trans>Next</Trans>
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
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
