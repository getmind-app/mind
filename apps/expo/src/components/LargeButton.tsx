import { TouchableOpacity, View } from "react-native";

import { BasicText } from "./BasicText";
import { Loading } from "./Loading";

type TouchableOpacityProps = ConstructorParameters<typeof TouchableOpacity>[0];

export function LargeButton({
    children,
    ...props
}: TouchableOpacityProps & {
    loading?: boolean;
    children: React.ReactNode;
    disabled?: boolean;
}) {
    return (
        <TouchableOpacity
            style={{
                width: "100%",
                backgroundColor:
                    props.disabled || props.loading ? "#bfdbfe" : "#3b82f6",
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
