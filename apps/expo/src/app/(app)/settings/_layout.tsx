import { Stack } from "expo-router";

export default function SettingsLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen name="notifications" />
            <Stack.Screen name="finances" />
            <Stack.Screen name="recurrences" />
            <Stack.Screen name="(psych)" options={{ headerShown: false }} />
        </Stack>
    );
}
