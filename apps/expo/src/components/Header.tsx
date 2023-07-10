import { Text, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

type HeaderProps = {
  title?: string;
};

export const Header = ({ title }: HeaderProps) => {
  const router = useRouter();

  return (
    <Stack.Screen
      options={{
        headerLeft: () => (
          <MaterialIcons
            size={32}
            name="chevron-left"
            onPress={() => router.back()}
          />
        ),
        headerTitle: () => (
          <Text className="font-nunito-sans text-base capitalize">{title}</Text>
        ),
        headerBackground: () => (
          <View className="h-full w-full bg-off-white"></View>
        ),
        headerBackVisible: false,
      }}
    />
  );
};
