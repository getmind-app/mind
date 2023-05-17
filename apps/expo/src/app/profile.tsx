import { Image, Pressable, SafeAreaView, Text, View } from "react-native";
import { useClerk } from "@clerk/clerk-expo";

import { api } from "../utils/api";

export default function UserProfileScreen() {
  const { user, signOut } = useClerk();

  return (
    <SafeAreaView className="p-4 pb-20">
      <View className="flex h-full justify-between">
        <View>
          <View className="flex flex-row justify-center">
            <Image
              className="rounded-full"
              alt={`${user?.firstName}'s profile picture`}
              source={{
                uri: user?.profileImageUrl,
                width: 100,
                height: 100,
              }}
            />
          </View>
          <View>
            {user?.fullName && (
              <Text className="text-center text-2xl">{user.fullName}</Text>
            )}
          </View>

          <Pressable onPress={() => signOut()}>
            <View className="border-red-900 bg-red-400 rounded-xl border py-2">
              <Text className="text-center text-2xl">Sign Out</Text>
            </View>
          </Pressable>
        </View>

        {process.env.NODE_ENV === "development" ? <DevelopmentOptions /> : null}
      </View>
    </SafeAreaView>
  );
}

function DevelopmentOptions() {
  const { mutateAsync } = api.users.clearMetadata.useMutation({});
  const { user } = useClerk();

  async function clearUserMetaData() {
    await mutateAsync();
    await user?.reload();
  }

  return (
    <View className="bg-gray-300 rounded-lg p-2">
      <Text className="text-center text-lg">Dev Options</Text>
      <Pressable onPress={clearUserMetaData}>
        <View className="bg-gray-500 flex h-12 items-center justify-center rounded p-2">
          <Text className="text-white">Reset user metadata</Text>
        </View>
      </Pressable>
    </View>
  );
}
