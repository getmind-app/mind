import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export type BubbleSelectInputProps = {
    title: string;
    error?: string;
    options: string[];
    selectedOptions?: string[];
    onChangeSelectedOptions: (options: string[]) => void;
} & Omit<View["props"], "onPress">;

export function OptionsInput({
    title,
    error,
    options,
    selectedOptions = [],
    onChangeSelectedOptions: onSelectOption,
    ...otherProps
}: BubbleSelectInputProps) {
    const isOptionSelected = (option: string) =>
        selectedOptions.includes(option);

    const handleSelectOption = (option: string) => {
        const isSelected = isOptionSelected(option);
        if (isSelected) {
            onSelectOption(selectedOptions.filter((o) => o !== option));
        } else {
            onSelectOption([...selectedOptions, option]);
        }
    };

    return (
        <View className="gap-2 py-3">
            <Text className="font-nunito-sans text-lg text-slate-700">
                {title}
            </Text>
            <View
                style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                }}
            >
                {options.map((option) => (
                    <TouchableOpacity
                        key={option}
                        onPress={() => handleSelectOption(option)}
                        style={{
                            paddingVertical: 8,
                            paddingHorizontal: 16,
                            marginHorizontal: 4,
                            marginBottom: 8,
                            borderRadius: 50,
                            borderWidth: 1,
                            borderColor: isOptionSelected(option)
                                ? "#3b82f6"
                                : "#C0C0C2",
                            backgroundColor: isOptionSelected(option)
                                ? "#3b82f6"
                                : "white",
                        }}
                    >
                        <Text
                            style={{
                                color: isOptionSelected(option)
                                    ? "white"
                                    : "black",
                            }}
                            className="font-nunito-sans text-sm"
                        >
                            {option}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            {error ? (
                <Text style={{ color: "red", marginTop: 8 }}>{error}</Text>
            ) : null}
        </View>
    );
}
