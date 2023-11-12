import { View } from "react-native";
import { Stack } from "expo-router";

import { Loading } from "./Loading";

export function FullScreenLoading() {
    return (
        <>
            <Stack.Screen
                options={{
                    headerShown: false,
                }}
            />
            <View
                style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#f8f8f8",
                }}
            >
                <Loading size={"large"} />
            </View>
        </>
    );
}
