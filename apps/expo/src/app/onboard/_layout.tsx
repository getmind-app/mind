import { Stack } from "expo-router";

export default function PatientLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="patient-profile" />
            <Stack.Screen name="therapist-profile" />

            {/* Therapist Address - cant go back to previous screen  */}
            <Stack.Screen
                name="therapist-address"
                options={{ headerShown: false, gestureEnabled: false }}
            />
        </Stack>
    );
}
