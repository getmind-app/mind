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
                backgroundColor: disabled
                    ? disabledColor(colors[color])
                    : colors[color],
                borderRadius: 8,
                alignItems: "center",
                alignSelf: "flex-start",
                justifyContent: "center",
                paddingHorizontal: 12,
                paddingVertical: 4,
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
                    color="white"
                    size={textSize}
                >
                    {children}
                </BasicText>
            </View>
        </TouchableOpacity>
    );
}
