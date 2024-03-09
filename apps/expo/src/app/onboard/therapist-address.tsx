import { useEffect, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trans, t } from "@lingui/macro";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormTextInput } from "../../components/FormTextInput";
import { LargeButton } from "../../components/LargeButton";
import { ScreenWrapper } from "../../components/ScreenWrapper";
import { Title } from "../../components/Title";
import { geocode } from "../../helpers/geocode";
import { api } from "../../utils/api";

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

    const {
        control,
        handleSubmit,
        formState: { isValid },
        getValues,
        watch,
        reset,
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
            latitude: latitude,
            longitude: longitude,
        });
    });

    useEffect(() => {
        if (getValues("zipCode").replaceAll("-", "").length >= 8) {
            lookupAddress();
        }
    }, [watch("zipCode")]);

    useEffect(() => {
        if (isValid) {
            (async () => {
                const address = {
                    street: getValues("street"),
                    number: getValues("number"),
                    city: getValues("city"),
                    state: getValues("state"),
                    country: "Brazil",
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
    }, [isValid, watch()]);

    const { mutate, isLoading } = api.therapists.updateAddress.useMutation({
        onSuccess: async () => {
            await user?.reload();
            router.push({ pathname: "/" });
        },
    });

    const lookupAddress = () => {
        fetch(
            `https://viacep.com.br/ws/${getValues("zipCode").replaceAll(
                "-",
                "",
            )}/json/`,
        )
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                reset({
                    street: data.logradouro,
                    number: "",
                    complement: data.complemento,
                    neighborhood: data.bairro,
                    city: data.localidade,
                    state: data.uf,
                    zipCode: data.cep,
                });
            })
            .catch((error) => {
                console.error("Error fetching address data:", error);
            });
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScreenWrapper paddindBottom={16}>
                <ScrollView
                    className="min-h-max"
                    showsVerticalScrollIndicator={false}
                >
                    <Title title={t({ message: "Address" })} />

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
                    <View className="mb-4 gap-3 py-3 ">
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
                                    width: 360,
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
                                scrollEnabled={false}
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
                <LargeButton
                    disabled={!isValid || isLoading}
                    onPress={onSubmit}
                    loading={isLoading}
                >
                    <Trans>Finish</Trans>
                </LargeButton>
            </ScreenWrapper>
        </KeyboardAvoidingView>
    );
}
