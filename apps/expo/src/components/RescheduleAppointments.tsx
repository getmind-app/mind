import { useEffect, useState } from "react";
import { Alert, Dimensions, View } from "react-native";
import { Modalize, useModalize } from "react-native-modalize";
import { Portal } from "react-native-portalize";
import { useClerk } from "@clerk/clerk-expo";
import { Trans, t } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import { format, startOfDay } from "date-fns";

import {
    type Appointment,
    type Hour,
    type Therapist,
} from "../../../../packages/db";
import { getLocale } from "../helpers/getLocale";
import { api } from "../utils/api";
import { BasicText } from "./BasicText";
import { LargeButton } from "./LargeButton";
import { SmallButton } from "./SmallButton";

export function RescheduleAppointments() {
    const { user } = useClerk();
    const { ref, open, close } = useModalize();

    const appointmentsToReschedule =
        api.patients.appointmentsToReschedule.useQuery();

    useEffect(() => {
        if (
            appointmentsToReschedule.data &&
            appointmentsToReschedule.data?.length > 0
        ) {
            // junky solutions to a problem i shouldn't have
            // but checking ref.current wasn't working
            setTimeout(() => {
                open();
            }, 1000);
        } else {
            close();
        }
    }, [appointmentsToReschedule.data, appointmentsToReschedule.isLoading]);

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

    if (
        !appointmentsToReschedule.data ||
        appointmentsToReschedule.data.length === 0
    ) {
        return null;
    }

    async function handleReschedule() {
        await appointmentsToReschedule.refetch();
    }

    return (
        <>
            <Portal>
                <Modalize
                    modalStyle={{ backgroundColor: "#f8f8f8", padding: 24 }}
                    ref={ref}
                    modalHeight={Dimensions.get("window").height * 0.8}
                    alwaysOpen={Dimensions.get("window").height * 0.8}
                    closeOnOverlayTap={false}
                    closeSnapPointStraightEnabled={false}
                    withHandle={false}
                    withOverlay={true}
                >
                    <BasicText
                        size="2xl"
                        fontWeight="bold"
                        style={{
                            marginBottom: 24,
                        }}
                    >
                        <Trans>Reschedule requests</Trans>
                    </BasicText>
                    <View
                        style={{
                            gap: 32,
                            paddingBottom: 32,
                        }}
                    >
                        {appointmentsToReschedule.data.map(
                            (appointment, index) => (
                                <RescheduleAppointmentRequest
                                    key={`${appointment.id}-${index}`}
                                    appointment={appointment}
                                    onReschedule={handleReschedule}
                                />
                            ),
                        )}
                    </View>
                </Modalize>
            </Portal>
        </>
    );
}

function RescheduleAppointmentRequest({
    appointment,
    onReschedule,
}: {
    appointment: Appointment & { therapist: Therapist };
    onReschedule: () => void;
}) {
    const lingui = useLingui();
    const closeRescheduleRequest =
        api.appointments.closeRescheduleRequest.useMutation();
    const suggestedHours =
        api.appointments.similarHoursBasedOnAppointment.useQuery({
            id: appointment.id,
        });
    const [selectedDayAndHour, setSelectedHourId] = useState<{
        date: Date;
        hourId: string;
    } | null>(null);

    function handleHourSelection({
        hourId,
        date,
    }: {
        hourId: string;
        date: Date;
    }) {
        setSelectedHourId({
            hourId,
            date,
        });
    }

    async function saveNewHour() {
        if (!selectedDayAndHour) {
            return;
        }

        try {
            await closeRescheduleRequest.mutateAsync({
                appointmentId: appointment.id,
                newHourId: selectedDayAndHour.hourId,
                newDate: selectedDayAndHour.date,
            });
            onReschedule();
        } catch (e) {
            console.error(e);

            Alert.alert(
                t({ message: "Error" }),
                t({
                    message:
                        "An error occurred while trying to reschedule your appointment",
                }),
            );
        }
    }

    async function keepCurrent() {
        try {
            await closeRescheduleRequest.mutateAsync({
                appointmentId: appointment.id,
                keepCurrentHour: true,
            });
            onReschedule();
        } catch (e) {
            console.error(e);

            Alert.alert(
                t({ message: "Error" }),
                t({
                    message:
                        "An error occurred while trying to update your appointment",
                }),
            );
        }
    }
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
            <BasicText size="md">
                <Trans>
                    Pick another hour for your appointment or keep the current
                    one
                </Trans>
            </BasicText>
            <BasicText size="xl" fontWeight="bold">
                <Trans>Other hours on the same day</Trans>
            </BasicText>
            <View
                style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 6,
                }}
            >
                {suggestedHours.data?.availableHoursOnTheSameDay.map(
                    (hour, index) => (
                        <HourButton
                            key={`${hour.id}-${index}`}
                            hour={hour}
                            isSelected={selectedDayAndHour?.hourId === hour.id}
                            onPress={({ hourId }) =>
                                handleHourSelection({
                                    hourId,
                                    date: startOfDay(appointment.scheduledTo),
                                })
                            }
                        />
                    ),
                )}
            </View>
            <BasicText size="xl" fontWeight="bold">
                <Trans>Similar hours on the different day</Trans>
            </BasicText>

            {suggestedHours.data?.availableHoursOnDifferentDays.map((date) => (
                <>
                    <BasicText size="lg">
                        {format(date.date, "EEEE - dd/MM", {
                            locale: getLocale(lingui),
                        })}
                    </BasicText>
                    <View
                        style={{
                            flexDirection: "row",
                            flexWrap: "wrap",
                            gap: 6,
                        }}
                    >
                        {date.hours.map((hour, index) => (
                            <HourButton
                                key={`${hour.id}-${index}`}
                                hour={hour}
                                isSelected={
                                    selectedDayAndHour?.hourId === hour.id
                                }
                                onPress={({ hourId }) =>
                                    handleHourSelection({
                                        hourId,
                                        date: startOfDay(date.date),
                                    })
                                }
                            />
                        ))}
                    </View>
                </>
            ))}
            <View
                style={{
                    flexDirection: "row",
                    gap: 12,
                    marginTop: 24,
                }}
            >
                <LargeButton
                    style={{
                        flex: 0.3,
                    }}
                    textSize="md"
                    color="gray"
                    onPress={keepCurrent}
                    disabled={closeRescheduleRequest.isLoading}
                >
                    Keep current
                </LargeButton>
                <LargeButton
                    style={{
                        flex: 0.7,
                    }}
                    textSize="md"
                    onPress={saveNewHour}
                    disabled={
                        !selectedDayAndHour || closeRescheduleRequest.isLoading
                    }
                >
                    Save
                </LargeButton>
            </View>
        </View>
    );
}

function HourButton({
    hour,
    onPress,
    isSelected,
}: {
    hour: Hour;
    onPress: ({ hourId }: { hourId: string }) => void;
    isSelected: boolean;
}) {
    return (
        <SmallButton
            onPress={() => {
                onPress({ hourId: hour.id });
            }}
            color={isSelected ? "primaryBlue" : "lightGray"}
            textColor={isSelected ? "white" : "black"}
        >
            {hour.startAt}:00
        </SmallButton>
    );
}
