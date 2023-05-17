import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Link, useNavigation, useRouter, useSearchParams } from "expo-router";
import { EvilIcons, MaterialIcons } from "@expo/vector-icons";

import { LogoSvg } from "../../components/LogoSvg";

export default function TherapistSchedule() {
  const navigation = useNavigation();
  const router = useRouter();
  const params = useSearchParams();
  const { psych = "John" } = params;
  /* TODO: trocar esse implementacao por um context, redux, zustand, jotai */
  const [selectedDate, setSelectedDate] = useState<number>();
  const [selectedHour, setSelectedHour] = useState<string>();
  const [selectedMode, setSelectedMode] = useState<"person" | "online">();
  const allPicked = useMemo(() => {
    return selectedDate && selectedMode && selectedHour;
  }, [selectedHour, selectedMode, selectedDate]);

  return (
    <SafeAreaView className="bg-[#FFF] px-4 pt-8">
      <ScrollView>
        {/* TODO: remover esses margins */}
        <View className=" -mb-4 mt-2  flex flex-row items-center justify-end px-4">
          <View>
            <LogoSvg className="m-auto" />
          </View>
        </View>
        <View className="relative mt-8 rounded-2xl bg-[#f8f8f8] p-3 pt-8">
          <View className="p-1/2 absolute -top-8 left-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full">
            <Image
              source={{
                uri: "https://images.pexels.com/photos/4098353/pexels-photo-4098353.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
                width: 64,
                height: 64,
              }}
            />
          </View>
          <Text className="mb-2 text-2xl">{psych}&apos;s Schedule</Text>
          <Text className="mb-2 text-sm text-[#666666]">
            Pick the date that you would like to meet
          </Text>
          <Calendar onSelect={setSelectedDate} />
        </View>
        <HourPicker
          hour={selectedHour ?? ""}
          onSelect={setSelectedHour}
          date={selectedDate ?? 0}
        />
        <ModalityPicker
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
              router.push(`/psych/payment`); // Usando essa implementação para testes (não sei se é a correta)

              // @ts-expect-error dont know why it doesnt work
              navigation.navigate(`/psych/payment`, {
                hour: selectedHour,
                date: `04/${selectedDate}`,
                mode: selectedMode,
                psych,
              });
            }}
          >
            <Text className={`text-white text-center font-bold`}>
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
    <View className="mx-auto flex  w-min flex-row flex-wrap items-center justify-start  rounded-lg bg-[#FFF] p-3">
      <Text className="relative left-3 w-full pb-3 text-xl">April</Text>
      {/* TODO: substituir esse magic number de 47px por algo responsivo */}
      <Text className="w-full max-w-[47px] text-center text-sm text-[#666666]">
        M
      </Text>
      <Text className="w-full max-w-[47px] text-center text-sm text-[#666666]">
        T
      </Text>
      <Text className="w-full max-w-[47px] text-center text-sm text-[#666666]">
        W
      </Text>
      <Text className="w-full max-w-[47px] text-center text-sm text-[#666666]">
        T
      </Text>
      <Text className="w-full max-w-[47px] text-center text-sm text-[#666666]">
        F
      </Text>
      <Text className="w-full max-w-[47px] text-center text-sm text-[#666666]">
        S
      </Text>
      <Text className="w-full max-w-[47px] text-center text-sm text-[#666666]">
        S
      </Text>
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

function HourPicker({
  date,
  hour,
  onSelect,
}: {
  date: number;
  hour: string;
  onSelect: (n: string) => void;
}) {
  const [numbers, setNumbers] = useState<number[]>([]);

  useEffect(() => {
    if (date === 0) return;
    setNumbers(
      Array.from(Array(Math.floor(Math.random() * 6)).keys())
        .map((n) => n + 9 + Math.floor(Math.random() * 5))
        .sort((a, b) => a - b)
        .filter((a, b, c) => c.findLastIndex((v) => v === a) === b),
    );
  }, [date]);

  return (
    <View className="relative mt-3 rounded-2xl bg-[#f8f8f8] p-3">
      <Text className="mb-2 text-2xl">What hour?</Text>
      <ScrollView horizontal={true}>
        <View className="flex flex-row">
          {date === 0 && (
            <Text className="text-[#666666]">Please select a date</Text>
          )}
          {date !== 0 && numbers.length === 0 && (
            <Text className="text-[#666666]">
              There are no more available sessions for this date!
            </Text>
          )}
          {numbers.map((n, i) => (
            <Hour
              key={i}
              number={`${n}:00`}
              onPress={onSelect}
              isSelected={hour === `${n}:00`}
            />
          ))}
        </View>
      </ScrollView>
    </View>
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
      className={`flex w-full max-w-[47px] rounded-full p-2 ${
        isSelected ? "" : ""
      }`}
      android_disableSound={true}
      onPress={() => onPress(number)}
    >
      <Text
        className={`p-[6px] text-center text-sm ${
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
          isSelected ? " bg-[#2185EE]" : "bg-[#FFF]"
        }`}
      >
        <Text className={`text-base ${isSelected ? "text-white" : ""}`}>
          {number}
        </Text>
      </Pressable>
    </View>
  );
}

function ModalityPicker({
  mode,
  onSelect,
}: {
  mode: string;
  onSelect: (x: string) => void;
}) {
  return (
    <View className="relative mt-3 rounded-2xl bg-[#f8f8f8] p-3">
      <Text className="mb-2 text-2xl">How would you like to meet</Text>
      <Text className="text-[#666666]">
        John&apos;s sessions happen at{" "}
        <Text className="underline">335 Pioneer Way</Text>
      </Text>
      <View className="mt-3 flex flex-row justify-between">
        <Pressable
          onPress={() => onSelect("online")}
          className={`w-[47%] rounded-lg bg-[#FFF] py-3 ${
            mode === "online" ? "bg-[#2185EE]" : ""
          }`}
        >
          <Text
            className={`text-center text-base ${
              mode === "online" ? "text-white" : ""
            }`}
          >
            Online
          </Text>
        </Pressable>
        <Pressable
          onPress={() => onSelect("person")}
          className={`w-[47%] rounded-lg bg-[#FFF] py-3 ${
            mode === "person" ? "bg-[#2185EE]" : ""
          }`}
        >
          <Text
            className={`text-center text-base ${
              mode === "person" ? "text-white" : ""
            }`}
          >
            In-person
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
