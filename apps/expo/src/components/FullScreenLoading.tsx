import { ActivityIndicator, View } from "react-native";

export function FullScreenLoading() {
    return (
        <View
            style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <ActivityIndicator size={"large"} color={"#3b82f6"} />
        </View>
    );
}
