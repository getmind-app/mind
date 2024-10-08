import { useState } from "react";
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { AntDesign } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trans, t } from "@lingui/macro";
import { useHeaderHeight } from "@react-navigation/elements";
import { cpf } from "cpf-cnpj-validator";
import { DateTime } from "luxon";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { FormCurrencyInput } from "../../components/FormCurrencyInput";
import { FormDateInput } from "../../components/FormDateInput";
import { FormTextInput } from "../../components/FormTextInput";
import { Header } from "../../components/Header";
import { LargeButton } from "../../components/LargeButton";
import { ScreenWrapper } from "../../components/ScreenWrapper";
import { Title } from "../../components/Title";
import { useUserMutations } from "../../hooks/user/useUserMutations";
import { api } from "../../utils/api";
import { type Gender, type Modality } from ".prisma/client";

export default function NewPsychScreen() {
    const { user } = useUser();
    const router = useRouter();
    const headerHeight = useHeaderHeight();
    const createAccount = api.stripe.createAccount.useMutation();
    const [modalities, setModalities] = useState<Modality[]>([]);
    const { setMetadata } = useUserMutations();
    const [selectedImage, setSelectedImage] =
        useState<ImagePicker.ImagePickerAsset | null>(null);

    const [showBirthdayPicker, setShowBirthdayPicker] = useState(false);

    const { mutateAsync, isLoading } = api.therapists.create.useMutation({
        onSuccess: async () => {
            await user?.reload();
            await createAccount.mutateAsync();
            if (modalities.includes("ON_SITE")) {
                router.push("/onboard/therapist-address");
            } else {
                router.push("/");
            }
        },
    });

    const {
        control,
        handleSubmit,
        formState: { isValid },
    } = useForm<{
        name: string;
        birthday: Date;
        document: string;
        crp: string;
        gender: Gender;
        hourlyRate: string;
        phone: string;
        modalities: Modality[];
        pixKey?: string;
    }>({
        defaultValues: {
            name: user?.fullName ?? "",
            birthday: DateTime.local()
                .set({
                    year: 2000,
                    month: 1,
                    day: 1,
                })
                .toJSDate(),
            document: "",
            crp: "",
            gender: "MALE",
            hourlyRate: "",
            phone: "",
            modalities: [],
            pixKey: "",
        },
        resolver: zodResolver(schema),
        mode: "onTouched",
    });

    const onSubmit = handleSubmit(async (data) => {
        setModalities(data.modalities);

        let image;

        if (selectedImage) {
            try {
                image = await user?.setProfileImage({
                    file: `data:image/png;base64,${selectedImage?.base64}`,
                });
            } catch (error) {
                console.error(error);
            }
        }

        await setMetadata.mutateAsync({
            metadata: {
                role: "professional",
            },
        });

        if (data.name !== user?.fullName) {
            await user?.update({
                firstName: data.name.split(" ")[0],
                lastName: data.name.split(" ")[1],
            });
        }

        try {
            await mutateAsync({
                ...data,
                userId: String(user?.id),
                profilePictureUrl: image?.publicUrl ?? user?.imageUrl ?? "",
                dateOfBirth: data.birthday,
                gender: data.gender,
                hourlyRate: parseInt(data.hourlyRate),
                crp: data.crp.replaceAll("/", ""),
                document: data.document.replaceAll("-", "").replaceAll(".", ""),
                phone: data.phone
                    .replaceAll("(", "")
                    .replaceAll(")", "")
                    .replaceAll("-", ""),
                modalities: data.modalities,
            });
        } catch (error) {
            console.error(error);
        }
    });

    const pickImageAsync = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            quality: 1,
            base64: true,
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
        });

        if (!result.canceled) setSelectedImage(result.assets[0] ?? null);
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={headerHeight}
        >
            <ScreenWrapper paddindBottom={16} paddingTop={0}>
                <Header />
                <ScrollView showsVerticalScrollIndicator={false}>
                    <Title title={t({ message: "Onboard" })} />
                    <Text className="mt-4 font-nunito-sans text-lg text-slate-700">
                        Profile picture
                    </Text>
                    <View className="flex flex-row items-center justify-center">
                        <TouchableOpacity
                            onPress={pickImageAsync}
                            className="mb-2 mt-4 flex h-24 w-24 flex-row items-center justify-center rounded-full bg-gray-200"
                        >
                            {selectedImage || user?.imageUrl ? (
                                <Image
                                    className="rounded-full"
                                    alt={`${user?.firstName} profile picture`}
                                    source={{
                                        uri:
                                            selectedImage?.uri ??
                                            user?.imageUrl ??
                                            "",
                                        width: 96,
                                        height: 96,
                                    }}
                                />
                            ) : (
                                <AntDesign
                                    name="user"
                                    size={24}
                                    color="black"
                                />
                            )}
                        </TouchableOpacity>
                    </View>
                    <FormTextInput
                        required
                        control={control}
                        name="name"
                        title={t({ message: "Full Name" })}
                        placeholder={t({
                            message: "John Doe",
                            comment: "Psych Onboard Full Name Placeholder",
                        })}
                    />
                    <FormDateInput
                        required
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
                        required
                        control={control}
                        name="document"
                        title={t({ message: "Document (CPF)" })}
                        placeholder="123.456.789-01"
                        mask="999.999.999-99"
                        inputMode="numeric"
                    />
                    <FormTextInput
                        required
                        control={control}
                        name="phone"
                        title={t({ message: "Phone" })}
                        placeholder="(11) 91234-5678"
                        mask="(99) 99999-9999"
                        inputMode="numeric"
                    />
                    <FormTextInput
                        required
                        control={control}
                        name="crp"
                        title={t({ message: "CRP" })}
                        placeholder="01/23456"
                        mask="99/999999"
                        inputMode="numeric"
                    />
                    <FormCurrencyInput
                        required
                        name="hourlyRate"
                        control={control}
                        title={t({ message: "Hourly rate" })}
                    />
                    <FormTextInput
                        control={control}
                        name="pixKey"
                        title={t({ message: "Pix key" })}
                        placeholder={t({
                            message: "E-mail, CPF, phone number",
                        })}
                    />
                    <Controller
                        control={control}
                        name="modalities"
                        render={({ field: { value, onChange } }) => (
                            <View className="gap-x-2 pt-3">
                                <Text className="font-nunito-sans text-lg text-slate-700">
                                    <Trans>
                                        Modality (you can choose both)
                                    </Trans>{" "}
                                    *
                                </Text>
                                <View className="mt-4 flex flex-row justify-between">
                                    <TouchableOpacity
                                        onPress={() => {
                                            onChange(
                                                value.includes("ONLINE")
                                                    ? value.filter(
                                                          (item) =>
                                                              item !== "ONLINE",
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
                    <Controller
                        control={control}
                        name="gender"
                        render={({ field: { value, onChange } }) => (
                            <View className="gap-x-2 pb-8 pt-3">
                                <Text className="font-nunito-sans text-lg text-slate-700">
                                    <Trans>Gender</Trans>
                                </Text>
                                <View className="mt-4 flex flex-row justify-between">
                                    <TouchableOpacity
                                        onPress={() => {
                                            onChange("MALE");
                                        }}
                                        className={`w-[48%] rounded-lg bg-white py-3 ${
                                            value === "MALE"
                                                ? "bg-blue-500"
                                                : ""
                                        }`}
                                    >
                                        <Text
                                            className={`text-center font-nunito-sans text-base ${
                                                value === "MALE"
                                                    ? "font-nunito-sans-bold text-white"
                                                    : ""
                                            }`}
                                        >
                                            <Trans>Male</Trans>
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => {
                                            onChange("FEMALE");
                                        }}
                                        className={`w-[48%] rounded-lg bg-white py-3 ${
                                            value === "FEMALE"
                                                ? "bg-blue-500"
                                                : ""
                                        }`}
                                    >
                                        <Text
                                            className={`text-center font-nunito-sans text-base ${
                                                value === "FEMALE"
                                                    ? "font-nunito-sans-bold text-white"
                                                    : ""
                                            }`}
                                        >
                                            <Trans>Female</Trans>
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    />
                </ScrollView>
                <LargeButton
                    disabled={!isValid || isLoading || setMetadata.isLoading}
                    onPress={onSubmit}
                    loading={isLoading || setMetadata.isLoading}
                >
                    <Trans>Next</Trans>
                </LargeButton>
            </ScreenWrapper>
        </KeyboardAvoidingView>
    );
}

const schema = z.object({
    document: z
        .string({
            required_error: "The document is required",
        })
        .min(11, "Your document must be 11 characters long")
        .refine((value) => cpf.isValid(value), {
            message: "Must be a valid CPF",
        }),
    name: z
        .string({
            required_error: "Full name is required",
        })
        .min(2, "Full name must be at least 2 characters"),
    gender: z.enum(["MALE", "FEMALE"]),
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
    pixKey: z.string().optional(),
});
