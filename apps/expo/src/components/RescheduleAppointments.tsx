import { useEffect, useRef } from "react";
import { Alert, View } from "react-native";
import { Modalize } from "react-native-modalize";
import { Portal } from "react-native-portalize";
import { useClerk } from "@clerk/clerk-expo";
import { Trans, t } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import { format } from "date-fns";

import { type Appointment, type Therapist } from "../../../../packages/db";
import { getLocale } from "../helpers/getLocale";
import { api } from "../utils/api";
import { BasicText } from "./BasicText";
import { Title } from "./Title";

export function RescheduleAppointments() {
    const { user } = useClerk();
    const modalizeRef = useRef<Modalize>(null);

    const appointmentsToReschedule =
        api.patients.appointmentsToReschedule.useQuery();

    useEffect(() => {
        if (
            appointmentsToReschedule.data &&
            appointmentsToReschedule.data?.length > 0 &&
            modalizeRef.current
        ) {
            modalizeRef.current?.open();
        }
    }, [appointmentsToReschedule.data, modalizeRef.current]);

    if (!user) {
        return null;
    }

    if (appointmentsToReschedule.isLoading) {
        return null;
    }

    if (appointmentsToReschedule.isError) {
        Alert.alert(
            "Error",
            "An error occurred while fetching your appointments to reschedule",
        );
        return null;
    }

    if (!appointmentsToReschedule.data) {
        return null;
    }

    return (
        <>
            <Portal>
                <Modalize
                    modalStyle={{ backgroundColor: "#f8f8f8", padding: 24 }}
                    ref={modalizeRef}
                >
                    <BasicText
                        size="xl"
                        fontWeight="bold"
                        style={{
                            marginBottom: 24,
                        }}
                    >
                        <Trans>Reschedule requests</Trans>
                    </BasicText>
                    {appointmentsToReschedule.data.map((appointment) => (
                        <RescheduleAppointmentRequest
                            key={appointment.id}
                            appointment={appointment}
                        />
                    ))}
                </Modalize>
            </Portal>
        </>
    );
}

function RescheduleAppointmentRequest({
    appointment,
}: {
    appointment: Appointment & { therapist: Therapist };
}) {
    const lingui = useLingui();
    const suggestedHours =
        api.appointments.similarHoursBasedOnAppointment.useQuery({
            id: appointment.id,
        });

    console.log(suggestedHours.data);

    return (
        <View
            style={{
                gap: 12,
            }}
        >
            <BasicText size="lg">
                <Trans>
                    <BasicText fontWeight="bold">
                        {appointment.therapist.name}
                    </BasicText>{" "}
                    wants to reschedule your session originally scheduled for{" "}
                    {format(
                        appointment.scheduledTo,
                        `d/MM '${t({
                            message: "at",
                            context: "appointment scheduled to X at Y",
                        })}' HH:mm`,
                        {
                            locale: getLocale(lingui),
                        },
                    )}
                </Trans>
            </BasicText>
            <BasicText size="lg">
                <Trans>
                    Pick another hour for your appointment or keep the current
                    one
                </Trans>
            </BasicText>
            <BasicText size="lg" fontWeight="bold">
                <Trans>Other hours on the same day</Trans>
            </BasicText>
            <View
                style={{
                    flexDirection: "column",
                }}
            >
                {suggestedHours.data?.availableHoursOnTheSameDay.map((hour) => (
                    <BasicText key={hour.id} size="lg">
                        {hour.startAt} - {hour.weekDay}
                    </BasicText>
                ))}
            </View>
            <BasicText size="lg" fontWeight="bold">
                <Trans>Similar hours on the different days</Trans>
            </BasicText>
            <View
                style={{
                    flexDirection: "column",
                }}
            >
                {suggestedHours.data?.availableHoursOnTheDifferentDays.map(
                    (hour) => (
                        <BasicText key={hour.id} size="lg">
                            {hour.startAt} - {hour.weekDay}
                        </BasicText>
                    ),
                )}
            </View>
        </View>
    );
}
