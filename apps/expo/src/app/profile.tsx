import { Image, Pressable, SafeAreaView, Text, View } from "react-native";
import { useClerk } from "@clerk/clerk-expo";

export default function UserProfileScreen() {
  const { user, signOut } = useClerk();
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
      <Pressable onPress={() => signOut()}>
        <View className="border-red-900 bg-red-400 rounded-xl border py-2">
          <Text className="text-center text-2xl">Sign Out</Text>
        </View>
      </Pressable>
    </SafeAreaView>
  );
}
