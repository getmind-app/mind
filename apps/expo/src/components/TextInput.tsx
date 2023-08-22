import { TextInput as NativeTextInput, Text, View } from "react-native";
import {
    MaskedTextInput,
    type MaskedTextInputProps,
} from "react-native-mask-text";

export type TextInputProps = Parameters<typeof TextInput>[0];

export function TextInput<T extends string>({
    title,
    unit,
    error,
    mask,
    onChangeText,
    ...otherProps
}: {
    title: string;
    unit?: string;
    error?: string;
    mask?: T;
    onChangeText?: T extends string
        ? MaskedTextInputProps["onChangeText"]
        : NativeTextInput["props"]["onChangeText"];
} & Omit<NativeTextInput["props"], "onChangeText">) {
    return (
        <View className="gap-2 py-3">
            <Text className="font-nunito-sans text-lg text-slate-700">
                {title}
            </Text>
            <View
                className={`flex flex-row items-center rounded border border-off-white  px-2 ${
                    error ? "border-red-600" : ""
                }`}
            >
                {mask ? (
                    <MaskedTextInput
                        mask={mask}
                        className={`h-10 ${
                            unit ? "" : "w-full"
                        } flex flex-row items-center justify-center  font-nunito-sans text-xl`}
                        onChangeText={onChangeText as any}
                        {...otherProps}
                    />
                ) : (
                    <NativeTextInput
                        // TODO: remover as any
                        onChangeText={onChangeText as any}
                        className={`h-10 ${
                            unit ? "" : "w-full"
                        } flex flex-row items-center justify-center  font-nunito-sans text-xl`}
                        {...otherProps}
                    />
                )}

                {unit ? (
                    <Text className="ml-2 font-nunito-sans text-xl">
                        {unit}
                    </Text>
                ) : null}
            </View>
            {error ? (
                <Text className="font-nunito ml-2 text-center text-red-600">
                    {error}
                </Text>
            ) : null}
        </View>
    );
}
