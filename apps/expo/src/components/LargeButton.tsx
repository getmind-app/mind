import { TouchableOpacity, View } from "react-native";

import { BasicText } from "./BasicText";
import { Loading } from "./Loading";

type TouchableOpacityProps = ConstructorParameters<typeof TouchableOpacity>[0];
type ButtonColors = "red" | "blue";

function getButtonColor({
    color,
    disabled = false,
}: {
    color: ButtonColors;
    disabled?: boolean;
}) {
    switch (color) {
        case "red":
            if (disabled) return "#F87171";
            return "#EF4444";
        case "blue":
            if (disabled) return "#BFDBFE";
            return "#3B82F6";
    }
}

export function LargeButton({
    children,
    color = "blue",
    ...props
}: TouchableOpacityProps & {
    loading?: boolean;
    children: React.ReactNode;
    disabled?: boolean;
    color?: ButtonColors;
}) {
    return (
        <TouchableOpacity
            style={{
                width: "100%",
                backgroundColor: getButtonColor({
                    color,
                    disabled: props.disabled || props.loading,
                }),
                borderRadius: 10,
                paddingVertical: 12,
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
