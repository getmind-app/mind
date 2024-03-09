import { Image, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGlobalSearchParams, useRouter } from "expo-router";
import { Trans } from "@lingui/macro";
import { useLingui } from "@lingui/react";

import { FullScreenLoading } from "../../../components/FullScreenLoading";
import { LargeButton } from "../../../components/LargeButton";
import { capitalizeFirstLetter } from "../../../helpers/capitalizeFirstLetter";
import { getLocale } from "../../../helpers/getLocale";
import { api } from "../../../utils/api";

export default function FinishAppointmentSchedulingScreen() {
    const router = useRouter();
    const { appointmentId } = useGlobalSearchParams();

    const { data, isLoading } = api.appointments.findById.useQuery({
        id: String(appointmentId),
    });

    const lingui = useLingui();

    const locale = getLocale(lingui);

    if (isLoading) {
        return <FullScreenLoading />;
    }

    return (
        <SafeAreaView className="h-full bg-off-white">
            <View className="flex flex-col items-center justify-center px-4 pt-28">
                <View className="flex items-center justify-center">
                    <Image
                        alt=""
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                        source={require("../../../../assets/images/girl_guitar.png")}
                        style={{ width: 200, height: 200 }}
                        resizeMode="contain"
                    />
                </View>
                <Text className="pt-8 font-nunito-sans-bold text-4xl">
                    <Trans>You&apos;re all set!</Trans>
                </Text>
                <View className="w-4/5 pt-2">
                    <Text className="text-center">
                        <Trans>
                            <Text className="font-nunito-sans text-lg text-slate-500">
                                If{" "}
                            </Text>
                            <Text className="font-nunito-sans-bold text-lg">
                                {data?.therapist.name.split(" ")[0]}{" "}
                            </Text>
                            <Text className="font-nunito-sans text-lg text-slate-500">
                                accepts, you will be meeting on{" "}
                            </Text>
                            <Text className="font-nunito-sans-bold text-lg ">
                                {capitalizeFirstLetter(
                                    new Intl.DateTimeFormat(locale.code, {
                                        month: "long",
                                    }).format(data?.scheduledTo),
                                )}
                                , {data?.scheduledTo.getDate()}{" "}
                            </Text>
                            <Text className="font-nunito-sans text-lg text-slate-500">
                                at{" "}
                            </Text>

                            <Text className="font-nunito-sans-bold text-lg">
                                {data?.scheduledTo.getHours()}:
                                {data?.scheduledTo.getMinutes() == 0
                                    ? "00"
                                    : data?.scheduledTo.getMinutes()}
                            </Text>
                        </Trans>
                    </Text>
                </View>

                <View
                    style={{
                        marginTop: 24,
                        width: "70%",
                    }}
                >
                    <LargeButton
                        onPress={() => {
                            router.push("/calendar");
                        }}
                        color="white"
                        textColor="black"
                    >
                        <Trans>Your appointments</Trans>
                    </LargeButton>
                </View>
            </View>
        </SafeAreaView>
    );
}
