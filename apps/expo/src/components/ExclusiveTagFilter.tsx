import { useState } from "react";

import { TouchableTag } from "./TouchableTag";

export function ExclusiveTagFilter<
    T extends { label: string; value: string }[],
>({
    tags,
    onChange,
    defaultValue,
}: {
    tags: T;
    onChange?: (value: string) => void;
    defaultValue?: string;
}) {
    const [selected, setSelected] = useState<string | null>(
        defaultValue || null,
    );

    return tags.map(({ label, value }) => (
        <TouchableTag
            key={value}
            checked={selected === value}
            onPress={() => {
                setSelected(value);
                if (onChange) {
                    onChange(value);
                }
            }}
        >
            {label}
        </TouchableTag>
    ));
}
