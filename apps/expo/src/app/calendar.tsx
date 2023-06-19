import { useState } from "react";
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { FontAwesome } from "@expo/vector-icons";

import { CardSkeleton } from "../components/CardSkeleton";
import { api } from "../utils/api";
import { type Appointment } from ".prisma/client";

export default function CalendarScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useUser();
  const { data, isLoading } = api.appointments.findByUserId.useQuery({
    userId: String(user?.id),
  });

  const onRefresh = () => {
    setRefreshing(true);
    console.log("refreshing"); // TODO: Invalidar queries
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="bg-off-white">
      <ScrollView
        className="min-h-screen px-4"
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text className="pt-12 font-nunito-sans-bold text-3xl">Calendar</Text>
        <Appointments data={data ? data : []} isLoading={isLoading} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Appointments({
  data,
  isLoading,
}: {
  data: Appointment[];
  isLoading: boolean;
}) {
  const router = useRouter();

  if (isLoading) return <CardSkeleton />;

  return data && data.length > 0 ? (
    <>
      {data.map((appointment) => (
        <View
          key={appointment.id}
          className="mt-4 rounded-xl bg-white px-6 pt-6 shadow-sm"
        >
          <View className="flex w-full flex-row justify-between">
            <Text className="font-nunito-sans text-xl">
              {new Intl.DateTimeFormat("en", { weekday: "long" }).format(
                new Date(appointment.scheduledTo),
              )}
              , {new Date(appointment.scheduledTo).getDate()}/
              {new Date(appointment.scheduledTo).getMonth()}
            </Text>
            <Text className="font-nunito-sans-bold text-xl text-blue-500 ">
              {new Date(appointment.scheduledTo).getHours()}:
              {new Date(appointment.scheduledTo).getMinutes() == 0
                ? "00"
                : new Date(appointment.scheduledTo).getMinutes()}
            </Text>
          </View>
          <Text className="font-nunito-sans text-sm text-slate-500">
            {appointment.modality === "ONLINE"
              ? "via Google Meet"
              : "in person"}
          </Text>
          <View className="mt-4 flex w-full flex-row items-center justify-between align-middle"></View>
        </View>
      ))}
    </>
  ) : (
    <View className="mt-4 rounded-xl bg-white shadow-sm">
      <View className="px-6 pt-6">
        <Text className="font-nunito-sans text-xl">Nothing for now!</Text>
        <Text className="font-nunito-sans text-sm text-slate-500">
          Search for you new therapist
        </Text>
      </View>
      <TouchableOpacity onPress={() => router.push("/search")}>
        <View className="mt-6 flex w-full flex-row items-center justify-center rounded-bl-xl rounded-br-xl bg-blue-500 py-3 align-middle">
          <FontAwesome size={16} color="white" name="search" />
          <Text className="ml-4 font-nunito-sans-bold text-lg text-white">
            Therapists
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}
