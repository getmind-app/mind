import React, { useState } from "react";
import {
  Image,
  ImageBackground,
  Linking,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Link } from "expo-router";
import { AntDesign, FontAwesome, MaterialIcons } from "@expo/vector-icons";

import { GradientText } from "../components/GradientText";
import { LogoSvg } from "../components/LogoSvg";

function NextMeetingCard() {
  const [nextScheduledTherapist, setNextScheduledTherapist] = useState("1");

  return (
    <View className="bg-white mx-4 mt-4 rounded-xl shadow-sm">
      <View className="px-8 pt-8">
        <View className="flex w-full flex-row">
          <Text className="text-xl" style={{ fontFamily: "Nunito-Sans" }}>
            Monday, 04/16
          </Text>
          <Text
            className="text-blue-500 order-last ml-auto text-xl"
            style={{ fontFamily: "Nunito-Sans-Bold" }}
          >
            8:30
          </Text>
        </View>
        <Text
          className="text-slate-500 text-sm"
          style={{ fontFamily: "Nunito-Sans" }}
        >
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
            <Text
              className="ml-2 text-xl"
              style={{ fontFamily: "Nunito-Sans" }}
            >
              John Williams{" "}
            </Text>
          </View>
          <MaterialIcons
            style={{ paddingRight: 8 }}
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
          <Text
            style={{ fontFamily: "Nunito-Sans-Bold" }}
            className="text-white ml-4 text-lg"
          >
            Join the meeting
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

function LastNotesCard() {
  return (
    <View className="relative mt-4 rounded-2xl bg-[#F8F8F8] p-3">
      <View>
        <SingleNote />
        <SingleNote />
        <View className="flex flex-row justify-center">
          <Text className="text-gray-500 text-sm underline">Ver notas</Text>
        </View>
      </View>
    </View>
  );
}

export default function Index() {
  return (
    <SafeAreaView className="min-h-screen bg-[#FFF] px-4 pt-8">
      <ScrollView className="min-h-max" showsVerticalScrollIndicator={false}>
        <View className="h-full py-2">
          <View className="flex flex-row items-center justify-between px-4">
            <Text
              className="mt-12 text-4xl"
              style={{ fontFamily: "Nunito-Sans-Bold" }}
            >
              Next session
            </Text>
          </View>
          <NextMeetingCard />
          <View className="px-4">
            <Text
              className="mt-8 text-4xl"
              style={{ fontFamily: "Nunito-Sans-Bold" }}
            >
              Last notes
            </Text>
          </View>
          <LastNotesCard />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SingleNote() {
  return (
    <View className="mb-2">
      <View className="flex flex-row items-center justify-start text-sm ">
        <GradientText>16th</GradientText>
        <View className="my-auto">
          <Text> February 2023</Text>
        </View>
      </View>
      <View className="flex flex-row items-center justify-evenly rounded-lg bg-[#EBEBEB] px-2 py-4">
        <Text className="text-2xl">😀</Text>
        <Text className="mx-auto w-full max-w-[75%] text-xs">
          I feel very pressured with all the demands of work and family life. I
          become...
        </Text>
        <AntDesign name="right" />
      </View>
    </View>
  );
}
