import {
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter, useSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

export default function SessionFinishAppointment() {
  const router = useRouter();
  const params = useSearchParams();

  const { date, psych } = params;

  return (
    <SafeAreaView>
      <View className="flex flex-col items-center justify-center px-4 pt-28">
        <View className="flex items-center justify-center">
          <Image
            alt=""
            source={require("../../../assets/success.png")}
            style={{ width: 200, height: 200 }}
            resizeMode="contain"
          />
        </View>
        <Text className="font-nunito-sans-bold pt-8 text-4xl">
          You&apos;re all set!
        </Text>
        <View className="w-4/5 pt-2">
          <Text className="text-center">
            <Text className="font-nunito-sans-bold text-lg">{psych} </Text>
            <Text className="text-slate-500 font-nunito-sans text-lg">
              will be meeting with you on{" "}
            </Text>
            <Text className="font-nunito-sans-bold text-lg">{date}</Text>
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            router.push("/calendar");
          }}
          className="w-4/5 pt-8"
        >
          <View className="bg-blue-500 flex flex-row items-center justify-center rounded-xl px-6 py-2">
            <MaterialIcons size={24} name="schedule" color="white" />
            <Text className="text-white font-nunito-sans-bold ml-2 text-xl">
              Create event
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            router.push("/calendar");
          }}
          className="w-4/5 pt-4"
        >
          <View className="bg-white flex flex-row items-center justify-center rounded-xl px-12 py-2 shadow-sm">
            <Text className="font-nunito-sans text-xl">Message John</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
