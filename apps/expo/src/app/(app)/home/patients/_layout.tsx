import { Stack } from "expo-router";

export default function OnboardLayout() {
    return (
        <Stack initialRouteName="patients">
            <Stack.Screen name="[patientId]" />
            <Stack.Screen name="index" />
        </Stack>
    );
}
