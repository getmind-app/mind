import { Stack } from "expo-router";

export default function OnboardLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    title: "Choose role",
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="psych"
                options={{
                    title: "Psych onboard",
                    headerShown: false,
                }}
            />
        </Stack>
    );
}
