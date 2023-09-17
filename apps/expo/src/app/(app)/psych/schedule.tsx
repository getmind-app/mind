import { useEffect, useMemo, useState } from "react";
import {
    Image,
    LayoutAnimation,
    Linking,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Trans } from "@lingui/macro";
import { atom, useAtom } from "jotai";

import { AnimatedCard } from "../../../components/Accordion";
import { Header } from "../../../components/Header";
import geocodeAddress from "../../../helpers/geocodeAddress";
import getNext30Days from "../../../helpers/next30Days";
import { api } from "../../../utils/api";
import {
    type Address,
    type Appointment,
    type Education,
    type Hour,
    type Methodology,
    type Modality,
    type Therapist,
} from ".prisma/client";

const appointmentAtom = atom<{
    date: Date | null;
    hour: string | null;
    modality: Modality | null;
}>({
    date: null,
    hour: null,
    modality: null,
});

export default function TherapistSchedule() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    const [appointment, setAppointment] = useAtom(appointmentAtom);
    const router = useRouter();
    const { id } = useLocalSearchParams();

    const { data, isLoading, isError, error } =
        api.therapists.findById.useQuery({
            id: String(id),
        });

    const { mutate } = api.appointments.create.useMutation({
        onSuccess: (appointment) => {
            router.push({
                pathname: "/psych/payment",
                params: { appointmentId: appointment.id },
            });
        },
    });

    const { data: patient } = api.patients.findByUserId.useQuery();

    const allPicked = useMemo(() => {
        return Boolean(
            appointment.date && appointment.modality && appointment.hour,
        );
    }, [appointment]);

    function handleConfirm() {
        if (!appointment.date || !appointment.hour || !appointment.modality) {
            throw new Error("Missing form data");
        }

        const [hour, minutes] = appointment.hour.split(":");

        mutate({
            scheduledTo: new Date(
                appointment.date.getFullYear(),
                appointment.date.getMonth(),
                appointment.date.getDate(),
                parseInt(String(hour)),
                parseInt(String(minutes)),
            ),
            modality: appointment.modality,
            therapistId: String(id),
            patientId: String(patient?.id),
        });
    }

    if (isLoading) return <Text>Loading...</Text>;
    if (isError) return <Text>Error: {JSON.stringify(error)}</Text>;
    if (!data) return <Text>Not found</Text>;

    return (
        <>
            <Header />
            <ScrollView className="bg-off-white px-4">
                <View className="relative mt-8 rounded-2xl bg-white p-4 pt-12">
                    <View className="p-1/2 absolute -top-8 left-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full">
                        <Image
                            alt={`${data.name} picture`}
                            source={{
                                uri: data.profilePictureUrl,
                                width: 64,
                                height: 64,
                            }}
                        />
                    </View>
                    <Text className="mb-2 font-nunito-sans-bold text-2xl">
                        <Trans>
                            {data.name.split(" ").at(0)}&apos;s Schedule
                        </Trans>
                    </Text>
                    <Text className="mb-2 font-nunito-sans text-sm text-[#666666]">
                        <Trans>
                            Pick the date that you would like to meet:
                        </Trans>
                    </Text>
                    <Calendar
                        onSelect={(newDate) =>
                            setAppointment({ ...appointment, date: newDate })
                        }
                    />
                </View>
                <HourPicker
                    hour={appointment.hour}
                    date={appointment.date}
                    therapistAppointments={data.appointments}
                    therapistHours={data.hours}
                    onSelect={(newHour) =>
                        setAppointment({ ...appointment, hour: newHour })
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
                <View className="mb-28 mt-5 flex w-min flex-row justify-center">
                    <TouchableOpacity
                        className={`rounded-lg bg-[#2185EE] px-16 py-3 ${
                            allPicked ? "" : "opacity-30"
                        }`}
                        disabled={!allPicked}
                        onPress={handleConfirm}
                    >
                        <Text
                            className={`text-center font-nunito-sans-bold text-lg font-bold text-white`}
                        >
                            <Trans>Confirm appointment</Trans>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </>
    );
}

