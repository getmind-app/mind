import { useState } from "react";
import { ScrollView } from "react-native";

import { TouchableTag } from "./TouchableTag";

export function ExclusiveTagFilter<
    T extends { label: string; value: string }[],
>({
    tags,
    onChange,
    selected,
}: {
    tags: T;
    onChange?: (value: string) => void;
    selected?: string;
}) {
    return (
        <ScrollView horizontal>
            {tags.map(({ label, value }) => (
                <TouchableTag
                    key={value}
                    checked={selected === value}
                    onPress={() => {
                        if (onChange) {
                            onChange(value);
                        }
                    }}
                    style={{ marginRight: 8 }}
                >
                    {label}
                </TouchableTag>
            ))}
        </ScrollView>
    );
}
