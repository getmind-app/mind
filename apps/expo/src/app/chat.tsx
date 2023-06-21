import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useClerk } from "@clerk/clerk-expo";
import { MaterialIcons } from "@expo/vector-icons";

export default function ChatScreen() {
  const { user } = useClerk();
  const router = useRouter();

  return (
    <SafeAreaView className="min-h-screen bg-off-white ">
      <ScrollView className="px-4" showsVerticalScrollIndicator={false}>
        <Text className="pt-12 font-nunito-sans-bold text-3xl">Chat</Text>
        <View className="flex flex-col">
          <View className="flex flex-row items-center justify-between align-middle">
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
                <View className="flex flex-row items-center align-middle">
                  <Text className="font-nunito-sans-bold">
                    {user?.fullName}
                  </Text>
                  <View className="ml-2 h-2 w-2 rounded-full bg-blue-500"></View>
                </View>
                <Text className="font-nunito-sans text-slate-500">
                  Conteúdo da mensagem 😃
                </Text>
              </View>
            </View>
            <MaterialIcons size={32} name="chevron-right" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
