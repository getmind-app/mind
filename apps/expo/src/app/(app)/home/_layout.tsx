import { Stack } from "expo-router";

export default function OnboardLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name="index"
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen name="notes" options={{ headerShown: false }} />
        </Stack>
    );
}
