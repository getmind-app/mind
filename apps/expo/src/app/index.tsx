import React, { useEffect, useState } from "react";
import {
    Image,
    Linking,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";

import { CardSkeleton } from "../components/CardSkeleton";
import DefaultCard from "../components/DefaultCard";
import { api } from "../utils/api";

export default function Index() {
    const router = useRouter();
    const { newNote, deletedNote } = useLocalSearchParams();
    const [refreshing, setRefreshing] = useState(false);
    const utils = api.useContext();

    const onRefresh = () => {
        setRefreshing(true);
        utils.appointments.findNextUserAppointment.invalidate();
        utils.notes.findByUserId.invalidate();
        setTimeout(() => {
            setRefreshing(false);
        }, 500); // Adjust the delay time as needed
    };

    useEffect(() => {
        if (newNote || deletedNote) {
            onRefresh();
        }
    }, [newNote, deletedNote]);

    return (
        <ScrollView
            className="bg-off-white px-4 pt-12"
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <View className="h-full">
                <Text className="pt-12 font-nunito-sans-bold text-3xl">
                    Next session
                </Text>
                <NextAppointment />
                <View className="mb-2 flex flex-row items-center justify-between pt-8 align-middle">
                    <Text className=" font-nunito-sans-bold text-3xl">
                        Last notes
                    </Text>
                    <TouchableOpacity onPress={() => router.push("/notes/new")}>
                        <View className="rounded-lg bg-blue-500 px-3 py-1 shadow-sm">
                            <Text className="text-center font-nunito-sans-bold text-base text-white">
                                New
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

    const geocode = async () => {
        const location = await Location.geocodeAsync(
            "335 Pioneer Way, Mountain View, CA 94041",
        );

        return location[0];
    };

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
                                    in person at{" "}
                                    <TouchableOpacity
                                        onPress={() =>
                                            geocode().then((geocode) =>
                                                Linking.openURL(
                                                    `https://www.google.com/maps/search/?api=1&query=${geocode?.latitude},${geocode?.longitude}`,
                                                ),
                                            )
                                        }
                                    >
                                        <Text className="underline">
                                            335 Pioneer Way
                                        </Text>
                                    </TouchableOpacity>
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
                        onPress={() => {
                            if (data.modality === "ON_SITE") {
                                Linking.openURL(
                                    "https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`",
                                );
                            } else if (data.modality === "ONLINE") {
                                Linking.openURL(data.link || "No link found");
                            } else {
                                throw new Error("Invalid modality");
                            }
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
                                    ? "Join the meeting"
                                    : "Get directions"}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            ) : (
                <DefaultCard />
            )}
        </>
    );
}

function LastNotes() {
    const router = useRouter();

    const { data, isLoading } = api.notes.findByUserId.useQuery();

    // TODO: achar uma forma de refazer a query quando o usuário criar/delete uma nota
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
                                No notes for now
                            </Text>
                            <Text className="pt-2 font-nunito-sans text-base">
                                Create a new one right now
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
