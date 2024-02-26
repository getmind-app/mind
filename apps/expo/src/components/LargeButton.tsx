import { TouchableOpacity, View } from "react-native";

import { colors, disabledColor, type Color } from "../utils/colors";
import { BasicText, type BasicTextSizes } from "./BasicText";
import { Loading } from "./Loading";

type TouchableOpacityProps = ConstructorParameters<typeof TouchableOpacity>[0];

export function LargeButton({
    children,
    color = "primaryBlue",
    disabled = false,
    textSize = "lg",
    style = {},
    ...props
}: TouchableOpacityProps & {
    loading?: boolean;
    children: React.ReactNode;
    disabled?: boolean;
    color?: Color;
    textSize?: BasicTextSizes;
}) {
    return (
        <TouchableOpacity
            style={{
                flex: 1,
                minHeight: 48,
                backgroundColor: disabled
                    ? disabledColor(colors[color])
                    : colors[color],
                borderRadius: 10,
                paddingVertical: 12,
                alignItems: "center",
                justifyContent: "center",
                ...(style as object),
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
                        style={{
                            position: "absolute",
                            left: -24,
                        }}
                    />
                )}
                <BasicText
                    style={{
                        position: "relative",
                    }}
                    fontWeight="bold"
                    color="white"
                    size={textSize}
                >
                    {children}
                </BasicText>
            </View>
        </TouchableOpacity>
    );
}
