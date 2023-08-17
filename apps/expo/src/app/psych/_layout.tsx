import { Stack } from "expo-router";

export default function PsychLayout() {
    return (
        <Stack>
            <Stack.Screen name="[id]" />
            <Stack.Screen name="schedule" />
            <Stack.Screen name="payment" />
            <Stack.Screen
                name="finish"
                options={{
                    headerShown: false,
                }}
            />
        </Stack>
    );
}
