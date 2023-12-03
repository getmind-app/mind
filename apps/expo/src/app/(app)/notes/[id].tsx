import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useGlobalSearchParams, useRouter } from "expo-router";
import { Trans } from "@lingui/macro";

import { FullScreenLoading } from "../../../components/FullScreenLoading";
import { Header } from "../../../components/Header";
import { Loading } from "../../../components/Loading";
import { ScreenWrapper } from "../../../components/ScreenWrapper";
import { api } from "../../../utils/api";

export default function Note() {
    const router = useRouter();
    const utils = api.useContext();
    const params = useGlobalSearchParams();

    const { data, isLoading, isError, error } = api.notes.findById.useQuery({
        id: String(params.id),
    });

    const deleteNote = api.notes.delete.useMutation({
        onSuccess: async () => {
            await utils.notes.findByUserId.invalidate();
            router.push({
                pathname: "/",
            });
        },
    });

    async function handleDelete() {
        deleteNote.mutateAsync({ id: String(params.id) });
    }

    if (isLoading) return <FullScreenLoading />;

    if (isError) return <Text>Error: {JSON.stringify(error)}</Text>;

    if (!data) return <Text>Not found</Text>;

    return (
        <ScreenWrapper
            style={{
                paddingTop: 12,
            }}
        >
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <Header onBack={() => router.push("/")} />
                <ScrollView
                    className="min-h-max"
                    showsVerticalScrollIndicator={false}
                >
                    <View
                        className={`flex flex-row items-center justify-between`}
                    >
                        <Text className="font-nunito-sans-bold text-3xl ">
                            <Text className="text-blue-500">
                                {data.createdAt.getDate()}
                            </Text>{" "}
                            {data.createdAt.toLocaleString("en", {
                                month: "long",
                            })}
                        </Text>
                        <TouchableOpacity onPress={handleDelete}>
                            <View
                                className={`rounded-xl bg-red-500 ${
                                    deleteNote.isLoading && "opacity-75"
                                }`}
                            >
                                <View className="flex flex-row items-center gap-2 px-4 py-2 align-middle">
                                    <Text className="font-nunito-sans-bold text-base text-white">
                                        <Trans>Delete</Trans>
                                    </Text>
                                    {deleteNote.isLoading && (
                                        <Loading color={"#fff"} />
                                    )}
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <Text className="w-full py-4 font-nunito-sans text-lg">
                        {data.content}
                    </Text>
                </ScrollView>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
}
