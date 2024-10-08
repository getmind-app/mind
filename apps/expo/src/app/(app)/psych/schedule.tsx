import { useEffect, useMemo, useState } from "react";
import {
    Image,
    Linking,
    ScrollView,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Trans, t } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import { setHours, setMilliseconds, setMinutes, setSeconds } from "date-fns";
import { atom, useAtom } from "jotai";

import { AnimatedCard } from "../../../components/Accordion";
import { BasicText } from "../../../components/BasicText";
import { FullScreenLoading } from "../../../components/FullScreenLoading";
import { Header } from "../../../components/Header";
import { LargeButton } from "../../../components/LargeButton";
import { ScreenWrapper } from "../../../components/ScreenWrapper";
import { UserPhoto } from "../../../components/UserPhotos";
import geocodeAddress from "../../../helpers/geocodeAddress";
import { getMonthInLocale } from "../../../helpers/getMonthInLocale";
import { useRecurrenceCanHappen } from "../../../hooks/recurrence/useRecurrenceCanHappen";
import { api, type RouterOutputs } from "../../../utils/api";
import {
    type Address,
    type Appointment,
    type Hour,
    type Modality,
    type Therapist,
} from ".prisma/client";

const appointmentAtom = atom<{
    date: Date | null;
    hour: string | null;
    modality: Modality | null;
    repeat: boolean;
    hourId: string | null;
}>({
    date: null,
    hourId: null,
    hour: null,
    modality: null,
    repeat: false,
});

type therapistAvailableDates =
    RouterOutputs["therapists"]["getAvailableDatesAndHours"];

export default function AppointmentSchedulingScreen() {
    const [appointment, setAppointment] = useAtom(appointmentAtom);
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { data: patient } = api.patients.findByUserId.useQuery();

    const { data, isLoading, isError, error } =
        api.therapists.findById.useQuery({
            id: String(id),
        });

    const createAppointment = api.appointments.create.useMutation({
        onSuccess: (appointment) => {
            router.push({
                pathname: "/psych/finish",
                params: { appointmentId: appointment.id },
            });
        },
    });

    const therapistAvailableDates =
        api.therapists.getAvailableDatesAndHours.useQuery({
            therapistId: String(id),
        });

    const allPicked = useMemo(() => {
        return Boolean(
            appointment.date && appointment.modality && appointment.hour,
        );
    }, [appointment]);

    const completeDate = useMemo(() => {
        if (!appointment.date || !appointment.hour) return null;

        const [hour, minutes] = appointment.hour
            .split(":")
            .map((v) => parseInt(v)) as [number, number];
        return setHours(
            setMinutes(
                setSeconds(setMilliseconds(appointment.date, 0), 0),
                minutes,
            ),
            hour,
        );
    }, [appointment.date, appointment.hour]);

    async function handleConfirm() {
        if (!completeDate || !appointment.modality) {
            throw new Error("Missing form data");
        } else if (!data?.hourlyRate) {
            throw new Error("Missing hourly rate");
        } else if (!appointment.hourId) {
            throw new Error("Missing hour id");
        }

        await createAppointment.mutateAsync({
            scheduledTo: completeDate,
            modality: appointment.modality,
            therapistId: String(id),
            patientId: String(patient?.id),
            repeat: appointment.repeat,
            hourId: appointment.hourId,
        });
    }

    if (isLoading || !therapistAvailableDates.data)
        return <FullScreenLoading />;

    if (isError) return <Text>Error: {JSON.stringify(error)}</Text>;
    if (!data) return <Text>Not found</Text>;

    return (
        <>
            <Header />
            <ScreenWrapper paddingTop={8} paddindBottom={32}>
                <View
                    style={{
                        flex: 1,
                        justifyContent: "space-between",
                    }}
                >
                    <ScrollView>
                        <View
                            style={{
                                borderRadius: 16,
                                backgroundColor: "#fff",
                                padding: 16,
                                marginTop: 16,
                                position: "relative",
                            }}
                        >
                            <View className="p-1/2 absolute left-4 top-[-16] flex h-16 w-16 overflow-hidden rounded-full">
                                <UserPhoto
                                    alt={`${data.name} picture`}
                                    url={data.profilePictureUrl}
                                    width={64}
                                    height={64}
                                    userId={null}
                                />
                            </View>
                            <BasicText
                                size="2xl"
                                fontWeight="bold"
                                style={{
                                    marginBottom: 2,
                                    paddingTop: 40,
                                }}
                            >
                                <Trans>
                                    {data.name.split(" ").at(0)}&apos;s Schedule
                                </Trans>
                            </BasicText>
                            <BasicText
                                color="gray"
                                size="md"
                                style={{
                                    marginBottom: 2,
                                }}
                            >
                                <Trans>
                                    Pick the date that you would like to meet:
                                </Trans>
                            </BasicText>
                            <Calendar
                                availableDates={therapistAvailableDates.data}
                                onSelect={(newDate) =>
                                    setAppointment({
                                        ...appointment,
                                        date: newDate,
                                    })
                                }
                            />
                        </View>
                        <HourPicker
                            hour={appointment.hour}
                            date={appointment.date}
                            therapistAppointments={data.appointments}
                            therapistHours={data.hours}
                            onSelect={({ newHour, hourId }) =>
                                setAppointment({
                                    ...appointment,
                                    hour: newHour,
                                    hourId,
                                })
                            }
                        />
                        <ModalityPicker
                            therapist={data}
                            hour={appointment.hour}
                            mode={appointment.modality}
                            onSelect={(newModality) =>
                                setAppointment({
                                    ...appointment,
                                    modality: newModality,
                                })
                            }
                        />
                        <RecurrenceOptions
                            scheduledTo={completeDate}
                            therapistId={data.id}
                            repeat={appointment.repeat}
                            onToggle={() => {
                                setAppointment({
                                    ...appointment,
                                    repeat: !appointment.repeat,
                                });
                            }}
                        />
                        {/* BOTTOM SPACING */}
                        <View style={{ height: 48 }} />
                    </ScrollView>

                    <View>
                        <LargeButton
                            disabled={!allPicked || createAppointment.isLoading}
                            onPress={handleConfirm}
                            loading={createAppointment.isLoading}
                        >
                            <Trans>Confirm appointment</Trans>
                        </LargeButton>
                    </View>
                </View>
            </ScreenWrapper>
        </>
    );
}

