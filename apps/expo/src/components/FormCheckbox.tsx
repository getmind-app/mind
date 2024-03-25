import {
    Controller,
    type Control,
    type FieldPath,
    type FieldValues,
    type RegisterOptions,
} from "react-hook-form";

import { Checkbox } from "./Checkbox";
import { type TextInputProps } from "./TextInput";

export function FormCheckbox<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
    control,
    name,
    rules,
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
}) {
    return (
        <Controller
            control={control}
            name={name}
            rules={rules}
            render={({ field: { onChange, value }, fieldState }) => (
                <Checkbox
                    error={fieldState.error?.message}
                    value={Boolean(value)}
                    onValueChange={onChange}
                    title={required ? `${title} *` : title}
                    {...otherProps}
                />
            )}
        />
    );
}
