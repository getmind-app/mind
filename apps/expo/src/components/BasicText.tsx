import { Text } from "react-native";

type BasicTextProps = ConstructorParameters<typeof Text>[0] & {
    fontWeight?: "bold" | "normal";
    color?: "black" | "white" | "gray";
    size?: "sm" | "md" | "lg" | "xl" | "2xl";
};

const colorMapper: {
    [key in NonNullable<BasicTextProps["color"]>]: string;
} = {
    black: "#000",
    white: "#fff",
    gray: "#666",
};

const sizeMapper: {
    [key in NonNullable<BasicTextProps["size"]>]: number;
} = {
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    "2xl": 20,
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
        color: colorMapper[color] ?? colorMapper.black,
        fontSize: sizeMapper[size] ?? "md",
    };

    return (
        <Text
            style={{
                ...style,
                ...(typeof propsStyle === "object" && propsStyle !== null
                    ? propsStyle
                    : {}),
            }}
            {...rest}
        >
            {children}
        </Text>
    );
}
