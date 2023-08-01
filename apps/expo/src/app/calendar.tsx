import { useEffect, useState } from "react";
import {
  Image,
  LayoutAnimation,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { Feather, FontAwesome } from "@expo/vector-icons";

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
    <ScrollView
      className="bg-off-white px-4 pt-12"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text className="pt-12 font-nunito-sans-bold text-3xl">Calendar</Text>
      <Appointments data={data ? data : []} isLoading={isLoading} />
    </ScrollView>
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
  const { user } = useUser();

  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

  if (isLoading) return <CardSkeleton />;

  return (data && data.length) > 0 ? (
    <View>
      {data.map((appoinment) =>
        user ? (
          <AppointmentCard
            key={appoinment.id}
            appointment={appoinment}
            metadata={user.publicMetadata}
          />
        ) : null,
      )}
    </View>
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

function AppointmentCard({
  appointment,
  metadata,
}: {
  appointment: Appointment & { therapist: Therapist };
  metadata: UserPublicMetadata;
}) {
  const [open, setOpen] = useState<boolean>(false);
  const [isPaid, setIsPaid] = useState<boolean>(appointment.isPaid as boolean); // why?

  console.log(isPaid);

  const { mutate } = api.appointments.update.useMutation({});

  const handlePaymentConfirmation = () => {
    mutate({
      id: appointment.id,
      scheduledTo: appointment.scheduledTo,
      modality: appointment.modality,
      isPaid: isPaid,
      therapistId: appointment.therapistId,
      userId: appointment.userId,
    });
  };

  return (
    <View
      key={appointment.id}
      className="my-2 rounded-xl bg-white p-6 shadow-sm"
    >
      <View className="flex flex-row justify-between">
        <View className="flex flex-col gap-1">
          <Text className="font-nunito-sans text-xl">
            {new Intl.DateTimeFormat("en", { weekday: "long" }).format(
              new Date(appointment.scheduledTo),
            )}
            , {new Date(appointment.scheduledTo).getDate()}/
            {new Date(appointment.scheduledTo).getMonth() + 1}
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
        <View className="flex flex-row gap-2">
          <Text className="font-nunito-sans-bold text-xl text-blue-500 ">
            {new Date(appointment.scheduledTo).getHours()}:
            {new Date(appointment.scheduledTo).getMinutes() == 0
              ? "00"
              : new Date(appointment.scheduledTo).getMinutes()}
          </Text>
          {metadata && metadata.role == "professional" ? (
            <Pressable onPress={() => setOpen(!open)}>
              {open ? (
                <Feather size={24} name="chevron-up" />
              ) : (
                <Feather size={24} name="chevron-down" />
              )}
            </Pressable>
          ) : null}
        </View>
      </View>
      {open ? (
        <View className="flex flex-row items-center pt-4 align-middle">
          <Text className="text-base">The patient paid?</Text>
          <View className="pl-2">
            <Pressable
              onPress={() => {
                setIsPaid(!isPaid);
                handlePaymentConfirmation();
              }}
            >
              {isPaid ? (
                <Feather size={24} name="check-circle" color="green" />
              ) : (
                <Feather size={24} name="x-circle" color="red" />
              )}
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
}
