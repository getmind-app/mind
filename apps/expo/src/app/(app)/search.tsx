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
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { Trans, t } from "@lingui/macro";

import {
    type Address,
    type Gender,
    type Modality,
    type Therapist,
} from "../../../../../packages/db";
import { BasicText } from "../../components/BasicText";
import { ProfileSkeleton } from "../../components/ProfileSkeleton";
import { ScreenWrapper } from "../../components/ScreenWrapper";
import { Title } from "../../components/Title";
import { UserPhoto } from "../../components/UserPhotos";
import getDistanceFromCurrentLocation from "../../helpers/getDistanceFromCurrentLocation";
import { useSearchTherapistByFilters } from "../../hooks/search/useSearchTherapistByFilters";
import { useDebounce } from "../../hooks/util/useDebounce";

export default function SearchScreen() {
    const [search, setSearch] = useState<string | null>(null);
    const [priceRange, setPriceRange] = useState<number[] | null>(null);
    const [modality, setModality] = useState<Modality[] | null>(null);
    const [gender, setGender] = useState<Gender[] | null>(null);
    const [distance, setDistance] = useState<number[] | null>(null);
    const [selectedMethodologies, setSelectedMethodologies] = useState<
        string[] | null
    >(null);
    const [currentLocation, setCurrentLocation] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);
    const modalizeRef = useRef<Modalize>(null);
    const ref = useRef<number[] | null>(null);
    const debounceSearch = useDebounce(search, 500);
    const debouncePriceRange = useDebounce(priceRange, 300);
    const debouceDistance = useDebounce(distance, 300);
    const debouceSelectedMethodologies = useDebounce(
        selectedMethodologies,
        300,
    );
    const methodologies = [
        t({ message: "Mindfulness" }),
        t({ message: "Psicoterapia Corporal Reichiana" }),
        t({ message: "Cognitivo Comportamental (TCC)" }),
        t({ message: "Psicoterapia breve focal" }),
        t({ message: "Humanismo" }),
        t({ message: "Behaviorista" }),
        t({ message: "Existencial" }),
        t({ message: "Junguiana" }),
        t({ message: "Psicanalítica de Freud" }),
        t({ message: "Psicanalítica de Lacan" }),
        t({ message: "Gestalt" }),
        t({ message: "Positiva" }),
    ];

    function onOpen() {
        (async () => {
            const { status } =
                await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                alert(
                    t({
                        message:
                            "You won't be able to use the location filter without location permission.",
                    }),
                );
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            setCurrentLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });
        })();

        modalizeRef.current?.open();
    }

    function handleUpdateMethodologies(methodology: string) {
        const isSelected = selectedMethodologies?.includes(methodology);
        if (isSelected) {
            setSelectedMethodologies(
                selectedMethodologies?.filter((m) => m !== methodology) ?? [],
            );
        } else {
            setSelectedMethodologies([
                ...(selectedMethodologies ?? []),
                methodology,
            ]);
        }
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
                                (modality && modality.length > 0) ||
                                distance
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
                    {search ||
                    priceRange ||
                    gender ||
                    modality ||
                    distance ||
                    (debouceSelectedMethodologies &&
                        debouceSelectedMethodologies.length > 0) ? (
                        <List
                            name={debounceSearch}
                            priceRange={debouncePriceRange ?? []}
                            modalities={modality}
                            gender={gender}
                            distance={
                                (debouceDistance && debouceDistance[0]) ?? null
                            }
                            currentLocation={currentLocation}
                            methodologies={debouceSelectedMethodologies}
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
                    modalHeight={700}
                    snapPoint={700}
                    modalStyle={{ backgroundColor: "#f8f8f8", padding: 24 }}
                >
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            paddingBottom: 16,
                        }}
                    >
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 8,
                            }}
                        >
                            <MaterialIcons
                                name="filter-list"
                                size={24}
                                color={"black"}
                            />
                            <Text className="font-nunito-sans-bold text-xl ">
                                <Trans>Filters</Trans>
                            </Text>
                        </View>

                        <TouchableOpacity
                            className="shadow-sm"
                            style={{
                                padding: 8,
                                backgroundColor: "#3b82f6",
                                borderRadius: 8,
                                elevation: 2,
                            }}
                            onPress={() => {
                                setPriceRange(null);
                                setModality(null);
                                setGender(null);
                                setDistance(null);
                            }}
                        >
                            <Text className="font-nunito-sans-bold text-sm text-white">
                                <Trans>Clear</Trans>
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <Text className="font-nunito-sans-bold text-base">
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
                        labelComponent={CustomCurrencyLabel}
                        style={{
                            paddingHorizontal: 16,
                            paddingBottom: 12,
                        }}
                        trackStyle={{
                            borderColor: "gray",
                        }}
                        selectedTrackStyle={{
                            borderColor: "#3b82f6",
                        }}
                        onSlidingComplete={() => {
                            setPriceRange(ref.current);
                        }}
                        onChange={(values: number[]) => {
                            ref.current = values;
                        }}
                    />
                    <Text className="font-nunito-sans-bold text-base ">
                        <Trans>Distance</Trans>
                    </Text>
                    <Slider
                        min={1}
                        max={20}
                        values={[distance?.[0] ?? 20]}
                        trackStyle={{
                            borderColor: "gray",
                        }}
                        selectedTrackStyle={{
                            borderColor: "#3b82f6",
                        }}
                        markerComponent={CustomMarker}
                        labelComponent={CustomDistanceLabel}
                        style={{
                            paddingHorizontal: 16,
                            paddingBottom: 12,
                        }}
                        onChange={(values: number[]) => {
                            setDistance(values);
                        }}
                    />
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            paddingBottom: 16,
                        }}
                    >
                        <View style={{ flexDirection: "column", gap: 8 }}>
                            <Text className="font-nunito-sans-bold text-base ">
                                <Trans>Gender</Trans>
                            </Text>
                            <View className="flex flex-row items-center justify-between gap-3">
                                <TouchableOpacity
                                    style={{
                                        padding: 8,
                                        backgroundColor: `${
                                            gender?.includes("MALE")
                                                ? "#3b82f6"
                                                : "#f8f8f8"
                                        }`,
                                        borderRadius: 8,
                                        borderWidth: 1,
                                        borderColor: gender?.includes("MALE")
                                            ? "#3b82f6"
                                            : "#64748b",
                                        elevation: 2,
                                    }}
                                    onPress={() => {
                                        if (gender?.includes("MALE")) {
                                            setGender(
                                                gender.filter(
                                                    (gender) =>
                                                        gender !== "MALE",
                                                ),
                                            );
                                        } else {
                                            setGender([
                                                ...(gender ?? []),
                                                "MALE",
                                            ]);
                                        }
                                    }}
                                >
                                    <Trans>
                                        <Text
                                            className={`font-nunito-sans ${
                                                gender?.includes("MALE")
                                                    ? "text-white"
                                                    : "text-black"
                                            }`}
                                        >
                                            Male
                                        </Text>
                                    </Trans>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={{
                                        padding: 8,
                                        backgroundColor: `${
                                            gender?.includes("FEMALE")
                                                ? "#3b82f6"
                                                : "#f8f8f8"
                                        }`,
                                        borderRadius: 8,
                                        elevation: 2,
                                        borderWidth: 1,
                                        borderColor: gender?.includes("FEMALE")
                                            ? "#3b82f6"
                                            : "#64748b",
                                    }}
                                    onPress={() => {
                                        if (gender?.includes("FEMALE")) {
                                            setGender(
                                                gender.filter(
                                                    (gender) =>
                                                        gender !== "FEMALE",
                                                ),
                                            );
                                        } else {
                                            setGender([
                                                ...(gender ?? []),
                                                "FEMALE",
                                            ]);
                                        }
                                    }}
                                >
                                    <Trans>
                                        <Text
                                            className={`font-nunito-sans ${
                                                gender?.includes("FEMALE")
                                                    ? "text-white"
                                                    : "text-black"
                                            }`}
                                        >
                                            Female
                                        </Text>
                                    </Trans>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={{ flexDirection: "column", gap: 8 }}>
                            <Text className="font-nunito-sans-bold text-base ">
                                <Trans>Modality</Trans>
                            </Text>
                            <View className="flex flex-row items-center justify-between gap-3">
                                <TouchableOpacity
                                    style={{
                                        padding: 8,
                                        backgroundColor: `${
                                            modality?.includes("ONLINE")
                                                ? "#3b82f6"
                                                : "#f8f8f8"
                                        }`,
                                        borderRadius: 8,
                                        elevation: 2,
                                        borderWidth: 1,
                                        borderColor: modality?.includes(
                                            "ONLINE",
                                        )
                                            ? "#3b82f6"
                                            : "#64748b",
                                    }}
                                    onPress={() => {
                                        if (modality?.includes("ONLINE")) {
                                            setModality(
                                                modality.filter(
                                                    (modality) =>
                                                        modality !== "ONLINE",
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
                                        <Text
                                            className={`font-nunito-sans ${
                                                modality?.includes("ONLINE")
                                                    ? "text-white"
                                                    : "text-black"
                                            }`}
                                        >
                                            Online
                                        </Text>
                                    </Trans>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={{
                                        padding: 8,
                                        backgroundColor: `${
                                            modality?.includes("ON_SITE")
                                                ? "#3b82f6"
                                                : "#f8f8f8"
                                        }`,
                                        borderRadius: 8,
                                        elevation: 2,
                                        borderWidth: 1,
                                        borderColor: modality?.includes(
                                            "ON_SITE",
                                        )
                                            ? "#3b82f6"
                                            : "#64748b",
                                    }}
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
                                        <Text
                                            className={`font-nunito-sans ${
                                                modality?.includes("ON_SITE")
                                                    ? "text-white"
                                                    : "text-black"
                                            }`}
                                        >
                                            On site
                                        </Text>
                                    </Trans>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    <Text className="font-nunito-sans-bold text-base ">
                        <Trans>Methodologies</Trans>
                    </Text>
                    <View
                        style={{
                            flexDirection: "row",
                            flexWrap: "wrap",
                            paddingTop: 8,
                            columnGap: 8,
                        }}
                    >
                        {methodologies.map((methodology) => (
                            <TouchableOpacity
                                key={methodology}
                                onPress={() =>
                                    handleUpdateMethodologies(methodology)
                                }
                                style={{
                                    padding: 8,
                                    marginBottom: 8,
                                    borderRadius: 8,
                                    borderWidth: 1,
                                    elevation: 2,
                                    borderColor:
                                        selectedMethodologies?.includes(
                                            methodology,
                                        )
                                            ? "#3b82f6"
                                            : "#64748b",
                                    backgroundColor:
                                        selectedMethodologies?.includes(
                                            methodology,
                                        )
                                            ? "#3b82f6"
                                            : "#f8f8f8",
                                }}
                            >
                                <Text
                                    style={{
                                        color: selectedMethodologies?.includes(
                                            methodology,
                                        )
                                            ? "white"
                                            : "black",
                                    }}
                                    className="font-nunito-sans text-sm"
                                >
                                    {methodology}
                                </Text>
                            </TouchableOpacity>
                        ))}
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
    distance,
    currentLocation,
    methodologies,
}: {
    name: string | null;
    priceRange: number[] | null;
    gender: Gender[] | null;
    modalities: Modality[] | null;
    distance: number | null;
    currentLocation: {
        latitude: number;
        longitude: number;
    } | null;
    methodologies: string[] | null;
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
        distance: distance === 20 ? null : distance,
        currentLocation: currentLocation ?? null,
        methodologies: methodologies,
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
        <View className="flex w-full flex-col items-start justify-center gap-y-4 pt-8">
            {data.map((therapist) => (
                <View key={therapist.id} className="w-full">
                    <TherapistProfile
                        therapist={therapist}
                        currentLocation={currentLocation}
                    />
                </View>
            ))}
        </View>
    ) : (
        <View className="flex flex-col items-center justify-center gap-2 pt-32">
            <Image
                className="h-40 w-40"
                alt={`No therapists picture`}
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                source={require("../../../assets/images/girl_dog.png")}
            />
            <Text className="font-nunito-sans-bold text-xl text-slate-500">
                <Trans>No therapists found!</Trans>
            </Text>
        </View>
    );
}

function TherapistProfile({
    therapist,
    currentLocation,
}: {
    therapist: Therapist & { address: Address | null };
    currentLocation: { latitude: number; longitude: number } | null;
}) {
    const router = useRouter();

    return (
        <TouchableOpacity
            className="flex w-full flex-row"
            onPress={() => router.push(`/psych/${therapist.id}`)}
        >
            <UserPhoto
                userId={therapist.userId}
                alt={therapist.name}
                url={therapist.profilePictureUrl}
                width={48}
                height={48}
            />
            <View className="ml-3 flex flex-col ">
                <BasicText
                    fontWeight="bold"
                    size="xl"
                    style={{
                        marginBottom: -2,
                    }}
                >
                    {therapist.name}
                </BasicText>
                <BasicText size="sm" color="gray">
                    <Trans>
                        <BasicText size="sm" fontWeight="bold" color="gray">
                            R$ {therapist.hourlyRate}{" "}
                        </BasicText>
                        |{" "}
                        {therapist.modalities.length > 1
                            ? "Online e presencial"
                            : therapist.modalities.includes("ONLINE")
                            ? "Online"
                            : "Presencial"}
                    </Trans>{" "}
                    {therapist.address && currentLocation && (
                        <Distance
                            address={therapist.address}
                            currentLocation={currentLocation}
                        />
                    )}
                </BasicText>
            </View>
        </TouchableOpacity>
    );
}

function Distance({
    address,
    currentLocation,
}: {
    address: Address;
    currentLocation: { latitude: number; longitude: number };
}) {
    const distanceFromCurrentLocation = getDistanceFromCurrentLocation({
        address,
        currentLocation,
    });

    return (
        <Text className="font-nunito-sans">
            (
            {distanceFromCurrentLocation && distanceFromCurrentLocation > 1000
                ? `${(distanceFromCurrentLocation / 1000).toFixed(1)} km`
                : `${distanceFromCurrentLocation} m`}
            )
        </Text>
    );
}

function CustomDistanceLabel(props: LabelProps) {
    const position = useMemo(() => {
        if (typeof props.position.value === "number") {
            return {
                ...props.position,
                value: `${props.position.value == 20 ? "+" : ""}${
                    props.position.value
                } km`,
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
                marginTop: 8,
            }}
            textStyle={{
                fontFamily: "NunitoSans_700Bold",
            }}
        />
    );
}

function CustomCurrencyLabel(props: LabelProps) {
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
                marginTop: 8,
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
