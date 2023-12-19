import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import MapView from "react-native-maps";
import { Marker } from "react-native-svg";
import { type Float } from "react-native/Libraries/Types/CodegenTypes";
import { Image } from "expo-image";
import * as Linking from "expo-linking";
import { useGlobalSearchParams, useRouter, useSearchParams } from "expo-router";
import { Trans, t } from "@lingui/macro";

import { FullScreenLoading } from "../../../components/FullScreenLoading";
import { Header } from "../../../components/Header";
import { ScreenWrapper } from "../../../components/ScreenWrapper";
import formatModality from "../../../helpers/formatModality";
import { geocode } from "../../../helpers/geocode";
import geocodeAddress from "../../../helpers/geocodeAddress";
import { getShareLink } from "../../../helpers/getShareLink";
import { api } from "../../../utils/api";
import { type Address, type Modality } from ".prisma/client";

export default function TherapistProfile() {
    const params = useGlobalSearchParams();
    const router = useRouter();
    const { data, isLoading, isError } = api.therapists.findById.useQuery({
        id: params.id as string,
    });

    if (isError) {
        return <Text>There was an error</Text>;
    }

    if (isLoading) {
        return <FullScreenLoading />;
    }

    return (
        <>
            <Header
                share
                onShare={() =>
                    void getShareLink({ id: data?.id, name: data?.name })
                }
                onBack={() => router.push({ pathname: "/search" })}
            />
            <ScreenWrapper>
                <ScrollView>
                    <View className="flex flex-row items-center gap-x-6">
                        <Image
                            alt="Profile picture"
                            className="h-28 w-28 rounded-full"
                            source={data?.profilePictureUrl}
                            contentFit="cover"
                        />
                        <View className="gap-y-2">
                            <Text className="font-nunito-sans-bold text-3xl font-bold">
                                {data?.name}
                            </Text>
                            <View className="flex flex-col">
                                <Text className="font-nunito-sans-bold text-base text-slate-500">
                                    CRP{" "}
                                    <Text className="text-black">
                                        {data?.crp}
                                    </Text>
                                </Text>

                                {data?.yearsOfExperience && (
                                    <Text className="font-nunito-sans-bold text-base text-slate-500">
                                        <Trans>Practicing for </Trans>
                                        <Text className="text-black">
                                            {" "}
                                            {data?.yearsOfExperience}
                                            <Text className=" text-black">
                                                {" "}
                                                <Trans>years</Trans>
                                            </Text>
                                        </Text>
                                    </Text>
                                )}
                            </View>
                        </View>
                    </View>
                    <View className="pb-32 pt-4">
                        {data?.about && (
                            <ContentCard
                                title={t({ message: "About" })}
                                emoji="👤"
                            >
                                {data?.about}
                            </ContentCard>
                        )}
                        {data?.modalities.includes("ON_SITE") &&
                            data?.address && (
                                <ContentCard
                                    title={t({ message: "Location" })}
                                    emoji="📍"
                                >
                                    <LocationContent address={data?.address} />
                                </ContentCard>
                            )}
                        {/* <ContentCard title={t({ message: "Education" })} emoji="🎓">
                        Psicologia Cognitiva - Universidade Federal do Paraná
                    </ContentCard>
                    <ContentCard
                        title={t({ message: "Methodologies" })}
                        emoji="📚"
                    >
                        Terapia Cognitiva Comportamental, Mindfulness, Terapia
                        Psicodinâmica
                    </ContentCard> */}
                        {/* COMENTADO ENQUANTO NÃO TEMOS INPUT DO TERAPEUTA */}
                    </View>
                </ScrollView>
            </ScreenWrapper>
            {data && (
                <ScheduleBar
                    modalities={data?.modalities}
                    hourlyRate={data?.hourlyRate}
                />
            )}
        </>
    );
}

function ContentCard({
    children,
    emoji,
    title,
}: {
    children: React.ReactNode;
    emoji: string;
    title: string;
}) {
    return (
        <View className="mt-4 rounded-xl bg-white px-6 py-4 shadow-sm">
            <View className="flex flex-row items-center justify-between align-middle">
                <View className="flex flex-row items-center gap-2 align-middle">
                    <Text>{emoji}</Text>
                    <Text className=" font-nunito-sans-bold text-lg">
                        <Trans>{title}</Trans>
                    </Text>
                </View>
            </View>
            <View className="pb-1 pt-2">
                <Text className="font-nunito-sans text-base">{children}</Text>
            </View>
        </View>
    );
}

function ScheduleBar({
    modalities,
    hourlyRate,
}: {
    modalities: Modality[];
    hourlyRate: Float;
}) {
    const params = useSearchParams();
    const router = useRouter();

    function handleSchedule() {
        router.push({
            pathname: "/psych/schedule",
            params: { id: params.id },
        });
    }

    return (
        <View
            style={{
                flex: 1,
                paddingHorizontal: 16,
                paddingTop: 16,
                paddingBottom: 24,
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                width: "100%",
            }}
            className="absolute bottom-0 bg-blue-500 "
        >
            <View className="flex flex-row items-center justify-between ">
                <View className="flex flex-col">
                    <Text className="font-nunito-sans-bold text-base text-white shadow-sm">
                        R$ {hourlyRate}
                    </Text>
                    <Text className="font-nunito-sans text-base text-white">
                        {modalities.length === 1 ? (
                            <Trans>{formatModality(modalities[0])}</Trans>
                        ) : (
                            <Trans>Online and on-site</Trans>
                        )}
                    </Text>
                </View>
                <TouchableOpacity onPress={handleSchedule}>
                    <View
                        style={{
                            borderRadius: 6,
                            backgroundColor: "#fff",
                        }}
                    >
                        <View className="flex   flex-row items-center px-4 py-2 align-middle">
                            <Text className="font-nunito-sans-bold text-base">
                                <Trans>Schedule</Trans>
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
}

function LocationContent({ address }: { address: Address }) {
    const [location, setLocation] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);

    useEffect(() => {
        const fetchLocation = async () => {
            const result = await geocode(address);
            // Assuming your geocode function returns an object with latitude and longitude
            setLocation(result[0] as { latitude: number; longitude: number });
        };

        fetchLocation();
    }, [address]);

    const handlePress = async () => {
        const mapsLink = await geocodeAddress(address);
        Linking.openURL(mapsLink as string);
    };

    return (
        <>
            <TouchableOpacity onPress={handlePress}>
                <Text className="font-nunito-sans text-base underline">
                    {address.street} {address.number} - {address.city}
                </Text>
            </TouchableOpacity>
            <View
                style={{
                    paddingTop: 16,
                }}
            >
                {location && (
                    <MapView
                        style={{
                            alignContent: "center",
                            alignSelf: "center",
                            borderRadius: 10,
                            height: 120,
                            width: 320,
                        }}
                        camera={{
                            center: {
                                latitude: location.latitude,
                                longitude: location.longitude,
                            },
                            pitch: 0,
                            heading: 0,
                            altitude: 1000,
                            zoom: 15,
                        }}
                    >
                        <Marker
                            coordinate={{
                                latitude: location.latitude,
                                longitude: location.longitude,
                            }}
                        />
                    </MapView>
                )}
            </View>
        </>
    );
}
