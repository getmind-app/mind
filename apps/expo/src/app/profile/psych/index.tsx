import { SafeAreaView, Text, View } from "react-native";
import { Tabs, useNavigation, useRouter, useSearchParams } from "expo-router";
import { AntDesign } from "@expo/vector-icons";

export default function TherapistProfile() {
  const navigation = useNavigation();
  const router = useRouter();
  const params = useSearchParams();
  const { id = 42 } = params;

  return (
    <SafeAreaView>
      <View>
        <Text>meu 23123</Text>
        <Text className="bg-red-400 h-16 w-16">{id}</Text>
      </View>
    </SafeAreaView>
  );
}
