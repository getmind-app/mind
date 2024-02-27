import { TouchableOpacity, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

import { BasicText } from "./BasicText";

type HeaderProps = {
    title?: string;
    goBack?: boolean;
    onShare?: () => void;
    onBack?: () => void;
};

export const Header = ({ title, onShare, onBack }: HeaderProps) => {
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
                    onShare && (
                        <View className="pr-4">
                            <TouchableOpacity onPress={() => onShare?.()}>
                                <MaterialIcons size={24} name="ios-share" />
                            </TouchableOpacity>
                        </View>
                    ),
                headerTitle: () => (
                    <BasicText size="xl" fontWeight="bold">
                        {title}
                    </BasicText>
                ),
                headerStyle: {
                    backgroundColor: "#f8f8f8",
                },
                headerShadowVisible: false,
            }}
        />
    );
};
