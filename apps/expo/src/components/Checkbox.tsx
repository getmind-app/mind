import { Text, View } from "react-native";
import CheckboxComponent from "@react-native-community/checkbox";

export type TextInputProps = Parameters<typeof Checkbox>[0];

export function Checkbox({
    title,
    error,
    onChange: onChange,
    ...otherProps
}: {
    title: string;
    error?: string;
    onChange?: ConstructorParameters<
        typeof CheckboxComponent
    >["0"]["onValueChange"];
} & Omit<
    ConstructorParameters<typeof CheckboxComponent>["0"],
    "onValueChange"
>) {
    return (
        <View className="gap-2 py-3">
            <Text className="font-nunito-sans text-lg text-slate-700">
                {title}
            </Text>
            <View
                className={`flex flex-row items-center rounded border border-off-white ${
                    error ? "border-red-600" : ""
                }`}
            >
                <CheckboxComponent onValueChange={onChange} {...otherProps} />
            </View>
            {error ? (
                <Text className="font-nunito ml-2 text-center text-red-600">
                    {error}
                </Text>
            ) : null}
        </View>
    );
}
