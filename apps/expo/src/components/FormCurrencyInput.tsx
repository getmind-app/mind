import { Text, View } from "react-native";
import CurrencyInput from "react-native-currency-input";
import {
    Controller,
    type Control,
    type FieldPath,
    type FieldValues,
    type RegisterOptions,
} from "react-hook-form";

type FormInputProps = {
    title: string;
};

export function FormCurrencyInput<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
    title,
    control,
    name,
    rules,
}: FormInputProps & {
    control: Control<TFieldValues>;
    name: TName;
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
                <View className="gap-2 py-3">
                    <Text className="font-nunito-sans text-lg text-slate-700">
                        {title}
                    </Text>
                    <CurrencyInput
                        className="h-10 font-nunito-sans text-xl"
                        value={value}
                        onChangeValue={onChange}
                        onBlur={onBlur}
                        prefix="US$ "
                        delimiter=","
                        separator="."
                        maxValue={1000}
                        precision={2}
                        placeholder="100.00 USD"
                        inputMode="numeric"
                    />
                </View>
            )}
        />
    );
}
