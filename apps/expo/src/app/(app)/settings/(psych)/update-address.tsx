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
import { useHeaderHeight } from "@react-navigation/elements";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { type Address } from "../../../../../../../packages/db";
import { FormTextInput } from "../../../../components/FormTextInput";
import { Header } from "../../../../components/Header";
import { LargeButton } from "../../../../components/LargeButton";
import { ProfileSkeleton } from "../../../../components/ProfileSkeleton";
import { ScreenWrapper } from "../../../../components/ScreenWrapper";
import { geocode } from "../../../../helpers/geocode";
import { api } from "../../../../utils/api";

export default function Address() {
    const { user } = useUser();
    const router = useRouter();
    const [latitude, setLatitude] = useState(0);
    const [longitude, setLongitude] = useState(0);
    const headerHeight = useHeaderHeight();

    const { data: therapist, isLoading } =
        api.therapists.findByUserId.useQuery();

    const updateAddress = api.therapists.updateAddress.useMutation({
        onSuccess: async () => {
            await user?.reload();
            router.push("/settings");
        },
    });

    const {
        control,
        handleSubmit,
        getValues,
        watch,
        reset,
        formState: { isValid, isDirty },
    } = useForm<Address>({
        defaultValues:
            therapist && therapist.address
                ? {
                      street: therapist.address.street,
                      number: therapist.address.number,
                      complement: therapist.address.complement,
                      neighborhood: therapist.address.neighborhood,
                      city: therapist.address.city,
                      state: therapist.address.state,
                      zipCode: therapist.address.zipCode,
                  }
                : {
                      street: "",
                      number: "",
                      complement: "",
                      neighborhood: "",
                      city: "",
                      state: "",
                      zipCode: "",
                  },
        resolver: zodResolver(addressSchema),
    });
    const onSubmit = handleSubmit(async (data) => {
        await user?.reload();

        updateAddress.mutate({
            street: data.street,
            number: data.number,
            complement: data.complement,
            neighborhood: data.neighborhood,
            city: data.city,
            state: data.state,
            zipCode: data.zipCode.replaceAll("-", "").replaceAll(".", ""),
            country: "BR",
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

    if (!therapist || isLoading) {
        return <ProfileSkeleton />;
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={headerHeight}
        >
            <ScreenWrapper paddingTop={0} paddindBottom={16}>
                <Header title={t({ message: "Address" })} />

                <ScrollView
                    className="min-h-max"
                    showsVerticalScrollIndicator={false}
                >
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
                    disabled={!isValid || !isDirty}
                    onPress={onSubmit}
                    loading={updateAddress.isLoading}
                >
                    <Trans>Update</Trans>
                </LargeButton>
            </ScreenWrapper>
        </KeyboardAvoidingView>
    );
}

const addressSchema = z.object({
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
        .min(1, "Your number must be valid"),
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
