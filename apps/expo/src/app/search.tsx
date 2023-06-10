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

import { api } from "../utils/api";

export default function SearchScreen() {
  const [search, setSearch] = useState("");
  const [pressed, setPressed] = useState(false);

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
            <TouchableOpacity
              onPress={() => {
                setPressed(!pressed);
              }}
            >
              <View className="flex items-center justify-center rounded bg-blue-500 px-6 py-1">
                <Text className="font-['Nunito-Sans-Bold'] text-lg text-white">
                  Search
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <View className="flex flex-row items-center gap-x-4 px-4 pt-4 align-middle"></View>
        <ScrollView className="w-full" showsVerticalScrollIndicator={false}>
          {pressed && <List />}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
function List() {
  const { data, isLoading, isError, error } =
    api.users.getAllProfessionals.useQuery();
  const router = useRouter();

  if (isError) {
    return (
      <View className="flex  items-center justify-center">
        <Text>{JSON.stringify(error)}</Text>
      </View>
    );
  }

  if (isLoading || !data) {
    return (
      <View className="flex  items-center justify-center">
        <Text>Loading</Text>
      </View>
    );
  }
  return (
    <View className="flex w-full flex-col items-start justify-center gap-y-4 px-2">
      {data.map(({ firstName, lastName, profileImageUrl, id }) => {
        return (
          <TouchableOpacity
            className="flex flex-row gap-2"
            key={id}
            onPress={() => router.push(`/psych/${id}`)}
          >
            <Image
              className="flex items-center justify-center rounded-full"
              alt={`${firstName} ${lastName}' profile picture`}
              source={{
                uri: profileImageUrl,
                width: 48,
                height: 48,
              }}
            />
            <View className="flex flex-col justify-center align-middle">
              <Text className="-mb-1 font-['Nunito-Sans-Bold'] text-lg">
                {firstName} {lastName}
              </Text>
              <Text className="font-['Nunito-Sans'] text-slate-500">
                Psychologist - 32/43243
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