const Calendar = ({
    onSelect,
    availableDates,
}: {
    onSelect: (n: Date) => void;
    availableDates: therapistAvailableDates;
}) => {
    const lingui = useLingui();
    const [selectedDate, setSelectedDate] = useState<Date>();

    return (
        <View className="flex flex-col gap-4 rounded-lg pt-4">
            {availableDates &&
                Object.values(availableDates).length > 0 &&
                Object.entries(availableDates).map(
                    ([monthIndex, availableDays]) => (
                        <View
                            key={monthIndex}
                            style={{
                                paddingLeft: 4,
                            }}
                        >
                            <BasicText
                                style={{
                                    textTransform: "capitalize",
                                    paddingBottom: 4,
                                }}
                                size="lg"
                            >
                                {getMonthInLocale({
                                    locale: lingui.i18n.locale,
                                    monthIndex: parseInt(monthIndex),
                                })}
                            </BasicText>
                            <ScrollView horizontal={true}>
                                {availableDays.length === 0 ? (
                                    <BasicText
                                        style={{
                                            paddingLeft: 4,
                                        }}
                                        color="gray"
                                        size="sm"
                                    >
                                        <Trans>
                                            No dates available for this month
                                        </Trans>
                                    </BasicText>
                                ) : (
                                    availableDays.map((day) => (
                                        <TouchableOpacity
                                            key={day.date.getDate()}
                                            className={`mr-2 flex w-16 rounded-lg ${
                                                day.date.getMonth() ===
                                                    selectedDate?.getMonth() &&
                                                day.date.getDate() ===
                                                    selectedDate?.getDate()
                                                    ? "bg-[#2185EE]"
                                                    : "bg-off-white"
                                            }`}
                                            onPress={() => {
                                                onSelect(day.date);
                                                setSelectedDate(day.date);
                                            }}
                                        >
                                            <Text
                                                className={`p-3 text-center font-nunito-sans text-sm ${
                                                    day.date.getMonth() ===
                                                        selectedDate?.getMonth() &&
                                                    day.date.getDate() ===
                                                        selectedDate?.getDate()
                                                        ? "font-nunito-sans-bold text-white"
                                                        : ""
                                                }`}
                                            >
                                                {day.date.getDate()}
                                            </Text>
                                        </TouchableOpacity>
                                    ))
                                )}
                            </ScrollView>
                        </View>
                    ),
                )}
        </View>
    );
};

