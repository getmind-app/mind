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

import { ProfileSkeleton } from "../../components/ProfileSkeleton";
import { ScreenWrapper } from "../../components/ScreenWrapper";
import { Title } from "../../components/Title";
import { useSearchTherapistByName } from "../../hooks/search/useSearchTherapistByName";
import { useDebounce } from "../../hooks/util/useDebounce";

//
export default function SearchScreen() {
    const [search, setSearch] = useState("");
    const debouncedValue = useDebounce(search, 500);

    return (
        <ScreenWrapper>
            <Title title={t({ message: "Search" })} />

            <View className="flex flex-row items-center justify-between pt-2 align-middle">
                <TextInput
                    onChangeText={setSearch}
                    autoFocus={false}
                    value={search}
                    placeholder={t({ message: "Looking for a therapist?" })}
                    className="w-full font-nunito-sans text-lg"
                />
            </View>
            <ScrollView className="w-full" showsVerticalScrollIndicator={false}>
                {search.length > 1 ? (
                    <List search={debouncedValue} />
                ) : (
                    <View className="flex flex-col items-center justify-center gap-2 pt-32">
                        <Image
                            className="h-48 w-48"
                            alt={`No therapists picture`}
                            source={require("../../../assets/images/girl_dog.png")}
                        />
                        <Text className="font-nunito-sans text-xl text-slate-500">
                            <Trans>Find your therapist</Trans>
                        </Text>
                    </View>
                )}
            </ScrollView>
        </ScreenWrapper>
    );
}

function List({ search }: { search: string }) {
    const { data, isLoading, isError } = useSearchTherapistByName({
        name: search,
    });
    const router = useRouter();

    if (isError) {
        return (
            <View className="flex  items-center justify-center">
                <Text>
                    <Trans>
                        There was an error when searching for therapists
                    </Trans>
                </Text>
            </View>
        );
    }

    if (isLoading) {
        return (
            <>
                <ProfileSkeleton />
                <ProfileSkeleton />
                <ProfileSkeleton />
            </>
        );
    }

    return data.length > 0 ? (
        <View className="flex w-full flex-col items-start justify-center gap-y-4 pt-2">
            {data.map(({ name, profilePictureUrl, id, crp }) => (
                <TouchableOpacity
                    className="flex w-full flex-row items-center gap-4 align-middle"
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
                source={require("../../../assets/images/girl_dog.png")}
            />
            <Text className="font-nunito-sans-bold text-xl text-slate-500">
                <Trans>No therapists found!</Trans>
            </Text>
        </View>
    );
}
