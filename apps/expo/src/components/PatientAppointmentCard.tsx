import React, { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Trans, t } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import { format } from "date-fns";

import {
    type Appointment,
    type Patient,
    type Therapist,
} from "../../../../packages/db";
import { getLocale } from "../helpers/getLocale";
import { isMoreThan24HoursLater } from "../helpers/isMoreThan24HoursLater";
import { useUserIsProfessional } from "../hooks/user/useUserIsProfessional";
import { api } from "../utils/api";
import { colors } from "../utils/colors";
import { AppointmentStatus } from "./AppointmentStatus";
import { BasicText } from "./BasicText";
import { Card } from "./Card";
import { CopyButton } from "./CopyButton";
import { SmallButton } from "./SmallButton";
import { TypeOfAppointment } from "./TypeOfAppointment";
import { UserPhoto } from "./UserPhotos";

export function PatientAppointmentCard({
    appointment,
}: {
    appointment: Appointment & { therapist: Therapist } & { patient: Patient };
}) {
    const [open, setOpen] = useState(false);
    const isProfessional = useUserIsProfessional();
    const lingui = useLingui();
    const router = useRouter();
    const patientCanCancel =
        appointment.status == "ACCEPTED" &&
        isMoreThan24HoursLater(appointment.scheduledTo) &&
        !isProfessional;

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
                    <Text className="pb-2 font-nunito-sans text-xl capitalize">
                        {format(
                            new Date(appointment.scheduledTo),
                            "EEEE, dd/MM",
                            {
                                locale: getLocale(lingui),
                            },
                        )}
                    </Text>
                    <AppointmentStatus status={appointment.status} />
                    <TypeOfAppointment appointmentType={appointment.type} />
                    <View className="flex flex-row pt-2">
                        <Text className="font-nunito-sans text-sm text-slate-500">
                            <Trans>with</Trans>
                            {"  "}
                        </Text>
                        <TouchableOpacity
                            onPress={() => {
                                router.push(
                                    `/psych/${appointment.therapist.id}`,
                                );
                            }}
                        >
                            <UserPhoto
                                userId={appointment.therapist.userId}
                                alt={appointment.therapist.name}
                                url={appointment.therapist.profilePictureUrl}
                                width={20}
                                height={20}
                                iconSize={12}
                            />
                        </TouchableOpacity>
                        <Text className="font-nunito-sans text-sm text-slate-500">
                            {"  "}
                            {appointment.therapist.name}{" "}
                            {appointment.modality === "ONLINE"
                                ? t({ message: "via Google Meet" })
                                : t({ message: "in person" })}
                        </Text>
                    </View>
                </View>
                <View className="flex flex-col items-end justify-between">
                    <BasicText fontWeight="bold" size="xl" color="primaryBlue">
                        {format(appointment.scheduledTo, "HH:mm")}
                    </BasicText>
                    {patientCanCancel ? (
                        <TouchableOpacity onPress={() => setOpen(!open)}>
                            {open ? (
                                <Feather
                                    size={24}
                                    color={colors.gray}
                                    name="chevron-up"
                                />
                            ) : (
                                <Feather
                                    size={24}
                                    color={colors.gray}
                                    name="chevron-down"
                                />
                            )}
                        </TouchableOpacity>
                    ) : null}
                </View>
            </View>
            {open ? (
                <View className="mt-4 flex flex-row items-center justify-between border-t-[1px] border-slate-500/10 pt-4 align-middle">
                    <CopyPixKeyButton appointment={appointment} />
                    <PatientOptions appointment={appointment} />
                </View>
            ) : null}
        </Card>
    );
}

function CopyPixKeyButton({
    appointment,
}: {
    appointment: Appointment & { therapist: Therapist };
}) {
    if (!appointment.therapist.pixKey) return null;

    return (
        <CopyButton stringToCopy={appointment.therapist.pixKey}>
            <Trans>Copy pix key</Trans>
        </CopyButton>
    );
}

function PatientOptions({
    appointment,
}: {
    appointment: Appointment & { therapist: Therapist };
}) {
    if (
        appointment.status === "ACCEPTED" &&
        isMoreThan24HoursLater(appointment.scheduledTo)
    )
        return <SessionCancel appointment={appointment} />;

    return null;
}

function SessionCancel({
    appointment,
}: {
    appointment: Appointment & { therapist: Therapist };
}) {
    const utils = api.useContext();

    const { mutate } = api.appointments.update.useMutation({
        onSuccess: async () => {
            await utils.appointments.findAll.invalidate();
        },
    });

    const handleSessionCancel = () => {
        mutate({
            id: appointment.id,
            scheduledTo: appointment.scheduledTo,
            modality: appointment.modality,
            status: "CANCELED",
            isPaid: appointment.isPaid,
            therapistId: appointment.therapistId,
            patientId: appointment.patientId,
        });
    };

    return (
        <View>
            <SmallButton
                color="red"
                onPress={() =>
                    Alert.alert(
                        t({ message: "Are you sure?" }),
                        t({
                            message: `Are you sure you want to cancel the session with ${appointment.therapist.name}?`,
                        }),
                        [
                            {
                                text: t({ message: "No" }),
                                style: "cancel",
                            },
                            {
                                text: t({ message: "Yes" }),
                                onPress: () => {
                                    handleSessionCancel();
                                },
                            },
                        ],
                    )
                }
            >
                <BasicText color="white">
                    <Trans>Cancel session</Trans>
                </BasicText>
            </SmallButton>
        </View>
    );
}
