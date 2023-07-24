import { TextInput as NativeTextInput, Text, View } from "react-native";

export type TextInputProps = NativeTextInput["props"] & {
  title: string;
  unit?: string;
  error?: string;
};

export const TextInput = ({
  title,
  unit,
  error,
  ...otherProps
}: TextInputProps) => {
  return (
    <View className="gap-2 py-3">
      <Text className="font-nunito-sans text-lg text-slate-700">{title}</Text>
      <View
        className={`flex flex-row items-center rounded border border-transparent px-2 ${
          error ? "border-red-600" : ""
        }`}
      >
        <NativeTextInput
          className={`h-10 ${
            unit ? "" : "w-full"
          } flex flex-row items-center justify-center  font-nunito-sans text-xl`}
          {...otherProps}
        />
        {unit ? (
          <Text className="ml-2 font-nunito-sans text-xl">{unit}</Text>
        ) : null}
      </View>
      {error ? (
        <Text className="font-nunito ml-2 text-center text-red-600">
          {error}
        </Text>
      ) : null}
    </View>
  );
};
