import React, { useEffect, useRef, useState } from "react";
import {
    Alert,
    Linking,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import * as Device from "expo-device";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { requestTrackingPermissionsAsync } from "expo-tracking-transparency";
import { useUser } from "@clerk/clerk-expo";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { Trans, t } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import { format } from "date-fns";

import { BasicText } from "../../components/BasicText";
import { Card } from "../../components/Card";
import { CardSkeleton } from "../../components/CardSkeleton";
import DefaultHomeCard from "../../components/DefaultHomeCard";
import { NoteCard } from "../../components/NoteCard";
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
import { colors } from "../../utils/colors";

export default function HomeScreen() {
    const router = useRouter();
    const utils = api.useContext();
    const { user } = useUser();
    const { setMetadata } = useUserMutations();
    const [refreshing, setRefreshing] = useState(false);
    const [locationStatus] = Location.useBackgroundPermissions();
    const isProfessional = useUserIsProfessional();
    const notificationListener = useRef<Notifications.Subscription>();
    const responseListener = useRef<Notifications.Subscription>();
    const [expoPushToken, setExpoPushToken] =
        useState<Notifications.ExpoPushToken | null>(null);
    const [, setNotification] = useState<Notifications.Notification | boolean>(
        false,
    );
    const nextAppointment = api.appointments.findNextUserAppointment.useQuery();

    const onRefresh = async () => {
        setRefreshing(true);
        await utils.invalidate();
        setRefreshing(false);
    };

    useEffect(() => {
        (async () => {
            await requestTrackingPermissionsAsync();

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
                {isProfessional && <AppointmentsPreview />}
                <View className="mb-2 flex flex-row items-center justify-between pt-8 align-middle">
                    <Title title={t({ message: "Last notes" })} />

                    <SmallButton
                        onPress={() =>
                            router.push({
                                pathname: "/notes/new",
                                params: {
                                    patientId: nextAppointment.data?.patientId,
                                    patientUserId:
                                        nextAppointment.data?.patient.userId,
                                },
                            })
                        }
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

    const nextAppointment = api.appointments.findNextUserAppointment.useQuery();

    if (nextAppointment.isLoading) return <CardSkeleton />;

    return (
        <>
            {nextAppointment.data && nextAppointment.data.therapistId ? (
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
                                    new Date(nextAppointment.data.scheduledTo),
                                    "EEEE, dd/MM",
                                    {
                                        locale: getLocale(lingui),
                                    },
                                )}
                            </BasicText>
                            <BasicText
                                color="primaryBlue"
                                fontWeight="bold"
                                size="2xl"
                            >
                                {format(
                                    nextAppointment.data.scheduledTo,
                                    "HH:mm",
                                )}
                            </BasicText>
                        </View>
                        <Text className="font-nunito-sans text-sm text-slate-500">
                            {nextAppointment.data.modality === "ONLINE" ? (
                                "via Google Meet"
                            ) : (
                                <Text>
                                    <Trans>
                                        in person at{" "}
                                        <TouchableOpacity
                                            onPress={() =>
                                                geocodeAddress(
                                                    nextAppointment.data
                                                        ?.therapist?.address,
                                                ).then((link) =>
                                                    Linking.openURL(
                                                        link ? link : "",
                                                    ),
                                                )
                                            }
                                        >
                                            <BasicText style={{ marginTop: 3 }}>
                                                {
                                                    nextAppointment.data
                                                        .therapist.address
                                                        ?.street
                                                }
                                                ,{" "}
                                                {
                                                    nextAppointment.data
                                                        .therapist.address
                                                        ?.number
                                                }
                                            </BasicText>
                                        </TouchableOpacity>
                                    </Trans>
                                </Text>
                            )}
                        </Text>
                        <View className="flex w-full flex-row items-center justify-between pt-4 align-middle">
                            {isProfessional ? (
                                <TouchableOpacity
                                    onPress={() =>
                                        router.push(
                                            `/(psych)/patients/${nextAppointment.data?.patient.id}`,
                                        )
                                    }
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                    }}
                                >
                                    <UserPhoto
                                        userId={
                                            nextAppointment.data.patient.userId
                                        }
                                        alt={"Patient"}
                                        url={
                                            nextAppointment.data.patient
                                                .profilePictureUrl
                                        }
                                    />
                                    <Text className="pl-2 font-nunito-sans text-xl">
                                        {isProfessional
                                            ? nextAppointment.data.patient.name
                                            : nextAppointment.data.therapist
                                                  .name}
                                    </Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                    onPress={() =>
                                        router.push(
                                            `/psych/${nextAppointment.data?.therapist.id}`,
                                        )
                                    }
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                    }}
                                >
                                    <UserPhoto
                                        userId={
                                            nextAppointment.data.therapist
                                                .userId
                                        }
                                        alt={"Therapist"}
                                        url={
                                            nextAppointment.data.therapist
                                                .profilePictureUrl
                                        }
                                    />
                                    <Text className="pl-2 font-nunito-sans text-xl">
                                        {isProfessional
                                            ? nextAppointment.data.patient.name
                                            : nextAppointment.data.therapist
                                                  .name}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                    <TouchableOpacity
                        onPress={async () => {
                            if (nextAppointment.data?.modality === "ONLINE") {
                                Linking.openURL(
                                    nextAppointment?.data?.link as string,
                                );
                                return;
                            }

                            if (isProfessional) {
                                router.push(
                                    `/(psych)/patients/${nextAppointment.data?.patient.id}`,
                                );
                                return;
                            }

                            const mapsLink = await geocodeAddress(
                                nextAppointment.data?.therapist.address,
                            );
                            Linking.openURL(mapsLink as string);
                        }}
                    >
                        <View className="flex w-full flex-row items-center justify-center rounded-bl-xl rounded-br-xl bg-blue-500 py-3 align-middle shadow-sm">
                            <FontAwesome
                                size={16}
                                color="white"
                                name={`${
                                    nextAppointment.data.modality === "ONLINE"
                                        ? "video-camera"
                                        : isProfessional
                                        ? "user"
                                        : "car"
                                }`}
                            />
                            <Text className="ml-4 font-nunito-sans-bold text-lg text-white">
                                {nextAppointment.data.modality === "ONLINE"
                                    ? t({ message: "Join the meeting" })
                                    : isProfessional
                                    ? t({
                                          message: "See patient",
                                      })
                                    : t({
                                          message: "Get directions",
                                      })}
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
                data.map((note) => <NoteCard note={note} key={note.id} />)
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

function AppointmentsPreview() {
    const preview = api.therapists.appointmentsPreview.useQuery();
    const router = useRouter();

    if (preview.isLoading) return null;

    if (preview.isError)
        return (
            <BasicText color="red">
                <Trans>Failed to get appointments data</Trans>
            </BasicText>
        );

    return (
        <View
            style={{
                marginTop: 12,
                marginHorizontal: 6,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
            }}
        >
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                }}
            >
                <View
                    style={{
                        borderRadius: 8,
                        width: 8,
                        height: 8,
                        backgroundColor: colors.green,
                    }}
                />
                <TouchableOpacity
                    onPress={() =>
                        router.push({
                            pathname: "/calendar",
                            params: {
                                filter: "TODAY",
                            },
                        })
                    }
                >
                    <BasicText fontWeight="bold" color="green">
                        <Trans>{preview.data?.appointmentsToday} today</Trans>
                    </BasicText>
                </TouchableOpacity>
            </View>
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                }}
            >
                <View
                    style={{
                        borderRadius: 8,
                        width: 8,
                        height: 8,
                        backgroundColor: colors.yellow,
                    }}
                />
                <TouchableOpacity
                    onPress={() =>
                        router.push({
                            pathname: "/calendar",
                            params: {
                                filter: "PENDENT",
                            },
                        })
                    }
                >
                    <BasicText fontWeight="bold" color="yellow">
                        <Trans>
                            {preview.data?.pendentAppointments} pendent
                        </Trans>
                    </BasicText>
                </TouchableOpacity>
            </View>
        </View>
    );
}
