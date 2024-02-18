import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { type Float } from "react-native/Libraries/Types/CodegenTypes";
import * as Linking from "expo-linking";
import { useGlobalSearchParams, useRouter, useSearchParams } from "expo-router";
import { Trans, t } from "@lingui/macro";
import { capitalize, groupBy } from "lodash-es";

import { BasicText } from "../../../components/BasicText";
import { FullScreenLoading } from "../../../components/FullScreenLoading";
import { Header } from "../../../components/Header";
import { ScreenWrapper } from "../../../components/ScreenWrapper";
import { UserPhoto } from "../../../components/UserPhotos";
import formatModality from "../../../helpers/formatModality";
import { geocode } from "../../../helpers/geocode";
import geocodeAddress from "../../../helpers/geocodeAddress";
import { getShareLink } from "../../../helpers/getShareLink";
import { getTranslatedDay } from "../../../helpers/getTranslatedDay";
import { api } from "../../../utils/api";
import { type Address, type Hour, type Modality } from ".prisma/client";

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

    if (!data) {
        return <Text>Profile not found</Text>;
    }

    // Group hours by week day but only the first and last hour
    const groupedHours = groupBy(data?.hours, "weekDay");
    Object.entries(groupedHours).forEach(([weekDay, hours]) => {
        groupedHours[weekDay] = [
            hours[0] as Hour,
            hours[hours.length - 1] as Hour,
        ];
    });

    return (
        <>
            <Header
                onShare={() =>
                    void getShareLink({ id: data?.id, name: data?.name })
                }
            />
            <ScreenWrapper>
                <ScrollView>
                    <View className="flex flex-row items-center">
                        <UserPhoto
                            userId={data?.userId}
                            url={data?.profilePictureUrl}
                            alt={`${data?.name} profile picture`}
                            width={data?.yearsOfExperience ? 96 : 72}
                            height={data?.yearsOfExperience ? 96 : 72}
                        />
                        <View className="ml-4">
                            <Text className="font-nunito-sans-bold text-2xl font-bold">
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
                    <View className="pb-32">
                        <ContentCard
                            title={t({ message: "Work Hours" })}
                            emoji="🕒"
                        >
                            <WorkHours {...groupedHours} />
                        </ContentCard>
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
                        {data?.education && (
                            <ContentCard
                                title={t({ message: "Education" })}
                                emoji="🎓"
                            >
                                {data?.education}
                            </ContentCard>
                        )}

                        {data?.methodologies &&
                            data?.methodologies.length > 0 && (
                                <ContentCard
                                    title={t({ message: "Methodologies" })}
                                    emoji="📚"

                                    // map methodologies and make bullet points for each
                                >
                                    {data?.methodologies.map(
                                        (methodology, index) => (
                                            <View
                                                key={index}
                                                style={{
                                                    flexDirection: "row",
                                                    alignItems: "center",
                                                }}
                                            >
                                                <Text
                                                    style={{ marginRight: 8 }}
                                                >
                                                    •
                                                </Text>
                                                <Text className="font-nunito-sans text-base">
                                                    {methodology}
                                                </Text>
                                            </View>
                                        ),
                                    )}
                                </ContentCard>
                            )}
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

function WorkHours(groupedHours: { [key: string]: Hour[] }): React.ReactNode {
    return (
        <View
            style={{
                flex: 1,
                flexDirection: "column",
                rowGap: 4,
            }}
        >
            {Object.entries(groupedHours).map(([weekDay, hours]) => (
                <BasicText size="lg" key={weekDay}>
                    {capitalize(getTranslatedDay(weekDay))}:{"  "}
                    {hours.map((hour, index) => (
                        <BasicText size="lg" key={hour.id}>
                            {hour.startAt}h {index === 0 ? "-" : ""}{" "}
                        </BasicText>
                    ))}
                </BasicText>
            ))}
        </View>
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
                {typeof children === "string" ? (
                    <Text className="font-nunito-sans text-base">
                        {children}
                    </Text>
                ) : (
                    children
                )}
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
                paddingHorizontal: 24,
                paddingTop: 16,
                paddingBottom: 32,
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
                            // TODO: remove this
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
