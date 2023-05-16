import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";

import { api } from "../utils/api";

export default function ChooseRole() {
  const { user } = useUser();
  const router = useRouter();
  const { mutate, isLoading } = api.users.setMetadata.useMutation({
    onSuccess: async function () {
      await user?.reload();
      router.push("/");
    },
  });

  const patientOnClick = () => {
    mutate({
      metadata: { role: "patient" },
    });
  };
  const professionalOnClick = () => {
    mutate({
      metadata: { role: "professional" },
    });
  };

  return (
    <SafeAreaView>
      <View className="mt-24">
        <View className="flex min-h-screen w-full gap-y-8 px-4">
          <Text className="fon px-4 text-3xl">Who are you?</Text>
          <View className="items-center">
            <TouchableOpacity
              onPress={patientOnClick}
              className={`w-full ${isLoading ? "opacity-30" : ""}`}
            >
              <View className="bg-white flex w-full flex-row rounded-xl shadow-sm">
                <View className="items-center">
                  <View className="gap-y-2 px-4 py-10">
                    <Text className="ml-4 text-2xl">Patient</Text>
                    <Text className="text-slate-500 ml-4 text-lg font-light">
                      Looking for help or just{"\n"}want to talk
                    </Text>
                  </View>
                </View>
                <Image
                  alt=""
                  source={require("../../assets/profissional_2.png")}
                  className="ml-1 mt-8 h-36 w-36"
                  resizeMode="contain"
                />
              </View>
            </TouchableOpacity>
          </View>
          <View className="items-center">
            <TouchableOpacity
              onPress={professionalOnClick}
              className={`w-full ${isLoading ? "opacity-30" : ""}`}
            >
              <View className="bg-white flex w-full flex-row rounded-xl shadow-sm">
                <Image
                  alt=""
                  source={require("../../assets/paciente.png")}
                  className="ml-9 mt-8 h-36 w-36"
                  resizeMode="contain"
                />
                <View className="items-center">
                  <View className="gap-y-2 px-4 py-10">
                    <Text className="ml-4 text-2xl">Professional</Text>
                    <Text className="text-slate-500 ml-4 text-lg font-light">
                      Meet and help{"\n"}new patients
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
