import { TouchableOpacity, View } from "react-native";

import { colors, disabledColor, type Color } from "../utils/colors";
import { BasicText } from "./BasicText";
import { Loading } from "./Loading";

type TouchableOpacityProps = ConstructorParameters<typeof TouchableOpacity>[0];

export function LargeButton({
    children,
    color = "primaryBlue",
    disabled = false,
    ...props
}: TouchableOpacityProps & {
    loading?: boolean;
    children: React.ReactNode;
    disabled?: boolean;
    color?: Color;
}) {
    return (
        <TouchableOpacity
            style={{
                width: "100%",
                backgroundColor: disabled
                    ? disabledColor(colors[color])
                    : colors[color],
                borderRadius: 10,
                paddingVertical: 12,
                alignItems: "center",
                justifyContent: "center",
            }}
            disabled={disabled}
            {...props}
        >
            <View
                style={{
                    position: "relative",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {props.loading && (
                    <Loading
                        color={colors.white}
                        style={{
                            position: "absolute",
                            left: -32,
                        }}
                    />
                )}
                <BasicText
                    style={{
                        position: "relative",
                    }}
                    fontWeight="bold"
                    color="white"
                    size="lg"
                >
                    {children}
                </BasicText>
            </View>
        </TouchableOpacity>
    );
}
