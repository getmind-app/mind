import React, { useEffect, useRef, useState } from "react";
import {
    Image,
    Linking,
    Platform,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { Trans, t } from "@lingui/macro";

import { CardSkeleton } from "../../components/CardSkeleton";
import DefaultHomeCard from "../../components/DefaultHomeCard";
import geocodeAddress from "../../helpers/geocodeAddress";
import { api } from "../../utils/api";

export default function Index() {
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const utils = api.useContext();

    const [expoPushToken, setExpoPushToken] =
        useState<Notifications.ExpoPushToken | null>(null);
    const [notification, setNotification] = useState<
        Notifications.Notification | boolean
    >(false);
    const notificationListener = useRef<Notifications.Subscription>();
    const responseListener = useRef<Notifications.Subscription>();

    const onRefresh = () => {
        setRefreshing(true);
        utils.appointments.findNextUserAppointment.invalidate();
        utils.notes.findByUserId.invalidate();
        setTimeout(() => {
            setRefreshing(false);
        }, 500);
    };

    useEffect(() => {
        registerForPushNotificationsAsync().then((token) =>
            setExpoPushToken(token ?? null),
        );

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
        <ScrollView
            className="bg-off-white px-4 pt-12"
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <TouchableOpacity
                onPress={() => sendPushNotification(expoPushToken)}
            >
                <Text>Send notification</Text>
            </TouchableOpacity>

            <View className="h-full">
                <Text className="pt-12 font-nunito-sans-bold text-3xl">
                    <Trans>Next session</Trans>
                </Text>
                <NextAppointment />
                <View className="mb-2 flex flex-row items-center justify-between pt-8 align-middle">
                    <Text className=" font-nunito-sans-bold text-3xl">
                        <Trans>Last notes</Trans>
                    </Text>
                    <TouchableOpacity onPress={() => router.push("/notes/new")}>
                        <View className="rounded-lg bg-blue-500 px-3 py-1 shadow-sm">
                            <Text className="text-center font-nunito-sans-bold text-base text-white">
                                <Trans>New</Trans>
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <LastNotes />
            </View>
        </ScrollView>
    );
}

function NextAppointment() {
    const router = useRouter();

    const { data, isLoading } =
        api.appointments.findNextUserAppointment.useQuery();

    if (isLoading) return <CardSkeleton />;

    return (
        <>
            {data && data.therapistId ? (
                <View className="mt-4 rounded-xl bg-white shadow-sm">
                    <View className="p-6">
                        <View className="flex w-full flex-row justify-between">
                            <Text className="font-nunito-sans text-xl">
                                {new Intl.DateTimeFormat("en", {
                                    weekday: "long",
                                }).format(new Date(data.scheduledTo))}
                                , {new Date(data.scheduledTo).getDate()}/
                                {new Date(data.scheduledTo).getMonth() + 1}
                            </Text>
                            <Text className="font-nunito-sans-bold text-xl text-blue-500 ">
                                {new Date(data.scheduledTo).getHours()}:
                                {new Date(data.scheduledTo).getMinutes() == 0
                                    ? "00"
                                    : new Date(data.scheduledTo).getMinutes()}
                            </Text>
                        </View>
                        <Text className="font-nunito-sans text-sm text-slate-500">
                            {data.modality === "ONLINE" ? (
                                "via Google Meet"
                            ) : (
                                <Text>
                                    <Trans>
                                        in person at{" "}
                                        <TouchableOpacity
                                            onPress={() =>
                                                geocodeAddress(
                                                    data?.therapist?.address,
                                                ).then((link) =>
                                                    Linking.openURL(
                                                        link ? link : "",
                                                    ),
                                                )
                                            }
                                        >
                                            <Text>
                                                {data.therapist.address?.street}
                                                ,{" "}
                                                {data.therapist.address?.number}
                                            </Text>
                                        </TouchableOpacity>
                                    </Trans>
                                </Text>
                            )}
                        </Text>
                        <View className="flex w-full flex-row items-center justify-between pt-4 align-middle">
                            <View className="flex flex-row items-center align-middle">
                                <View className="flex items-center justify-center overflow-hidden rounded-full align-middle">
                                    <TouchableOpacity
                                        onPress={() =>
                                            router.push(
                                                "/psych/" + data.therapist.id,
                                            )
                                        }
                                    >
                                        <Image
                                            className="flex items-center justify-center rounded-full"
                                            alt={`${data.therapist.name} profile picture`}
                                            source={{
                                                uri: data.therapist
                                                    .profilePictureUrl,
                                                width: 32,
                                                height: 32,
                                            }}
                                        />
                                    </TouchableOpacity>
                                </View>
                                <Text className="pl-2 font-nunito-sans text-xl">
                                    {data.therapist.name}
                                </Text>
                            </View>
                            <MaterialIcons
                                style={{ paddingRight: 12 }}
                                color="black"
                                size={24}
                                name="add"
                            />
                        </View>
                    </View>
                    <TouchableOpacity
                        onPress={async () => {
                            if (data.modality === "ONLINE") {
                                Linking.openURL(data?.link as string);
                                return;
                            }

                            const mapsLink = await geocodeAddress(
                                data?.therapist.address,
                            );
                            Linking.openURL(mapsLink as string);
                        }}
                    >
                        <View className="flex w-full flex-row items-center justify-center rounded-bl-xl rounded-br-xl bg-blue-500 py-3 align-middle">
                            <FontAwesome
                                size={16}
                                color="white"
                                name={`${
                                    data.modality === "ONLINE"
                                        ? "video-camera"
                                        : "car"
                                }`}
                            />
                            <Text className="ml-4 font-nunito-sans-bold text-lg text-white">
                                {data.modality === "ONLINE"
                                    ? t({ message: "Join the meeting" })
                                    : t({ message: "Get directions" })}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            ) : (
                <DefaultHomeCard />
            )}
        </>
    );
}

function LastNotes() {
    const router = useRouter();

    const { data, isLoading } = api.notes.findByUserId.useQuery();

    if (isLoading) return <CardSkeleton />;

    return (
        <>
            {data && data.length > 0 ? (
                data.map(
                    ({
                        id,
                        content,
                        createdAt,
                    }: {
                        id: string;
                        content: string;
                        createdAt: Date;
                    }) => (
                        <View
                            key={id}
                            className="my-2 rounded-xl bg-white shadow-sm"
                        >
                            <View className="flex w-full flex-row items-center justify-between px-6 py-4 align-middle">
                                <View className="flex w-64 flex-col">
                                    <Text className="font-nunito-sans-bold text-xl text-slate-500">
                                        <Text className="text-blue-500">
                                            {createdAt.getDate()}
                                        </Text>{" "}
                                        {createdAt.toLocaleString("en", {
                                            month: "long",
                                        })}
                                    </Text>
                                    <Text className="pt-2 font-nunito-sans text-base">
                                        {content}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => router.push("/notes/" + id)}
                                >
                                    <MaterialIcons
                                        size={32}
                                        name="chevron-right"
                                        color="#3b82f6"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ),
                )
            ) : (
                <View className="mt-4 rounded-xl bg-white shadow-sm">
                    <View className="flex w-full flex-row items-center justify-between px-6 py-4 align-middle">
                        <View className="flex flex-col">
                            <Text className="font-nunito-sans-bold text-xl text-slate-500">
                                <Trans>You have no notes</Trans>
                            </Text>
                            <Text className="pt-2 font-nunito-sans text-base">
                                <Trans>
                                    Notes are a tool for helping you track your
                                    progress
                                </Trans>
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => router.push("/notes/new")}
                        >
                            <MaterialIcons
                                size={32}
                                name="chevron-right"
                                color="#3b82f6"
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </>
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
        console.log(token);
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

async function sendPushNotification(
    expoPushToken: Notifications.ExpoPushToken | null,
) {
    const message = {
        to: expoPushToken,
        sound: "default",
        title: "Original Title",
        body: "And here is the body!",
        data: { someData: "goes here" },
    };

    await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Accept-encoding": "gzip, deflate",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
    });
}
