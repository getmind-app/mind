import {
    Text,
    TouchableOpacity,
    type TouchableOpacityProps,
} from "react-native";

export function TouchableTag({
    checked,
    children,
    ...rest
}: {
    checked: boolean;
} & TouchableOpacityProps) {
    return (
        <TouchableOpacity
            style={{
                padding: 8,
                backgroundColor: checked ? "#3b82f6" : "#f8f8f8",
                borderRadius: 8,
                borderWidth: 1,
                borderColor: checked ? "#3b82f6" : "#64748b",
                elevation: 2,
            }}
            {...rest}
        >
            <Text
                className={`font-nunito-sans ${
                    checked ? "text-white" : "text-black"
                }`}
            >
                {children}
            </Text>
        </TouchableOpacity>
    );
}
