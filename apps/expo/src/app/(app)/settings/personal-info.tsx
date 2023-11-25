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
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormCurrencyInput } from "../../../components/FormCurrencyInput";
import { FormDateInput } from "../../../components/FormDateInput";
import { FormTextInput } from "../../../components/FormTextInput";
import { Header } from "../../../components/Header";
import { LargeButton } from "../../../components/LargeButton";
import { ProfileSkeleton } from "../../../components/ProfileSkeleton";
import { ScreenWrapper } from "../../../components/ScreenWrapper";
import { useUserIsProfessional } from "../../../hooks/user/useUserIsProfessional";
import { api } from "../../../utils/api";

export default function PersonalInfo() {
    const isProfessional = useUserIsProfessional();

    return (
        <>
            <Header />
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <ScreenWrapper>
                    {isProfessional ? <TherapistOptions /> : <PatientOptions />}
                </ScreenWrapper>
            </KeyboardAvoidingView>
        </>
    );
}

function TherapistOptions() {
    const { user } = useUser();
    const router = useRouter();
    const therapist = api.therapists.findByUserId.useQuery();
    const [showBirthdayPicker, setShowBirthdayPicker] = useState(false);

    const { mutate: updateTherapist } = api.therapists.update.useMutation({
        onSuccess: async () => {
            await user?.reload();
            router.push("/profile");
        },
    });

    // eventuamente devemos não deixar o cara alterar tudo,
    // coisas como nome, data de nascimento, documento e crp
    // imagino que devem ser imutáveis
    const {
        control,
        handleSubmit,
        formState: { isValid, isDirty, isSubmitting },
    } = useForm<NonNullable<typeof therapist.data>>({
        defaultValues: therapist.data
            ? {
                  name: therapist.data.name,
                  dateOfBirth: therapist.data.dateOfBirth,
                  document: therapist.data.document,
                  crp: therapist.data.crp,
                  yearsOfExperience: therapist.data.yearsOfExperience,
                  hourlyRate: therapist.data.hourlyRate,
                  phone: therapist.data.phone,
                  about: therapist.data.about,
              }
            : {
                  name: "",
                  dateOfBirth: DateTime.local().toJSDate(),
                  document: "",
                  crp: "",
                  yearsOfExperience: "",
                  hourlyRate: 100,
                  phone: "",
                  about: "",
              },
        resolver: zodResolver(therapistSchema),
    });
    const onSubmit = handleSubmit(async (formData) => {
        await user?.reload();

        updateTherapist({
            name: formData.name,
            dateOfBirth: formData.dateOfBirth,
            document: formData.document,
            crp: formData.crp,
            yearsOfExperience: formData.yearsOfExperience ?? "",
            hourlyRate: formData.hourlyRate,
            phone: formData.phone,
            about: formData.about,
        });
    });

    if (!therapist.data || therapist.isLoading) {
        return <ProfileSkeleton />;
    }

    return (
        <>
            <ScrollView
                className="min-h-max"
                showsVerticalScrollIndicator={false}
            >
                <Text className="font-nunito-sans-bold text-3xl">
                    <Trans>Personal info</Trans>
                </Text>
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
                    name="dateOfBirth"
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
                    unit={t({ message: "years" })}
                    control={control}
                    name="yearsOfExperience"
                    inputMode="numeric"
                />
                <FormTextInput
                    title={t({ message: "About you" })}
                    placeholder={t({
                        message: "Tell us about yourself",
                    })}
                    control={control}
                    name="about"
                    inputMode="text"
                />
                <FormCurrencyInput
                    name="hourlyRate"
                    control={control}
                    title={t({ message: "Hourly Rate" })}
                />
            </ScrollView>
            <LargeButton onPress={onSubmit} loading={isSubmitting}>
                <Trans>Update</Trans>
            </LargeButton>
        </>
    );
}

function PatientOptions() {
    const { data: patient, isLoading } = api.patients.findByUserId.useQuery();

    if (!patient || isLoading) {
        return <ProfileSkeleton />;
    }

    return (
        <View className="flex flex-col gap-y-4">
            <Text>No need to update anything in the patient now</Text>
        </View>
    );
}

const therapistSchema = z.object({
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
    yearsOfExperience: z
        .string()
        .refine(
            (value) => !value || /^\d{0,2}$/.test(value),
            "Must be a valid number",
        )
        .nullable(),
    dateOfBirth: z
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
    about: z.string().nullable(),
});
