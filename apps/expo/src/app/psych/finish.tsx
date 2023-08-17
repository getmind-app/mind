import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { Trans } from "@lingui/macro";

import { api } from "../../utils/api";

export default function SessionFinishAppointment() {
    const router = useRouter();
    const { appointmentId } = useSearchParams();

    const { data } = api.appointments.findById.useQuery({
        id: String(appointmentId),
    });

    return (
        <SafeAreaView className="h-full bg-off-white">
            <View className="flex flex-col items-center justify-center px-4 pt-28">
                <View className="flex items-center justify-center">
                    <Image
                        alt=""
                        source={require("../../../assets/success.png")}
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
                            <Text className="font-nunito-sans-bold text-lg">
                                {data?.therapist.name.split(" ")[0]}{" "}
                            </Text>
                            <Text className="font-nunito-sans text-lg text-slate-500">
                                will be meeting with you on{" "}
                            </Text>
                            <Text className="font-nunito-sans-bold text-lg ">
                                {new Intl.DateTimeFormat("en", {
                                    month: "long",
                                }).format(data?.scheduledTo)}
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
                <TouchableOpacity
                    onPress={() => {
                        router.push("/calendar");
                    }}
                    className="w-4/5 pt-8"
                >
                    <View className="flex flex-row items-center justify-center rounded-xl bg-[#2185EE] px-6 py-2">
                        <MaterialIcons
                            size={20}
                            name="schedule"
                            color="white"
                        />
                        <Text className="ml-2 font-nunito-sans-bold text-xl text-white">
                            <Trans>Create event</Trans>
                        </Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => {
                        router.push("/calendar");
                    }}
                    className="w-4/5 pt-4"
                >
                    <View className="flex flex-row items-center justify-center rounded-xl bg-white px-12 py-2 shadow-sm">
                        <Text className="font-nunito-sans text-xl">
                            <Trans>Your appointments</Trans>
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
