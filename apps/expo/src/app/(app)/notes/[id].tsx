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
import { useLingui } from "@lingui/react";
import { format } from "date-fns";

import { BasicText } from "../../../components/BasicText";
import { FullScreenLoading } from "../../../components/FullScreenLoading";
import { Header } from "../../../components/Header";
import { Loading } from "../../../components/Loading";
import { ScreenWrapper } from "../../../components/ScreenWrapper";
import { UserPhoto } from "../../../components/UserPhotos";
import { getLocale } from "../../../helpers/getLocale";
import { useUserIsProfessional } from "../../../hooks/user/useUserIsProfessional";
import { api } from "../../../utils/api";

export default function Note() {
    const router = useRouter();
    const utils = api.useContext();
    const params = useGlobalSearchParams();
    const isProfessional = useUserIsProfessional();
    const lingui = useLingui();

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
        await deleteNote.mutateAsync({ id: String(params.id) });
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
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 12,
                            }}
                        >
                            <BasicText
                                fontWeight="bold"
                                size="3xl"
                                color="primaryBlue"
                            >
                                {data.createdAt.getDate()}
                            </BasicText>
                            <BasicText fontWeight="bold" size="3xl">
                                {format(data.createdAt, "LLLL", {
                                    locale: getLocale(lingui),
                                })}
                            </BasicText>
                            {isProfessional && (
                                <UserPhoto
                                    userId={data.patient.userId}
                                    alt={"Patient's photo"}
                                />
                            )}
                        </View>
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
