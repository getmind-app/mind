import { TouchableOpacity, View } from "react-native";

import { colors, disabledColor, type Color } from "../utils/colors";
import { BasicText, type BasicTextSizes } from "./BasicText";
import { Loading } from "./Loading";

type TouchableOpacityProps = ConstructorParameters<typeof TouchableOpacity>[0];

export function SmallButton({
    children,
    color = "primaryBlue",
    disabled = false,
    textSize = "md",
    textColor = "white",
    ...props
}: TouchableOpacityProps & {
    loading?: boolean;
    children: React.ReactNode;
    disabled?: boolean;
    color?: Color;
    textSize?: BasicTextSizes;
    textColor?: Color;
}) {
    return (
        <TouchableOpacity
            style={{
                backgroundColor: disabled
                    ? disabledColor(colors[color])
                    : colors[color],
                borderRadius: 8,
                alignItems: "center",
                alignSelf: "flex-start",
                justifyContent: "center",
                paddingHorizontal: 12,
                paddingVertical: 4,
            }}
            disabled={disabled}
            {...props}
        >
            <View
                style={{
                    position: "relative",
                    alignItems: "center",
                    justifyContent: "center",
                    alignSelf: "flex-start",
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
                    color={textColor}
                    size={textSize}
                >
                    {children}
                </BasicText>
            </View>
        </TouchableOpacity>
    );
}
