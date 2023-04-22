import {
  Button,
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import {
  Link,
  Tabs,
  useNavigation,
  useRouter,
  useSearchParams,
} from "expo-router";
import { AntDesign, EvilIcons, MaterialIcons } from "@expo/vector-icons";

import { LogoSvg } from "../../../components/LogoSvg";

export default function TherapistProfile() {
  const navigation = useNavigation();
  const router = useRouter();
  const params = useSearchParams();
  const { id = 42 } = params;

  return (
    <SafeAreaView className="bg-[#DFDFDF] px-4 pt-8">
      <ScrollView className="min-h-screen" showsVerticalScrollIndicator={false}>
        <View className="h-full py-2">
          <View className="mb-16 flex flex-row  items-center justify-end px-4">
            <View>
              <LogoSvg className="m-auto mb-2" />
            </View>
          </View>
          <View className="relative mb-24 rounded-2xl bg-[#F8F8F8] p-3  pt-14">
            <View className="p-1/2 absolute  -top-[72px] left-8 flex h-28 w-28 items-center justify-center overflow-hidden rounded-full">
              <Image
                source={{
                  uri: "https://images.pexels.com/photos/4098353/pexels-photo-4098353.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
                  width: 126,
                  height: 126,
                }}
              />
            </View>
            <View className="pl-2">
              <Text className="mb-2 text-2xl font-bold">Maria Helena Cruz</Text>

              <View className="mb-2 flex flex-row justify-between">
                <View className="flex w-1/2 flex-row items-center">
                  <EvilIcons color={"#666666"} size={20} name="location" />
                  <Text className="ml-2 text-[#666666]">
                    Palo Alto, California
                  </Text>
                </View>
                <View className="flex w-1/2 flex-row items-center">
                  <MaterialIcons color={"#666666"} size={20} name="wifi" />
                  <Text className="ml-2 text-[#666666]">Online</Text>
                </View>
              </View>
              <View className="flex flex-row justify-between">
                <View className="flex w-1/2 flex-row items-center">
                  <MaterialIcons
                    color={"#666666"}
                    size={20}
                    name="attach-money"
                  />
                  <Text className="ml-2 text-[#666666]">80,00</Text>
                </View>

                <View className="flex w-1/2 flex-row items-center">
                  <MaterialIcons color={"#666666"} size={20} name="home" />
                  <Text className="ml-2 text-[#666666]">In-person</Text>
                </View>
              </View>
              <View className="mt-3">
                <View>
                  <Text className="text-2xl">About me</Text>
                </View>
                <View className="mt-3 flex flex-row items-center justify-evenly rounded-lg bg-[#EBEBEB] px-2 py-4">
                  <Text className="ml-2 text-lg">🗣️</Text>
                  <Text className="ml-4 mr-auto w-full max-w-[75%] text-xs">
                    I really enjoy helping people find peace of mind. I believe
                    I was born with a mission to assist everyone who seeks
                    self-awareness and personal growth.
                  </Text>
                </View>
              </View>
              <View className="mt-3">
                <View>
                  <Text className="text-2xl">Education</Text>
                </View>
                <View className="mt-3 flex flex-row items-center justify-evenly rounded-lg bg-[#EBEBEB] px-2 py-4">
                  <Text className="ml-2 text-lg">🎓</Text>
                  <View className="ml-4 mr-auto w-full max-w-[75%]">
                    <Text className="text-xs">
                      Bachelor's Degree in Psychology - Federal University of
                      Paraná (PR)
                    </Text>
                    <Text className="text-xs">
                      Postgraduate degree in Life Therapy - University of São
                      Paulo (SP)
                    </Text>
                  </View>
                </View>
              </View>
              <View className="mt-5">
                <View className="mb-3">
                  <Text className="text-2xl">Methodologies</Text>
                </View>
                <View className="mt-3 flex flex-row flex-wrap items-center gap-2">
                  <View className="flex flex-row items-center justify-between rounded-full bg-[#2185EE] px-4 py-1 pr-2">
                    <Text className="text-white">Behaviorism</Text>
                    <View className="bg-white ml-3 flex h-6 w-6 items-center justify-center rounded-full">
                      <Text className="text-sm font-bold text-[#74a7dd]">
                        ?
                      </Text>
                    </View>
                  </View>
                  <View className="flex flex-row items-center justify-between rounded-full bg-[#2185EE] px-4 py-1 pr-2">
                    <Text className="text-white">Bioenergetic</Text>
                    <View className="bg-white ml-3 flex h-6 w-6 items-center justify-center rounded-full">
                      <Text className="text-sm font-bold text-[#74a7dd]">
                        ?
                      </Text>
                    </View>
                  </View>
                  <View className="flex flex-row items-center justify-between rounded-full bg-[#2185EE] px-4 py-1 pr-2">
                    <Text className="text-white">
                      Cognitive Behavioral Therapy
                    </Text>
                    <View className="bg-white ml-3 flex h-6 w-6 items-center justify-center rounded-full">
                      <Text className="text-sm font-bold text-[#74a7dd]">
                        ?
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
              <View className="mt-6 flex flex-row justify-between">
                <Link
                  className="w-1/3 rounded-lg  bg-[#EBEBEB] p-4 text-center"
                  href={"/chat"}
                >
                  <Text>Chat</Text>
                </Link>
                <Link
                  className="w-3/5 rounded-lg  bg-[#2185EE] p-4 text-center"
                  href={"/profile/psych/schedule"}
                >
                  <Text>Schedule</Text>
                </Link>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
