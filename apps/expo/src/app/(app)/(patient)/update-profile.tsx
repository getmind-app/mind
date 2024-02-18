import { KeyboardAvoidingView, Platform, Text, View } from "react-native";

import { Header } from "../../../components/Header";
import { ProfileSkeleton } from "../../../components/ProfileSkeleton";
import { ScreenWrapper } from "../../../components/ScreenWrapper";
import { api } from "../../../utils/api";

export default function PersonalInfo() {
    return (
        <>
            <Header />
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <ScreenWrapper>
                    <PatientOptions />
                </ScreenWrapper>
            </KeyboardAvoidingView>
        </>
    );
}

function PatientOptions() {
    const { data: patient, isLoading } = api.patients.findByUserId.useQuery();

    if (!patient || isLoading) {
        return <ProfileSkeleton />;
    }

    return (
        <View className="flex flex-col gap-y-4">
            <Text>No need to update anything in the patient now</Text>
        </View>
    );
}
