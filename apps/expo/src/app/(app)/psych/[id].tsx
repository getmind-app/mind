import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { type Float } from "react-native/Libraries/Types/CodegenTypes";
import { Image } from "expo-image";
import * as Linking from "expo-linking";
import { useGlobalSearchParams, useRouter, useSearchParams } from "expo-router";
import { Trans, t } from "@lingui/macro";

import { Header } from "../../../components/Header";
import { ProfileSkeleton } from "../../../components/ProfileSkeleton";
import formatModality from "../../../helpers/formatModality";
import geocodeAddress from "../../../helpers/geocodeAddress";
import { getShareLink } from "../../../helpers/getShareLink";
import { api } from "../../../utils/api";
import { type Modality } from ".prisma/client";

export default function TherapistProfile() {
    const params = useGlobalSearchParams();
    const { data, isLoading, isError } = api.therapists.findById.useQuery({
        id: params.id as string,
    });

    if (isError) {
        return <Text>There was an error</Text>;
    }

    if (isLoading) {
        return (
            <>
                <Header />
                <ProfileSkeleton />
            </>
        );
    }

    return (
        <>
            <Header
                share
                onShare={() =>
                    void getShareLink({ id: data?.id, name: data?.name })
                }
            />
            <ScrollView
                showsVerticalScrollIndicator={false}
                className="h-full bg-off-white px-4 py-2"
            >
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
                                <Text className="text-black">{data?.crp}</Text>
                            </Text>

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
                        </View>
                    </View>
                </View>
                <View className="pb-32 pt-4">
                    {data?.about && (
                        <ContentCard title={t({ message: "About" })} emoji="👤">
                            {data?.about}
                        </ContentCard>
                    )}
                    {data?.modalities.includes("ON_SITE") && (
                        <ContentCard
                            title={t({ message: "Location" })}
                            emoji="📍"
                        >
                            <TouchableOpacity
                                onPress={async () => {
                                    const mapsLink = await geocodeAddress(
                                        data?.address,
                                    );
                                    Linking.openURL(mapsLink as string);
                                }}
                            >
                                <Text className="font-nunito-sans text-base underline">
                                    {data?.address?.street}{" "}
                                    {data?.address?.number} -{" "}
                                    {data?.address?.city}
                                </Text>
                            </TouchableOpacity>
                        </ContentCard>
                    )}
                    <ContentCard title={t({ message: "Education" })} emoji="🎓">
                        Psicologia Cognitiva - Universidade Federal do Paraná
                    </ContentCard>
                    <ContentCard
                        title={t({ message: "Methodologies" })}
                        emoji="📚"
                    >
                        Terapia Cognitiva Comportamental, Mindfulness, Terapia
                        Psicodinâmica
                    </ContentCard>
                </View>
            </ScrollView>
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
        <View className="absolute bottom-0 w-full rounded-t-xl bg-blue-500 px-6 pb-8 pt-4">
            <View className="flex flex-row items-center justify-between ">
                <View className="flex flex-col">
                    <Text className="font-nunito-sans-bold text-base text-white shadow-sm">
                        $ {hourlyRate}
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
                    <View className="rounded-xl bg-white">
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
