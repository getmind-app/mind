import React, { useState } from "react";
import {
    Modal,
    Pressable,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
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
import { AppointmentStatus } from "./AppointmentStatus";
import { Card } from "./Card";
import { CopyButton } from "./CopyButton";
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
                            userId={appointment.therapist.userId}
                            alt={appointment.therapist.name}
                            url={appointment.therapist.profilePictureUrl}
                            width={20}
                            height={20}
                            iconSize={12}
                        />
                        <Text className="font-nunito-sans text-sm text-slate-500">
                            {"  "}
                            {appointment.therapist.name}{" "}
                            {appointment.modality === "ONLINE"
                                ? t({ message: "via Google Meet" })
                                : t({ message: "in person" })}
                        </Text>
                    </View>
                    {isProfessional && appointment.status == "ACCEPTED" && (
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
                    {patientCanCancel ? (
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
            <CopyPixKeyButton appointment={appointment} />
            {open ? (
                <View className="mt-4 border-t-[1px] border-slate-500/10">
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
    const [modalVisible, setModalVisible] = useState(false);

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

    // TODO: make modal a component, prettify it and add some transparency to the background (bg-opacity-x does not work idk why)
    return (
        <>
            <Modal animationType="fade" transparent visible={modalVisible}>
                <TouchableWithoutFeedback
                    onPress={() => setModalVisible(false)}
                >
                    <View className="flex h-full flex-col items-center justify-center bg-off-white align-middle">
                        <View className="w-72 items-center gap-4 rounded-lg bg-white px-6 py-4 align-middle shadow-sm">
                            <Text className="font-nunito-sans-bold text-2xl">
                                <Trans>Are you sure?</Trans>
                            </Text>
                            <Pressable
                                className="rounded-lg bg-red-400 "
                                onPress={() => {
                                    handleSessionCancel();
                                    setModalVisible(false);
                                }}
                            >
                                <Text className="px-6 py-3 text-center font-nunito-sans-bold text-lg text-white">
                                    <Trans>Cancel</Trans>
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
            <View className="flex flex-row items-center pt-4 align-middle">
                <Text className="text-base">
                    <Trans>Cancel the session?</Trans>
                </Text>
                <View className="pl-3">
                    <TouchableOpacity
                        onPress={() => {
                            setModalVisible(true);
                        }}
                    >
                        <View className="rounded-lg bg-red-400 shadow-sm">
                            <Text className="px-3 py-2 text-white">
                                <Trans>Yes</Trans>
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </>
    );
}
