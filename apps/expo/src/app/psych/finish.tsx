import {
  Image,
  ImageBackground,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Link, useRouter, useSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

export default function SessionFinishAppointment() {
  const router = useRouter();
  const params = useSearchParams();

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
        <Text
          className="pt-8 text-4xl"
          style={{ fontFamily: "Nunito-Sans-Bold" }}
        >
          You&apos;re all set!
        </Text>
        <View className="w-4/5 pt-2">
          <Text className="text-center">
            <Text
              className="text-lg"
              style={{ fontFamily: "Nunito-Sans-Bold" }}
            >
              {params.psych}{" "}
            </Text>
            <Text
              className="text-slate-500 text-lg"
              style={{ fontFamily: "Nunito-Sans" }}
            >
              will be meeting with you on the the{" "}
            </Text>
            <Text
              className="text-lg"
              style={{ fontFamily: "Nunito-Sans-Bold" }}
            >
              {
                ""
                //{(params.date as string).split("/")[1]}
              }
            </Text>
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
            <Text
              style={{ fontFamily: "Nunito-Sans-Bold" }}
              className="text-white ml-2 text-xl"
            >
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
            <Text style={{ fontFamily: "Nunito-Sans" }} className="text-xl">
              Message John
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
