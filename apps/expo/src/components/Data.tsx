import { View } from "react-native";

import { colors, type Color } from "../utils/colors";
import { BasicText } from "./BasicText";

export function Data({
    value,
    label,
    color = "primaryBlue",
}: {
    value: string | number;
    label: string;
    color?: Color;
}) {
    return (
        <View
            style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
            }}
        >
            <View
                style={{
                    borderRadius: 8,
                    width: 8,
                    height: 8,
                    backgroundColor: colors[color],
                }}
            />
            <BasicText fontWeight="bold" color={color}>
                {value} {label}
            </BasicText>
        </View>
    );
}
