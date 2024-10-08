import { useState } from "react";
import { Alert, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Trans, t } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import { format } from "date-fns";

import {
    type Appointment,
    type AppointmentStatus as AppointmentStatusType,
    type Patient,
    type Therapist,
} from "../../../../packages/db";
import { getLocale } from "../helpers/getLocale";
import { useUpdateRecurrence } from "../hooks/recurrence/useUpdateRecurrence";
import { api } from "../utils/api";
import { AppointmentStatus } from "./AppointmentStatus";
import { BasicText } from "./BasicText";
import { Card } from "./Card";
import { LargeButton } from "./LargeButton";
import { SmallButton } from "./SmallButton";
import { TypeOfAppointment } from "./TypeOfAppointment";
import { UserPhoto } from "./UserPhotos";

export function TherapistAppointmentCard({
    appointment,
}: {
    appointment: Appointment & { therapist: Therapist } & { patient: Patient };
}) {
    const [open, setOpen] = useState(false);
    const [canUndo, setCanUndo] = useState(false);
    const lingui = useLingui();

    return (
        <Card key={appointment.id}>
            <View
                style={{
                    flexDirection: "row",
                    flex: 1,
                }}
            >
                <View
                    style={{
                        flex: 3,
                    }}
                >
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                        }}
                    >
                        <BasicText
                            size="xl"
                            style={{
                                textTransform: "capitalize",
                            }}
                        >
                            {format(
                                new Date(appointment.scheduledTo),
                                "EEEE, dd/MM",
                                {
                                    locale: getLocale(lingui),
                                },
                            )}
                        </BasicText>
                        <BasicText
                            fontWeight="bold"
                            color="primaryBlue"
                            size="xl"
                        >
                            {format(appointment.scheduledTo, "HH:mm")}
                        </BasicText>
                    </View>
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginVertical: 6,
                        }}
                    >
                        <AppointmentStatus status={appointment.status} />

                        {appointment.isPaid || canUndo ? (
                            <BasicText color="green">
                                {t({ message: "Paid" })}
                            </BasicText>
                        ) : (
                            <BasicText color="red">
                                {t({ message: "Not paid" })}
                            </BasicText>
                        )}
                    </View>
                    <TypeOfAppointment appointmentType={appointment.type} />

                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginTop: 6,
                        }}
                    >
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                            }}
                        >
                            <BasicText size="sm" color="gray">
                                <Trans>with</Trans>
                                {"  "}
                            </BasicText>
                            <UserPhoto
                                userId={appointment.patient.userId}
                                alt={appointment.patient.name}
                                url={appointment.patient.profilePictureUrl}
                                width={20}
                                height={20}
                                iconSize={12}
                            />
                            <BasicText size="sm" color="gray">
                                {"  "}
                                {appointment.patient.name}{" "}
                                {appointment.modality === "ONLINE"
                                    ? t({ message: "via Google Meet" })
                                    : t({ message: "in person" })}
                            </BasicText>
                        </View>
                        <View
                            style={{
                                alignSelf: "flex-end",
                            }}
                        >
                            {appointment.status == "PENDENT" ||
                            appointment.status == "ACCEPTED" ? (
                                <TouchableOpacity
                                    onPress={() => setOpen(!open)}
                                >
                                    {open ? (
                                        <Feather
                                            size={24}
                                            color="#64748b"
                                            name="chevron-up"
                                        />
                                    ) : (
                                        <Feather
                                            size={24}
                                            color="#64748b"
                                            name="chevron-down"
                                        />
                                    )}
                                </TouchableOpacity>
                            ) : null}
                        </View>
                    </View>
                </View>
            </View>

            {open ? (
                <View className="mt-4 border-t-[1px] border-slate-500/10">
                    <TherapistOptions
                        appointment={appointment}
                        canUndo={canUndo}
                        setCanUndo={setCanUndo}
                    />
                </View>
            ) : null}
        </Card>
    );
}

function TherapistOptions({
    appointment,
    canUndo,
    setCanUndo,
}: {
    appointment: Appointment & { therapist: Therapist };
    canUndo: boolean;
    setCanUndo: (arg0: boolean) => void;
}) {
    const [rescheduleRequested, setRescheduleRequested] = useState(false);

    const requestReschedule = api.appointments.requestReschedule.useMutation();

    const checkAsPaid = api.appointments.checkAppointmentAsPaid.useMutation();
    const checkAsNotPaid =
        api.appointments.checkAppointmentAsNotPaid.useMutation();

    async function handlePaid() {
        try {
            await checkAsPaid.mutateAsync({ id: appointment.id });
            setCanUndo(true);
        } catch (e) {
            setCanUndo(false);
            Alert.alert(t({ message: "Failed to check appointment as paid" }));
            console.error(e);
        }
    }

    async function handleUndoPaid() {
        try {
            await checkAsNotPaid.mutateAsync({ id: appointment.id });
            setCanUndo(false);
        } catch (e) {
            setCanUndo(true);
            Alert.alert(
                t({ message: "Failed to undo check appointment as paid" }),
            );
            console.error(e);
        }
    }

    return (
        <View className="flex flex-col gap-2 pt-4">
            {appointment.status === "PENDENT" ? (
                <SessionConfirmation appointment={appointment} />
            ) : null}
            {appointment.status == "ACCEPTED" && (
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flex: 1,
                        marginTop: 12,
                    }}
                >
                    {appointment.rescheduleRequested || rescheduleRequested ? (
                        <SmallButton
                            color="gray"
                            disabled
                            textSize="sm"
                            style={{ paddingVertical: 8 }}
                        >
                            <Trans>Reschedule requested</Trans>
                        </SmallButton>
                    ) : (
                        <SmallButton
                            color="yellow"
                            disabled={requestReschedule.isLoading}
                            onPress={async function () {
                                try {
                                    await requestReschedule.mutateAsync({
                                        id: appointment.id,
                                    });
                                    setRescheduleRequested(true);
                                } catch (e) {
                                    console.error(e);
                                    Alert.alert(
                                        t({
                                            message:
                                                "Failed to request reschedule",
                                        }),
                                    );
                                    setRescheduleRequested(false);
                                }
                            }}
                            textSize="sm"
                            style={{ paddingVertical: 8 }}
                        >
                            <Trans>Request reschedule</Trans>
                        </SmallButton>
                    )}

                    {appointment.isPaid || canUndo ? (
                        <SmallButton
                            color="lightGray"
                            disabled={checkAsNotPaid.isLoading}
                            onPress={handleUndoPaid}
                            textSize="sm"
                            style={{ paddingVertical: 8 }}
                        >
                            <Trans>Uncheck</Trans>
                        </SmallButton>
                    ) : (
                        <SmallButton
                            disabled={checkAsPaid.isLoading}
                            onPress={handlePaid}
                            textSize="sm"
                            style={{ paddingVertical: 8 }}
                        >
                            <Trans>Check as paid</Trans>
                        </SmallButton>
                    )}
                </View>
            )}
        </View>
    );
}

