import { useState } from "react";
import {
    Image,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useRouter } from "expo-router";
import { Trans, t } from "@lingui/macro";

import { ProfileSkeleton } from "../components/ProfileSkeleton";
import { api } from "../utils/api";

export default function SearchScreen() {
    const [search, setSearch] = useState("");

    return (
        <View className="h-full bg-off-white px-4 pt-12">
            <View className="flex flex-col">
                <Text className="pt-12 font-nunito-sans-bold text-3xl">
                    <Trans>Search</Trans>
                </Text>

                <View className="flex flex-row items-center justify-between pt-2 align-middle">
                    <TextInput
                        onChangeText={setSearch}
                        autoFocus={false}
                        value={search}
                        placeholder={t({ message: "Looking for a therapist?" })}
                        className="font-nunito-sans text-lg"
                    />
                </View>
            </View>
            <ScrollView className="w-full" showsVerticalScrollIndicator={false}>
                {search.length > 0 ? (
                    <List search={search} />
                ) : (
                    <View className="flex flex-col items-center justify-center gap-2 pt-32">
                        <Image
                            className="h-40 w-40"
                            alt={`No therapists picture`}
                            source={require("../../assets/login_mind.png")}
                        />
                        <Text className="font-nunito-sans-bold text-xl text-slate-500">
                            <Trans>Find your new therapist</Trans>
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

function List({ search }: { search: string }) {
    const { data, isLoading, isError, error } =
        api.therapists.findByNameLike.useQuery({ name: search });

    const router = useRouter();

    if (isError) {
        return (
            <View className="flex  items-center justify-center">
                <Text>{JSON.stringify(error)}</Text>
            </View>
        );
    }

    if (isLoading) {
        return <ProfileSkeleton />;
    }

    return data.length > 0 ? (
        <View className="flex w-full flex-col items-start justify-center gap-y-4 pt-2">
            {data.map(({ name, profilePictureUrl, id, crp }) => (
                <TouchableOpacity
                    className="flex flex-row items-center gap-4 align-middle"
                    key={id}
                    onPress={() => router.push(`/psych/${id}`)}
                >
                    <Image
                        className="rounded-full"
                        alt={t({ message: `${name}' profile picture` })}
                        source={{
                            uri: profilePictureUrl,
                            width: 48,
                            height: 48,
                        }}
                    />
                    <View className="flex flex-col justify-center align-middle">
                        <Text className="-mb-1 font-nunito-sans-bold text-lg">
                            {name}
                        </Text>
                        <Text className=" font-nunito-sans text-slate-500">
                            {/*TODO: add mask*/}
                            <Trans>Psychologist - {crp}</Trans>
                        </Text>
                    </View>
                </TouchableOpacity>
            ))}
        </View>
    ) : (
        <View className="flex flex-col items-center justify-center gap-2 pt-32">
            <Image
                className="h-40 w-40"
                alt={`No therapists picture`}
                source={require("../../assets/login_mind.png")}
            />
            <Text className="font-nunito-sans-bold text-xl text-slate-500">
                <Trans>No therapists found!</Trans>
            </Text>
        </View>
    );
}
