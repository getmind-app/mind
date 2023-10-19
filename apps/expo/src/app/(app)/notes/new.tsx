import { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useRouter } from "expo-router";
import { Trans, t } from "@lingui/macro";

import { Header } from "../../../components/Header";
import { api } from "../../../utils/api";

export default function NewNote() {
    const router = useRouter();
    const [content, setContent] = useState("");
    const utils = api.useContext();

    const { mutate, isLoading } = api.notes.create.useMutation({
        onSuccess: async () => {
            await utils.notes.findByUserId.invalidate();
            router.push({
                pathname: "/",
            });
        },
    });

    function handleNewNote() {
        mutate({
            content: content,
        });
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <Header />
            <View className="bg-off-white pb-4 pt-6">
                <View className="h-full px-8 py-2">
                    <ScrollView
                        className="min-h-max"
                        showsVerticalScrollIndicator={false}
                    >
                        <View className="flex flex-row items-center justify-between">
                            <Text className=" font-nunito-sans-bold text-3xl">
                                <Trans>New note</Trans>
                            </Text>
                            <TouchableOpacity onPress={handleNewNote}>
                                <View
                                    className={`rounded-xl bg-blue-500 ${
                                        isLoading && "opacity-75"
                                    }`}
                                >
                                    <View className="flex flex-row items-center gap-2 px-4 py-2 align-middle">
                                        <Text className="font-nunito-sans-bold text-base text-white">
                                            <Trans>Create</Trans>
                                        </Text>
                                        {isLoading && <ActivityIndicator />}
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            className="w-full py-4 font-nunito-sans text-lg"
                            onChangeText={setContent}
                            value={content}
                            placeholder={t({ message: "Write your note here" })}
                        />
                    </ScrollView>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}
