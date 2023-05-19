import { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";

import { api } from "../utils/api";

export default function ChooseRole() {
  const { user } = useUser();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<
    "patient" | "professional"
  >();

  const { mutate, isLoading } = api.users.setMetadata.useMutation({
    onSuccess: async function () {
      await user?.reload();
      router.push("/");
    },
  });

  function handleNext() {
    if (selectedRole) {
      mutate({
        metadata: { role: selectedRole },
      });
    } else {
      throw new Error("No role selected");
    }
  }

  return (
    <SafeAreaView className="flex-1 flex-wrap items-center justify-center">
      <View className="flex w-full gap-y-8 px-4">
        <Text className="px-4 text-3xl">Who are you?</Text>
        <View className="items-center">
          <Pressable
            onPress={() => setSelectedRole("patient")}
            className={`w-full ${
              isLoading ? "opacity-30" : ""
            } relative overflow-hidden`}
          >
            <View
              className={`bg-white flex w-full flex-row rounded-xl border-2 shadow-sm ${
                selectedRole === "patient" ? "border-blue-500" : "border-white"
              }`}
            >
              <View className="items-center">
                <View className="gap-y-2 px-4 py-10">
                  <Text className="ml-4 text-2xl">Patient</Text>
                  <Text className="text-slate-500 ml-4 text-lg font-light">
                    Looking for help or just{"\n"}want to talk
                  </Text>
                </View>
              </View>
              <Image
                alt="Patient with a plant"
                source={require("../../assets/profissional_2.png")}
                className="absolute -bottom-2 right-4 h-36 w-36"
                resizeMode="contain"
              />
            </View>
          </Pressable>
        </View>
        <View className="items-center">
          <Pressable
            onPress={() => setSelectedRole("professional")}
            className={`relative w-full ${isLoading ? "opacity-30" : ""}`}
          >
            <View
              className={`bg-white flex w-full flex-row justify-end rounded-xl border-2 shadow-sm ${
                selectedRole === "professional"
                  ? "border-blue-500"
                  : "border-white"
              }`}
            >
              <Image
                alt="Psychologist reading a book"
                source={require("../../assets/paciente.png")}
                className="absolute bottom-0 left-6 h-36 w-36"
                resizeMode="contain"
              />
              <View className="w-3/4 items-center">
                <View className="gap-y-2 px-4 py-10">
                  <Text className="ml-4 text-2xl">Professional</Text>
                  <Text className="text-slate-500 ml-4 text-lg font-light">
                    Meet and help{"\n"}new patients
                  </Text>
                </View>
              </View>
            </View>
          </Pressable>
          <Pressable
            className="w-full"
            disabled={!selectedRole}
            onPress={handleNext}
          >
            <View
              className={` mt-8 flex w-full items-center  justify-center rounded-xl py-3 ${
                selectedRole ? "bg-blue-500" : "bg-gray-300 opacity-50"
              }`}
            >
              <Text
                style={{ fontFamily: "Nunito-Sans-Bold" }}
                className={`text-lg ${
                  selectedRole ? "text-white" : "text-black"
                }`}
              >
                Next
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
