import { Stack } from "expo-router";

export default function PsychLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Psych Profile",
          headerShown: false,
        }}
      />
    </Stack>
  );
}
