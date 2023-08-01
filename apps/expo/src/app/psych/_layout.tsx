import { Stack } from "expo-router";

export default function PsychLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="[id]"
                options={{
                    title: "Professional",
                }}
            />
            <Stack.Screen
                name="schedule"
                options={{
                    title: "Schedule",
                }}
            />
            <Stack.Screen
                name="payment"
                options={{
                    title: "Payment",
                }}
            />
            <Stack.Screen
                name="finish"
                options={{
                    headerShown: false,
                }}
            />
        </Stack>
    );
}
