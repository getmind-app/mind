import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Image,
  ImageBackground,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Link, useNavigation, useRouter, useSearchParams } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";

import { LogoSvg } from "../../../../components/LogoSvg";

function handleMode(x: string) {
  if (x === "online") return "Online";
  if (x === "person") return "In Person";
}

export default function SessionFinishAppointment() {
  const router = useRouter();
  const params = useSearchParams();

  return (
    <SafeAreaView className="bg-[#FFF] px-4 pt-8">
      <ScrollView
        className="min-h-screen"
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
      >
        <View className=" -mb-4 mt-2  flex flex-row items-center justify-end px-4">
          <View>
            <LogoSvg className="m-auto" />
          </View>
        </View>
        <View className="relative mt-8 rounded-2xl bg-[#f8f8f8] p-4">
          <Text className="mb-4 text-2xl">All set!</Text>
          <Text className="mb-2 text-lg text-[#666666]">
            {params.psych} will be meeting with you on the{" "}
            {(params.date as string).split("/")[1]}th
          </Text>
          <View className="rounded-lg bg-[#EBEBEB] p-4">
            <View className="flex flex-row items-center justify-between">
              <View className="w-4/5">
                <Text className="text-xs">
                  I'm excited to know more about you!
                </Text>
                <Text className="text-xs">
                  If you have any questions about me or the session please hit
                  me up on our chat
                </Text>
              </View>
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
                      pathname: `/profile/psych`,
                      params: { id: 42 },
                    }}
                  />
                </ImageBackground>
              </View>
            </View>

            <Pressable className="bg-green-400 mt-3 rounded-md py-2">
              <Text className="text-center">Chat</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
