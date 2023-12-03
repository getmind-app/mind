import { TouchableOpacity, View } from "react-native";

import { BasicText } from "./BasicText";
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
    ...props
}: TouchableOpacityProps & {
    loading?: boolean;
    children: React.ReactNode;
    disabled?: boolean;
    color?: color;
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
