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

// TODO: fazer a busca na base, único problema é a foto de perfil... poderíamos manter ela na base tb (url)
export default function SearchScreen() {
  const [search, setSearch] = useState("");
  const [pressed, setPressed] = useState(false);

  return (
    <SafeAreaView className="min-h-screen bg-off-white ">
      <View className="h-full px-4 py-2">
        <View className="flex flex-col">
          <Text className="pt-12 font-nunito-sans-bold text-3xl">Search</Text>

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
                <Text className="font-nunito-sans-bold text-lg text-white">
                  Search
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView className="w-full" showsVerticalScrollIndicator={false}>
          {pressed && <List />}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
function List() {
  const { data, isLoading, isError, error } = api.therapists.findAll.useQuery();
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
    <View className="flex w-full flex-col items-start justify-center gap-y-4">
      {data.map(({ name, profilePictureUrl, id, crp }) => {
        return (
          <TouchableOpacity
            className="flex flex-row items-center gap-4 align-middle"
            key={id}
            onPress={() => router.push(`/psych/${id}`)}
          >
            <Image
              className="rounded-full"
              alt={`${name}' profile picture`}
              source={{
                uri: profilePictureUrl,
                width: 48,
                height: 48,
              }}
            />
            <View className="flex flex-col justify-center align-middle">
              <Text className="-mb-1 font-nunito-sans-bold text-lg">
                {name}
              </Text>
              <Text className=" font-nunito-sans text-slate-500">
                Psychologist - {crp} {/*TODO: add mask*/}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
