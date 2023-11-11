import { Text, TouchableOpacity, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

type HeaderProps = {
    title?: string;
    share?: boolean;
    goBack?: boolean;
    onShare?: () => void;
    onBack?: () => void;
};

export const Header = ({ title, share, onShare, onBack }: HeaderProps) => {
    const router = useRouter();

    function handleBack() {
        if (onBack) {
            onBack();
        } else {
            router.back();
        }
    }

    return (
        <Stack.Screen
            options={{
                headerLeft: () => (
                    <MaterialIcons
                        size={32}
                        name="chevron-left"
                        onPress={handleBack}
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
                headerStyle: { backgroundColor: "#f8f8f8" },
                headerShadowVisible: false,
                headerBackVisible: false,
            }}
        />
    );
};
