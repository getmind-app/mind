import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trans, t } from "@lingui/macro";
import { useHeaderHeight } from "@react-navigation/elements";
import { cpf } from "cpf-cnpj-validator";
import { DateTime } from "luxon";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormCurrencyInput } from "../../../../components/FormCurrencyInput";
import { FormDateInput } from "../../../../components/FormDateInput";
import { FormLongTextInput } from "../../../../components/FormLongTextInput";
import { FormOptionsInput } from "../../../../components/FormOptionsInput";
import { FormTextInput } from "../../../../components/FormTextInput";
import { Header } from "../../../../components/Header";
import { LargeButton } from "../../../../components/LargeButton";
import { ProfileSkeleton } from "../../../../components/ProfileSkeleton";
import { ScreenWrapper } from "../../../../components/ScreenWrapper";
import { api } from "../../../../utils/api";

export default function PersonalInfo() {
    const headerHeight = useHeaderHeight();

    return (
        <>
            <Header title={t({ message: "Personal Info" })} />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={headerHeight}
            >
                <ScreenWrapper paddingTop={0} paddindBottom={16}>
                    <TherapistOptions />
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

    const updateTherapist = api.therapists.update.useMutation({
        onSuccess: async () => {
            await user?.reload();
            router.push("/settings");
        },
    });

    // eventuamente devemos não deixar o cara alterar tudo,
    // coisas como nome, data de nascimento, documento e crp
    // imagino que devem ser imutáveis
    const {
        control,
        handleSubmit,
        formState: { isValid, isDirty },
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
                  methodologies: therapist.data.methodologies,
                  education: therapist.data.education,
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
                  methodologies: [],
                  education: "",
              },
        resolver: zodResolver(therapistSchema),
    });
    const onSubmit = handleSubmit(async (formData) => {
        await user?.reload();

        updateTherapist.mutate({
            name: formData.name,
            dateOfBirth: formData.dateOfBirth,
            document: formData.document,
            crp: formData.crp,
            yearsOfExperience: formData.yearsOfExperience ?? "",
            hourlyRate: formData.hourlyRate,
            phone: formData.phone,
            about: formData.about,
            methodologies: formData.methodologies,
            education: formData.education,
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
                <FormCurrencyInput
                    name="hourlyRate"
                    control={control}
                    title={t({ message: "Hourly Rate" })}
                />
                <FormLongTextInput
                    title={t({ message: "About you" })}
                    placeholder={t({
                        message: "Tell us about yourself",
                    })}
                    control={control}
                    name="about"
                    inputMode="text"
                    lengthLimit={250}
                />

                <FormLongTextInput
                    title={t({ message: "Education" })}
                    placeholder={t({
                        message: "How was your education?",
                    })}
                    control={control}
                    name="education"
                    inputMode="text"
                    lengthLimit={300}
                />

                <FormOptionsInput
                    title={t({ message: "Methodologies" })}
                    options={[
                        t({ message: "Mindfulness" }),
                        t({ message: "Psicoterapia Corporal Reichiana" }),
                        t({
                            message: "Cognitivo Comportamental (TCC)",
                        }),
                        t({ message: "Psicoterapia Breve Focal" }),
                        t({ message: "Humanismo" }),
                        t({ message: "Behaviorista" }),
                        t({ message: "Existencial" }),
                        t({ message: "Junguiana" }),
                        t({ message: "Psicanalítica de Freud" }),
                        t({ message: "Psicanalítica de Lacan" }),
                        t({ message: "Gestalt" }),
                        t({ message: "Positiva" }),
                    ]}
                    control={control}
                    name="methodologies"
                />
            </ScrollView>
            <LargeButton
                onPress={onSubmit}
                loading={updateTherapist.isLoading}
                disabled={!isValid || !isDirty}
            >
                <Trans>Update</Trans>
            </LargeButton>
        </>
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
    methodologies: z.array(z.string()).nullable(),
    education: z.string().nullable(),
});
