import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trans, t } from "@lingui/macro";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormTextInput } from "../../components/FormTextInput";
import { api } from "../../utils/api";

const schema = z.object({
    zip: z
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

export default function OnboardAddressScreen() {
    const { user } = useUser();
    const router = useRouter();

    const {
        control,
        handleSubmit,
        formState: { isValid },
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
    const onSubmit = handleSubmit((data) => {
        mutate({
            ...data,
            street: data.street,
            number: data.number,
            complement: data.complement,
            neighborhood: data.neighborhood,
            city: data.city,
            state: data.state,
            zipCode: data.zipCode,
            country: "BR",
        });
    });

    const { mutate, isLoading } = api.therapists.updateAddress.useMutation({
        onSuccess: async () => {
            await user?.reload();
            router.push("/settings/available-hours");
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
            <View className="bg-off-white pb-4 pt-16">
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
