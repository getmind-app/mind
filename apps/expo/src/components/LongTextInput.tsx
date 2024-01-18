import { TextInput as NativeTextInput, Text, View } from "react-native";
import { type MaskedTextInputProps } from "react-native-mask-text";

export type TextInputProps = Parameters<typeof LongTextInput>[0];

export function LongTextInput<T extends string>({
    title,
    error,
    value,
    lengthLimit,
    onChangeText,
    ...otherProps
}: {
    title: string;
    unit?: string;
    error?: string;
    value?: string;
    lengthLimit?: number;
    onChangeText?: T extends string
        ? MaskedTextInputProps["onChangeText"]
        : NativeTextInput["props"]["onChangeText"];
} & Omit<NativeTextInput["props"], "onChangeText">) {
    return (
        // TODO: add length limit
        <View className="gap-2 py-3">
            <Text className="font-nunito-sans text-lg text-slate-700">
                {title} {lengthLimit ? `(${value?.length}/${lengthLimit})` : ""}
            </Text>
            {/* input that grows as user type more */}
            <View
                className={`h-30 flex flex-row flex-wrap items-center rounded border border-off-white px-2 ${
                    error ? "border-red-600" : ""
                }`}
            >
                <NativeTextInput
                    multiline
                    maxLength={lengthLimit}
                    onChangeText={onChangeText as any}
                    className={`h-30 font-nunito-sans text-xl`}
                    {...otherProps}
                />
            </View>
            {error ? (
                <Text className="font-nunito ml-2 text-center text-red-600">
                    {error}
                </Text>
            ) : null}
        </View>
    );
}