function SessionConfirmation({
    appointment,
}: {
    appointment: Appointment & { therapist: Therapist };
}) {
    const utils = api.useContext();
    const updateRecurrence = useUpdateRecurrence();

    const { mutateAsync, isLoading } = api.appointments.update.useMutation({
        onSuccess: async () => {
            await utils.appointments.findAll.invalidate();
        },
    });

    const handleSessionConfirmation = async (
        newStatus: AppointmentStatusType,
    ) => {
        await mutateAsync({
            id: appointment.id,
            scheduledTo: appointment.scheduledTo,
            modality: appointment.modality,
            status: newStatus,
            isPaid: appointment.isPaid,
            therapistId: appointment.therapistId,
            patientId: appointment.patientId,
        });
    };

    const isMutating = isLoading || updateRecurrence.isLoading;

    return (
        <View
            style={{
                flex: 1,
                alignItems: "flex-start",
                gap: 12,
                paddingLeft: 8,
                paddingTop: 8,
            }}
        >
            <View
                style={{
                    flex: 1,
                    gap: 8,
                    width: "100%",
                }}
            >
                {appointment.type === "FIRST_IN_RECURRENCE" && (
                    <LargeButton
                        disabled={isMutating}
                        onPress={() => {
                            Alert.alert(
                                t({ message: "Confirm recurrence acceptance" }),
                                t({
                                    message: `After accepting the recurrence, weekly events will be added to your calendar. 
                                        Recurrent appointments are approved by default and can be canceled up until 24 hours before the session.`,
                                }),
                                [
                                    {
                                        text: t({ message: "Cancel" }),
                                        style: "cancel",
                                    },
                                    {
                                        text: t({ message: "Accept" }),
                                        onPress: async () => {
                                            await handleSessionConfirmation(
                                                "ACCEPTED",
                                            );
                                            if (appointment.recurrenceId) {
                                                await updateRecurrence.mutateAsync(
                                                    {
                                                        recurrenceId:
                                                            appointment.recurrenceId,
                                                        status: "ACCEPTED",
                                                    },
                                                );
                                            }
                                        },
                                    },
                                ],
                            );
                        }}
                    >
                        <Trans>Accept session and recurrence </Trans>
                    </LargeButton>
                )}
                <LargeButton
                    disabled={isMutating}
                    onPress={() => {
                        Alert.alert(
                            t({
                                message: "Confirm session acceptance",
                            }),
                            t({
                                message: `After accepting the session, an event will be created in your calendar.${
                                    appointment.recurrenceId
                                        ? "Accepting a single session will refuse the patient's recurrence request."
                                        : ""
                                }`,
                            }),
                            [
                                {
                                    text: t({ message: "Cancel" }),
                                    style: "cancel",
                                },
                                {
                                    text: t({ message: "Accept" }),
                                    onPress: async () => {
                                        await handleSessionConfirmation(
                                            "ACCEPTED",
                                        );
                                        if (appointment.recurrenceId) {
                                            await updateRecurrence.mutateAsync({
                                                recurrenceId:
                                                    appointment.recurrenceId,
                                                status: "REJECTED",
                                            });
                                        }
                                    },
                                },
                            ],
                        );
                    }}
                >
                    {appointment.type === "FIRST_IN_RECURRENCE"
                        ? t({ message: "Accept single session" })
                        : t({ message: "Accept session" })}
                </LargeButton>
                <LargeButton
                    color="red"
                    disabled={isMutating}
                    onPress={() => {
                        Alert.alert(
                            t({ message: "Confirm session rejection" }),
                            t({ message: "This action can't be undone" }),
                            [
                                {
                                    text: t({ message: "Cancel" }),
                                    style: "cancel",
                                },
                                {
                                    text: t({ message: "Reject" }),
                                    onPress: async () => {
                                        await handleSessionConfirmation(
                                            "REJECTED",
                                        );
                                        if (appointment.recurrenceId) {
                                            await updateRecurrence.mutateAsync({
                                                recurrenceId:
                                                    appointment.recurrenceId,
                                                status: "REJECTED",
                                            });
                                        }
                                    },
                                },
                            ],
                        );
                    }}
                >
                    <Trans>Refuse session</Trans>
                </LargeButton>
            </View>
        </View>
    );
}
