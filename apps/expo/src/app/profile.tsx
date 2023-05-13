import { Image, Pressable, SafeAreaView, Text, View } from "react-native";
import { useClerk } from "@clerk/clerk-expo";

import { api } from "../utils/api";

export default function UserProfileScreen() {
  const { user, signOut } = useClerk();
  const { mutate } = api.users.setMetadata.useMutation({});

  const patientOnClick = () => {
    mutate({
      metadata: { role: "patient" },
    });
  };

  return (
    <SafeAreaView className="p-4">
      <View className="flex flex-row justify-center ">
        <Image
          className="rounded-full"
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

      <Pressable onPress={() => patientOnClick()}>
        <View className="border-blue-900 bg-blue-300 rounded-xl border py-2">
          <Text className="text-center text-2xl">I'm a patient</Text>
        </View>
      </Pressable>

      <Pressable onPress={() => signOut()}>
        <View className="border-red-900 bg-red-400 rounded-xl border py-2">
          <Text className="text-center text-2xl">Sign Out</Text>
        </View>
      </Pressable>
    </SafeAreaView>
  );
}
