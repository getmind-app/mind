import { Text, TouchableOpacity, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

type HeaderProps = {
    title?: string;
    share?: boolean;
    onShare?: () => void;
};

export const Header = ({ title, share, onShare }: HeaderProps) => {
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
                headerRight: () =>
                    share && (
                        <View className="pr-4">
                            <TouchableOpacity onPress={() => onShare?.()}>
                                <MaterialIcons size={24} name="ios-share" />
                            </TouchableOpacity>
                        </View>
                    ),
                headerTitle: () => (
                    <Text className="font-nunito-sans text-base capitalize">
                        {title}
                    </Text>
                ),
                headerBackground: () => (
                    <View className="h-full w-full bg-off-white"></View>
                ),
                headerBackVisible: false,
            }}
        />
    );
};
