import { useRef, useState } from "react";
import {
    FlatList,
    Image,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { Modalize } from "react-native-modalize";
import { Portal } from "react-native-portalize";
import { MaterialIcons } from "@expo/vector-icons";
import { Trans, t } from "@lingui/macro";

import { BasicText } from "../../../../components/BasicText";
import { CardSkeleton } from "../../../../components/CardSkeleton";
import { Header } from "../../../../components/Header";
import { LargeButton } from "../../../../components/LargeButton";
import { ProfileSkeleton } from "../../../../components/ProfileSkeleton";
import { Refreshable } from "../../../../components/Refreshable";
import { ScreenWrapper } from "../../../../components/ScreenWrapper";
import { SmallButton } from "../../../../components/SmallButton";
import { Title } from "../../../../components/Title";
import { UserPhoto } from "../../../../components/UserPhotos";
import { useSearchTherapistByFilters } from "../../../../hooks/search/useSearchTherapistByFilters";
import { useTherapistByUserId } from "../../../../hooks/therapist/useTherapistByUserId";
import { useDebounce } from "../../../../hooks/util/useDebounce";
import { api } from "../../../../utils/api";

export default function Recommendations() {
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState<string | null>(null);
    const debounceSearch = useDebounce(search, 500);
    const therapist = useTherapistByUserId();
    const modalizeRef = useRef<Modalize>(null);
    const removeRecommendation =
        api.therapists.removeRecommendation.useMutation({
            onSuccess: async () => {
                await therapist.refetch();
            },
        });

    if (!therapist.data || therapist.isLoading)
        return (
            <View className="mx-4 mt-12">
                <CardSkeleton />
            </View>
        );

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await therapist.refetch();
        } finally {
            setRefreshing(false);
        }
    };

    function onOpen() {
        modalizeRef.current?.open();
    }

    const onClose = async () => {
        modalizeRef.current?.close();
        await therapist.refetch();
    };

    return (
        <>
            <ScreenWrapper paddingTop={8}>
                <Refreshable
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                        />
                    }
                >
                    <Header title={t({ message: "Recommendations" })} />
                    <BasicText size="lg" color="gray">
                        <Trans>
                            You can choose up to 3 therapists to appear as
                            recommendations in your profile.
                        </Trans>
                    </BasicText>

                    {therapist.data.recommendations &&
                        therapist.data.recommendations.length > 0 && (
                            <FlatList
                                scrollEnabled={false}
                                renderItem={({ item }) => (
                                    <View className="mt-4 flex flex-row items-center justify-between align-middle">
                                        <View className="flex flex-row items-center align-middle">
                                            <UserPhoto
                                                userId={null}
                                                alt={item.recommendedName}
                                                url={
                                                    item.recommendedProfilePictureUrl
                                                }
                                                width={40}
                                                height={40}
                                            />
                                            <View className="ml-3 flex flex-col">
                                                <BasicText
                                                    fontWeight="bold"
                                                    size="lg"
                                                >
                                                    {item.recommendedName}
                                                </BasicText>
                                            </View>
                                        </View>
                                        <View>
                                            <SmallButton
                                                onPress={() => {
                                                    removeRecommendation.mutate(
                                                        {
                                                            therapistId:
                                                                item.recommendedId,
                                                        },
                                                    );
                                                }}
                                                color="red"
                                            >
                                                <MaterialIcons
                                                    size={20}
                                                    color="white"
                                                    name="close"
                                                />
                                            </SmallButton>
                                        </View>
                                    </View>
                                )}
                                data={therapist.data.recommendations}
                                ListHeaderComponent={
                                    <BasicText
                                        size="lg"
                                        style={{ marginTop: 12 }}
                                    >
                                        <Trans>Here&apos;s your list:</Trans>
                                    </BasicText>
                                }
                            />
                        )}
                    <LargeButton
                        style={{ marginTop: 16 }}
                        onPress={onOpen}
                        disabled={therapist.data.recommendations.length >= 3}
                    >
                        <Trans>Add</Trans>
                    </LargeButton>
                </Refreshable>
            </ScreenWrapper>
            <Portal>
                <Modalize
                    ref={modalizeRef}
                    modalHeight={700}
                    snapPoint={700}
                    modalStyle={{ backgroundColor: "#f8f8f8", padding: 24 }}
                >
                    <Title title={t({ message: "Search" })} />

                    <View className="flex flex-row items-center justify-between pt-2 align-middle">
                        <TextInput
                            onChangeText={setSearch}
                            autoFocus={false}
                            value={search ?? ""}
                            placeholder={t({
                                message: "Type the therapist name",
                            })}
                            className="w-72 font-nunito-sans text-lg"
                        />
                    </View>
                    <View className="my-4 h-0.5 bg-gray-200" />
                    <ScrollView
                        className="w-full"
                        showsVerticalScrollIndicator={false}
                    >
                        {search && (
                            <List onClose={onClose} name={debounceSearch} />
                        )}
                    </ScrollView>
                </Modalize>
            </Portal>
        </>
    );
}

function List({ name, onClose }: { name: string | null; onClose: () => void }) {
    const { data, isLoading, isError } = useSearchTherapistByFilters({
        name: name,
        priceRange: null,
        gender: null,
        modalities: null,
        distance: null,
        currentLocation: null,
        methodologies: null,
    });

    const addRecommendation = api.therapists.addRecommendation.useMutation({
        onSuccess: () => {
            onClose();
        },
    });

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
        <View className="flex w-full flex-col items-start justify-center gap-y-4 pt-4">
            {data.map((therapist) => (
                <View key={therapist.id} className="w-full">
                    <View className="flex flex-row items-center justify-between align-middle">
                        <View className="flex flex-row items-center align-middle">
                            <UserPhoto
                                userId={therapist.userId}
                                alt={therapist.name}
                                url={therapist.profilePictureUrl}
                                width={48}
                                height={48}
                            />
                            <View className="ml-3 flex flex-col">
                                <BasicText
                                    fontWeight="bold"
                                    size="lg"
                                    style={{}}
                                >
                                    {therapist.name}
                                </BasicText>
                                <BasicText size="sm" color="gray">
                                    <Trans>
                                        <BasicText
                                            size="sm"
                                            fontWeight="bold"
                                            color="gray"
                                        >
                                            R$ {therapist.hourlyRate}{" "}
                                        </BasicText>
                                        |{" "}
                                        {therapist.modalities.length > 1
                                            ? "Online e presencial"
                                            : therapist.modalities.includes(
                                                  "ONLINE",
                                              )
                                            ? "Online"
                                            : "Presencial"}
                                    </Trans>
                                </BasicText>
                            </View>
                        </View>
                        <View>
                            <SmallButton
                                onPress={() => {
                                    addRecommendation.mutate({
                                        therapistId: therapist.id,
                                    });
                                }}
                                color="primaryBlue"
                            >
                                <MaterialIcons
                                    size={20}
                                    color="white"
                                    name="add"
                                />
                            </SmallButton>
                        </View>
                    </View>
                </View>
            ))}
        </View>
    ) : (
        <View className="flex flex-col items-center justify-center gap-2 pt-32">
            <Image
                className="h-40 w-40"
                alt={`No therapists picture`}
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                source={require("../../../../../assets/images/girl_dog.png")}
            />
            <Text className="font-nunito-sans-bold text-xl text-slate-500">
                <Trans>No therapists found!</Trans>
            </Text>
        </View>
    );
}