const Calendar = ({ onSelect }: { onSelect: (n: Date) => void }) => {
    const [selectedDate, setSelectedDate] = useState<Date>();

    const [currentMonthData, nextMonthData] = getNext30Days();

    return (
        <View className="rounded-lg bg-white pt-4">
            {currentMonthData && currentMonthData.dates.length > 0 && (
                <View>
                    <Text className="relative left-1 w-full pb-3 font-nunito-sans-bold text-xl">
                        <Trans>
                            {currentMonthData.monthName.split(" ").at(0)}
                        </Trans>
                    </Text>
                    <ScrollView horizontal={true}>
                        {currentMonthData.dates.map((day) => (
                            <TouchableOpacity
                                key={day.getDate()}
                                className={`mr-2 flex w-16 rounded-lg ${
                                    day.getMonth() ===
                                        selectedDate?.getMonth() &&
                                    day.getDate() === selectedDate?.getDate()
                                        ? "bg-[#2185EE]"
                                        : "bg-off-white"
                                }`}
                                onPress={() => {
                                    onSelect(day);
                                    setSelectedDate(day);
                                }}
                            >
                                <Text
                                    className={`p-3 text-center font-nunito-sans text-sm ${
                                        day.getMonth() ===
                                            selectedDate?.getMonth() &&
                                        day.getDate() ===
                                            selectedDate?.getDate()
                                            ? "font-nunito-sans-bold text-white"
                                            : ""
                                    }`}
                                >
                                    {day.getDate()}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            {nextMonthData && nextMonthData.dates.length > 0 && (
                <View className="pt-4">
                    <Text className="relative left-1 w-full pb-3 font-nunito-sans-bold text-xl">
                        <Trans>
                            {nextMonthData.monthName.split(" ").at(0)}
                        </Trans>
                    </Text>
                    <ScrollView horizontal={true}>
                        {nextMonthData.dates.map((day) => (
                            <TouchableOpacity
                                key={day.getDate()}
                                className={`mr-2 flex w-16 rounded-lg ${
                                    day.getMonth() ===
                                        selectedDate?.getMonth() &&
                                    day.getDate() === selectedDate?.getDate()
                                        ? "bg-[#2185EE]"
                                        : "bg-off-white"
                                }`}
                                onPress={() => {
                                    onSelect(day);
                                    setSelectedDate(day);
                                }}
                            >
                                <Text
                                    className={`p-3 text-center font-nunito-sans text-sm ${
                                        day.getMonth() ===
                                            selectedDate?.getMonth() &&
                                        day.getDate() ===
                                            selectedDate?.getDate()
                                            ? "font-nunito-sans-bold text-white"
                                            : ""
                                    }`}
                                >
                                    {day.getDate()}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}
        </View>
    );
};

type HourPickerProps = {
    date: Date | null;
    hour: string | null;
    therapistHours: Hour[];
    therapistAppointments: Appointment[];
    onSelect: (n: string) => void;
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
                            date?.getFullYear()
                    );
                },
            );

            return !isAppointmentMatch;
        })
        .map((h) => h.startAt);

    return (
        <AnimatedCard
            title={
                <View className="flex flex-row justify-between">
                    <Text className={"font-nunito-sans text-xl"}>
                        <Trans>Hour </Trans>
                    </Text>
                    <Text className={"font-nunito-sans text-xl"}>{hour} </Text>
                </View>
            }
            expanded={expanded}
            setExpanded={setExpanded}
            maxHeight={date ? 60 : 30}
        >
            <ScrollView horizontal={true}>
                <View className="flex flex-col pt-2">
                    {!date && (
                        <Text className="font-nunito-sans text-[#666666]">
                            <Trans>Please select a date</Trans>
                        </Text>
                    )}
                    {date && availableHours.length === 0 && (
                        <Text className="font-nunito-sans text-[#666666]">
                            <Trans>
                                No more available sessions for this date!
                            </Trans>
                        </Text>
                    )}
                    {date &&
                        availableHours.map((n, i) => (
                            <HourComponent
                                key={i}
                                number={`${n}:00`}
                                onPress={(v) => {
                                    onSelect(v);
                                    setExpanded(false);
                                }}
                                isSelected={hour === `${n}:00`}
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
        methodologies: Methodology[];
    } & {
        education: Education[];
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

    if (therapist.modalities.length === 1 && therapist.modalities[0]) {
        onSelect(therapist.modalities[0]);
    }

    return (
        <AnimatedCard
            expanded={expanded}
            setExpanded={setExpanded}
            maxHeight={therapist.modalities.length > 1 ? 110 : 60}
            title={
                <View className="flex flex-row justify-between">
                    <Text className={"font-nunito-sans text-xl"}>
                        <Trans>Meet</Trans>
                    </Text>
                    <Text className={"font-nunito-sans text-xl capitalize"}>
                        {mode == "ON_SITE" ? "Onsite" : "Online"}
                    </Text>
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
                    <Text className="mt-2 font-nunito-sans text-[#666666]">
                        <Trans>
                            {therapist.name}&apos;s sessions happen at{" "}
                            <Text className="font-nunito-sans underline">
                                {therapist.address?.street},{" "}
                                {therapist.address?.number}
                            </Text>
                        </Trans>
                    </Text>
                </TouchableOpacity>
            ) : (
                <Text className="mt-2 font-nunito-sans text-[#666666]">
                    {/* TODO: Translate */}
                    <Trans>
                        {therapist.name}&apos;s sessions happen online!
                    </Trans>
                </Text>
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
