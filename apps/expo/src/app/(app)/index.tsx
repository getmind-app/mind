import React, { useState } from "react";
import {
    Image,
    Linking,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { Trans, t } from "@lingui/macro";

import { Card } from "../../components/Card";
import { CardSkeleton } from "../../components/CardSkeleton";
import DefaultHomeCard from "../../components/DefaultHomeCard";
import { ScreenWrapper } from "../../components/ScreenWrapper";
import { Title } from "../../components/Title";
import geocodeAddress from "../../helpers/geocodeAddress";
import { useUserIsProfessional } from "../../hooks/user/useUserIsProfessional";
import { api } from "../../utils/api";

export default function Index() {
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const utils = api.useContext();

    const onRefresh = () => {
        setRefreshing(true);
        utils.appointments.findNextUserAppointment.invalidate();
        utils.notes.findByUserId.invalidate();
        setTimeout(() => {
            setRefreshing(false);
        }, 500);
    };

    return (
        <ScreenWrapper
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <Title title={t({ message: "Next session" })} />

            <NextAppointment />
            <View className="mb-2 flex flex-row items-center justify-between pt-8 align-middle">
                <Title title={t({ message: "Last notes" })} />

                <TouchableOpacity onPress={() => router.push("/notes/new")}>
                    <View className="rounded-lg bg-blue-500 px-3 py-1 shadow-sm">
                        <Text className="text-center font-nunito-sans-bold text-base text-white">
                            <Trans>New</Trans>
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
            <LastNotes />
        </ScreenWrapper>
    );
}

function NextAppointment() {
    const router = useRouter();
    const isProfessional = useUserIsProfessional();

    const appointment = api.appointments.findNextUserAppointment.useQuery();

    console.log(appointment.data);

    if (appointment.isLoading) return <CardSkeleton />;

    return (
        <>
            {appointment.data && appointment.data.therapistId ? (
                <View className="mt-4 rounded-xl bg-white shadow-sm">
                    <View className="p-6">
                        <View className="flex w-full flex-row justify-between">
                            <Text className="font-nunito-sans text-xl">
                                {new Intl.DateTimeFormat("en", {
                                    weekday: "long",
                                }).format(
                                    new Date(appointment.data.scheduledTo),
                                )}
                                ,{" "}
                                {new Date(
                                    appointment.data.scheduledTo,
                                ).getDate()}
                                /
                                {new Date(
                                    appointment.data.scheduledTo,
                                ).getMonth() + 1}
                            </Text>
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
                                    <TouchableOpacity
                                        onPress={() =>
                                            router.push(
                                                "/psych/" +
                                                    appointment.data?.therapist
                                                        .id,
                                            )
                                        }
                                    >
                                        <Image
                                            className="flex items-center justify-center rounded-full"
                                            alt={
                                                isProfessional
                                                    ? "Patient"
                                                    : "Therapist"
                                            }
                                            source={{
                                                uri: isProfessional
                                                    ? appointment.data.patient
                                                          .profilePictureUrl
                                                    : appointment.data.therapist
                                                          .profilePictureUrl,
                                                width: 32,
                                                height: 32,
                                            }}
                                        />
                                    </TouchableOpacity>
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
