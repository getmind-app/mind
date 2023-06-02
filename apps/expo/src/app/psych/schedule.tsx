import { useEffect, useMemo, useState } from "react";
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useRouter, useSearchParams } from "expo-router";

import { AnimatedCard } from "../../components/Accordion";
import { Header } from "../../components/Header";

export default function TherapistSchedule() {
  const router = useRouter();
  const params = useSearchParams();
  const { psych = "John" } = params;
  /* TODO: trocar esse implementacao por um context, redux, zustand, jotai */
  const [selectedDate, setSelectedDate] = useState<number>();
  const [selectedHour, setSelectedHour] = useState<string>();
  const [selectedMode, setSelectedMode] = useState<"in-person" | "online">();
  const allPicked = useMemo(() => {
    return selectedDate && selectedMode && selectedHour;
  }, [selectedHour, selectedMode, selectedDate]);

  return (
    <SafeAreaView className="bg-off-white">
      <Header title="Schedule" />
      <ScrollView className="px-4 pt-8">
        <View className="bg-white relative mt-8 rounded-2xl p-4 pt-12">
          <View className="p-1/2 absolute -top-8 left-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full">
            <Image
              alt="John Michael Williams"
              source={{
                uri: "https://images.pexels.com/photos/4098353/pexels-photo-4098353.jpeg?auto=compress&cs=tinysrgb&w=1260&h=751&dpr=1",
                width: 64,
                height: 64,
              }}
            />
          </View>
          <Text className="font-nunito-sans-bold mb-2 text-2xl">
            {psych}&apos;s Schedule
          </Text>
          <Text className="font-nunito-sans mb-2 text-sm text-[#666666]">
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
          hour={selectedHour}
          mode={selectedMode ?? ""}
          onSelect={setSelectedMode as any}
        />
        <View className="mb-28 mt-5 flex w-min flex-row justify-center">
          <Pressable
            className={`rounded-lg bg-[#2185EE] px-16 py-3 ${
              allPicked ? "" : "opacity-30"
            }`}
            disabled={!allPicked}
            onPress={() => {
              router.push({
                pathname: `/psych/payment`,
                params: {
                  hour: selectedHour,
                  date: `04/${selectedDate}`,
                  mode: selectedMode,
                  psych,
                },
              });
            }}
          >
            <Text
              className={`font-nunito-sans-bold text-white text-center font-bold`}
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
    <View className="bg-white mx-auto  flex w-min flex-row flex-wrap items-center justify-start rounded-lg pt-4">
      <Text className="font-nunito-sans-bold relative left-3 w-full pb-3 text-xl">
        April
      </Text>
      {/* TODO: substituir esse magic number de 47px por algo responsivo */}
      <View className="flex w-full flex-row justify-between px-4">
        <Text className="font-nunito-sans text-center text-sm text-[#666666]">
          M
        </Text>
        <Text className="font-nunito-sans text-center text-sm text-[#666666]">
          T
        </Text>
        <Text className="font-nunito-sans text-center text-sm text-[#666666]">
          W
        </Text>
        <Text className="font-nunito-sans text-center text-sm text-[#666666]">
          T
        </Text>
        <Text className="font-nunito-sans text-center text-sm text-[#666666]">
          F
        </Text>
        <Text className="font-nunito-sans text-center text-sm text-[#666666]">
          S
        </Text>
        <Text className="font-nunito-sans text-center text-sm text-[#666666]">
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
        className={`font-nunito-sans p-[6px] text-center text-sm ${
          isSelected ? "text-white rounded-full bg-[#2185EE]" : ""
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
  mode,
  onSelect,
  hour,
}: {
  mode: string;
  onSelect: (x: string) => void;
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
      <Text className="font-nunito-sans mt-2 text-[#666666]">
        John&apos;s sessions happen at{" "}
        <Text className="font-nunito-sans underline">335 Pioneer Way</Text>
      </Text>
      <View className="mt-3 flex flex-row justify-between">
        <Pressable
          onPress={() => {
            onSelect("online");
            setExpanded(false);
          }}
          className={`bg-off-white w-[48%] rounded-lg py-3 ${
            mode === "online" ? "bg-[#2185EE]" : ""
          }`}
        >
          <Text
            className={`font-nunito-sans text-center text-base ${
              mode === "online" ? "text-white" : ""
            }`}
          >
            Online
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            onSelect("in-person");
            setExpanded(false);
          }}
          className={`bg-off-white w-[48%] rounded-lg py-3 ${
            mode === "in-person" ? "bg-[#2185EE]" : ""
          }`}
        >
          <Text
            className={`font-nunito-sans text-center text-base ${
              mode === "in-person" ? "text-white" : ""
            }`}
          >
            In-person
          </Text>
        </Pressable>
      </View>
    </AnimatedCard>
  );
}
