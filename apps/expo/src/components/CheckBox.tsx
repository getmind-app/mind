import { View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { FontAwesome } from "@expo/vector-icons";

import { colors } from "../utils/colors";
import { BasicText } from "./BasicText";

export function CheckBox({
    checked,
    label,
    action,
}: {
    checked: boolean;
    label: string;
    action?: () => void;
}) {
    return (
        <View
            style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
            }}
        >
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                }}
            >
                <View
                    style={{
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: 100,
                        width: 24,
                        height: 24,
                        borderWidth: 2,
                        borderColor: colors.primaryBlue,
                    }}
                >
                    {checked && (
                        <View
                            style={{
                                width: 12,
                                height: 12,
                                borderRadius: 100,
                                backgroundColor: colors.primaryBlue,
                            }}
                        />
                    )}
                </View>
                <BasicText
                    style={{
                        marginLeft: 10,
                        textDecorationLine: checked ? "line-through" : "none",
                    }}
                    color={checked ? "gray" : "black"}
                >
                    {label}
                </BasicText>
            </View>
            {!checked && action && (
                <TouchableOpacity onPress={action}>
                    <FontAwesome
                        name="chevron-right"
                        size={12}
                        color={colors.primaryBlue}
                    />
                </TouchableOpacity>
            )}
        </View>
    );
}
