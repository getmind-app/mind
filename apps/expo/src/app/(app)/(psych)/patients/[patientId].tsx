import { useState } from "react";
import {
    LayoutAnimation,
    RefreshControl,
    ScrollView,
    View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { t } from "@lingui/macro";
import { FlashList } from "@shopify/flash-list";
import { format } from "date-fns";

import {
    type Appointment,
    type Patient,
    type Recurrence,
    type Therapist,
} from "../../../../../../../packages/db";
import { BasicText } from "../../../../components/BasicText";
import { Data } from "../../../../components/Data";
import { FullScreenLoading } from "../../../../components/FullScreenLoading";
import { Header } from "../../../../components/Header";
import { Refreshable } from "../../../../components/Refreshable";
import { ScreenWrapper } from "../../../../components/ScreenWrapper";
import { TherapistAppointmentCard } from "../../../../components/TherapistAppointmentCard";
import { UserPhoto } from "../../../../components/UserPhotos";
import { api } from "../../../../utils/api";
import { RecurrenceCard } from "../../settings/recurrences";

export default function PatientProfileScreen() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();
    const params = useLocalSearchParams();
    const patientProfile = api.therapists.patientProfile.useQuery({
        patientId: String(params.patientId),
    });

    if (patientProfile.isLoading) return <FullScreenLoading />;

    if (patientProfile.error || !patientProfile.data)
        return (
            <View
                style={{
                    marginTop: 24,
                    marginHorizontal: 12,
                }}
            >
                <BasicText color="red">
                    {t({
                        message: "Error fetching patient profile",
                    })}
                </BasicText>
            </View>
        );

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await patientProfile.refetch();
        } finally {
            setRefreshing(false);
        }
    };

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
                <Header />
                <ScrollView>
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 12,
                        }}
                    >
                        <UserPhoto
                            userId={patientProfile.data?.userId}
                            url={patientProfile.data?.profilePictureUrl}
                            alt={`${patientProfile.data?.name} profile picture`}
                            width={72}
                            height={72}
                        />
                        <View
                            style={{
                                flex: 1,
                            }}
                        >
                            <BasicText size="2xl" fontWeight="bold">
                                {patientProfile.data?.name}
                            </BasicText>

                            <View
                                style={{
                                    alignItems: "flex-start",
                                    gap: 4,
                                    flex: 1,
                                }}
                            >
                                <BasicText
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        flex: 1,
                                    }}
                                >
                                    First appointment:{" "}
                                    <BasicText color="black">
                                        {format(
                                            patientProfile.data
                                                ?.firstAppointment,
                                            "dd/MM/yyyy",
                                        )}
                                    </BasicText>
                                </BasicText>

                                <BasicText>
                                    Total value:{" "}
                                    <BasicText
                                        color="primaryBlue"
                                        fontWeight="bold"
                                    >
                                        R$ {patientProfile.data?.totalValue}
                                    </BasicText>
                                </BasicText>
                            </View>
                        </View>
                    </View>
                    <View>
                        <ProfileSection title="Appointments">
                            <View
                                style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    gap: 12,
                                }}
                            >
                                <Data
                                    value={
                                        patientProfile.data.appointments.length
                                    }
                                    label="Total"
                                />

                                <Data
                                    color="red"
                                    value={
                                        patientProfile.data.unpaidAppointments
                                    }
                                    label="Unpaid"
                                />
                            </View>
                            <AppointmentsList
                                appointments={patientProfile.data.appointments}
                            />
                        </ProfileSection>
                        <ProfileSection title="Recurrences">
                            <RecurrenceList
                                recurrences={patientProfile.data.Recurrence}
                            />
                        </ProfileSection>
                        <ProfileSection title="Notes" />
                    </View>
                </ScrollView>
            </Refreshable>
        </ScreenWrapper>
    );
}

function ProfileSection({
    children,
    title,
}: {
    children?: React.ReactNode;
    title: string | React.ReactNode;
}) {
    return (
        <>
            <BasicText size="lg" fontWeight="bold">
                {title}
            </BasicText>
            {children}
        </>
    );
}

function AppointmentsList({
    appointments,
}: {
    appointments: (Appointment & { therapist: Therapist } & {
        patient: Patient;
    })[];
}) {
    return (
        <FlashList
            data={appointments.slice(0, 3)}
            renderItem={({ item }) => (
                <TherapistAppointmentCard key={item.id} appointment={item} />
            )}
            estimatedItemSize={160}
            keyExtractor={(item) => item.id}
        />
    );
}

function RecurrenceList({
    recurrences,
}: {
    recurrences: (Recurrence & {
        therapist: Therapist;
        patient: Patient;
    })[];
}) {
    return (
        <FlashList
            data={recurrences.slice(0, 3)}
            renderItem={({ item }) => <RecurrenceCard recurrence={item} />}
            estimatedItemSize={200}
            keyExtractor={(item) => item.id}
        />
    );
}
