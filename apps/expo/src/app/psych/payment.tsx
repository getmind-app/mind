import { useEffect } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";
import { Trans, t } from "@lingui/macro";
import { usePaymentSheet } from "@stripe/stripe-react-native";

import { Header } from "../../components/Header";
import initialisePaymentSheet from "../../helpers/initialisePaymentSheet";
import { api } from "../../utils/api";

function handleMode(x: string) {
    if (x === "ONLINE") return t({ message: "Online" });
    if (x === "ON_SITE") return t({ message: "In Person" });
}

export default function SessionPayment() {
    const router = useRouter();
    const { initPaymentSheet, presentPaymentSheet, loading } =
        usePaymentSheet();
    const { appointmentId } = useLocalSearchParams();
    const { data } = api.appointments.findById.useQuery({
        id: String(appointmentId),
    });

    function handleConfirm() {
        router.push({
            pathname: "psych/finish",
            params: { appointmentId: appointmentId },
        });
    }

    useEffect(() => {
        initialisePaymentSheet();
    }, []);

    return (
        <>
            <Header />
            <ScrollView
                className="min-h-screen bg-off-white px-4"
                showsVerticalScrollIndicator={false}
                overScrollMode="never"
            >
                <View className="relative mt-4 rounded-2xl bg-white p-4 pt-6 shadow-sm">
                    <Text className="mb-4 font-nunito-sans-bold text-2xl">
                        <Trans>Your appointment</Trans>
                    </Text>
                    <View className="mb-8">
                        <View className="mb-2">
                            <Text className="mb-2 font-nunito-sans text-sm">
                                <Trans>Details</Trans>
                            </Text>
                            <Text className="mb-2 ml-3 font-nunito-sans text-[#666666]">
                                <Trans>
                                    Appointments with {data?.therapist.name}
                                </Trans>
                            </Text>
                            <View>
                                <View className="ml-6 flex flex-row justify-between">
                                    <Text className="font-nunito-sans text-[#666666]">
                                        {data?.scheduledTo.getDate()} -{" "}
                                        {data?.scheduledTo.getHours()}:
                                        {data?.scheduledTo.getMinutes() == 0
                                            ? "00"
                                            : data?.scheduledTo.getMinutes()}{" "}
                                        -{" "}
                                        {handleMode(
                                            data?.modality
                                                ? data?.modality
                                                : "",
                                        )}
                                    </Text>
                                    <Text className=" font-nunito-sans text-[#666666]">
                                        {t({ message: "US$" })}{" "}
                                        {data?.therapist.hourlyRate}
                                    </Text>
                                </View>
                            </View>
                        </View>
                        <View className="mb-4">
                            <Text className="mb-2 font-nunito-sans text-sm">
                                <Trans>Discount</Trans>
                            </Text>
                            <View>
                                <View className="ml-3 flex flex-row justify-between">
                                    <Text className=" font-nunito-sans text-[#666666]">
                                        <Trans>First Appointment (10%)</Trans>
                                    </Text>
                                    <Text className="font-nunito-sans text-green-500">
                                        {data?.therapist &&
                                        data?.therapist.hourlyRate
                                            ? `- ${t({ message: "US$" })} ` +
                                              data.therapist.hourlyRate * 0.1
                                            : "N/A"}{" "}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View className="flex flex-row justify-between ">
                            <Text className="font-nunito-sans">
                                <Trans>Total</Trans>
                            </Text>
                            <Text className="font-nunito-sans">
                                {data?.therapist && data?.therapist.hourlyRate
                                    ? t({ message: "US$ " }) +
                                      data.therapist.hourlyRate * 0.9
                                    : "N/A"}{" "}
                            </Text>
                        </View>
                    </View>
                    <View>
                        <Text className="mb-4 font-nunito-sans-bold text-2xl">
                            <Trans>Payment method</Trans>
                        </Text>
                        <View className="mb-2 flex flex-row items-center rounded-lg bg-[#E9E9E9] px-5 py-4">
                            <View className="flex flex-row items-center">
                                <FontAwesome5 size={24} name="cc-visa" />
                                <Text className="ml-4 font-nunito-sans-bold">
                                    **** 2215
                                </Text>
                            </View>
                            <View className="ml-auto flex flex-row items-center">
                                <FontAwesome5 name="chevron-down" />
                            </View>
                        </View>
                        <Text className="ml-2 font-nunito-sans text-xs text-[#666666]">
                            <Trans>
                                The payment will be processed a day before each
                                session.
                            </Trans>
                        </Text>
                    </View>
                </View>
                <View className="relative mt-4 rounded-2xl bg-off-white p-4">
                    <Text className="mb-1 font-nunito-sans-bold text-2xl">
                        <Trans>Confirm sessions</Trans>
                    </Text>
                    <Text className="mb-6 font-nunito-sans text-xs text-[#666666]">
                        <Trans>
                            You can cancel or reschedule your sessions up to 24
                            hours before.
                        </Trans>
                    </Text>
                    <TouchableOpacity
                        onPress={handleConfirm}
                        className={`rounded-lg bg-[#2185EE] px-16 py-3`}
                    >
                        <Text
                            className={`text-center font-nunito-sans-bold text-base text-white`}
                        >
                            <Trans>Confirm</Trans>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </>
    );
}
