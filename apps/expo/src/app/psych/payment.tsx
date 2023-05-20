import { Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { useRouter, useSearchParams } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";

function handleMode(x: string) {
  if (x === "online") return "Online";
  if (x === "person") return "In Person";
}

export default function SessionPayment() {
  const params = useSearchParams();
  const router = useRouter();

  return (
    <SafeAreaView className="bg-off-white">
      <ScrollView
        className="min-h-screen  px-4 pt-8"
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
      >
        <View className="relative mt-8 rounded-2xl bg-[#f8f8f8] p-4 pt-6">
          <Text
            className="mb-4 text-2xl"
            style={{ fontFamily: "Nunito-Sans-Bold" }}
          >
            Appointments with {params.psych}
          </Text>
          <View className="mb-8">
            <View className="mb-2">
              <Text
                style={{ fontFamily: "Nunito-Sans" }}
                className="mb-2 text-sm"
              >
                Details
              </Text>
              <Text
                style={{ fontFamily: "Nunito-Sans" }}
                className="mb-2 ml-3 text-[#666666]"
              >
                Appointments with {params.psych}
              </Text>
              <View>
                <View className="ml-6 flex flex-row justify-between">
                  <Text
                    style={{ fontFamily: "Nunito-Sans" }}
                    className="text-[#666666]"
                  >
                    {params.date} - {params.hour} -{" "}
                    {/* TODO: tirar type casting */}
                    {handleMode(params.mode as string)}
                  </Text>
                  <Text
                    style={{ fontFamily: "Nunito-Sans" }}
                    className=" text-[#666666]"
                  >
                    USD 80,00
                  </Text>
                </View>
              </View>
            </View>
            <View className="mb-4">
              <Text
                style={{ fontFamily: "Nunito-Sans" }}
                className="mb-2 text-sm"
              >
                Discount
              </Text>
              <View>
                <View className="ml-3 flex flex-row justify-between">
                  <Text
                    style={{ fontFamily: "Nunito-Sans" }}
                    className=" text-[#666666]"
                  >
                    First Appointment (10%)
                  </Text>
                  <Text
                    style={{ fontFamily: "Nunito-Sans" }}
                    className="text-green-500"
                  >
                    - USD 8,00
                  </Text>
                </View>
              </View>
            </View>

            <View className="flex flex-row justify-between">
              <Text style={{ fontFamily: "Nunito-Sans" }}>Total</Text>
              <Text style={{ fontFamily: "Nunito-Sans" }}>USD 72,00</Text>
            </View>
          </View>
          <View>
            <Text
              style={{ fontFamily: "Nunito-Sans-Bold" }}
              className="mb-4 text-2xl"
            >
              Payment method
            </Text>
            <View className="mb-2 flex flex-row items-center rounded-lg bg-[#E9E9E9] px-5 py-4">
              <View className="flex flex-row items-center">
                <FontAwesome5 size={24} name="cc-visa" />
                <Text
                  style={{ fontFamily: "Nunito-Sans-Bold" }}
                  className="ml-4"
                >
                  **** 2215
                </Text>
              </View>
              <View className="ml-auto flex flex-row items-center">
                <FontAwesome5 name="chevron-down" />
              </View>
            </View>
            <Text
              style={{ fontFamily: "Nunito-Sans" }}
              className="ml-2 text-xs text-[#666666]"
            >
              The payment will be processed a day before each session.
            </Text>
          </View>
        </View>
        <View className="relative mt-4 rounded-2xl bg-[#f8f8f8] p-4">
          <Text
            style={{ fontFamily: "Nunito-Sans-Bold" }}
            className="mb-2 text-2xl"
          >
            Confirm sessions
          </Text>
          <Text
            style={{ fontFamily: "Nunito-Sans" }}
            className="mb-4 text-xs text-[#666666]"
          >
            You can cancel or reschedule your sessions up to 24 hours before.
          </Text>
          <Pressable
            onPress={() => {
              router.push({ pathname: "psych/finish", params: params }); // TODO: Não sei pq esses params não são passados
            }}
            className={`rounded-lg bg-[#2185EE] px-16 py-3`}
          >
            <Text
              style={{ fontFamily: "Nunito-Sans-Bold" }}
              className={`text-white text-center text-base`}
            >
              Confirm
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