type HourPickerProps = {
    date: Date | null;
    hour: string | null;
    therapistHours: Hour[];
    therapistAppointments: Appointment[];
    onSelect: ({
        newHour,
        hourId,
    }: {
        newHour: string;
        hourId: string;
    }) => void;
};

function HourPicker({
    date,
    hour,
    therapistHours,
    therapistAppointments,
    onSelect,
}: HourPickerProps) {
    const [expanded, setExpanded] = useState(false);
    const weekdays = [
        "SUNDAY",
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
    ];

    useEffect(() => {
        if (date) {
            setExpanded(true);
        }
    }, [date]);

    const availableHours = therapistHours
        .filter((hour) => {
            return hour.weekDay === weekdays[date?.getDay() ?? 1];
        })
        .filter((hour) => {
            const isAppointmentMatch = therapistAppointments.some(
                (appointment) => {
                    return (
                        appointment.scheduledTo.getHours() === hour.startAt &&
                        appointment.scheduledTo.getDate() === date?.getDate() &&
                        appointment.scheduledTo.getMonth() ===
                            date?.getMonth() &&
                        appointment.scheduledTo.getFullYear() ===
                            date?.getFullYear() &&
                        appointment.status !== "CANCELED" &&
                        appointment.status != "REJECTED"
                    );
                },
            );

            return !isAppointmentMatch;
        });

    return (
        <AnimatedCard
            title={
                <View className="flex flex-row justify-between">
                    <Text className={"font-nunito-sans text-xl"}>
                        <Trans>Hour </Trans>
                    </Text>
                    <BasicText size="xl" color="gray">
                        {hour}{" "}
                    </BasicText>
                </View>
            }
            expanded={expanded}
            setExpanded={setExpanded}
            maxHeight={date ? 60 : 30}
        >
            <ScrollView className="w-full" horizontal={true}>
                <View className="flex w-full flex-row pt-2">
                    {!date && (
                        <BasicText
                            style={{
                                paddingLeft: 4,
                            }}
                            color="gray"
                            size="sm"
                        >
                            <Trans>Please select a date</Trans>
                        </BasicText>
                    )}
                    {date && availableHours.length === 0 && (
                        <BasicText
                            style={{
                                paddingLeft: 4,
                            }}
                            color="gray"
                            size="sm"
                        >
                            <Trans>
                                No more available sessions for this date!
                            </Trans>
                        </BasicText>
                    )}
                    {date &&
                        availableHours.map((selectedHour, i) => (
                            <HourComponent
                                key={i}
                                number={`${selectedHour.startAt}:00`}
                                onPress={(value) => {
                                    onSelect({
                                        newHour: value,
                                        hourId: selectedHour.id,
                                    });
                                    setExpanded(false);
                                }}
                                isSelected={
                                    hour === `${selectedHour.startAt}:00`
                                }
                            />
                        ))}
                </View>
            </ScrollView>
        </AnimatedCard>
    );
}

