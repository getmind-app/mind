import { Text } from "react-native";

import { colors, type Color } from "../utils/colors";

type BasicTextProps = ConstructorParameters<typeof Text>[0] & {
    fontWeight?: "bold" | "normal";
    color?: Color;
    size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
};

const sizeMapper: {
    [key in NonNullable<BasicTextProps["size"]>]: number;
} = {
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    "2xl": 20,
    "3xl": 24,
};

export function BasicText({
    children,
    fontWeight = "normal",
    color = "black",
    size = "md",
    style: propsStyle,
    ...rest
}: BasicTextProps) {
    const style: BasicTextProps["style"] = {
        fontFamily:
            fontWeight === "bold"
                ? "NunitoSans_700Bold"
                : "NunitoSans_400Regular",
        color: colors[color],
        fontSize: sizeMapper[size] ?? "md",
    };

    return (
        <Text
            style={
                typeof propsStyle === "object"
                    ? {
                          ...propsStyle,
                          ...style,
                      }
                    : style
            }
            {...rest}
        >
            {children}
        </Text>
    );
}
