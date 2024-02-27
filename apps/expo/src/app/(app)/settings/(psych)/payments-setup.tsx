import { useState } from "react";
import { LayoutAnimation, RefreshControl, Text, View } from "react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trans, t } from "@lingui/macro";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { CardSkeleton } from "../../../../components/CardSkeleton";
import { FormTextInput } from "../../../../components/FormTextInput";
import { Header } from "../../../../components/Header";
import { LargeButton } from "../../../../components/LargeButton";
import { Refreshable } from "../../../../components/Refreshable";
import { ScreenWrapper } from "../../../../components/ScreenWrapper";
import { useTherapistByUserId } from "../../../../hooks/therapist/useTherapistByUserId";
import { api } from "../../../../utils/api";

export default function PaymentsSetup() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    const [refreshing, setRefreshing] = useState(false);
    const therapist = useTherapistByUserId();
    const updateTherapist = api.therapists.update.useMutation();

    const {
        control,
        handleSubmit,
        formState: { isValid, isDirty },
    } = useForm<{
        pixKey: string;
    }>({
        defaultValues: {
            pixKey: therapist.data?.pixKey ?? "",
        },
        resolver: zodResolver(
            z.object({
                pixKey: z.string().min(7),
            }),
        ),
        mode: "all",
    });

    if (!therapist.data || therapist.isLoading)
        return (
            <View className="mx-4 mt-12">
                <CardSkeleton />
            </View>
        );

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await therapist.refetch();
        } finally {
            setRefreshing(false);
        }
    };

    const onSubmit = handleSubmit(async ({ pixKey }) => {
        try {
            await updateTherapist.mutateAsync({
                pixKey,
            });
            await therapist.refetch();
        } catch (error) {
            console.error(error);
        }
    });

    return (
        <ScreenWrapper paddingTop={8}>
            <Refreshable
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
            >
                <Header title={t({ message: "Payments Setup" })} />
                <Text className="pb-4 font-nunito-sans text-base text-slate-500">
                    <Trans>
                        You can configure a pix key to help your clients on
                        paying for your appointments
                    </Trans>
                </Text>

                <FormTextInput
                    required
                    control={control}
                    name="pixKey"
                    title={t({ message: "Pix key" })}
                    placeholder={t({
                        message: "CPF, E-mail or phone number",
                        comment: "Psych payments setup pix key placeholder",
                    })}
                />
                <LargeButton onPress={onSubmit} disabled={!isValid && isDirty}>
                    Save
                </LargeButton>
            </Refreshable>
        </ScreenWrapper>
    );
}
