import { useEffect, useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    LayoutAnimation,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trans, t } from "@lingui/macro";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormTextInput } from "../../../components/FormTextInput";
import { api } from "../../../utils/api";
import { type Address } from ".prisma/client";

const schema = z.object({
    zipCode: z
        .string({
            required_error: "Your zip code is required",
        })
        .min(8, "Your zip code must be valid"),
    street: z
        .string({
            required_error: "Your street is required",
        })
        .min(2, "Your street must be valid"),
    number: z
        .string({
            required_error: "Your number is required",
        })
        .min(0, "Your number must be valid"),
    complement: z.string(),
    neighborhood: z
        .string({
            required_error: "Your neighborhood is required",
        })
        .min(2, "Your neighborhood must be valid"),
    city: z
        .string({
            required_error: "Your city is required",
        })
        .min(2, "Your city must be valid"),
    state: z
        .string({
            required_error: "Your state is required",
        })
        .min(2, "Your state must be valid"),
});

export default function OnboardAddressScreen() {
    const { user } = useUser();
    const router = useRouter();
    const [latitude, setLatitude] = useState(0);
    const [longitude, setLongitude] = useState(0);

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    const {
        control,
        handleSubmit,
        formState: { isValid },
        getValues,
    } = useForm({
        defaultValues: {
            street: "",
            number: "",
            complement: "",
            neighborhood: "",
            city: "",
            state: "",
            zipCode: "",
            formValidated: "",
        },
        resolver: zodResolver(schema),
    });
    const onSubmit = handleSubmit(async (data) => {
        await user?.reload();

        mutate({
            street: data.street,
            number: data.number,
            complement: data.complement,
            neighborhood: data.neighborhood,
            city: data.city,
            state: data.state,
            zipCode: data.zipCode.replaceAll("-", "").replaceAll(".", ""),
            country: "Brazil",
        });
    });

    const geocode = async (address: Address) => {
        const location = await Location.geocodeAsync(
            address?.street +
                ", " +
                address?.number +
                ", " +
                address?.city +
                ", " +
                address?.state +
                ", " +
                address?.country,
        );

        return location;
    };

    useEffect(() => {
        if (isValid) {
            (async () => {
                const address = {
                    street: getValues("street"),
                    number: getValues("number"),
                    complement: getValues("complement"),
                    neighborhood: getValues("neighborhood"),
                    city: getValues("city"),
                    state: getValues("state"),
                    zipCode: getValues("zipCode").replaceAll("-", ""),
                    country: "Brazil",
                    id: "",
                    therapistId: "",
                };

                try {
                    const location = await geocode(address);

                    if (location && location.length > 0) {
                        setLatitude(location[0]?.latitude ?? 0);
                        setLongitude(location[0]?.longitude ?? 0);
                    }
                } catch (error) {
                    console.log(error);
                }
            })();
        }
    }, [isValid]);

    const { mutate, isLoading } = api.therapists.updateAddress.useMutation({
        onSuccess: async () => {
            await user?.reload();
            router.push("/(psych)/available-hours");
        },
    });

    if (isLoading) {
        return (
            <View className="flex h-full flex-col items-center justify-center">
                <Text className="text-2xl">Loading...</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <View className="bg-off-white pb-4 pt-8">
                <View className="h-full px-4 py-2">
                    <ScrollView
                        className="min-h-max pt-4"
                        showsVerticalScrollIndicator={false}
                    >
                        <View className="flex flex-row items-center justify-between">
                            <Text className="pt-12 font-nunito-sans-bold text-3xl">
                                <Trans>Address</Trans>
                            </Text>
                        </View>
                        <FormTextInput
                            control={control}
                            name="zipCode"
                            title={t({ message: "Zip" })}
                            placeholder="12345-123"
                            mask="99999-999"
                            inputMode="numeric"
                        />
                        <FormTextInput
                            control={control}
                            name="street"
                            title={t({ message: "Street" })}
                            placeholder="Pioneer way"
                            inputMode="text"
                        />
                        <FormTextInput
                            control={control}
                            name="number"
                            title={t({ message: "Number" })}
                            placeholder="123"
                            inputMode="numeric"
                        />
                        <FormTextInput
                            control={control}
                            name="complement"
                            title={t({ message: "Complement" })}
                            placeholder="Apartment 123"
                            inputMode="text"
                        />
                        <FormTextInput
                            control={control}
                            name="neighborhood"
                            title={t({ message: "Neighborhood" })}
                            placeholder="Juvevê"
                            inputMode="text"
                        />
                        <FormTextInput
                            control={control}
                            name="city"
                            title={t({ message: "City" })}
                            placeholder="Curitiba"
                            inputMode="text"
                        />
                        <FormTextInput
                            control={control}
                            name="state"
                            title={t({ message: "State" })}
                            placeholder="PR"
                            inputMode="text"
                        />
                        <View className="gap-3 py-3 pb-6">
                            <Text className="font-nunito-sans text-lg text-slate-700">
                                <Trans>Is that right?</Trans>
                            </Text>
                            <View>
                                <MapView
                                    style={{
                                        alignContent: "center",
                                        alignSelf: "center",
                                        borderRadius: 10,
                                        height: 120,
                                        width: 350,
                                    }}
                                    camera={{
                                        center: {
                                            latitude: latitude,
                                            longitude: longitude,
                                        },
                                        pitch: 0,
                                        heading: 0,
                                        altitude: 1000,
                                        zoom: 15,
                                    }}
                                >
                                    <Marker
                                        coordinate={{
                                            latitude: latitude,
                                            longitude: longitude,
                                        }}
                                    />
                                </MapView>
                            </View>
                        </View>
                    </ScrollView>
                    <TouchableOpacity className="w-full" onPress={onSubmit}>
                        <View
                            className={`mt-8 flex w-full items-center justify-center rounded-xl ${
                                isValid ? "bg-blue-500" : "bg-blue-200"
                            } py-2`}
                        >
                            <Text
                                className={`font-nunito-sans-bold text-lg text-white`}
                            >
                                <Trans>Finish</Trans>
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}
