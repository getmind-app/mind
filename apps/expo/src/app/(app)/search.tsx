import { useMemo, useRef, useState } from "react";
import {
    Image,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Slider, { SliderLabel, type LabelProps } from "react-native-a11y-slider";
import { Modalize } from "react-native-modalize";
import { Portal } from "react-native-portalize";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { Trans, t } from "@lingui/macro";

import { type Gender, type Modality } from "../../../../../packages/db";
import { ProfileSkeleton } from "../../components/ProfileSkeleton";
import { ScreenWrapper } from "../../components/ScreenWrapper";
import { Title } from "../../components/Title";
import { useSearchTherapistByFilters } from "../../hooks/search/useSearchTherapistByFilters";
import { useDebounce } from "../../hooks/util/useDebounce";

export default function SearchScreen() {
    const [search, setSearch] = useState<string | null>(null);
    const [priceRange, setPriceRange] = useState<number[] | null>(null);
    const [modality, setModality] = useState<Modality[] | null>(null);
    const [gender, setGender] = useState<Gender[] | null>(null);
    const modalizeRef = useRef<Modalize>(null);
    const debounceSearch = useDebounce(search, 500);
    const debouncePriceRange = useDebounce(priceRange, 300);

    function onOpen() {
        modalizeRef.current?.open();
    }

    return (
        <>
            <ScreenWrapper>
                <Title title={t({ message: "Search" })} />

                <View className="flex flex-row items-center justify-between pt-2 align-middle">
                    <TextInput
                        onChangeText={setSearch}
                        autoFocus={false}
                        value={search ?? ""}
                        placeholder={t({ message: "Looking for a therapist?" })}
                        className="w-72 font-nunito-sans text-lg"
                    />
                    <TouchableOpacity onPress={onOpen}>
                        <MaterialIcons
                            name="filter-list"
                            style={{
                                paddingRight: 8,
                            }}
                            size={24}
                            color={
                                priceRange ||
                                (gender && gender.length > 0) ||
                                (modality && modality.length > 0)
                                    ? "#3b82f6"
                                    : "black"
                            }
                        />
                    </TouchableOpacity>
                </View>
                <ScrollView
                    className="w-full"
                    showsVerticalScrollIndicator={false}
                >
                    {search || priceRange || gender || modality ? (
                        <List
                            name={debounceSearch}
                            priceRange={debouncePriceRange ?? []}
                            modalities={modality}
                            gender={gender}
                            proximity={null}
                            currentLocation={null}
                        />
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
            <Portal>
                <Modalize
                    ref={modalizeRef}
                    modalHeight={300}
                    snapPoint={300}
                    modalStyle={{ backgroundColor: "#f8f8f8", padding: 24 }}
                >
                    <Text className="font-nunito-sans-bold text-base ">
                        <Trans>Price</Trans>
                    </Text>
                    <Slider
                        min={30}
                        max={1000}
                        values={[
                            priceRange?.[0] ?? 30,
                            priceRange?.[1] ?? 1000,
                        ]}
                        markerComponent={CustomMarker}
                        labelComponent={CustomLabel}
                        style={{
                            paddingHorizontal: 12,
                            paddingTop: 12,
                        }}
                        onChange={(values: number[]) => {
                            setPriceRange(values);
                        }}
                    />
                    <Text className="font-nunito-sans-bold text-base ">
                        <Trans>Gender</Trans>
                    </Text>
                    <View className="flex flex-row items-center justify-between gap-4">
                        <TouchableOpacity
                            className={`${
                                gender?.includes("MALE") ? "bg-blue-500" : ""
                            }`}
                            onPress={() => {
                                if (gender?.includes("MALE")) {
                                    setGender(
                                        gender.filter(
                                            (gender) => gender !== "MALE",
                                        ),
                                    );
                                } else {
                                    setGender([...(gender ?? []), "MALE"]);
                                }
                            }}
                        >
                            <Trans>
                                <Text>Male</Text>
                            </Trans>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className={`${
                                gender?.includes("FEMALE") ? "bg-blue-500" : ""
                            }`}
                            onPress={() => {
                                if (gender?.includes("FEMALE")) {
                                    setGender(
                                        gender.filter(
                                            (gender) => gender !== "FEMALE",
                                        ),
                                    );
                                } else {
                                    setGender([...(gender ?? []), "FEMALE"]);
                                }
                            }}
                        >
                            <Trans>
                                <Text>Female</Text>
                            </Trans>
                        </TouchableOpacity>
                    </View>

                    <Text className="font-nunito-sans-bold text-base ">
                        <Trans>Modality</Trans>
                    </Text>
                    <View className="flex flex-row items-center justify-between gap-4">
                        <TouchableOpacity
                            className={`${
                                modality?.includes("ONLINE")
                                    ? "bg-blue-500"
                                    : ""
                            }`}
                            onPress={() => {
                                if (modality?.includes("ONLINE")) {
                                    setModality(
                                        modality.filter(
                                            (modality) => modality !== "ONLINE",
                                        ),
                                    );
                                } else {
                                    setModality([
                                        ...(modality ?? []),
                                        "ONLINE",
                                    ]);
                                }
                            }}
                        >
                            <Trans>
                                <Text>Online</Text>
                            </Trans>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className={`${
                                modality?.includes("ON_SITE")
                                    ? "bg-blue-500"
                                    : ""
                            }`}
                            onPress={() => {
                                if (modality?.includes("ON_SITE")) {
                                    setModality(
                                        modality.filter(
                                            (modality) =>
                                                modality !== "ON_SITE",
                                        ),
                                    );
                                } else {
                                    setModality([
                                        ...(modality ?? []),
                                        "ON_SITE",
                                    ]);
                                }
                            }}
                        >
                            <Trans>
                                <Text>On Site</Text>
                            </Trans>
                        </TouchableOpacity>
                    </View>
                </Modalize>
            </Portal>
        </>
    );
}

function List({
    name,
    priceRange,
    gender,
    modalities,
    proximity,
    currentLocation,
}: {
    name: string | null;
    priceRange: number[] | null;
    gender: Gender[] | null;
    modalities: Modality[] | null;
    proximity: number | null;
    currentLocation: {
        latitude: number;
        longitude: number;
    } | null;
}) {
    const { data, isLoading, isError } = useSearchTherapistByFilters({
        name: name,
        priceRange: priceRange
            ? {
                  min: priceRange[0] ?? 1,
                  max: priceRange[1] ?? 1000,
              }
            : null,
        gender: gender,
        modalities: modalities,
        proximity: proximity,
        currentLocation: currentLocation ?? null,
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
            {data.map(
                ({ name, profilePictureUrl, id, modalities, hourlyRate }) => (
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
                                <Trans>
                                    {modalities.length > 1
                                        ? "Online e presencial"
                                        : modalities.includes("ONLINE")
                                        ? "Online"
                                        : "Presencial"}{" "}
                                    |{" "}
                                    <Text className="font-nunito-sans-bold">
                                        R$ {hourlyRate}
                                    </Text>
                                </Trans>
                            </Text>
                        </View>
                    </TouchableOpacity>
                ),
            )}
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

function CustomLabel(props: LabelProps) {
    const position = useMemo(() => {
        if (typeof props.position.value === "number") {
            return {
                ...props.position,
                value: `R$ ${props.position.value}`,
            };
        }
        return props.position;
    }, [props.position]);

    return (
        <SliderLabel
            {...props}
            position={position}
            style={{
                backgroundColor: "#f8f8f8",
                borderWidth: 0,
            }}
            textStyle={{
                fontFamily: "NunitoSans_700Bold",
            }}
        />
    );
}

function CustomMarker() {
    return (
        <View
            style={{
                backgroundColor: "#3b82f6",
                height: CustomMarker.size,
                width: CustomMarker.size,
                borderRadius: CustomMarker.size / 2,
            }}
        />
    );
}
CustomMarker.size = 16;
