import { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Trans } from "@lingui/macro";

import { BasicText } from "../../components/BasicText";
import { LargeButton } from "../../components/LargeButton";
import { ScreenWrapper } from "../../components/ScreenWrapper";

export default function Onboard() {
    const router = useRouter();
    const [selectedRole, setSelectedRole] = useState<
        "patient" | "professional"
    >();

    function handleNext() {
        if (selectedRole === "patient") {
            router.push("/onboard/patient-profile");
        } else {
            router.push("/onboard/therapist-profile");
        }
    }

    return (
        <ScreenWrapper paddindBottom={16}>
            <View
                style={{
                    flex: 1,
                    justifyContent: "space-between",
                }}
            >
                <View
                    style={{
                        flex: 1,
                        rowGap: 16,
                    }}
                >
                    <View
                        style={{
                            flex: 1,
                            justifyContent: "center",
                            rowGap: 16,
                        }}
                    >
                        <BasicText size="3xl" style={{ paddingLeft: 12 }}>
                            <Trans>Who are you?</Trans>
                        </BasicText>
                        <View
                            style={{
                                flex: 1,
                                maxHeight: "30%",
                            }}
                        >
                            <Pressable
                                onPress={() => setSelectedRole("patient")}
                                style={{
                                    flex: 1,
                                    borderWidth: 2,
                                    borderColor:
                                        selectedRole === "patient"
                                            ? "#3b82f6"
                                            : "#f8f8f8",
                                    borderRadius: 16,
                                    flexDirection: "row",
                                    overflow: "hidden",
                                    backgroundColor:
                                        selectedRole === "patient"
                                            ? "#f0f9ff"
                                            : "#fff",
                                }}
                            >
                                <View
                                    className="items-center"
                                    style={{
                                        flex: 1,
                                        flexDirection: "row",
                                        alignItems: "center",
                                        paddingHorizontal: 24,
                                    }}
                                >
                                    <View
                                        style={{
                                            flex: 1,
                                        }}
                                    >
                                        <Text className="font-nunito-sans text-2xl">
                                            <Trans>Patient</Trans>
                                        </Text>
                                        <Text className="font-nunito-sans text-slate-500">
                                            <Trans>
                                                Looking for help or just want to
                                                talk
                                            </Trans>
                                        </Text>
                                    </View>
                                    <Image
                                        alt="Patient with a plant"
                                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                                        source={require("../../../assets/images/girl_flower.png")}
                                        style={{
                                            maxWidth: 180,
                                            maxHeight: 180,
                                            position: "relative",
                                            bottom: -24,
                                        }}
                                        resizeMode="contain"
                                    />
                                </View>
                            </Pressable>
                        </View>
                        <View
                            style={{
                                flex: 1,
                                maxHeight: "30%",
                            }}
                        >
                            <Pressable
                                onPress={() => setSelectedRole("professional")}
                                style={{
                                    flex: 1,
                                    borderWidth: 2,
                                    borderColor:
                                        selectedRole === "professional"
                                            ? "#3b82f6"
                                            : "#f8f8f8",
                                    borderRadius: 16,
                                    flexDirection: "row",
                                    overflow: "hidden",
                                    backgroundColor:
                                        selectedRole === "professional"
                                            ? "#f0f9ff"
                                            : "#fff",
                                }}
                            >
                                <View
                                    className="items-center"
                                    style={{
                                        flex: 1,
                                        flexDirection: "row",
                                        alignItems: "center",
                                        paddingHorizontal: 12,
                                    }}
                                >
                                    <Image
                                        alt="Patient with a plant"
                                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                                        source={require("../../../assets/images/girl_book.png")}
                                        style={{
                                            // for some reason it looks better if this image if smaller
                                            maxWidth: 160,
                                            maxHeight: 160,
                                            position: "relative",
                                            bottom: -24,
                                        }}
                                        resizeMode="contain"
                                    />
                                    <View
                                        style={{
                                            flex: 1,
                                        }}
                                    >
                                        <Text className="font-nunito-sans text-2xl">
                                            <Trans>Professional</Trans>
                                        </Text>
                                        <Text className="font-nunito-sans text-slate-500">
                                            <Trans>
                                                Meet and help new patients
                                            </Trans>
                                        </Text>
                                    </View>
                                </View>
                            </Pressable>
                        </View>
                    </View>
                </View>

                <LargeButton
                    onPress={handleNext}
                    disabled={!selectedRole}
                    style={{
                        maxHeight: 48,
                    }}
                >
                    <Trans>Next</Trans>
                </LargeButton>
            </View>
        </ScreenWrapper>
    );
}
