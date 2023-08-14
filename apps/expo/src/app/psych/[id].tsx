import React, { useState } from "react";
import {
    Image,
    LayoutAnimation,
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
                <View className="pt-8">
                    {/* <AboutMe>{data?.about}</AboutMe> */}
                    <AboutMe>
                        Hey there, I really enjoy helping people find peace for
                        their minds. I believe I was born with the mission to
                        assist anyone seeking self-awareness and personal
                        growth.
                    </AboutMe>
                    <Education>
                        Cognitive Psychology - Stanford University
                        {/* {data?.education} */}
                    </Education>
                    <Methodologies>
                        {/* {data?.methodologies} */}
                        Cognitive Behavioral Therapy, Mindfulness, Psychodynamic
                    </Methodologies>
                </View>
            </ScrollView>
            <View className="absolute bottom-0 w-full rounded-t-xl bg-blue-500 px-6 pb-8 pt-4">
                <View className="flex flex-row items-center justify-between ">
                    <View className="flex flex-col">
                        <Text className="font-nunito-sans-bold text-base text-white shadow-sm">
                            $ {data?.hourlyRate}
                        </Text>
                        <Text className="font-nunito-sans text-base text-white">
                            {/* TODO: fazer disso dinamico com base nas configs do terapeuta*/}
                            <Trans>Online and on-site</Trans>
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

function AboutMe({ children }: { children: React.ReactNode }) {
    const [aboutMeOpen, setAboutMeOpen] = useState(true);

    const toggleAboutMe = () => {
        setAboutMeOpen(!aboutMeOpen);
    };

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    return (
        <View className="w-full rounded-xl bg-white shadow-sm">
            <View className="px-6 py-4">
                <View className="flex flex-row items-center justify-between align-middle">
                    <View className="flex flex-row items-center gap-2 align-middle">
                        <Text>👤</Text>
                        <Text className=" font-nunito-sans-bold text-lg">
                            <Trans>About me</Trans>
                        </Text>
                    </View>
                    <Pressable onPress={toggleAboutMe}>
                        {aboutMeOpen ? (
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
                {aboutMeOpen ? (
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

function Education({ children }: { children: React.ReactNode }) {
    const [educationOpen, setEducationOpen] = useState(false);

    const toggleEducation = () => {
        setEducationOpen(!educationOpen);
    };

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    // Esse mt-4 ta péssimo
    return (
        <View className="mt-4 w-full rounded-xl bg-white shadow-sm">
            <View className="px-6 py-4">
                <View className="flex flex-row items-center justify-between align-middle">
                    <View className="flex flex-row items-center gap-2 align-middle">
                        <Text>🎓</Text>
                        <Text className=" font-nunito-sans-bold text-lg">
                            <Trans>Education</Trans>
                        </Text>
                    </View>
                    <Pressable onPress={toggleEducation}>
                        {educationOpen ? (
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
                {educationOpen ? (
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

function Methodologies({ children }: { children: React.ReactNode }) {
    const [methodologiesOpen, setMethodologiesOpen] = useState(false);

    const toggleMethodologies = () => {
        setMethodologiesOpen(!methodologiesOpen);
    };

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    // TODO: Esse mt-4 ta péssimo
    return (
        <View className="mt-4 w-full rounded-xl bg-white shadow-sm">
            <View className="px-6 py-4">
                <View className="flex flex-row items-center justify-between align-middle">
                    <View className="flex flex-row items-center gap-2 align-middle">
                        <Text>📚</Text>
                        <Text className=" font-nunito-sans-bold text-lg">
                            <Trans>Methodologies</Trans>
                        </Text>
                    </View>
                    <Pressable onPress={toggleMethodologies}>
                        {methodologiesOpen ? (
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
                {methodologiesOpen ? (
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
