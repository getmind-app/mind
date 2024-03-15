import { useState } from "react";
import {
    LayoutAnimation,
    RefreshControl,
    ScrollView,
    View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Trans, t } from "@lingui/macro";
import { FlashList } from "@shopify/flash-list";
import { format } from "date-fns";

import {
    type Appointment,
    type Note,
    type Patient,
    type Recurrence,
    type Therapist,
} from "../../../../../../../packages/db";
import { BasicText } from "../../../../components/BasicText";
import { Card } from "../../../../components/Card";
import { Data } from "../../../../components/Data";
import { FullScreenLoading } from "../../../../components/FullScreenLoading";
import { Header } from "../../../../components/Header";
import { NoteCard } from "../../../../components/NoteCard";
import { Refreshable } from "../../../../components/Refreshable";
import { ScreenWrapper } from "../../../../components/ScreenWrapper";
import { SmallButton } from "../../../../components/SmallButton";
import { TherapistAppointmentCard } from "../../../../components/TherapistAppointmentCard";
import { UserPhoto } from "../../../../components/UserPhotos";
import { api } from "../../../../utils/api";
import { RecurrenceCard } from "../../settings/recurrences";

export default function PatientProfileScreen() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    const [refreshing, setRefreshing] = useState(false);
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
        <ScreenWrapper paddindBottom={32}>
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
                                    <Trans>First appointment:</Trans>{" "}
                                    <BasicText color="black">
                                        {format(
                                            patientProfile.data
                                                ?.firstAppointment,
                                            "dd/MM/yyyy",
                                        )}
                                    </BasicText>
                                </BasicText>

                                <BasicText>
                                    <Trans>Total value:</Trans>{" "}
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
                    <View
                        style={{
                            marginTop: 16,
                        }}
                    >
                        <AppointmentsList
                            appointments={patientProfile.data.appointments}
                            unpaidAppointments={
                                patientProfile.data.unpaidAppointments
                            }
                        />

                        <RecurrenceList
                            recurrences={patientProfile.data.Recurrence}
                        />

                        <NotesList
                            patient={patientProfile.data}
                            notes={patientProfile.data.Note}
                        />
                    </View>
                </ScrollView>
            </Refreshable>
        </ScreenWrapper>
    );
}

function SectionHeader({ title }: { title: string | React.ReactNode }) {
    return typeof title === "string" ? (
        <BasicText size="2xl" fontWeight="bold" style={{ marginTop: 12 }}>
            {title}
        </BasicText>
    ) : (
        title
    );
}

function AppointmentsList({
    appointments,
    unpaidAppointments,
}: {
    appointments: (Appointment & { therapist: Therapist } & {
        patient: Patient;
    })[];
    unpaidAppointments: number;
}) {
    return (
        <FlashList
            ListHeaderComponent={() => (
                <>
                    <SectionHeader title={t({ message: "Appointments" })} />
                    <View
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            gap: 12,
                        }}
                    >
                        <Data
                            value={appointments.length}
                            label={t({ message: "Total" })}
                        />

                        <Data
                            color="red"
                            value={unpaidAppointments}
                            label={t({ message: "Unpaid" })}
                        />
                    </View>
                </>
            )}
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
            ListHeaderComponent={() => (
                <SectionHeader title={t({ message: "Recurrences" })} />
            )}
            data={recurrences.slice(0, 3)}
            renderItem={({ item }) => <RecurrenceCard recurrence={item} />}
            estimatedItemSize={200}
            ListEmptyComponent={() => <EmptyRecurrence />}
            keyExtractor={(item) => item.id}
        />
    );
}

function NotesList({ notes, patient }: { notes: Note[]; patient: Patient }) {
    const router = useRouter();
    return (
        <FlashList
            ListHeaderComponent={() => (
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        flex: 1,
                        marginTop: 12,
                        alignItems: "center",
                    }}
                >
                    <BasicText size="2xl" fontWeight="bold">
                        <Trans>Notes</Trans>
                    </BasicText>
                    <SmallButton
                        onPress={() =>
                            router.push({
                                pathname: "/home/notes/new",
                                params: {
                                    patientId: patient.id,
                                    patientUserId: patient.userId,
                                },
                            })
                        }
                        textSize="lg"
                    >
                        <Trans>New</Trans>
                    </SmallButton>
                </View>
            )}
            estimatedItemSize={200}
            data={notes}
            renderItem={({ item }) => <NoteCard note={item} />}
            ListEmptyComponent={() => <EmptyNotes />}
            keyExtractor={(item) => item.id}
        />
    );
}

function EmptyRecurrence() {
    return (
        <Card>
            <BasicText size="lg">
                <Trans>No recurrences found!</Trans>
            </BasicText>
            <BasicText color="gray">
                <Trans>
                    If a patient has a recurrence, it will appear here.
                </Trans>
            </BasicText>
        </Card>
    );
}

function EmptyNotes() {
    return (
        <Card>
            <BasicText size="lg">
                <Trans>No notes found</Trans>
            </BasicText>
            <BasicText color="gray">
                <Trans>
                    Create a new note to keep track of your patient&apos;s
                    progress.
                </Trans>
            </BasicText>
        </Card>
    );
}
