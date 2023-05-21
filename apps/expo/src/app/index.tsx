import React, { useState } from "react";
import {
  ImageBackground,
  Linking,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";

function NextMeetingCard() {
  const [nextScheduledTherapist, setNextScheduledTherapist] = useState("1");

  return (
    <View className="bg-white mx-4 mt-4 rounded-xl shadow-sm">
      <View className="px-6 pt-6">
        <View className="flex w-full flex-row">
          <Text className="font-nunito-sans text-xl">Monday, 04/16</Text>
          <Text className="text-blue-500 order-last ml-auto text-xl ">
            8:30
          </Text>
        </View>
        <Text className="text-slate-500 font-nunito-sans text-sm">
          via Google Meet
        </Text>
        <View className="mt-4 flex w-full flex-row items-center justify-between align-middle">
          <View className="flex flex-row items-center align-middle">
            <View className="flex max-h-[32px] max-w-[32px] items-center justify-center overflow-hidden rounded-full align-middle">
              <ImageBackground
                source={{
                  uri: "https://images.pexels.com/photos/4098353/pexels-photo-4098353.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
                }}
                resizeMode="contain"
              >
                <Link
                  className=" flex h-16 w-16 items-center justify-center"
                  href={{
                    pathname: `/psych`,
                    params: { id: nextScheduledTherapist },
                  }}
                />
              </ImageBackground>
            </View>
            <Text className="font-nunito-sans ml-2 text-xl">
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
        <View className="bg-blue-500 mt-6 flex w-full flex-row items-center justify-center rounded-bl-xl rounded-br-xl py-3 align-middle">
          <FontAwesome size={20} color="white" name="video-camera" />
          <Text className="font-nunito-sans-bold text-white ml-4 text-lg">
            Join the meeting
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

function LastNotes() {
  const router = useRouter();

  const notes = () => {
    router.push("/chat");
  };

  return (
    <View>
      <View className="bg-white mx-4 mt-4 rounded-xl shadow-sm">
        <View className="flex w-full flex-row items-center justify-between px-6 py-4 align-middle">
          <View className="flex w-72 flex-col">
            <View className="flex flex-row">
              <Text className="text-blue-500 font-nunito-sans-bold text-xl">
                5
              </Text>
              <Text className="font-nunito-sans text-xl">, May</Text>
            </View>
            <Text className="font-nunito-sans mt-2 text-base">
              I feel very pressured with all the demands of work and family
              life. I become...
            </Text>
          </View>
          <TouchableOpacity className="mr-2" onPress={notes}>
            <View className="bg-blue-500 rounded-full">
              <View className="items-center">
                <MaterialIcons size={32} name="arrow-right" color="white" />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <View className="bg-white mx-4 mt-4 rounded-xl shadow-sm">
        <View className="flex w-full flex-row items-center justify-between px-6 py-4 align-middle">
          <View className="flex w-72 flex-col">
            <View className="flex flex-row">
              <Text className="text-blue-500 font-nunito-sans-bold text-xl">
                12
              </Text>
              <Text className="font-nunito-sans text-xl">, April</Text>
            </View>
            <Text className="font-nunito-sans mt-2 text-base">
              I feel very pressured with all the demands of work and family
              life. I become...
            </Text>
          </View>
          <TouchableOpacity className="mr-2" onPress={notes}>
            <View className="bg-blue-500 rounded-full">
              <View className="items-center">
                <MaterialIcons size={32} name="arrow-right" color="white" />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function Index() {
  return (
    <SafeAreaView className="bg-off-white min-h-screen px-4 pt-8">
      <ScrollView className="min-h-max" showsVerticalScrollIndicator={false}>
        <View className="h-full py-2">
          <View className="flex flex-row items-center justify-between px-4">
            <Text className="font-nunito-sans-bold mt-12 text-4xl">
              Next session
            </Text>
          </View>
          <NextMeetingCard />
          <View className="px-4">
            <Text className="font-nunito-sans-bold mt-8 text-4xl">
              Last notes
            </Text>
          </View>
          <LastNotes />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
