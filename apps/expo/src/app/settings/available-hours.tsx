import { useState } from "react";
import { Button, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { groupBy } from "lodash-es";
import { DateTime } from "luxon";
import { useForm } from "react-hook-form";

import { CardSkeleton } from "../../components/CardSkeleton";
import { FormDateInput } from "../../components/FormDateInput";
import { api } from "../../utils/api";
import { type Hour } from ".prisma/client";

type Days = "monday" | "tuesday" | "thursday" | "wednesday" | "friday";

export default function AvailableHours() {
  const { user } = useUser();
  const [addHours, setAddHours] = useState(false);

  if (!user) {
    throw new Error("Missing user");
  }

  const { data, isLoading } = api.therapists.findByUserId.useQuery({
    userId: String(user.id),
  });

  if (!data || isLoading) return <CardSkeleton />;

  const groupedHours = groupBy(data.hours, "weekDay");

  return (
    <View className="h-full bg-off-white px-4 pt-12">
      <Text className="pt-12 font-nunito-sans-bold text-3xl">
        Available hours
      </Text>
      <Text className="pb-4 font-nunito-sans text-base text-slate-500">
        Set available hours for your appointments.
      </Text>
      <TouchableOpacity onPress={() => setAddHours(!addHours)}>
        <View
          className={`rounded-lg ${
            addHours ? "mb-2 bg-gray-200" : "bg-blue-500"
          } shadow-sm" px-3 py-1`}
        >
          <Text
            className={`text-center font-nunito-sans-bold text-base ${
              addHours ? "text-black" : "text-white"
            }`}
          >
            Add Hours
          </Text>
        </View>
      </TouchableOpacity>
      {addHours ? <AddHours /> : null}
      {Object.entries(groupedHours).map(([weekDay, hours]) => (
        <View key={weekDay} className="gap-2 pb-4">
          <Text className="font-nunito-sans text-xl">
            {capitalizeWeekDay(weekDay)}
          </Text>
          <View className="flex flex-row rounded-xl bg-white px-6 py-4 align-middle shadow-sm">
            <ScrollView horizontal={true}>
              {hours.map((hour: Hour) => (
                <HourButton key={hour.id} {...hour} />
              ))}
            </ScrollView>
          </View>
        </View>
      ))}
    </View>
  );
}

function AddHours() {
  const [selectedDays, setSelectedDays] = useState<Days[]>([]);
  const [showStartHourPicker, setShowStartHourPicker] = useState(false);
  const [showEndHourPicker, setShowEndHourPicker] = useState(false);
  const x = useForm({
    defaultValues: {
      days: [] as Days[],
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

  return (
    <View
      className="w-full rounded-xl bg-white px-6 py-4"
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
        control={x.control}
        handleChange={() => setShowStartHourPicker(false)}
        onValuePress={() => setShowStartHourPicker(true)}
        name="startHour"
        show={showStartHourPicker}
        title="Start Hour:"
        mode="time"
        valueDisplayFunction={(date) =>
          DateTime.fromISO(date.toISOString()).toFormat("HH:00")
        }
      />
      <FormDateInput
        control={x.control}
        valueDisplayFunction={(date) =>
          DateTime.fromISO(date.toISOString()).toFormat("HH:00")
        }
        handleChange={() => setShowEndHourPicker(false)}
        onValuePress={() => setShowEndHourPicker(true)}
        name="endHour"
        show={showEndHourPicker}
        title="End Hour:"
        mode="time"
      />
      <TouchableOpacity className="w-full" onPress={() => {}}>
        <View
          className={`flex w-full items-center justify-center rounded-xl bg-blue-500 py-2`}
        >
          <Text
            className={`font-nunito-sans-bold text-lg ${
              true ? "text-white" : "text-black"
            }`}
          >
            Save
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
  selectedDays: Days[];
  setSelectedDays: React.Dispatch<React.SetStateAction<Days[]>>;
}) {
  function onPress(day: Days) {
    return function () {
      if (selectedDays.some((d) => d === day)) {
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
        day={"monday"}
        selected={selectedDays.includes("monday")}
        onPress={onPress}
      />
      <DayToSelect
        day={"tuesday"}
        selected={selectedDays.includes("tuesday")}
        onPress={onPress}
      />
      <DayToSelect
        day={"wednesday"}
        selected={selectedDays.includes("wednesday")}
        onPress={onPress}
      />
      <DayToSelect
        day={"thursday"}
        selected={selectedDays.includes("thursday")}
        onPress={onPress}
      />
      <DayToSelect
        day={"friday"}
        selected={selectedDays.includes("friday")}
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
  day: Days;
  selected: boolean;
  onPress: (day: Days) => () => void;
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
        <Text className={`font-nunito-sans text-base `}>{hour.startAt}:00</Text>
      </TouchableOpacity>
    </View>
  );
}

const capitalizeWeekDay = (weekDay: string): string => {
  return weekDay.charAt(0) + weekDay.slice(1).toLowerCase();
};
