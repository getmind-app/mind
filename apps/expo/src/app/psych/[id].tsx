import React, { useState } from "react";
import {
    Image,
    LayoutAnimation,
    Linking,
    Pressable,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useRouter, useSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { Trans } from "@lingui/macro";

import { Header } from "../../components/Header";
import { ProfileSkeleton } from "../../components/ProfileSkeleton";
import formatModality from "../../helpers/formatModality";
import geocodeAddress from "../../helpers/geocodeAddress";
import { api } from "../../utils/api";

export default function TherapistProfile() {
    const router = useRouter();
    const params = useSearchParams();
    const { data, isLoading, isError } = api.therapists.findById.useQuery({
        id: params.id as string,
    });

    function handleSchedule() {
        router.push({
            pathname: "/psych/schedule",
            params: { id: params.id },
        });
    }

    if (isError) {
        return <Text>There was an error</Text>;
    }

    if (isLoading) {
        return <ProfileSkeleton />;
    }

    return (
        <>
            <Header />
            <ScrollView
                showsVerticalScrollIndicator={false}
                className="h-full bg-off-white px-4 py-2"
            >
                <View className="flex flex-col items-center justify-center">
                    <View className="flex w-full flex-row">
                        <Image
                            className="rounded-full"
                            alt={`${data?.name} picture`}
                            source={{
                                uri: data?.profilePictureUrl,
                                width: 96,
                                height: 96,
                            }}
                        />
                        <View className="flex flex-col justify-center gap-1.5 pl-4 align-middle">
                            <Text className="font-nunito-sans-bold text-3xl font-bold">
                                {data?.name}
                            </Text>
                        </View>
                    </View>
                    <View className="flex flex-row items-center gap-12 pt-6 align-middle">
                        <View className="flex flex-col">
                            <Text className="font-nunito-sans-bold text-base text-slate-500">
                                CRP
                            </Text>
                            <Text className="font-nunito-sans-bold text-base">
                                {data?.crp}
                            </Text>
                        </View>
                        <View className="flex flex-col">
                            <Text className="font-nunito-sans-bold text-base text-slate-500">
                                <Trans>Patients</Trans>
                            </Text>
                            <Text className="font-nunito-sans-bold text-base text-blue-500">
                                42
                                <Text className="font-nunito-sans-bold text-base">
                                    {" "}
                                    <Trans
                                        comment={
                                            "Number of patients a therapist sees per week"
                                        }
                                    >
                                        / week
                                    </Trans>
                                </Text>
                            </Text>
                        </View>
                        <View className="flex flex-col">
                            <Text className="font-nunito-sans-bold text-base text-slate-500">
                                <Trans>Practicing for</Trans>
                            </Text>
                            <Text className="font-nunito-sans-bold text-base text-blue-500">
                                {data?.yearsOfExperience}
                                <Text className="font-nunito-sans-bold text-base">
                                    {" "}
                                    <Trans>years</Trans>
                                </Text>
                            </Text>
                        </View>
                    </View>
                </View>
                <View className="gap-4 pt-8">
                    {/* TODO: Use real data when implementend in the form */}
                    <ContentCard title="About" emoji="👤">
                        Hey there, I really enjoy helping people find peace for
                        their minds. I believe I was born with the mission to
                        assist anyone seeking self-awareness and personal
                        growth.
                    </ContentCard>

                    <ContentCard title="Education" emoji="🎓">
                        Cognitive Psychology - Stanford University
                    </ContentCard>
                    <ContentCard title="Methodologies" emoji="📚">
                        Cognitive Behavioral Therapy, Mindfulness, Psychodynamic
                    </ContentCard>
                    <ContentCard title="Location" emoji="📍">
                        <TouchableOpacity
                            onPress={async () => {
                                const mapsLink = await geocodeAddress(
                                    data?.address,
                                );
                                Linking.openURL(mapsLink as string);
                            }}
                        ></TouchableOpacity>
                    </ContentCard>
                </View>
            </ScrollView>
            <View className="absolute bottom-0 w-full rounded-t-xl bg-blue-500 px-6 pb-8 pt-4">
                <View className="flex flex-row items-center justify-between ">
                    <View className="flex flex-col">
                        <Text className="font-nunito-sans-bold text-base text-white shadow-sm">
                            $ {data?.hourlyRate}
                        </Text>
                        <Text className="font-nunito-sans text-base text-white">
                            {data?.modalities.length === 1 ? (
                                <Trans>
                                    {formatModality(data?.modalities[0])}
                                </Trans>
                            ) : (
                                <Trans>Online and on-site</Trans>
                            )}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={handleSchedule}>
                        <View className="rounded-xl bg-white">
                            <View className="flex flex-row items-center px-4 py-2 align-middle">
                                <Text className="font-nunito-sans-bold text-base">
                                    <Trans>Schedule</Trans>
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
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
    const [open, setOpen] = useState(false);

    const toggle = () => {
        setOpen(!open);
    };

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    return (
        <View className="mt-4 w-full rounded-xl bg-white shadow-sm">
            <View className="px-6 py-4">
                <View className="flex flex-row items-center justify-between align-middle">
                    <View className="flex flex-row items-center gap-2 align-middle">
                        <Text>{emoji}</Text>
                        <Text className=" font-nunito-sans-bold text-lg">
                            <Trans>{title}</Trans>
                        </Text>
                    </View>
                    <Pressable onPress={toggle}>
                        {open ? (
                            <MaterialIcons
                                color="black"
                                size={28}
                                name="arrow-drop-up"
                            />
                        ) : (
                            <MaterialIcons
                                color="black"
                                size={28}
                                name="arrow-drop-down"
                            />
                        )}
                    </Pressable>
                </View>
                {open ? (
                    <View className="pb-2 pt-4">
                        <Text className="font-nunito-sans text-base">
                            {children}
                        </Text>
                    </View>
                ) : null}
            </View>
        </View>
    );
}
