import React, { useEffect, useRef, useState } from "react";
import {
    Alert,
    Linking,
    Platform,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import * as Device from "expo-device";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import {
    requestTrackingPermissionsAsync,
    useTrackingPermissions,
} from "expo-tracking-transparency";
import { useUser } from "@clerk/clerk-expo";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { Trans, t } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import { format } from "date-fns";

import { BasicText } from "../../components/BasicText";
import { Card } from "../../components/Card";
import { CardSkeleton } from "../../components/CardSkeleton";
import DefaultHomeCard from "../../components/DefaultHomeCard";
import { Refreshable } from "../../components/Refreshable";
import { RescheduleAppointments } from "../../components/RescheduleAppointments";
import { ScreenWrapper } from "../../components/ScreenWrapper";
import { SmallButton } from "../../components/SmallButton";
import { Title } from "../../components/Title";
import { UserPhoto } from "../../components/UserPhotos";
import { Warning } from "../../components/Warning";
import geocodeAddress from "../../helpers/geocodeAddress";
import { getLocale } from "../../helpers/getLocale";
import { registerForPushNotificationsAsync } from "../../helpers/registerForPushNotifications";
import { useUserIsProfessional } from "../../hooks/user/useUserIsProfessional";
import { useUserMutations } from "../../hooks/user/useUserMutations";
import { api } from "../../utils/api";

export default function HomeScreen() {
    const router = useRouter();
    const utils = api.useContext();
    const { user } = useUser();
    const { setMetadata } = useUserMutations();
    const [refreshing, setRefreshing] = useState(false);
    const [trackingStatus] = useTrackingPermissions();
    const [locationStatus] = Location.useBackgroundPermissions();
    const isProfessional = useUserIsProfessional();
    const notificationListener = useRef<Notifications.Subscription>();
    const responseListener = useRef<Notifications.Subscription>();
    const [expoPushToken, setExpoPushToken] =
        useState<Notifications.ExpoPushToken | null>(null);
    const [, setNotification] = useState<Notifications.Notification | boolean>(
        false,
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await utils.appointments.findNextUserAppointment.invalidate();
        await utils.notes.findByUserId.invalidate();
        setRefreshing(false);
    };

    useEffect(() => {
        (async () => {
            if (!trackingStatus?.granted) {
                await requestTrackingPermissionsAsync();
            }

            if (!locationStatus?.granted) {
                const { status } =
                    await Location.requestForegroundPermissionsAsync();
                if (status !== "granted") {
                    Alert.alert(
                        "Permission",
                        "Sorry, we need location permissions to make this work!",
                        [{ text: "OK", onPress: () => {} }],
                    );
                }
            }

            const notificationPermission =
                await Notifications.getPermissionsAsync();

            if (
                !notificationPermission.granted &&
                notificationPermission.canAskAgain &&
                Device.isDevice
            ) {
                await registerForPushNotificationsAsync().then((token) =>
                    setExpoPushToken(token ?? null),
                );

                await setMetadata.mutateAsync({
                    metadata: {
                        ...user?.publicMetadata,
                        expoPushToken: expoPushToken?.data,
                    },
                });
                await user?.reload();
            }
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
            <Refreshable
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
            >
                {isProfessional && <SetUpWorkHoursWarning />}
                {!isProfessional && <RescheduleAppointments />}
                <Title title={t({ message: "Next session" })} />
                <NextAppointment />
                <View className="mb-2 flex flex-row items-center justify-between pt-8 align-middle">
                    <Title title={t({ message: "Last notes" })} />

                    <SmallButton
                        onPress={() => router.push("/notes/new")}
                        textSize="lg"
                    >
                        New
                    </SmallButton>
                </View>
                <LastNotes />
            </Refreshable>
        </ScreenWrapper>
    );
}

function NextAppointment() {
    const router = useRouter();
    const isProfessional = useUserIsProfessional();
    const lingui = useLingui();

    const appointment = api.appointments.findNextUserAppointment.useQuery();

    if (appointment.isLoading) return <CardSkeleton />;

    return (
        <>
            {appointment.data && appointment.data.therapistId ? (
                <View
                    style={{
                        elevation: 2,
                    }}
                    className="mt-4 rounded-xl bg-white shadow-sm"
                >
                    <View className="p-6">
                        <View className="flex w-full flex-row justify-between">
                            <BasicText
                                size="2xl"
                                style={{
                                    textTransform: "capitalize",
                                }}
                            >
                                {format(
                                    new Date(appointment.data.scheduledTo),
                                    "EEEE, dd/MM",
                                    {
                                        locale: getLocale(lingui),
                                    },
                                )}
                            </BasicText>
                            <Text className="font-nunito-sans-bold text-xl text-blue-500 ">
                                {new Date(
                                    appointment.data.scheduledTo,
                                ).getHours()}
                                :
                                {new Date(
                                    appointment.data.scheduledTo,
                                ).getMinutes() == 0
                                    ? "00"
                                    : new Date(
                                          appointment.data.scheduledTo,
                                      ).getMinutes()}
                            </Text>
                        </View>
                        <Text className="font-nunito-sans text-sm text-slate-500">
                            {appointment.data.modality === "ONLINE" ? (
                                "via Google Meet"
                            ) : (
                                <Text>
                                    <Trans>
                                        in person at{" "}
                                        <TouchableOpacity
                                            onPress={() =>
                                                geocodeAddress(
                                                    appointment.data?.therapist
                                                        ?.address,
                                                ).then((link) =>
                                                    Linking.openURL(
                                                        link ? link : "",
                                                    ),
                                                )
                                            }
                                        >
                                            <Text>
                                                {
                                                    appointment.data.therapist
                                                        .address?.street
                                                }
                                                ,{" "}
                                                {
                                                    appointment.data.therapist
                                                        .address?.number
                                                }
                                            </Text>
                                        </TouchableOpacity>
                                    </Trans>
                                </Text>
                            )}
                        </Text>
                        <View className="flex w-full flex-row items-center justify-between pt-4 align-middle">
                            <View className="flex flex-row items-center align-middle">
                                <View className="flex items-center justify-center overflow-hidden rounded-full align-middle">
                                    {isProfessional ? (
                                        <UserPhoto
                                            userId={
                                                appointment.data.patient.userId
                                            }
                                            alt={"Patient"}
                                            url={
                                                appointment.data.patient
                                                    .profilePictureUrl
                                            }
                                        />
                                    ) : (
                                        <TouchableOpacity
                                            onPress={() =>
                                                router.push(
                                                    `/psych/${appointment.data?.therapist.id}`,
                                                )
                                            }
                                        >
                                            <UserPhoto
                                                userId={
                                                    appointment.data.therapist
                                                        .userId
                                                }
                                                alt={"Therapist"}
                                                url={
                                                    appointment.data.therapist
                                                        .profilePictureUrl
                                                }
                                            />
                                        </TouchableOpacity>
                                    )}
                                </View>
                                <Text className="pl-2 font-nunito-sans text-xl">
                                    {isProfessional
                                        ? appointment.data.patient.name
                                        : appointment.data.therapist.name}
                                </Text>
                            </View>
                        </View>
                    </View>
                    <TouchableOpacity
                        onPress={async () => {
                            if (appointment.data?.modality === "ONLINE") {
                                Linking.openURL(
                                    appointment?.data?.link as string,
                                );
                                return;
                            }

                            const mapsLink = await geocodeAddress(
                                appointment.data?.therapist.address,
                            );
                            Linking.openURL(mapsLink as string);
                        }}
                    >
                        <View className="flex w-full flex-row items-center justify-center rounded-bl-xl rounded-br-xl bg-blue-500 py-3 align-middle shadow-sm">
                            <FontAwesome
                                size={16}
                                color="white"
                                name={`${
                                    appointment.data.modality === "ONLINE"
                                        ? "video-camera"
                                        : "car"
                                }`}
                            />
                            <Text className="ml-4 font-nunito-sans-bold text-lg text-white">
                                {appointment.data.modality === "ONLINE"
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
    const lingui = useLingui();

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
                        <Card key={id}>
                            <View className="flex w-full flex-row items-center justify-between align-middle">
                                <View className="flex w-64 flex-col">
                                    <Text className="font-nunito-sans-bold text-xl capitalize text-slate-500">
                                        <Text className="text-blue-500">
                                            {createdAt.getDate()}
                                        </Text>{" "}
                                        {createdAt.toLocaleString(
                                            lingui.i18n.locale,
                                            {
                                                month: "long",
                                            },
                                        )}
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
                        </Card>
                    ),
                )
            ) : (
                <Card>
                    <View className="flex w-full flex-row items-center justify-between gap-2 align-middle">
                        <View className="flex w-64 flex-col">
                            <Text className="font-nunito-sans-bold text-xl text-slate-500">
                                <Trans>You have no notes</Trans>
                            </Text>
                            <Text className="w-72 pt-2 font-nunito-sans text-base">
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
                </Card>
            )}
        </>
    );
}

function SetUpWorkHoursWarning() {
    const router = useRouter();
    const hasSetUpWorkHours = api.hours.hasSetUpWorkHours.useQuery();

    return (
        <>
            {!hasSetUpWorkHours.data?.hasSetUpWorkHours &&
                !hasSetUpWorkHours.isLoading && (
                    <View style={{ marginBottom: 12 }}>
                        <Warning
                            title={t({ message: "Set up your work hours" })}
                            description={t({
                                message:
                                    "You need to set up your work hours to receive appointments",
                            })}
                            action={() =>
                                router.push("/settings/available-hours")
                            }
                        />
                    </View>
                )}
        </>
    );
}
