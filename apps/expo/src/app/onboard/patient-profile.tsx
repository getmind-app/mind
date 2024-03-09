import { useState } from "react";
import {
    Image,
    KeyboardAvoidingView,
    Platform,
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
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormTextInput } from "../../components/FormTextInput";
import { Header } from "../../components/Header";
import { LargeButton } from "../../components/LargeButton";
import { Loading } from "../../components/Loading";
import { ScreenWrapper } from "../../components/ScreenWrapper";
import { Title } from "../../components/Title";
import { usePatientMutations } from "../../hooks/patient/usePatientMutations";
import { useUserHasProfileImage } from "../../hooks/user/useUserHasProfileImage";
import { useUserMutations } from "../../hooks/user/useUserMutations";

export default function EditPatientProfile() {
    const { user } = useUser();
    const router = useRouter();
    const headerHeight = useHeaderHeight();
    const { setMetadata } = useUserMutations();
    const userHasProfileImage = useUserHasProfileImage({ userId: null });
    const [selectedImage, setSelectedImage] =
        useState<ImagePicker.ImagePickerAsset | null>(null);
    const { createPatient } = usePatientMutations({
        onSuccess: () => {
            router.push("/");
        },
    });

    const {
        control,
        handleSubmit,
        formState: { isValid },
    } = useForm<{
        name: string;
        document: string;
        profilePicture: string;
    }>({
        defaultValues: {
            name: user?.fullName ?? "",
            profilePicture: user?.imageUrl ?? "",
        },
        resolver: zodResolver(schema),
    });

    const onSubmit = handleSubmit(async (data) => {
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
                role: "patient",
            },
        });
        await user?.reload();

        if (data.name !== user?.fullName) {
            const [firstName, lastName] = data.name.split(" ");
            await user?.update({
                firstName,
                lastName,
            });
        }

        await createPatient.mutateAsync({
            name: data.name,
            email: String(user?.emailAddresses[0]?.emailAddress),
            document: data.document,
            profilePictureUrl: image?.publicUrl ?? user?.imageUrl ?? "",
            userId: String(user?.id),
        });
        userHasProfileImage.remove();
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

    if (!user) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Loading size={"large"} />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={headerHeight}
        >
            <ScreenWrapper paddindBottom={16} paddingTop={0}>
                <Header />
                <Title title={t({ message: "Onboard" })} />
                <Text className="mt-4 font-nunito-sans text-lg text-slate-700">
                    <Trans>Profile picture</Trans>
                </Text>
                <View
                    style={{
                        flex: 1,
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <View>
                        <View className="flex flex-row items-center justify-center">
                            <TouchableOpacity
                                onPress={pickImageAsync}
                                className="mb-2 mt-4 flex h-24 w-24 flex-row items-center justify-center rounded-full bg-gray-200"
                            >
                                {userHasProfileImage.data ||
                                selectedImage ||
                                !userHasProfileImage.isLoading ? (
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
                            title={t({ message: "Name" })}
                            placeholder="John Doe"
                            inputMode="text"
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
                    </View>
                </View>
                <LargeButton
                    disabled={
                        !isValid ||
                        createPatient.isLoading ||
                        setMetadata.isLoading
                    }
                    loading={createPatient.isLoading || setMetadata.isLoading}
                    onPress={onSubmit}
                    style={{
                        maxHeight: 48,
                    }}
                >
                    <Trans>Next</Trans>
                </LargeButton>
            </ScreenWrapper>
        </KeyboardAvoidingView>
    );
}

const schema = z.object({
    name: z
        .string({
            required_error: "Full name is required",
        })
        .min(2, "Full name must be at least 2 characters"),
    document: z
        .string({
            required_error: "The document is required",
        })
        .min(11, "Your document must be 11 characters long")
        .refine((value) => cpf.isValid(value), {
            message: "Must be a valid CPF",
        }),
    profilePicture: z
        .string({
            required_error: "Profile picture is required",
        })
        .min(2, "Profile picture must be at least 2 characters"),
});
