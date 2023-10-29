import { Stack } from "expo-router";

export default function SettingsLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="personal-info"
                options={{
                    title: "Personal Info",
                }}
            />
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
        </Stack>
    );
}
