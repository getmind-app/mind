import { Stack } from "expo-router";

export default function OnboardLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="[id]"
                options={{
                    title: "Note",
                }}
            />
            <Stack.Screen
                name="new"
                options={{
                    title: "New note",
                }}
            />
        </Stack>
    );
}
