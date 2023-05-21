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
    <SafeAreaView className="bg-off-white min-h-screen ">
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
              <View className="bg-blue-500 flex items-center justify-center rounded px-6 py-1">
                <Text className="text-white font-['Nunito-Sans-Bold'] text-lg">
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
                <TouchableOpacity onPress={() => router.push("/profile")}>
                  <Image
                    className="rounded-full"
                    alt={`${user?.firstName}'s profile picture`}
                    source={{
                      uri: user?.profileImageUrl,
                      width: 48,
                      height: 48,
                    }}
                  />
                </TouchableOpacity>

                <View className="ml-4 flex flex-col justify-center align-middle">
                  <Text className="-mb-1 font-['Nunito-Sans-Bold'] text-lg">
                    {user?.fullName}
                  </Text>
                  <Text className="text-slate-500 font-['Nunito-Sans']">
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
