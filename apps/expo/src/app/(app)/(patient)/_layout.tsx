import { Text } from "react-native";
import { Redirect, Stack } from "expo-router";
import { useUser } from "@clerk/clerk-expo";

export default function PsychLayout() {
    const { user } = useUser();

    if (!user) {
        return <Text>Loading...</Text>;
    }

    const isPatient = user.publicMetadata?.role === "patient";
    if (!isPatient) {
        return <Redirect href="/" />;
    }

    return (
        <Stack>
            <Stack.Screen
                name="profile"
                options={{
                    title: "Edit profile",
                    headerShown: false,
                }}
            />
        </Stack>
    );
}
