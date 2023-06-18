import React, { useState } from "react";
import {
  Image,
  Linking,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import SkeletonContent from "react-native-skeleton-content";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";

import { api } from "../utils/api";

function NextAppointment() {
  const { user } = useUser();
  const router = useRouter();

  const { data, isLoading } = (
    api.appointments as any
  ).findLastByUserId.useQuery({
    userId: user?.id,
  });

  const { data: therapist, isLoading: therapistLoading } = (
    api.therapists as any
  ).findById.useQuery({
    id: data?.therapistId,
  });

  if (isLoading || therapistLoading) return <Text>Loading...</Text>;

  return (
    <>
      <Text className="mt-12 font-nunito-sans-bold text-3xl">Next session</Text>
      {data ? (
        <View className="mt-4 rounded-xl bg-white shadow-sm">
          <View className="px-6 pt-6">
            <View className="flex w-full flex-row justify-between">
              <Text className="font-nunito-sans text-xl">
                {new Intl.DateTimeFormat("en", { weekday: "long" }).format(
                  new Date(data.scheduledTo),
                )}
                , {new Date(data.scheduledTo).getDate()}/
                {new Date(data.scheduledTo).getMonth()}
              </Text>
              <Text className="font-nunito-sans-bold text-xl text-blue-500 ">
                {new Date(data.scheduledTo).getHours()}:
                {new Date(data.scheduledTo).getMinutes() == 0
                  ? "00"
                  : new Date(data.scheduledTo).getMinutes()}
              </Text>
            </View>
            <Text className="font-nunito-sans text-sm text-slate-500">
              {data.modality === "ONLINE"
                ? "via Google Meet"
                : "in person at " + therapist.address}
            </Text>
            <View className="mt-4 flex w-full flex-row items-center justify-between align-middle">
              <View className="flex flex-row items-center align-middle">
                <View className="flex items-center justify-center overflow-hidden rounded-full align-middle">
                  <TouchableOpacity
                    onPress={() => router.push("/psych/" + therapist.id)}
                  >
                    <Image
                      className="flex items-center justify-center rounded-full"
                      alt={`${therapist.name} profile picture`}
                      source={{
                        uri: therapist.profilePictureUrl,
                        width: 32,
                        height: 32,
                      }}
                    />
                  </TouchableOpacity>
                </View>
                <Text className="ml-2 font-nunito-sans text-xl">
                  {therapist.name}
                </Text>
              </View>
              <MaterialIcons
                style={{ paddingRight: 12 }}
                color="black"
                size={24}
                name="add"
              />
            </View>
          </View>
          <TouchableOpacity
            onPress={() =>
              Linking.openURL(
                data.modality === "ONLINE"
                  ? data.link
                  : "uber, maps sei la kkk",
              )
            }
          >
            <View className="mt-6 flex w-full flex-row items-center justify-center rounded-bl-xl rounded-br-xl bg-blue-500 py-3 align-middle">
              <FontAwesome
                size={20}
                color="white"
                name={`${data.modality === "ONLINE" ? "video-camera" : "car"}`}
              />
              <Text className="ml-4 font-nunito-sans-bold text-lg text-white">
                {data.modality === "ONLINE"
                  ? "Join the meeting"
                  : "Get directions"}
              </Text>
            </View>
          </TouchableOpacity>
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
              <FontAwesome size={20} color="white" name="search" />
              <Text className="ml-4 font-nunito-sans-bold text-lg text-white">
                Therapists
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
}

function LastNotes() {
  const { user } = useUser();
  const router = useRouter();

  const { data, isLoading } = (api.notes as any).findByUserId.useQuery({
    userId: user?.id,
  });

  // TODO: Adicionar skeletons para loading e achar uma forma de refazer a query quando o usuário criar/delete uma nota
  if (isLoading) return <Text>Loading...</Text>;

  return (
    <>
      <View className="mt-8 flex flex-row items-center justify-between align-middle">
        <Text className=" font-nunito-sans-bold text-3xl">Last notes</Text>
        <TouchableOpacity onPress={() => router.push("/notes/new")}>
          <View className="rounded-xl bg-blue-500 px-4 py-2 shadow-sm">
            <Text className="text-center font-nunito-sans-bold text-base text-white">
              +
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      {data && data.length > 0 ? (
        data.map(
          ({
            id,
            content,
            createdAt,
          }: {
            id: string;
            content: string;
            createdAt: Date;
          }) => (
            <View key={id} className="mt-4 rounded-xl bg-white shadow-sm">
              <View className="flex w-full flex-row items-center justify-between px-6 py-4 align-middle">
                <View className="flex flex-col">
                  <Text className="font-nunito-sans-bold text-xl text-slate-500">
                    <Text className="text-blue-500">{createdAt.getDate()}</Text>{" "}
                    {createdAt.toLocaleString("en", {
                      month: "long",
                    })}
                  </Text>
                  <Text className="pt-2 font-nunito-sans text-base">
                    {content}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => router.push("/notes/" + id)}>
                  <MaterialIcons
                    size={32}
                    name="chevron-right"
                    color="#3b82f6"
                  />
                </TouchableOpacity>
              </View>
            </View>
          ),
        )
      ) : (
        <View className="mt-4 rounded-xl bg-white shadow-sm">
          <View className="flex w-full flex-row items-center justify-between px-6 py-4 align-middle">
            <View className="flex flex-col">
              <Text className="font-nunito-sans-bold text-xl text-slate-500">
                No notes for now
              </Text>
              <Text className="pt-2 font-nunito-sans text-base">
                Create a new one right now
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push("/notes/new")}>
              <MaterialIcons size={32} name="chevron-right" color="#3b82f6" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </>
  );
}

export default function Index() {
  return (
    <SafeAreaView className="min-h-screen bg-off-white">
      <ScrollView
        className="min-h-max px-4"
        showsVerticalScrollIndicator={false}
      >
        <View className="h-full">
          <NextAppointment />
          <LastNotes />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
