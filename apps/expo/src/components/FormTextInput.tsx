import {
    Controller,
    type Control,
    type FieldPath,
    type FieldValues,
    type RegisterOptions,
} from "react-hook-form";

import { TextInput, type TextInputProps } from "./TextInput";

export function FormTextInput<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
    T extends string | undefined = undefined,
>({
    control,
    name,
    rules,
    error,
    required,
    title,
    ...otherProps
}: TextInputProps & {
    control: Control<TFieldValues>;
    name: TName;
    required?: boolean;
    title?: string;
    rules?: Omit<
        RegisterOptions<TFieldValues, TName>,
        "valueAsNumber" | "valueAsDate" | "setValueAs" | "disabled"
    >;
    error?: string;
}) {
    return (
        <Controller
            control={control}
            name={name}
            rules={rules}
            render={({ field: { onChange, onBlur, value }, fieldState }) => (
                <TextInput
                    error={fieldState.error?.message}
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    title={required ? `${title} *` : title}
                    {...otherProps}
                />
            )}
        />
    );
}
