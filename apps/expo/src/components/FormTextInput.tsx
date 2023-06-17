import { Text, TextInput, View } from "react-native";

type FormInputProps = {
  title: string;
  placeholder: string;
  onChange: (value: string) => void;
};

export const FormTextInput = ({
  title,
  placeholder,
  onChange,
}: FormInputProps) => {
  return (
    <View className="gap-2 py-3">
      <Text className="font-nunito-sans text-lg text-slate-700">{title}</Text>
      <TextInput
        onChangeText={onChange}
        placeholder={placeholder}
        className="h-10 w-full text-xl"
      />
    </View>
  );
};
