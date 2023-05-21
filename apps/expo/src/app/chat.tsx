import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useClerk } from "@clerk/clerk-expo";
import { MaterialIcons } from "@expo/vector-icons";

export default function ChatScreen() {
  const { user } = useClerk();
  const router = useRouter();

  return (
    <SafeAreaView className="bg-off-white min-h-screen ">
      <View className="h-full py-2">
        <View className="flex flex-row items-center justify-between px-4">
          <Text className="pt-12 font-['Nunito-Sans-Bold'] text-4xl">Chat</Text>
        </View>
        <View className="flex flex-row items-center gap-x-4 px-4 pt-4 align-middle"></View>
        <ScrollView
          className="min-h-max px-4 pt-4"
          showsVerticalScrollIndicator={false}
        >
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
                    <Text className="font-['Nunito-Sans-Bold']">
                      {user?.fullName}
                    </Text>
                    <View className="bg-blue-500 ml-2 h-2 w-2 rounded-full"></View>
                  </View>
                  <Text className="text-slate-500 font-['Nunito-Sans']">
                    Conteúdo da mensagem 😃
                  </Text>
                </View>
              </View>
              <MaterialIcons size={32} name="chevron-right" />
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
