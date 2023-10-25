import { Text, TouchableOpacity, View } from "react-native";

import { Loading } from "./Loading";

type TouchableOpacityProps = React.ComponentProps<typeof TouchableOpacity>;

export function LargeButton({
    children,
    ...props
}: TouchableOpacityProps & {
    loading?: boolean;
    children: React.ReactNode;
}) {
    return (
        <TouchableOpacity
            style={{
                width: "100%",
                backgroundColor:
                    props.disabled || props.loading ? "#bfdbfe" : "#3b82f6",
                borderRadius: 10,
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
                    className={`relative font-nunito-sans-bold text-lg text-white`}
                >
                    {children}
                </Text>
            </View>
        </TouchableOpacity>
    );
}
