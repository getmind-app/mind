import { Text, View } from "react-native";
import { useRouter } from "expo-router";

export default function ChatScreen() {
  const router = useRouter();

  return (
    <View className="bg-off-white h-screen items-center justify-center align-middle">
      <Text className="text-4xl" style={{ fontFamily: "Nunito-Sans" }}>
        CHAT, coming up...
      </Text>
    </View>
  );
}
