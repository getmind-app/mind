import { Text, View } from "react-native";
import CurrencyInput from "react-native-currency-input";
import { Trans, t } from "@lingui/macro";
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
    platformFee,
    required,
}: FormInputProps & {
    control: Control<TFieldValues>;
    name: TName;
    rules?: Omit<
        RegisterOptions<TFieldValues, TName>,
        "valueAsNumber" | "valueAsDate" | "setValueAs" | "disabled"
    >;
    error?: string;
    platformFee?: number;
    required?: boolean;
}) {
    return (
        <Controller
            control={control}
            name={name}
            rules={rules}
            render={({ field: { onChange, onBlur, value }, fieldState }) => (
                <View className="gap-2 py-3">
                    <Text className="font-nunito-sans text-lg text-slate-700">
                        {required ? `${title} *` : title}
                    </Text>
                    {platformFee && (
                        <Text className="font-nunito-sans text-sm text-slate-500">
                            {value ? (
                                <Trans>
                                    You'll receive R${" "}
                                    {(value * (1 - platformFee)).toFixed(2) ??
                                        0}{" "}
                                    ({(1 - platformFee) * 100}%) for each
                                    session
                                </Trans>
                            ) : (
                                <Trans>
                                    Type the amount you want to charge for each
                                    session
                                </Trans>
                            )}
                        </Text>
                    )}
                    <CurrencyInput
                        className="h-10 px-2 font-nunito-sans text-xl"
                        value={value}
                        onChangeValue={onChange}
                        onBlur={onBlur}
                        prefix={t({ message: "R$ " })}
                        delimiter=","
                        separator="."
                        maxValue={1000}
                        precision={2}
                        placeholder={t({ message: "100.00" })}
                        inputMode="numeric"
                    />
                </View>
            )}
        />
    );
}
