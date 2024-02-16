import { useState } from "react";
import { Text, TouchableOpacity } from "react-native";

export function TouchableTag({
    onPress,
    children,
    defaultChecked = false,
}: {
    onPress: ({ checked }: { checked: boolean }) => void;
    children: React.ReactNode;
    defaultChecked?: boolean;
}) {
    const [checked, setChecked] = useState(defaultChecked);

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
            onPress={() => {
                setChecked(!checked);
                onPress({ checked });
            }}
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
