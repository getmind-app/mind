import { useEffect, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import { t } from "@lingui/macro";
import { usePaymentSheet } from "@stripe/stripe-react-native";

import { Header } from "../../../components/Header";
import { ProfileSkeleton } from "../../../components/ProfileSkeleton";
import { api } from "../../../utils/api";

function handleMode(x: string) {
    if (x === "ONLINE") return t({ message: "Online" });
    if (x === "ON_SITE") return t({ message: "In Person" });
}

export default function AppointmentPaymentScreen() {
    const router = useRouter();
    const { appointmentId } = useLocalSearchParams();
    const updateAppointment = api.appointments.update.useMutation();
    const [ready, setReady] = useState(false);
    const {
        initPaymentSheet,
        presentPaymentSheet,
        loading: loadingPaymentSheet,
    } = usePaymentSheet();
    const { data, isLoading } = api.appointments.findById.useQuery({
        id: String(appointmentId),
    });

    useEffect(() => {
        if (data) {
            initialisePaymentSheet();
        }
    }, [data]);

    async function initialisePaymentSheet() {
        if (!data) {
            Alert.alert("Missing appointment data");
            return;
        }

        if (!data.therapist.paymentAccountId) {
            Alert.alert("Missing therapist payment account id");
            return;
        }

        const { setupIntent, ephemeralKey, customer } =
            await createSetupIntent.mutateAsync();

        if (!setupIntent.client_secret) {
            Alert.alert("Missing stripe's client secret");
            return;
        }

        const { error } = await initPaymentSheet({
            customerId: customer.id,
            customerEphemeralKeySecret: ephemeralKey.secret,
            setupIntentClientSecret: setupIntent.client_secret,
            merchantDisplayName: "Mind",
            allowsDelayedPaymentMethods: true,
            returnURL: Linking.createURL("/"),
        });

        if (error) {
            Alert.alert("Error", error.message);
        } else {
            setReady(true);
        }
    }

    const createSetupIntent = api.stripe.createSetupIntent.useMutation();

    const handleConfirm = async () => {
        const { error } = await presentPaymentSheet();

        if (error) {
            Alert.alert("Error", error.message);
        } else {
            router.push({
                pathname: "psych/finish",
                params: { appointmentId: appointmentId },
            });
            setReady(false);
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

    if (!data) {
        return <Text>Impossible scenario, missing session data</Text>;
    }

    return <Text>This is currently disabled</Text>;

    // return (
    //     <>
    //         <Header />
    //         <ScreenWrapper>
    //             <ScrollView
    //                 showsVerticalScrollIndicator={false}
    //                 overScrollMode="never"
    //             >
    //                 <View className="rounded-2xl bg-white px-4 py-6 shadow-sm">
    //                     <Text className="font-nunito-sans-bold text-2xl">
    //                         <Trans>Your appointment</Trans>
    //                     </Text>
    //                     <Text className="pl-0.5 pt-2 font-nunito-sans text-sm">
    //                         <Trans>Details</Trans>
    //                     </Text>
    //                     <Text className="pl-3 pt-2 font-nunito-sans text-[#666666]">
    //                         <Trans>
    //                             Appointments with {data?.therapist.name}
    //                         </Trans>
    //                     </Text>
    //                     <View>
    //                         <View className="flex flex-row justify-between pl-6 pt-2">
    //                             <Text className="font-nunito-sans text-[#666666]">
    //                                 {data?.scheduledTo.getDate()} -{" "}
    //                                 {data?.scheduledTo.getHours()}:
    //                                 {data?.scheduledTo.getMinutes() == 0
    //                                     ? "00"
    //                                     : data?.scheduledTo.getMinutes()}{" "}
    //                                 -{" "}
    //                                 {handleMode(
    //                                     data?.modality ? data?.modality : "",
    //                                 )}
    //                             </Text>
    //                             <Text className=" font-nunito-sans text-[#666666]">
    //                                 {"R$ "}
    //                                 {data?.therapist.hourlyRate}
    //                             </Text>
    //                         </View>
    //                     </View>
    //                     <View className="flex flex-row justify-between pt-4">
    //                         <Text className="pl-0.5 font-nunito-sans">
    //                             <Trans>Total</Trans>
    //                         </Text>
    //                         <Text className="font-nunito-sans">
    //                             {data?.therapist && data?.therapist.hourlyRate
    //                                 ? "R$ " + data.therapist.hourlyRate
    //                                 : "N/A"}
    //                         </Text>
    //                     </View>
    //                     <View>
    //                         <Text className="pt-8 font-nunito-sans-bold text-2xl">
    //                             <Trans>Payment method</Trans>
    //                         </Text>

    //                         <TouchableOpacity
    //                             disabled={loadingPaymentSheet || !ready}
    //                             onPress={handleConfirm}
    //                             className={`${
    //                                 loadingPaymentSheet
    //                                     ? "bg-blue-300"
    //                                     : "bg-blue-500"
    //                             } mt-2 rounded-lg py-2`}
    //                         >
    //                             <Text
    //                                 className={
    //                                     "text-center font-nunito-sans-bold text-base text-white"
    //                                 }
    //                             >
    //                                 <Trans>Confirm</Trans>
    //                             </Text>
    //                         </TouchableOpacity>
    //                     </View>
    //                 </View>
    //             </ScrollView>
    //         </ScreenWrapper>
    //     </>
    // );
}
