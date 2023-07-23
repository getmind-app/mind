import { Stack } from "expo-router";

export default function SettingsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="available-hours"
        options={{
          title: "Available hours",
          headerShown: false,
        }}
      />
    </Stack>
  );
}
