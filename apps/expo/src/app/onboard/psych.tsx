import { useState } from "react";
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
import { cpf } from "cpf-cnpj-validator";
import { DateTime } from "luxon";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { FormCurrencyInput } from "../../components/FormCurrencyInput";
import { FormDateInput } from "../../components/FormDateInput";
import { FormTextInput } from "../../components/FormTextInput";
import { api } from "../../utils/api";
import { type Modality } from ".prisma/client";

export default function OnboardPsychScreen() {
    const { user } = useUser();
    const router = useRouter();
    let modalities: Modality[] = [];

    const [showBirthdayPicker, setShowBirthdayPicker] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { isValid },
    } = useForm<{
        name: string;
        birthday: Date;
        document: string;
        crp: string;
        yearsOfExperience: string;
        hourlyRate: string;
        phone: string;
        modalities: Modality[];
    }>({
        defaultValues: {
            name: "",
            birthday: DateTime.local().minus({ years: 18 }).toJSDate(),
            document: "",
            crp: "",
            yearsOfExperience: "",
            hourlyRate: "",
            phone: "",
            modalities: [],
        },
        resolver: zodResolver(schema),
    });
    const onSubmit = handleSubmit((data) => {
        mutate({
            ...data,
            userId: String(user?.id),
            profilePictureUrl: String(user?.profileImageUrl),
            about: "",
            dateOfBirth: data.birthday,
            yearsOfExperience: parseInt(data.yearsOfExperience),
            hourlyRate: parseInt(data.hourlyRate),
            crp: data.crp.replaceAll("/", ""),
            document: data.document.replaceAll("-", "").replaceAll(".", ""),
            phone: data.phone
                .replaceAll("(", "")
                .replaceAll(")", "")
                .replaceAll("-", ""),
            modalities: data.modalities,
        });

        modalities = data.modalities;
    });

    const { mutate, isLoading } = api.therapists.create.useMutation({
        onSuccess: async () => {
            await user?.reload();
            if (modalities.includes("ON_SITE")) {
                router.push("/onboard/address");
            } else {
                router.push("/settings/available-hours");
            }
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
                        className="pt-4"
                        showsVerticalScrollIndicator={false}
                    >
                        <View className="flex flex-row items-center justify-between">
                            <Text className="pt-12 font-nunito-sans-bold text-3xl">
                                <Trans>Onboard</Trans>
                            </Text>
                        </View>
                        <FormTextInput
                            control={control}
                            name="name"
                            title={t({ message: "Full Name" })}
                            placeholder={t({
                                message: "John Doe",
                                comment: "Psych Onboard Full Name Placeholder",
                            })}
                        />
                        <FormDateInput
                            title={t({ message: "Birthday" })}
                            name="birthday"
                            control={control}
                            show={showBirthdayPicker}
                            handleChange={() => setShowBirthdayPicker(false)}
                            onValuePress={() =>
                                setShowBirthdayPicker(!showBirthdayPicker)
                            }
                            maximumDate={DateTime.local()
                                .minus({ years: 18 })
                                .toJSDate()}
                            minimumDate={DateTime.local(1900).toJSDate()}
                        />
                        <FormTextInput
                            control={control}
                            name="document"
                            title={t({ message: "Document (CPF)" })}
                            placeholder="123.456.789-01"
                            mask="999.999.999-99"
                            inputMode="numeric"
                        />
                        <FormTextInput
                            control={control}
                            name="phone"
                            title={t({ message: "Phone" })}
                            placeholder="(11) 91234-5678"
                            mask="(99) 99999-9999"
                            inputMode="numeric"
                        />
                        <FormTextInput
                            control={control}
                            name="crp"
                            title={t({ message: "CRP" })}
                            placeholder="01/23456"
                            mask="99/999999"
                            inputMode="numeric"
                        />
                        <FormTextInput
                            title={t({ message: "Experience" })}
                            placeholder="2"
                            mask="99"
                            unit="years"
                            control={control}
                            name="yearsOfExperience"
                            inputMode="numeric"
                        />
                        <FormCurrencyInput
                            name="hourlyRate"
                            control={control}
                            title={t({ message: "Hourly Rate" })}
                        />
                        <Controller
                            control={control}
                            name="modalities"
                            render={({ field: { value, onChange } }) => (
                                <View className="gap-x-2 pb-8 pt-3">
                                    <Text className="font-nunito-sans text-lg text-slate-700">
                                        <Trans>
                                            Modality (you can choose both)
                                        </Trans>
                                    </Text>
                                    <View className="mt-4 flex flex-row justify-between">
                                        <TouchableOpacity
                                            onPress={() => {
                                                onChange(
                                                    value.includes("ONLINE")
                                                        ? value.filter(
                                                              (item) =>
                                                                  item !==
                                                                  "ONLINE",
                                                          )
                                                        : [...value, "ONLINE"],
                                                );
                                            }}
                                            className={`w-[48%] rounded-lg bg-white py-3 ${
                                                value.includes("ONLINE")
                                                    ? "bg-blue-500"
                                                    : ""
                                            }`}
                                        >
                                            <Text
                                                className={`text-center font-nunito-sans text-base ${
                                                    value.includes("ONLINE")
                                                        ? "font-nunito-sans-bold text-white"
                                                        : ""
                                                }`}
                                            >
                                                <Trans>Online</Trans>
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => {
                                                onChange(
                                                    value.includes("ON_SITE")
                                                        ? value.filter(
                                                              (item) =>
                                                                  item !==
                                                                  "ON_SITE",
                                                          )
                                                        : [...value, "ON_SITE"],
                                                );
                                            }}
                                            className={`w-[48%] rounded-lg bg-white py-3 ${
                                                value.includes("ON_SITE")
                                                    ? "bg-blue-500"
                                                    : ""
                                            }`}
                                        >
                                            <Text
                                                className={`text-center font-nunito-sans text-base ${
                                                    value.includes("ON_SITE")
                                                        ? "font-nunito-sans-bold text-white"
                                                        : ""
                                                }`}
                                            >
                                                <Trans>In-person</Trans>
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        />
                    </ScrollView>
                    <TouchableOpacity
                        className="mb-2 w-full"
                        onPress={onSubmit}
                    >
                        <View
                            className={`mt-4 flex w-full items-center justify-center rounded-xl ${
                                isValid ? "bg-blue-500" : "bg-blue-200"
                            } py-2`}
                        >
                            <Text
                                className={`font-nunito-sans-bold text-lg text-white`}
                            >
                                <Trans>Next</Trans>
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const schema = z.object({
    document: z
        .string({
            required_error: "The document is required",
        })
        .min(11, "Your document must be 11 characters long")
        .refine((value) => cpf.isValid(value), "Must be a valid CPF"),
    name: z
        .string({
            required_error: "Full name is required",
        })
        .min(2, "Full name must be at least 2 characters"),
    yearsOfExperience: z.string({
        required_error: "Your years of experience is required",
    }),
    birthday: z
        .date({
            required_error: "Must provide your birthday",
        })
        .max(
            DateTime.local().minus({ years: 18 }).toJSDate(),
            "Must be older than 18",
        )
        .min(DateTime.local(1900).toJSDate(), "Can't be too old"),
    hourlyRate: z
        .number({
            required_error: "Your hourly rate is required",
        })
        .min(0, "Please provide a valid hourly rate"),
    crp: z
        .string({
            required_error: "Your CRP is required",
        })
        .min(8, "Your CRP must be valid"),
    phone: z
        .string({
            required_error: "Your phone number is required",
        })
        .min(10, "Your phone number must be valid"),
    modalities: z
        .array(z.enum(["ONLINE", "ON_SITE"]))
        .refine(
            (value) => value.length > 0,
            "You must choose at least one modality",
        ),
});
