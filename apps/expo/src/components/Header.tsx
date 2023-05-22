import { Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

type HeaderProps = {
  title: string;
  path: string;
};

export const Header = ({ title, path }: HeaderProps) => {
  const router = useRouter();

  return (
    <TouchableOpacity onPress={() => router.push(path)}>
      <View className="flex flex-row items-center pl-4 align-middle">
        <MaterialIcons size={32} name="chevron-left" />
        <Text className="font-nunito-sans text-base">{title}</Text>
      </View>
    </TouchableOpacity>
  );
};
