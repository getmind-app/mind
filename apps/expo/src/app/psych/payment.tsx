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
import { FontAwesome5 } from "@expo/vector-icons";

import { LogoSvg } from "../../components/LogoSvg";

function handleMode(x: string) {
  if (x === "online") return "Online";
  if (x === "person") return "In Person";
}

export default function SessionPayment() {
  const navigation = useNavigation();
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
          <Text className="mb-4 text-2xl">
            Appointments with {params.psych}
          </Text>
          <View className="mb-6">
            <View className="mb-2">
              <Text className="mb-2 text-sm">Details</Text>
              <Text className="mb-2 ml-3 text-[#666666]">
                Appointments with {params.psych}
              </Text>
              <View>
                <View className="ml-6 flex flex-row justify-between">
                  <Text className=" text-[#666666]">
                    {params.date} - {params.hour} -{" "}
                    {/* TODO: tirar type casting */}
                    {handleMode(params.mode as string)}
                  </Text>
                  <Text className=" text-[#666666]">USD 80,00</Text>
                </View>
              </View>
            </View>
            <View className="mb-2">
              <Text className="text-sm">Discount</Text>
              <View>
                <View className="ml-3 flex flex-row justify-between">
                  <Text className=" text-[#666666]">
                    First Appointment (10%)
                  </Text>
                  <Text className="text-green-500">- USD 8,00</Text>
                </View>
              </View>
            </View>

            <View className="flex flex-row justify-between">
              <Text>Total</Text>
              <Text>USD 72,00</Text>
            </View>
          </View>
          <View>
            <Text className="mb-2 text-base">Payment method</Text>
            <View className="flex flex-row items-center rounded-lg bg-[#E9E9E9] p-3  px-5">
              <View className="flex flex-row items-center">
                <FontAwesome5 size={32} name="cc-visa" />
                <Text className="ml-4 font-bold">**** 2215</Text>
              </View>
              <View className="ml-auto flex flex-row items-center">
                <FontAwesome5 name="chevron-down" />
              </View>
            </View>
            <Text className="ml-2 text-xs text-[#666666]">
              The payment will be processed a day before each session
            </Text>
          </View>
        </View>
        <View className="relative mt-4 rounded-2xl bg-[#f8f8f8] p-4">
          <Text className="mb-2 text-2xl">Confirm sessions</Text>
          <Text className="mb-4 text-xs text-[#666666]">
            You can cancel or reschedule your sessions up to 24 hours before
          </Text>
          <Pressable
            onPress={() => {
              navigation.navigate(`psych/finish/index`, params);
            }}
            className={`rounded-lg bg-[#2185EE] px-16 py-3`}
          >
            <Text className={`text-white text-center font-bold`}>Confirm</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
