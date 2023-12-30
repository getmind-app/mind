import React from "react";
import {
  Text,
  View,
  TouchableOpacity,
} from "react-native";

export type BubbleSelectInputProps<> = {
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
  const isOptionSelected = (option: string) => selectedOptions.includes(option);

  const handleSelectOption = (option: string) => {
    const isSelected = isOptionSelected(option);
    if (isSelected) {
      // Deselect
      onSelectOption(selectedOptions.filter((o) => o !== option));
    } else {
      // Select
      onSelectOption([...selectedOptions, option]);
    }
  };

  return (
    <View {...otherProps} style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>
        {title}
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            onPress={() => handleSelectOption(option)}
            style={{
              padding: 8,
              margin: 4,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: isOptionSelected(option) ? "blue" : "black",
              backgroundColor: isOptionSelected(option) ? "blue" : "white",
            }}
          >
            <Text
              style={{
                color: isOptionSelected(option) ? "white" : "black",
              }}
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
