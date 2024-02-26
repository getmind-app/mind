import { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TextInput,
    View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Trans, t } from "@lingui/macro";

import { Header } from "../../../components/Header";
import { ScreenWrapper } from "../../../components/ScreenWrapper";
import { SmallButton } from "../../../components/SmallButton";
import { Title } from "../../../components/Title";
import { UserPhoto } from "../../../components/UserPhotos";
import { useUserIsProfessional } from "../../../hooks/user/useUserIsProfessional";
import { api } from "../../../utils/api";

export default function NewNote() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [content, setContent] = useState("");
    const utils = api.useContext();
    const isProfessional = useUserIsProfessional();
    // todo: dont use junky solution
    const isValid = content && content.length > 1;

    const { mutateAsync, isLoading } = api.notes.create.useMutation({
        onSuccess: async () => {
            await utils.notes.findByUserId.invalidate();
            router.push({
                pathname: "/",
            });
        },
    });

    async function handleNewNote() {
        if (isValid) {
            try {
                await mutateAsync({
                    content: content,
                    patientId: String(params.patientUserId),
                });
                setContent("");
            } catch {
                Alert.alert(
                    t({ message: "Error" }),
                    t({ message: "An error occurred while creating the note" }),
                );
            }
        }
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScreenWrapper
                style={{
                    paddingTop: 12,
                }}
            >
                <Header />
                <ScrollView
                    className="min-h-max"
                    showsVerticalScrollIndicator={false}
                >
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 12,
                            justifyContent: "space-between",
                        }}
                    >
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 12,
                            }}
                        >
                            <Title title={t({ message: "New note" })} />
                            {isProfessional && (
                                <UserPhoto
                                    userId={String(params.patientUserId)}
                                    alt={"Patient's photo"}
                                />
                            )}
                        </View>
                        <SmallButton
                            style={{
                                alignSelf: "center",
                            }}
                            onPress={handleNewNote}
                            disabled={isLoading || !isValid}
                        >
                            <Trans>Create</Trans>
                        </SmallButton>
                    </View>
                    <TextInput
                        className="w-full py-4 font-nunito-sans text-lg"
                        onChangeText={setContent}
                        value={content}
                        placeholder={t({ message: "Write your note here" })}
                    />
                </ScrollView>
            </ScreenWrapper>
        </KeyboardAvoidingView>
    );
}
