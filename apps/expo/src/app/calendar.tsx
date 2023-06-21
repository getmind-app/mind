import { useEffect, useState } from "react";
import {
  Image,
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
import { type Appointment, type Therapist } from ".prisma/client";

export default function CalendarScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useUser();
  const { data, isLoading, refetch } = api.appointments.findByUserId.useQuery({
    userId: String(user?.id),
  });

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  };

  useEffect(() => {
    if (refreshing) {
      refetch();
    }
  }, [refreshing, refetch]);

  return (
    <SafeAreaView className="h-full bg-off-white">
      <ScrollView
        className="px-4"
        showsVerticalScrollIndicator={false}
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
  data: (Appointment & { therapist: Therapist })[];
  isLoading: boolean;
}) {
  const router = useRouter();

  if (isLoading) return <CardSkeleton />;

  return data && data.length > 0 ? (
    <>
      {data.map((appointment) => (
        <View
          key={appointment.id}
          className="my-2 rounded-xl bg-white p-6 shadow-sm"
        >
          <View className="flex flex-row justify-between">
            <View className="flex flex-col">
              <Text className="font-nunito-sans text-xl">
                {new Intl.DateTimeFormat("en", { weekday: "long" }).format(
                  new Date(appointment.scheduledTo),
                )}
                , {new Date(appointment.scheduledTo).getDate()}/
                {new Date(appointment.scheduledTo).getMonth()}
              </Text>
              <View className="flex flex-row">
                <Text className="font-nunito-sans text-sm text-slate-500">
                  with{"  "}
                </Text>
                <Image
                  className="rounded-full"
                  alt={`${appointment.therapist.name}'s profile picture`}
                  source={{
                    uri: appointment.therapist.profilePictureUrl,
                    width: 20,
                    height: 20,
                  }}
                />
                <Text className="font-nunito-sans text-sm text-slate-500">
                  {"  "}
                  {appointment.modality === "ONLINE"
                    ? "via Google Meet"
                    : "in person"}
                </Text>
              </View>
            </View>
            <View className="flex flex-col">
              <Text className="font-nunito-sans-bold text-xl text-blue-500 ">
                {new Date(appointment.scheduledTo).getHours()}:
                {new Date(appointment.scheduledTo).getMinutes() == 0
                  ? "00"
                  : new Date(appointment.scheduledTo).getMinutes()}
              </Text>
            </View>
          </View>
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
