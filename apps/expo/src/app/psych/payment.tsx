import {
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  Touchable,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter, useSearchParams } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";

import { Header } from "../../components/Header";
import { api } from "../../utils/api";

function handleMode(x: string) {
  if (x === "ONLINE") return "Online";
  if (x === "ON_SITE") return "In Person";
}

export default function SessionPayment() {
  const router = useRouter();
  const { appointmentId } = useLocalSearchParams();
  const { data } = api.appointments.findById.useQuery({
    id: String(appointmentId),
  });

  function handleConfirm() {
    router.push({
      pathname: "psych/finish",
      params: { appointmentId: appointmentId },
    });
  }

  return (
    <SafeAreaView className="bg-off-white">
      <Header title="Payment" />
      <ScrollView
        className="min-h-screen px-4"
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
      >
        <View className="relative mt-8 rounded-2xl bg-white p-4 pt-6 shadow-sm">
          <Text className="mb-4 font-nunito-sans-bold text-2xl">
            Your appointment
          </Text>
          <View className="mb-8">
            <View className="mb-2">
              <Text className="mb-2 font-nunito-sans text-sm">Details</Text>
              <Text className="mb-2 ml-3 font-nunito-sans text-[#666666]">
                Appointments with {data?.therapist.name}
              </Text>
              <View>
                <View className="ml-6 flex flex-row justify-between">
                  <Text className="font-nunito-sans text-[#666666]">
                    {data?.scheduledTo.getDate()} -{" "}
                    {data?.scheduledTo.getHours()}:
                    {data?.scheduledTo.getMinutes() == 0
                      ? "00"
                      : data?.scheduledTo.getMinutes()}{" "}
                    -{handleMode(data?.modality ? data?.modality : "")}
                  </Text>
                  <Text className=" font-nunito-sans text-[#666666]">
                    US$ {data?.therapist.hourlyRate}
                  </Text>
                </View>
              </View>
            </View>
            <View className="mb-4">
              <Text className="mb-2 font-nunito-sans text-sm">Discount</Text>
              <View>
                <View className="ml-3 flex flex-row justify-between">
                  <Text className=" font-nunito-sans text-[#666666]">
                    First Appointment (10%)
                  </Text>
                  <Text className="font-nunito-sans text-green-500">
                    {data?.therapist && data?.therapist.hourlyRate
                      ? "- US$ " + data.therapist.hourlyRate * 0.1
                      : "N/A"}{" "}
                  </Text>
                </View>
              </View>
            </View>

            <View className="flex flex-row justify-between">
              <Text className="font-nunito-sans">Total</Text>
              <Text className="font-nunito-sans">
                {data?.therapist && data?.therapist.hourlyRate
                  ? "US$ " + data.therapist.hourlyRate * 0.9
                  : "N/A"}{" "}
              </Text>
            </View>
          </View>
          <View>
            <Text className="mb-4 font-nunito-sans-bold text-2xl">
              Payment method
            </Text>
            <View className="mb-2 flex flex-row items-center rounded-lg bg-[#E9E9E9] px-5 py-4">
              <View className="flex flex-row items-center">
                <FontAwesome5 size={24} name="cc-visa" />
                <Text className="ml-4 font-nunito-sans-bold">**** 2215</Text>
              </View>
              <View className="ml-auto flex flex-row items-center">
                <FontAwesome5 name="chevron-down" />
              </View>
            </View>
            <Text className="ml-2 font-nunito-sans text-xs text-[#666666]">
              The payment will be processed a day before each session.
            </Text>
          </View>
        </View>
        <View className="relative mt-4 rounded-2xl bg-off-white p-4">
          <Text className="mb-2 font-nunito-sans-bold text-2xl">
            Confirm sessions
          </Text>
          <Text className="mb-4 font-nunito-sans text-xs text-[#666666]">
            You can cancel or reschedule your sessions up to 24 hours before.
          </Text>
          <TouchableOpacity
            onPress={handleConfirm}
            className={`rounded-lg bg-[#2185EE] px-16 py-3`}
          >
            <Text
              className={`text-center font-nunito-sans-bold text-base text-white`}
            >
              Confirm
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
