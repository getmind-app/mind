import { Text, TouchableOpacity, View } from "react-native";

import { Loading } from "./Loading";

type TouchableOpacityProps = React.ComponentProps<typeof TouchableOpacity>;

type color = "white" | "blue";

const colorMapper: {
    [key in color]: {
        backgroundColor: string;
        text: string;
    };
} = {
    white: { backgroundColor: "#f8f8f8", text: "black" },
    blue: { backgroundColor: "#3b82f6", text: "white" },
};

export function LargeButton({
    children,
    color = "blue",
    textStyle,
    ...props
}: TouchableOpacityProps & {
    loading?: boolean;
    children: React.ReactNode;
    color?: color;
    textStyle?: React.ComponentProps<typeof Text>["style"];
}) {
    return (
        <TouchableOpacity
            style={{
                width: "100%",
                backgroundColor: colorMapper[color].backgroundColor,
                borderRadius: 10,
                opacity: props.disabled || props.loading ? 0.5 : 1,
                paddingVertical: 8,
                alignItems: "center",
                justifyContent: "center",
            }}
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
                <Text
                    style={{
                        color: colorMapper[color].text,
                        position: "relative",
                        fontFamily: "NunitoSans_700Bold",
                        fontSize: 18,
                        lineHeight: 28,
                        ...(textStyle !== null && typeof textStyle === "object"
                            ? textStyle
                            : {}),
                    }}
                >
                    {children}
                </Text>
            </View>
        </TouchableOpacity>
    );
}
