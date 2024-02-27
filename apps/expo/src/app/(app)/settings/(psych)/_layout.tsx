import { Redirect, Stack } from "expo-router";

import { useUserIsProfessional } from "../../../../hooks/user/useUserIsProfessional";

export default function PsychLayout() {
    const isProfessional = useUserIsProfessional();

    if (!isProfessional) {
        return <Redirect href="/" />;
    }

    return (
        <Stack>
            <Stack.Screen name="update-address" />
            <Stack.Screen name="update-profile" />
            <Stack.Screen name="payments-setup" />
            <Stack.Screen name="available-hours" />
        </Stack>
    );
}
