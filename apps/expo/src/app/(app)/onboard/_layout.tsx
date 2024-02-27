import { Text } from "react-native";
import { Stack } from "expo-router";
import { useUser } from "@clerk/clerk-expo";

export default function PatientLayout() {
    const { user } = useUser();

    if (!user) {
        return <Text>Loading...</Text>;
    }

    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="patient-profile" />
            <Stack.Screen name="therapist-profile" />
            <Stack.Screen name="therapist-address" />
        </Stack>
    );
}
