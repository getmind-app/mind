import { Stack } from "expo-router";

export default function PsychLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="schedule" />
      <Stack.Screen name="payment" />
      <Stack.Screen name="finish" />
    </Stack>
  );
}
