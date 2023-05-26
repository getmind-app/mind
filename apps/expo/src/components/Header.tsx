import { Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

type HeaderProps = {
  title: string;
};

export const Header = ({ title }: HeaderProps) => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity onPress={() => navigation.goBack()}>
      <View className="flex flex-row items-center pl-4 pt-2 align-middle">
        <MaterialIcons size={32} name="chevron-left" />
        <Text className="font-nunito-sans text-base">{title}</Text>
      </View>
    </TouchableOpacity>
  );
};
