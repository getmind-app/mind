import { useEffect, useMemo, useState } from "react";
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter, useSearchParams } from "expo-router";
import { useUser } from "@clerk/clerk-expo";

import { AnimatedCard } from "../../components/Accordion";
import { Header } from "../../components/Header";
import { api } from "../../utils/api";

export default function TherapistSchedule() {
  const router = useRouter();
  const { user } = useUser();
  const { id } = useLocalSearchParams();
  const { data, isLoading, isError, error } = api.therapists.findById.useQuery({
    id: String(id),
  });
  const { mutate } = api.appointments.create.useMutation({
    onSuccess: () => {
      router.push({
        pathname: "/psych/payment",
        params: { id },
      });
    },
  });

  /* TODO: trocar esse implementacao por um context, redux, zustand, jotai */
  const [selectedDate, setSelectedDate] = useState<number>();
  const [selectedHour, setSelectedHour] = useState<string>();
  const [selectedMode, setSelectedMode] = useState<"ON_SITE" | "ONLINE">();
  const allPicked = useMemo(() => {
    return selectedDate && selectedMode && selectedHour;
  }, [selectedHour, selectedMode, selectedDate]);

  function handleConfirm() {
    const today = new Date();

    if (!selectedDate || !selectedHour || !selectedMode) {
      throw new Error("Missing form data");
    }

    // TODO: fix the year and month
    mutate({
      scheduledTo: new Date(
        today.getFullYear(),
        today.getMonth(),
        selectedDate,
        parseInt(selectedHour.split(":")[0] ?? "1"),
        parseInt(selectedHour.split(":")[1] ?? "0"),
      ),
      // depois que tivermos uma solução de formulários não vai precisar do type casting
      modality: selectedMode,
      therapistId: String(id),
      userId: String(user?.id),
    });
  }

  if (isLoading) return <Text>Loading...</Text>;
  if (isError) return <Text>Error: {JSON.stringify(error)}</Text>;

  if (!data) return <Text>Not found</Text>;

  return (
    <SafeAreaView className="bg-off-white">
      <Header />
      <ScrollView className="px-4">
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
            {data.name}&apos;s Schedule
          </Text>
          <Text className="mb-2 font-nunito-sans text-sm text-[#666666]">
            Pick the date that you would like to meet:
          </Text>
          <Calendar onSelect={setSelectedDate} />
        </View>
        <HourPicker
          hour={selectedHour ?? ""}
          onSelect={setSelectedHour}
          date={selectedDate ?? 0}
        />
        <ModalityPicker
          therapistName={data.name ?? ""}
          hour={selectedHour}
          mode={selectedMode ?? ""}
          onSelect={(pickedModality) => setSelectedMode(pickedModality)}
        />
        <View className="mb-28 mt-5 flex w-min flex-row justify-center">
          <Pressable
            className={`rounded-lg bg-[#2185EE] px-16 py-3 ${
              allPicked ? "" : "opacity-30"
            }`}
            disabled={!allPicked}
            onPress={handleConfirm}
          >
            <Text
              className={`text-center font-nunito-sans-bold font-bold text-white`}
            >
              Confirm appointment
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const Calendar = ({ onSelect }: { onSelect: (n: number) => void }) => {
  const [selectedDate, setSelectedDate] = useState<number>();

  const numbers = Array.from(Array(31).keys());

  return (
    <View className="mx-auto flex  w-min flex-row flex-wrap items-center justify-start rounded-lg bg-white pt-4">
      <Text className="relative left-3 w-full pb-3 font-nunito-sans-bold text-xl">
        April
      </Text>
      {/* TODO: substituir esse magic number de 47px por algo responsivo */}
      <View className="flex w-full flex-row justify-between px-4">
        <Text className="text-center font-nunito-sans text-sm text-[#666666]">
          M
        </Text>
        <Text className="text-center font-nunito-sans text-sm text-[#666666]">
          T
        </Text>
        <Text className="text-center font-nunito-sans text-sm text-[#666666]">
          W
        </Text>
        <Text className="text-center font-nunito-sans text-sm text-[#666666]">
          T
        </Text>
        <Text className="text-center font-nunito-sans text-sm text-[#666666]">
          F
        </Text>
        <Text className="text-center font-nunito-sans text-sm text-[#666666]">
          S
        </Text>
        <Text className="text-center font-nunito-sans text-sm text-[#666666]">
          S
        </Text>
      </View>
      {numbers.map((number) => (
        <Day
          number={number + 1}
          isSelected={number + 1 === selectedDate}
          onPress={(n: number) => {
            setSelectedDate(n);
            onSelect(n);
          }}
          key={number}
        />
      ))}
    </View>
  );
};

type HourPickerProps = {
  date: number;
  hour: string;
  onSelect: (n: string) => void;
};

function HourPicker({ date, hour, onSelect }: HourPickerProps) {
  const [numbers, setNumbers] = useState<number[]>([]);
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    if (date === 0) return;
    setNumbers(
      Array.from(Array(Math.floor(Math.random() * 6)).keys())
        .map((n) => n + 9 + Math.floor(Math.random() * 5))
        .sort((a, b) => a - b)
        .filter((a, b, c) => c.findLastIndex((v) => v === a) === b),
    );
    onSelect("");
    setExpanded(true);
  }, [date]);

  return (
    <AnimatedCard
      title={
        <View className="flex flex-row justify-between">
          <Text className={"font-nunito-sans text-xl"}>Hour </Text>
          <Text className={"font-nunito-sans text-xl"}>{hour} </Text>
        </View>
      }
      expanded={expanded}
      setExpanded={setExpanded}
      maxHeight={60}
    >
      <ScrollView horizontal={true}>
        <View className="mt-2 flex flex-row">
          {date === 0 && (
            <Text className="font-nunito-sans text-[#666666]">
              Please select a date
            </Text>
          )}
          {date !== 0 && numbers.length === 0 && (
            <Text className="font-nunito-sans text-[#666666]">
              There are no more available sessions for this date!
            </Text>
          )}
          {numbers.map((n, i) => (
            <Hour
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

function Day({
  number,
  isSelected,
  onPress,
}: {
  number: number;
  isSelected: boolean;
  onPress: (x: number) => void;
}) {
  return (
    <Pressable
      className={`flex w-[47px] p-2 ${isSelected ? "rounded-full" : ""}`}
      android_disableSound={true}
      onPress={() => onPress(number)}
    >
      <Text
        className={`p-[6px] text-center font-nunito-sans text-sm ${
          isSelected ? "rounded-full bg-[#2185EE] text-white" : ""
        }`}
      >
        {number}
      </Text>
    </Pressable>
  );
}

function Hour({
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
      <Pressable
        onPress={() => onPress(number)}
        className={`mr-2 flex items-center justify-center rounded-lg px-5 py-3 ${
          isSelected ? " bg-[#2185EE]" : "bg-off-white"
        }`}
      >
        <Text
          className={`font-nunito-sans text-base ${
            isSelected ? "text-white" : ""
          }`}
        >
          {number}
        </Text>
      </Pressable>
    </View>
  );
}

function ModalityPicker({
  therapistName,
  mode,
  onSelect,
  hour,
}: {
  therapistName: string;
  mode: string;
  onSelect: (pickedModality: "ONLINE" | "ON_SITE") => void;
  hour?: string;
}) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (hour && !mode) {
      setExpanded(true);
    } else {
      setExpanded(false);
    }
  }, [hour]);

  return (
    <AnimatedCard
      expanded={expanded}
      setExpanded={setExpanded}
      maxHeight={90}
      title={
        <View className="flex flex-row justify-between">
          <Text className={"font-nunito-sans text-xl"}>Meet</Text>
          <Text className={"font-nunito-sans text-xl capitalize"}>{mode} </Text>
        </View>
      }
    >
      <Text className="mt-2 font-nunito-sans text-[#666666]">
        {therapistName}&apos;s sessions happen at{" "}
        <Text className="font-nunito-sans underline">335 Pioneer Way</Text>
      </Text>
      <View className="mt-3 flex flex-row justify-between">
        <Pressable
          onPress={() => {
            onSelect("ONLINE");
            setExpanded(false);
          }}
          className={`w-[48%] rounded-lg bg-off-white py-3 ${
            mode === "ONLINE" ? "bg-[#2185EE]" : ""
          }`}
        >
          <Text
            className={`text-center font-nunito-sans text-base ${
              mode === "ONLINE" ? "text-white" : ""
            }`}
          >
            Online
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            onSelect("ON_SITE");
            setExpanded(false);
          }}
          className={`w-[48%] rounded-lg bg-off-white py-3 ${
            mode === "ON_SITEn" ? "bg-[#2185EE]" : ""
          }`}
        >
          <Text
            className={`text-center font-nunito-sans text-base ${
              mode === "ON_SITE" ? "text-white" : ""
            }`}
          >
            In-person
          </Text>
        </Pressable>
      </View>
    </AnimatedCard>
  );
}
