import { useState } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useClerk } from "@clerk/clerk-expo";

export default function SearchScreen() {
  const [search, setSearch] = useState("");
  const router = useRouter();
  const { user } = useClerk();

  return (
    <SafeAreaView className="min-h-screen bg-off-white ">
      <View className="h-full py-2">
        <View className="flex flex-col px-4">
          <Text className="pt-12 font-['Nunito-Sans-Bold'] text-3xl">
            Search
          </Text>
          <View className="flex flex-row items-center justify-between pt-4 align-middle">
            <TextInput
              onChangeText={setSearch}
              autoFocus={false}
              value={search}
              placeholder="Looking for a therapist?"
            />
            <TouchableOpacity>
              <View className="flex items-center justify-center rounded bg-blue-500 px-6 py-1">
                <Text className="font-['Nunito-Sans-Bold'] text-lg text-white">
                  Search
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <View className="flex flex-row items-center gap-x-4 px-4 pt-4 align-middle"></View>
        <ScrollView
          className="min-h-max px-4 pt-4"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex flex-col">
            <View className="flex flex-row items-center align-middle">
              <View className="flex flex-row">
                <View className="flex items-center justify-center overflow-hidden rounded-full align-middle">
                  <TouchableOpacity onPress={() => router.push("/psych")}>
                    <Image
                      className="flex items-center justify-center rounded-full"
                      alt="John Williams' profile picture"
                      source={{
                        uri: "https://images.pexels.com/photos/4098353/pexels-photo-4098353.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
                        width: 48,
                        height: 48,
                      }}
                    />
                  </TouchableOpacity>
                </View>

                <View className="ml-4 flex flex-col justify-center align-middle">
                  <Text className="-mb-1 font-['Nunito-Sans-Bold'] text-lg">
                    John Michael Williams
                  </Text>
                  <Text className="font-['Nunito-Sans'] text-slate-500">
                    Psychologist - 32/43243
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
