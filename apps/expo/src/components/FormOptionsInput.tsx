import {
    Controller,
    type Control,
    type FieldPath,
    type FieldValues,
    type RegisterOptions,
} from "react-hook-form";

import { OptionsInput } from "./OptionsInput";

export function FormOptionsInput<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
    control,
    name,
    title,
    rules,
    error,
    options,
    ...otherProps
}: {
    control: Control<TFieldValues>;
    name: TName;
    title: string;
    rules?: Omit<
        RegisterOptions<TFieldValues, TName>,
        "valueAsNumber" | "valueAsDate" | "setValueAs" | "disabled"
    >;
    error?: string;
    options: string[];
}) {
    return (
        <Controller
            control={control}
            name={name}
            rules={rules}
            render={({ field: { onChange, onBlur, value }, fieldState }) => (
                <OptionsInput
                    {...otherProps}
                    title={title}
                    options={options}
                    selectedOptions={value}
                    onChangeSelectedOptions={onChange}
                    error={error ?? fieldState?.error?.message}
                />
            )}
        />
    );
}
