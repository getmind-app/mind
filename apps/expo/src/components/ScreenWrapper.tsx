import { SafeAreaView, View } from "react-native";

export const ScreenWrapper = ({
    children,
}: {
    children: React.ReactNode;
}): JSX.Element => {
    return (
        <SafeAreaView
            style={{
                flex: 1,
                backgroundColor: "#f8f8f8",
            }}
        >
            <View
                style={{
                    flex: 1,
                    padding: 30,
                    paddingHorizontal: 16,
                    paddingTop: 48,
                }}
            >
                {children}
            </View>
        </SafeAreaView>
    );
};
