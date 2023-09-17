import { Text } from "react-native";
import { Redirect, Stack } from "expo-router";
import { useUser } from "@clerk/clerk-expo";

export default function PsychLayout() {
    const { user } = useUser();

    if (!user) {
        return <Text>Loading...</Text>;
    }

    const isPsych = user.publicMetadata?.role === "professional";
    if (!isPsych) {
        return <Redirect href="/" />;
    }

    return (
        <Stack>
            <Stack.Screen
                name="profile"
                options={{
                    title: "Edit profile",
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="address"
                options={{
                    title: "Address input",
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="available-hours"
                options={{
                    title: "Available hours",
                }}
            />
        </Stack>
    );
}
