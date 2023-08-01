import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useRouter, useSearchParams } from "expo-router";

import { Header } from "../../components/Header";
import { api } from "../../utils/api";

// TODO: no futuro precisamos deixar editar a nota
export default function Note() {
    const router = useRouter();
    const params = useSearchParams();

    const { data, isLoading, isError, error } = api.notes.findById.useQuery({
        id: String(params.id),
    });

    const { mutate } = api.notes.delete.useMutation({
        onSuccess: () => {
            router.push({
                pathname: "/",
                params: { deletedNote: true },
            });
        },
    });

    function handleDelete() {
        mutate({ id: String(params.id) });
    }

    if (isLoading) return <View className="h-full bg-off-white"></View>;

    if (isError) return <Text>Error: {JSON.stringify(error)}</Text>;

    if (!data) return <Text>Not found</Text>;

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
                            <Text className="font-nunito-sans-bold text-3xl ">
                                <Text className="text-blue-500">
                                    {data.createdAt.getDate()}
                                </Text>{" "}
                                {data.createdAt.toLocaleString("en", {
                                    month: "long",
                                })}
                            </Text>
                            <TouchableOpacity onPress={handleDelete}>
                                <View className="rounded-xl bg-red-500">
                                    <View className="flex flex-row items-center px-4 py-2 align-middle">
                                        <Text className="font-nunito-sans-bold text-base text-white">
                                            Delete
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <Text className="w-full py-4 font-nunito-sans text-lg">
                            {data.content}
                        </Text>
                    </ScrollView>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}
