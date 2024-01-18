import {
    Controller,
    type Control,
    type FieldPath,
    type FieldValues,
    type RegisterOptions,
} from "react-hook-form";

import { LongTextInput } from "./LongTextInput";
import { type TextInputProps } from "./TextInput";

export function FormLongTextInput<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
    control,
    name,
    rules,
    lengthLimit,
    ...otherProps
}: TextInputProps & {
    control: Control<TFieldValues>;
    name: TName;
    rules?: Omit<
        RegisterOptions<TFieldValues, TName>,
        "valueAsNumber" | "valueAsDate" | "setValueAs" | "disabled"
    >;
    lengthLimit?: number;
    error?: string;
}) {
    return (
        <Controller
            control={control}
            name={name}
            rules={rules}
            render={({ field: { onChange, onBlur, value }, fieldState }) => (
                <LongTextInput
                    error={fieldState.error?.message}
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    lengthLimit={lengthLimit}
                    {...otherProps}
                />
            )}
        />
    );
}
