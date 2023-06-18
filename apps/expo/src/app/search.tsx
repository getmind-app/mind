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

import { ProfileSkeleton } from "../components/ProfileSkeleton";
import { api } from "../utils/api";

export default function SearchScreen() {
  const [search, setSearch] = useState<string>("");

  return (
    <SafeAreaView className="min-h-screen bg-off-white ">
      <View className="h-full px-4">
        <View className="flex flex-col">
          <Text className="pt-12 font-nunito-sans-bold text-3xl">Search</Text>

          <View className="flex flex-row items-center justify-between pt-4 align-middle">
            <TextInput
              onChangeText={setSearch}
              autoFocus={false}
              value={search}
              placeholder="Looking for a therapist?"
            />
          </View>
        </View>
        <ScrollView className="w-full" showsVerticalScrollIndicator={false}>
          {search.length > 0 ? (
            <List search={search} />
          ) : (
            <View className="flex flex-col items-center justify-center gap-2 pt-32">
              <Image
                className="h-40 w-40"
                alt={`No therapists picture`}
                source={require("../../assets/login_mind.png")}
              />
              <Text className="font-nunito-sans-bold text-xl text-slate-500">
                Find your new therapist
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function List({ search }: { search: string }) {
  const { data, isLoading, isError, error } =
    api.therapists.findByNameLike.useQuery({ name: search });

  const router = useRouter();

  if (isError) {
    return (
      <View className="flex  items-center justify-center">
        <Text>{JSON.stringify(error)}</Text>
      </View>
    );
  }

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  return data.length > 0 ? (
    <View className="flex w-full flex-col items-start justify-center gap-y-4 pt-2">
      {data.map(({ name, profilePictureUrl, id, crp }) => (
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
            <Text className="-mb-1 font-nunito-sans-bold text-lg">{name}</Text>
            <Text className=" font-nunito-sans text-slate-500">
              Psychologist - {crp} {/*TODO: add mask*/}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  ) : (
    <View className="flex flex-col items-center justify-center gap-2 pt-32">
      <Image
        className="h-40 w-40"
        alt={`No therapists picture`}
        source={require("../../assets/login_mind.png")}
      />
      <Text className="font-nunito-sans-bold text-xl text-slate-500">
        No therapists found!
      </Text>
    </View>
  );
}
