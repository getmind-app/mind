import { useState } from "react";
import { View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Feather } from "@expo/vector-icons";
import { t } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import { format } from "date-fns";

import { type PatientReport } from "@acme/api/src/router/finances";

import { getLocale } from "../helpers/getLocale";
import { BasicText } from "./BasicText";
import { Card } from "./Card";
import { UserPhoto } from "./UserPhotos";

export function PatientCard({ patient }: { patient: PatientReport }) {
    const lingui = useLingui();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Card key={patient.patientId} paddingHorizontal={6} paddingVertical={6}>
            <View
                style={{
                    flex: 3,
                }}
            >
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <View
                        style={{
                            flex: 1,
                            flexDirection: "row",
                            alignItems: "center",
                        }}
                    >
                        <UserPhoto
                            userId={null}
                            alt={patient.patientName}
                            url={patient.patientProfilePicture}
                            width={32}
                            height={32}
                            iconSize={20}
                        />
                        <BasicText
                            size="xl"
                            style={{
                                marginLeft: 12,
                            }}
                        >
                            {patient.patientName}
                        </BasicText>
                    </View>
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 12,
                        }}
                    >
                        <BasicText
                            size="xl"
                            fontWeight="bold"
                            color="primaryBlue"
                        >
                            R$ {patient.total}
                        </BasicText>
                        <TouchableOpacity
                            onPress={() => {
                                setIsOpen(!isOpen);
                            }}
                        >
                            <Feather
                                name={isOpen ? "chevron-up" : "chevron-down"}
                                size={16}
                                color="black"
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {isOpen && (
                    <View
                        style={{
                            flexDirection: "column",
                            alignItems: "flex-start",
                            justifyContent: "flex-start",
                            marginTop: 16,
                        }}
                    >
                        <BasicText
                            size="xl"
                            fontWeight="bold"
                            style={{
                                textTransform: "capitalize",
                            }}
                        >
                            {t({ message: "Sessions" })}
                        </BasicText>
                        <View style={{ marginTop: 4, flex: 1, gap: 4 }}>
                            {patient.appointments.map((appointment) => (
                                <View
                                    key={appointment.id}
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        width: "100%",
                                    }}
                                >
                                    <BasicText
                                        size="md"
                                        style={{
                                            textTransform: "capitalize",
                                        }}
                                    >
                                        {format(
                                            new Date(appointment.scheduledTo),
                                            "EEEE, dd/MM",
                                            {
                                                locale: getLocale(lingui),
                                            },
                                        )}
                                        {", "}
                                        {format(
                                            appointment.scheduledTo,
                                            "HH:mm",
                                        )}
                                    </BasicText>
                                    <BasicText
                                        fontWeight="bold"
                                        color="primaryBlue"
                                        size="md"
                                    >
                                        R$ {appointment.amount}
                                    </BasicText>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
            </View>
        </Card>
    );
}
