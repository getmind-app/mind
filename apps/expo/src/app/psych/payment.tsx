import { useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useClerk } from "@clerk/clerk-expo";
import { Trans, t } from "@lingui/macro";
import { CardField, useConfirmPayment } from "@stripe/stripe-react-native";
import { type Details } from "@stripe/stripe-react-native/lib/typescript/src/types/components/CardFieldInput";

import { Header } from "../../components/Header";
import { ProfileSkeleton } from "../../components/ProfileSkeleton";
import { api } from "../../utils/api";

function handleMode(x: string) {
    if (x === "ONLINE") return t({ message: "Online" });
    if (x === "ON_SITE") return t({ message: "In Person" });
}

export default function SessionPayment() {
    const router = useRouter();
    const { user } = useClerk();
    const { appointmentId } = useLocalSearchParams();
    const [cardDetails, setCardDetails] = useState<Details>();
    const { confirmPayment, loading } = useConfirmPayment();
    const { data, isLoading } = api.appointments.findById.useQuery({
        id: String(appointmentId),
    });

    const { mutateAsync: payment } =
        api.stripe.createPaymentIntent.useMutation();

    const { mutateAsync: updateAppointment } = api.appointments.update.useMutation({
        onSuccess: () => {

            console.log("Appointment updated");

            router.push({
                pathname: "psych/finish",
                params: { appointmentId: appointmentId },
            });
        },
    });

    console.log(data);


    const handleConfirm = async () => {
        if (!cardDetails?.complete) {
            Alert.alert("Please enter complete card details");
            return;
        }

        const billingDetails = {
            email: user?.emailAddresses[0]?.emailAddress,
        };

        const { clientSecret } = await payment({
            amount: data?.therapist.hourlyRate * 100,
            currency: "brl",
            payment_method_types: ["card"],
        });

        const { error, paymentIntent } = await confirmPayment(clientSecret, {
            paymentMethodType: "Card",
            paymentMethodData: {
                billingDetails,
            },
        });

        if (error) {
            Alert.alert(`Payment error code: ${error.code}`, error.message);
            console.log("Payment confirmation error", error.message);
        } else if (paymentIntent) {

            console.log("Payment confirmed", paymentIntent);
            
            console.log("Updating appointment", data?.therapist.id, data?.patient.id);

            await updateAppointment({
                id: String(data?.id),
                scheduledTo: data?.scheduledTo,
                modality: data?.modality,
                status: data?.status,
                isPaid: true,
                therapistId: data?.therapist.id,
                patientId: data?.patient.id,
            })
        }
    };

    if (isLoading) {
        return (
            <>
                <Header />
                <ScrollView
                    className="min-h-screen bg-off-white px-4"
                    showsVerticalScrollIndicator={false}
                    overScrollMode="never"
                >
                    <View className="relative mt-4 rounded-2xl bg-white p-4 pt-6 shadow-sm">
                        <ProfileSkeleton />
                    </View>
                </ScrollView>
            </>
        );
    }

    return (
        <>
            <Header />
            <ScrollView
                className="min-h-screen bg-off-white px-4 pt-4"
                showsVerticalScrollIndicator={false}
                overScrollMode="never"
                
            >
                <View className="rounded-2xl bg-white px-4 py-6 shadow-sm">
                    <Text className="font-nunito-sans-bold text-2xl">
                        <Trans>Your appointment</Trans>
                    </Text>
                            <Text className="pt-2 font-nunito-sans text-sm">
                                <Trans>Details</Trans>
                            </Text>
                            <Text className="pt-2 pl-3 font-nunito-sans text-[#666666]">
                                <Trans>
                                    Appointments with {data?.therapist.name}
                                </Trans>
                            </Text>
                            <View>
                                <View className="pl-6 pt-2 flex flex-row justify-between">
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
                        <View className="flex flex-row justify-between pt-4">
                            <Text className="font-nunito-sans">
                                <Trans>Total</Trans>
                            </Text>
                            <Text className="font-nunito-sans">
                                {data?.therapist && data?.therapist.hourlyRate
                                    ? t({ message: "US$ " }) +
                                      data.therapist.hourlyRate
                                    : "N/A"}
                            </Text>
                        </View>
                        <View>
                        <Text className="pt-8 font-nunito-sans-bold text-2xl">
                            <Trans>Payment method</Trans>
                        </Text>
                        <CardField
                            style={{
                                width: "90%",
                                height: 50,
                                marginVertical: 8,
                            }}
                            cardStyle={{
                                backgroundColor: "#FFFFFF",
                                textColor: "#000000",
                                fontFamily: "Nunito Sans",
                                fontSize: 16,
                            }}
                            postalCodeEnabled={false}
                            placeholders={{ number: "4242424242424242" }}
                            onCardChange={(cardDetails) => {
                                setCardDetails(cardDetails);
                            }}
                        />
                        <TouchableOpacity
                        disabled={loading || !cardDetails?.complete}
                        onPress={handleConfirm}
                        className={`${loading || !cardDetails?.complete ? "bg-blue-300" : "bg-blue-500"} rounded-lg py-2 mt-2`}>
                        <Text className={"text-center font-nunito-sans-bold text-base text-white"}>
                            <Trans>Confirm</Trans>
                        </Text>
                    </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </>
    );
}
