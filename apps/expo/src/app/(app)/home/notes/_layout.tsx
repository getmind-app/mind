import { Stack } from "expo-router";

export default function OnboardLayout() {
    return (
        <Stack initialRouteName="notes">
            <Stack.Screen name="[id]" />
            <Stack.Screen name="new" />
        </Stack>
    );
}
