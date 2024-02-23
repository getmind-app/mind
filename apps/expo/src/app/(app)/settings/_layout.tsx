import { Stack } from "expo-router";

export default function SettingsLayout() {
    return (
        <Stack
            screenOptions={{
                headerBackVisible: false,
            }}
        >
            <Stack.Screen
                name="address"
                options={{
                    title: "Address",
                }}
            />
            <Stack.Screen
                name="available-hours"
                options={{
                    title: "Available Hours",
                }}
            />
            <Stack.Screen
                name="recurrences"
                options={{
                    title: "Recurrences",
                }}
            />
            <Stack.Screen
                name="finances"
                options={{
                    title: "Finances",
                }}
            />
        </Stack>
    );
}
