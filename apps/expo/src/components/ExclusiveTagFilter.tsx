import { useState } from "react";

import { TouchableTag } from "./TouchableTag";

export function ExclusiveTagFilter<
    T extends { label: string; value: string }[],
>({
    tags,
    onChange,
    defaultValue,
    a,
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
