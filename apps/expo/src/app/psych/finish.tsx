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

function handleMode(x: string) {
  if (x === "online") return "Online";
  if (x === "person") return "In Person";
}

export default function SessionFinishAppointment() {
  const router = useRouter();
  const params = useSearchParams();

  return (
    <SafeAreaView>
      <View className="flex h-screen flex-col items-center justify-center bg-[#FAFAFA] px-4">
        <Text className="text-4xl" style={{ fontFamily: "Nunito-Sans-Bold" }}>
          You're all set!
        </Text>
        <View className="flex items-center justify-center pt-8">
          <Image
            alt=""
            source={require("../../../assets/success.png")}
            style={{ width: 250, height: 250 }}
            resizeMode="contain"
          />
        </View>
        <View className="w-4/5 pt-12">
          <Text className="text-center">
            <Text
              className="text-xl"
              style={{ fontFamily: "Nunito-Sans-Bold" }}
            >
              {params.psych}{" "}
            </Text>
            <Text
              className="text-slate-500 text-xl"
              style={{ fontFamily: "Nunito-Sans" }}
            >
              will be meeting with you on the the{" "}
            </Text>
            <Text
              className="text-xl"
              style={{ fontFamily: "Nunito-Sans-Bold" }}
            >
              {
                //(params.date as string).split("/")[1]} TODO: Descomentar quando os parâmetros estiverem sendo passados
                "Alguma Data"
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
          <View className="bg-blue-500 flex flex-row items-center justify-center rounded-xl px-12 py-3">
            <MaterialIcons size={24} name="schedule" color="white" />
            <Text
              style={{ fontFamily: "Nunito-Sans-Bold" }}
              className="text-white ml-2 text-xl"
            >
              Create appointment
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            router.push("/calendar");
          }}
          className="w-4/5 pt-4"
        >
          <View className="bg-white flex flex-row items-center justify-center rounded-xl px-12 py-3 shadow-sm">
            <Text style={{ fontFamily: "Nunito-Sans" }} className="text-xl">
              Message John
            </Text>
            <View className="ml-4 flex max-h-[24px] max-w-[24px] items-center justify-center overflow-hidden rounded-full align-middle">
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
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
