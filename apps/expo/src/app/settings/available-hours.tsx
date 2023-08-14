import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { Trans, t } from "@lingui/macro";
import { groupBy } from "lodash-es";
import { DateTime } from "luxon";
import { useForm } from "react-hook-form";

import { CardSkeleton } from "../../components/CardSkeleton";
import { FormDateInput } from "../../components/FormDateInput";
import { Header } from "../../components/Header";
import { api } from "../../utils/api";
import { type Hour, type WeekDay } from ".prisma/client";

function getHourFromISO(date: Date): string {
    return DateTime.fromISO(date.toISOString()).toFormat("HH");
}

export default function AvailableHours() {
    const { user } = useUser();
    const [addHours, setAddHours] = useState(false);

    if (!user) {
        throw new Error("Missing user");
    }

    const { data, isLoading } = api.therapists.findByUserId.useQuery({
        userId: String(user.id),
    });

    if (!data || isLoading)
        return (
            <View className="mx-4 mt-12">
                <CardSkeleton />
            </View>
        );

    const groupedHours = groupBy(data.hours, "weekDay");

    return (
        <>
            <Header />
            <View className="bg-off-white px-4 pt-4">
                <Text className="font-nunito-sans-bold text-3xl">
                    <Trans>Available hours</Trans>
                </Text>
                <Text className="pb-4 font-nunito-sans text-base text-slate-500">
                    <Trans>Set available hours for your appointments.</Trans>
                </Text>
                <TouchableOpacity onPress={() => setAddHours(!addHours)}>
                    <View
                        className={`rounded-lg ${
                            addHours ? "mb-2 bg-gray-200" : "bg-blue-500"
                        } shadow-sm" px-3 py-2`}
                    >
                        <Text
                            className={`text-center font-nunito-sans-bold text-base ${
                                addHours ? "text-black" : "text-white"
                            }`}
                        >
                            <Trans>Add Hours</Trans>
                        </Text>
                    </View>
                </TouchableOpacity>
                {addHours ? <AddHours /> : null}
                <ScrollView className="pt-4">
                    {Object.entries(groupedHours).map(([weekDay, hours]) => (
                        <View key={weekDay} className="gap-2 pb-4">
                            <Text className="font-nunito-sans text-xl">
                                {capitalizeWeekDay(weekDay)}
                            </Text>
                            <View className="flex flex-row rounded-xl bg-white p-4 align-middle shadow-sm">
                                <ScrollView horizontal={true}>
                                    {hours.map((hour: Hour) => (
                                        <HourButton key={hour.id} {...hour} />
                                    ))}
                                </ScrollView>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            </View>
        </>
    );
}

function AddHours() {
    const utils = api.useContext();
    const [selectedDays, setSelectedDays] = useState<WeekDay[]>([]);
    const [showStartHourPicker, setShowStartHourPicker] = useState(false);
    const [showEndHourPicker, setShowEndHourPicker] = useState(false);
    const setTherapistHours = api.therapists.setAvailableHours.useMutation({
        onSuccess() {
            utils.therapists.findByUserId.invalidate();
        },
    });

    const { control, handleSubmit, setValue } = useForm({
        defaultValues: {
            days: [] as WeekDay[],
            startHour: DateTime.now()
                .set({
                    hour: 9,
                    minute: 0,
                })
                .toJSDate(),
            endHour: DateTime.now()
                .set({
                    hour: 18,
                    minute: 0,
                })
                .toJSDate(),
        },
    });

    // this is an ugly workaround, ideally we wouldn't need selectedDays
    // and would just pass down the form value "days" to DaySelector
    useEffect(() => {
        setValue("days", selectedDays);
    }, [selectedDays, setValue]);

    const onSubmit = handleSubmit((values) => {
        setTherapistHours.mutate({
            days: values.days,
            startHour: parseInt(getHourFromISO(values.startHour)),
            endHour: parseInt(getHourFromISO(values.endHour)),
        });
    });

    return (
        <View
            className="mt-4 w-full rounded-xl bg-white px-6 py-4 shadow-sm"
            style={{
                flex: 1,
                maxHeight: 340,
            }}
        >
            <DaySelector
                selectedDays={selectedDays}
                setSelectedDays={setSelectedDays}
            />
            <FormDateInput
                control={control}
                handleChange={() => setShowStartHourPicker(false)}
                onValuePress={() => setShowStartHourPicker(true)}
                name="startHour"
                show={showStartHourPicker}
                title={t({ message: "Start Hour:" })}
                mode="time"
                valueDisplayFunction={(date) => `${getHourFromISO(date)}:00`}
            />
            <FormDateInput
                control={control}
                valueDisplayFunction={(date) => `${getHourFromISO(date)}:00`}
                handleChange={() => setShowEndHourPicker(false)}
                onValuePress={() => setShowEndHourPicker(true)}
                name="endHour"
                show={showEndHourPicker}
                title={t({ message: "End Hour:" })}
                mode="time"
            />
            <TouchableOpacity className="w-full" onPress={onSubmit}>
                <View
                    className={`flex w-full items-center justify-center rounded-xl bg-blue-500 py-2`}
                >
                    <Text
                        className={`font-nunito-sans-bold text-lg ${
                            true ? "text-white" : "text-black"
                        }`}
                    >
                        <Trans>Save</Trans>
                    </Text>
                </View>
            </TouchableOpacity>
        </View>
    );
}

function DaySelector({
    selectedDays,
    setSelectedDays,
}: {
    selectedDays: WeekDay[];
    setSelectedDays: React.Dispatch<React.SetStateAction<WeekDay[]>>;
}) {
    function onPress(day: WeekDay) {
        return function () {
            if (selectedDays.includes(day)) {
                const newDays = [...selectedDays].filter((d) => d !== day);
                setSelectedDays(newDays);
            } else {
                const newDays = [...selectedDays, day];
                setSelectedDays(newDays);
            }
        };
    }

    return (
        <View
            style={{
                flex: 1,
                flexDirection: "row",
                gap: 8,
                justifyContent: "center",
            }}
        >
            <DayToSelect
                day={"MONDAY"}
                selected={selectedDays.includes("MONDAY")}
                onPress={onPress}
            />
            <DayToSelect
                day={"TUESDAY"}
                selected={selectedDays.includes("TUESDAY")}
                onPress={onPress}
            />
            <DayToSelect
                day={"WEDNESDAY"}
                selected={selectedDays.includes("WEDNESDAY")}
                onPress={onPress}
            />
            <DayToSelect
                day={"THURSDAY"}
                selected={selectedDays.includes("THURSDAY")}
                onPress={onPress}
            />
            <DayToSelect
                day={"FRIDAY"}
                selected={selectedDays.includes("FRIDAY")}
                onPress={onPress}
            />
        </View>
    );
}

function DayToSelect({
    day,
    selected,
    onPress,
}: {
    day: WeekDay;
    selected: boolean;
    onPress: (day: WeekDay) => () => void;
}) {
    return (
        <Text
            onPress={onPress(day)}
            className={`max-h-12 max-w-[64px] rounded-lg px-5 py-3 ${
                selected ? "bg-blue-500 text-white" : "bg-off-white"
            }`}
        >
            {day.slice(0, 1).toUpperCase()}
        </Text>
    );
}

function HourButton(hour: Hour) {
    return (
        <View key={hour.id}>
            <TouchableOpacity
                onPress={() => null}
                className={`mr-2 flex items-center justify-center rounded-lg bg-off-white px-5 py-3`}
            >
                <Text className={`font-nunito-sans text-base `}>
                    {hour.startAt}:00
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const capitalizeWeekDay = (weekDay: string): string => {
    return weekDay.charAt(0) + weekDay.slice(1).toLowerCase();
};
