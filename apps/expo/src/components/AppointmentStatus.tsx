import { View } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { t } from "@lingui/macro";

import { type AppointmentStatus as AppointmentStatusType } from "../../../../packages/db";
import { type Color } from "../utils/colors";
import { BasicText } from "./BasicText";

export function AppointmentStatus({
    status,
}: {
    status: AppointmentStatusType;
}) {
    const statusMapper: {
        [key in AppointmentStatusType]: {
            color: Color;
            label: string;
        };
    } = {
        ACCEPTED: {
            color: "green",
            label: t({ message: "ACCEPTED" }),
        },
        PENDENT: {
            color: "yellow",
            label: t({ message: "PENDENT" }),
        },
        REJECTED: {
            color: "red",
            label: t({ message: "REJECTED" }),
        },
        CANCELED: {
            color: "red",
            label: t({ message: "CANCELED" }),
        },
    };

    const label = statusMapper[status].label;
    const color = statusMapper[status].color;

    return (
        <View
            style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
            }}
        >
            <FontAwesome size={12} name="circle" color={color} />
            <BasicText size="lg" fontWeight="bold">
                {label}
            </BasicText>
        </View>
    );
}