function HourComponent({
    number,
    isSelected,
    onPress,
}: {
    number: string;
    isSelected: boolean;
    onPress: (x: string) => void;
}) {
    return (
        <View className="flex flex-row items-center justify-between">
            <TouchableOpacity
                onPress={() => onPress(number)}
                className={`mr-2 flex items-center justify-center rounded-lg px-5 py-3 ${
                    isSelected ? "bg-[#2185EE]" : "bg-off-white"
                }`}
            >
                <Text
                    className={`font-nunito-sans text-base ${
                        isSelected ? "font-nunito-sans-bold text-white" : ""
                    }`}
                >
                    {number}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

type ModalityPickerProps = {
    therapist: Therapist & {
        address: Address | null;
    } & {
        appointments: Appointment[];
    } & {
        hours: Hour[];
    };
    mode: Modality | null;
    onSelect: (pickedModality: "ONLINE" | "ON_SITE") => void;
    hour: string | null;
};

function ModalityPicker({
    therapist,
    mode,
    onSelect,
    hour,
}: ModalityPickerProps) {
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        if (hour && !mode) {
            setExpanded(true);
        } else {
            setExpanded(false);
        }
    }, [hour]);

    useEffect(() => {
        if (
            !mode &&
            therapist.modalities.length === 1 &&
            therapist.modalities[0]
        ) {
            onSelect(therapist.modalities[0]);
        }
    }, []);

    return (
        <AnimatedCard
            expanded={expanded}
            setExpanded={setExpanded}
            maxHeight={therapist.modalities.length > 1 ? 90 : 60}
            title={
                <View className="flex flex-row justify-between">
                    <Text className={"font-nunito-sans text-xl"}>
                        <Trans>Meet</Trans>
                    </Text>
                    {mode && (
                        <BasicText size="xl" color="gray">
                            {mode == "ON_SITE"
                                ? t({
                                      message: "Onsite",
                                  })
                                : t({
                                      message: "Online",
                                  })}
                        </BasicText>
                    )}
                </View>
            }
        >
            {therapist.modalities.includes("ON_SITE") ? (
                <TouchableOpacity
                    onPress={async () => {
                        const mapsLink = await geocodeAddress(
                            therapist.address ? therapist.address : null,
                        );

                        await Linking.openURL(
                            mapsLink
                                ? mapsLink
                                : "https://www.google.com/maps/search/?api=1&query=google",
                        );
                    }}
                >
                    <BasicText
                        style={{
                            paddingLeft: 4,
                        }}
                        color="gray"
                        size="sm"
                    >
                        <Trans>
                            {therapist.name}&apos;s sessions happen at{" "}
                            <BasicText
                                style={{
                                    textDecorationLine: "underline",
                                }}
                            >
                                {therapist.address?.street},{" "}
                                {therapist.address?.number}
                            </BasicText>
                        </Trans>
                    </BasicText>
                </TouchableOpacity>
            ) : (
                <BasicText
                    style={{
                        paddingLeft: 4,
                    }}
                    color="gray"
                    size="sm"
                >
                    <Trans>
                        {therapist.name}&apos;s sessions happen online!
                    </Trans>
                </BasicText>
            )}

            {therapist.modalities.length > 1 && (
                <View className="flex flex-row justify-between pt-3">
                    <TouchableOpacity
                        onPress={() => {
                            onSelect("ONLINE");
                            setTimeout(() => setExpanded(false), 300);
                        }}
                        className={`w-[48%] rounded-lg bg-off-white py-3 ${
                            mode === "ONLINE" ? "bg-[#2185EE]" : ""
                        }`}
                    >
                        <Text
                            className={`text-center font-nunito-sans text-base ${
                                mode === "ONLINE"
                                    ? "font-nunito-sans-bold text-white"
                                    : ""
                            }`}
                        >
                            <Trans>Online</Trans>
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            onSelect("ON_SITE");
                            setExpanded(false);
                        }}
                        className={`w-[48%] rounded-lg bg-off-white py-3 ${
                            mode === "ON_SITE" ? "bg-[#2185EE]" : ""
                        }`}
                    >
                        <Text
                            className={`text-center font-nunito-sans text-base ${
                                mode === "ON_SITE"
                                    ? "font-nunito-sans-bold text-white"
                                    : ""
                            }`}
                        >
                            <Trans>Onsite</Trans>
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </AnimatedCard>
    );
}

type RecurrenceOptionsProps = {
    repeat: boolean;
    onToggle: () => void;
    scheduledTo: Date | null;
    therapistId: string;
};

function RecurrenceOptions({
    repeat,
    onToggle,
    scheduledTo,
    therapistId,
}: RecurrenceOptionsProps) {
    const recurrenceCanHappen = useRecurrenceCanHappen({
        scheduledTo,
        therapistId,
    });
    return (
        <View
            className={`relative mt-3 rounded-2xl bg-white p-3 ${
                !recurrenceCanHappen.data && "opacity-50"
            }`}
        >
            <TouchableOpacity
                disabled={!recurrenceCanHappen.data}
                className={"rounded"}
                onPress={onToggle}
            >
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <View>
                        <BasicText size="2xl">
                            <Trans>Repeat weekly</Trans>
                        </BasicText>
                        <BasicText
                            color="gray"
                            size="sm"
                            style={{
                                marginBottom: 2,
                                maxWidth: 260,
                            }}
                        >
                            <Trans>
                                This appointment will be automatically added to
                                your calendar every week.
                                {"\n"}
                                {"\n"}You can cancel it anytime.
                            </Trans>
                        </BasicText>
                    </View>
                    <Switch
                        disabled={!recurrenceCanHappen.data}
                        value={repeat}
                        onChange={onToggle}
                        trackColor={{ false: "#767577", true: "#2185EE" }}
                    />
                </View>
            </TouchableOpacity>
        </View>
    );
}
