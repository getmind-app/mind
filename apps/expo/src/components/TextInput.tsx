import { TextInput as NativeTextInput, Text, View } from "react-native";

type TextInputProps = NativeTextInput["props"] & {
  title: string;
  unit?: string;
};

export const TextInput = ({ title, unit, ...otherProps }: TextInputProps) => {
  return (
    <View className="gap-2 py-3">
      <Text className="font-nunito-sans text-lg text-slate-700">{title}</Text>
      <View className="flex flex-row items-center">
        <NativeTextInput
          className={`h-10 ${unit ? "" : "w-full"} font-nunito-sans text-xl`}
          {...otherProps}
        />
        {unit ? (
          <Text className="ml-2 font-nunito-sans text-xl">{unit}</Text>
        ) : null}
      </View>
    </View>
  );
};
