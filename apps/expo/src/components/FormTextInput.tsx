import { Text, TextInput, View, type InputModeOptions } from "react-native";

type FormInputProps = {
  title: string;
  placeholder: string;
  complement?: string;
  inputType?: InputModeOptions;
  value: string;
  onChange: (value: string) => void;
};

export const FormTextInput = ({
  title,
  placeholder,
  complement,
  inputType,
  value,
  onChange,
}: FormInputProps) => {
  const handleTextChange = (text: string) => {
    onChange(text);
  };

  return (
    <View className="gap-2 py-3">
      <Text className="font-nunito-sans text-lg text-slate-700">{title}</Text>
      <View className="flex flex-row items-center">
        <TextInput
          value={value}
          inputMode={inputType ? inputType : "text"}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          className={`h-10 ${
            complement ? "" : "w-full"
          } font-nunito-sans text-xl`}
        />
        {complement ? (
          <Text className="ml-2 font-nunito-sans text-xl">{complement}</Text>
        ) : null}
      </View>
    </View>
  );
};
