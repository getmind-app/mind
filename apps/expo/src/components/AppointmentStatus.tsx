import { Text, View } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { t } from "@lingui/macro";

import { type AppointmentStatus as AppointmentStatusType } from "../../../../packages/db";

export function AppointmentStatus({
    status,
}: {
    status: AppointmentStatusType;
}) {
    const statusMapper: {
        [key in AppointmentStatusType]: {
            color: string;
            circleColor: string;
            label: string;
        };
    } = {
        ACCEPTED: {
            color: "green-600",
            circleColor: "green",
            label: t({ message: "ACCEPTED" }),
        },
        PENDENT: {
            color: "yellow-300",
            circleColor: "yellow",
            label: t({ message: "PENDENT" }),
        },
        REJECTED: {
            color: "red-500",
            circleColor: "red",
            label: t({ message: "REJECTED" }),
        },
        CANCELED: {
            color: "red-500",
            circleColor: "red",
            label: t({ message: "CANCELED" }),
        },
    };

    const textColor = statusMapper[status].color;
    const circleColor = statusMapper[status].circleColor;
    const label = statusMapper[status].label;

    return (
        <View className="flex flex-row items-center align-middle">
            <FontAwesome size={12} name="circle" color={circleColor} />
            <Text
                className={`text-${textColor} pl-2 font-nunito-sans-bold text-base`}
            >
                {label}
            </Text>
        </View>
    );
}
