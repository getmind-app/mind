import { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
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
import { Card } from "./Card";
import { LargeButton } from "./LargeButton";
import { TypeOfAppointment } from "./TypeOfAppointment";
import { UserPhoto } from "./UserPhotos";

export function TherapistAppointmentCard({
    appointment,
}: {
    appointment: Appointment & { therapist: Therapist } & { patient: Patient };
}) {
    const [open, setOpen] = useState(false);
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
                    <AppointmentStatus status={appointment.status} />
                    <TypeOfAppointment appointmentType={appointment.type} />
                    <Text className="pt-2 font-nunito-sans text-xl capitalize">
                        {format(
                            new Date(appointment.scheduledTo),
                            "EEEE, dd/MM",
                            {
                                locale: getLocale(lingui),
                            },
                        )}
                    </Text>
                    <View className="flex flex-row pt-2">
                        <Text className="font-nunito-sans text-sm text-slate-500">
                            <Trans>with</Trans>
                            {"  "}
                        </Text>
                        <UserPhoto
                            userId={appointment.patient.userId}
                            alt={appointment.patient.name}
                            url={appointment.patient.profilePictureUrl}
                            width={20}
                            height={20}
                            iconSize={12}
                        />
                        <Text className="font-nunito-sans text-sm text-slate-500">
                            {"  "}
                            {appointment.patient.name}{" "}
                            {appointment.modality === "ONLINE"
                                ? t({ message: "via Google Meet" })
                                : t({ message: "in person" })}
                        </Text>
                    </View>
                    {appointment.status == "ACCEPTED" && (
                        <View>
                            <Text
                                className={`fontnunito-sans pt-2 ${
                                    appointment.isPaid
                                        ? "text-green-500"
                                        : "text-red-500"
                                }`}
                            >
                                {appointment.isPaid
                                    ? t({ message: "Paid" })
                                    : t({ message: "Not paid" })}
                            </Text>
                        </View>
                    )}
                </View>
                <View className=" flex flex-col items-center justify-between">
                    <Text className="font-nunito-sans-bold text-xl text-blue-500 ">
                        {format(appointment.scheduledTo, "HH:mm")}
                    </Text>
                    {appointment.status == "PENDENT" ? (
                        <TouchableOpacity onPress={() => setOpen(!open)}>
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
            {open ? (
                <View className="mt-4 border-t-[1px] border-slate-500/10">
                    <TherapistOptions appointment={appointment} />
                </View>
            ) : null}
        </Card>
    );
}

function TherapistOptions({
    appointment,
}: {
    appointment: Appointment & { therapist: Therapist };
}) {
    return (
        <View className="flex flex-col gap-2 pl-2 pt-4">
            {appointment.status === "PENDENT" ? (
                <SessionConfirmation appointment={appointment} />
            ) : null}
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
            }}
        >
            <Text
                style={{
                    flex: 1,
                }}
                className="text-base"
            >
                <Trans>Options</Trans>
            </Text>
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
                    <Trans>
                        {appointment.type === "FIRST_IN_RECURRENCE"
                            ? "Accept single session"
                            : "Accept session"}
                    </Trans>
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