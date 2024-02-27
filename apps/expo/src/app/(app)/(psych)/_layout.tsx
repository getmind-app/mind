import { Redirect, Stack } from "expo-router";

import { useUserIsProfessional } from "../../../hooks/user/useUserIsProfessional";

export default function PsychLayout() {
    const isProfessional = useUserIsProfessional();

    if (!isProfessional) {
        return <Redirect href="/" />;
    }

    return (
        <Stack
            screenOptions={{
                headerBackVisible: false,
            }}
        >
            <Stack.Screen name="patients/index" />
            <Stack.Screen name="patients/[patientId]" />
        </Stack>
    );
}
