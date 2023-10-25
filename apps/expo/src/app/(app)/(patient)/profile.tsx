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
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormTextInput } from "../../../components/FormTextInput";
import { LargeButton } from "../../../components/LargeButton";
import { Loading } from "../../../components/Loading";
import { ScreenWrapper } from "../../../components/ScreenWrapper";
import { Title } from "../../../components/Title";
import { usePatientMutations } from "../../../hooks/patient/usePatientMutations";
import { useUserHasProfileImage } from "../../../hooks/user/useUserHasProfileImage";

export default function EditPatientProfile() {
    const { user } = useUser();
    const router = useRouter();
    const userHasProfileImage = useUserHasProfileImage();
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
            profilePictureUrl: image?.publicUrl ?? user?.imageUrl ?? "",
            userId: String(user?.id),
        });
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
        >
            <ScreenWrapper>
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
                                {userHasProfileImage.data || selectedImage ? (
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
                            control={control}
                            name="name"
                            title={t({ message: "Name" })}
                            placeholder="John Doe"
                            inputMode="text"
                        />
                    </View>
                    <LargeButton
                        disabled={!isValid}
                        loading={createPatient.isLoading}
                        onPress={onSubmit}
                    >
                        <Trans>Next</Trans>
                    </LargeButton>
                </View>
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
    profilePicture: z
        .string({
            required_error: "Profile picture is required",
        })
        .min(2, "Profile picture must be at least 2 characters"),
});
