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

function NextMeetingCard() {
  const [nextScheduledTherapist, setNextScheduledTherapist] = useState("1");
  const router = useRouter();

  return (
    <View className="mt-4 rounded-xl bg-white shadow-sm">
      <View className="px-6 pt-6">
        <View className="flex w-full flex-row">
          <Text className="font-nunito-sans text-xl">Monday, 04/16</Text>
          <Text className="order-last ml-auto font-nunito-sans-bold text-xl text-blue-500 ">
            8:30
          </Text>
        </View>
        <Text className="font-nunito-sans text-sm text-slate-500">
          via Google Meet
        </Text>
        <View className="mt-4 flex w-full flex-row items-center justify-between align-middle">
          <View className="flex flex-row items-center align-middle">
            <View className="flex max-h-[32px] max-w-[32px] items-center justify-center overflow-hidden rounded-full align-middle">
              <TouchableOpacity onPress={() => router.push("/psych")}>
                <Image
                  className="flex items-center justify-center rounded-full"
                  alt="John Williams' profile picture"
                  source={{
                    uri: "https://images.pexels.com/photos/4098353/pexels-photo-4098353.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
                    width: 48,
                    height: 48,
                  }}
                />
              </TouchableOpacity>
            </View>
            <Text className="ml-2 font-nunito-sans text-xl">
              John Williams{" "}
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
        onPress={() => Linking.openURL("https://meet.google.com/xcc-pqgk-gxx")}
      >
        <View className="mt-6 flex w-full flex-row items-center justify-center rounded-bl-xl rounded-br-xl bg-blue-500 py-3 align-middle">
          <FontAwesome size={20} color="white" name="video-camera" />
          <Text className="ml-4 font-nunito-sans-bold text-lg text-white">
            Join the meeting
          </Text>
        </View>
      </TouchableOpacity>
    </View>
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
          <View className="flex flex-row items-center justify-between">
            <Text className="mt-12 font-nunito-sans-bold text-3xl">
              Next session
            </Text>
          </View>
          <NextMeetingCard />
          <Text className="mt-8 font-nunito-sans-bold text-3xl">
            Last notes
          </Text>
          <LastNotes />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
