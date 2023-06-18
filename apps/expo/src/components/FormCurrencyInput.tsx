import { Text, View } from "react-native";
import CurrencyInput from "react-native-currency-input";

type FormInputProps = {
  title: string;
  value: number;
  onChange: (value: number) => void;
};

export const FormCurrencyInput = ({
  title,
  value,
  onChange,
}: FormInputProps) => {
  const handleValueChange = (value: number) => {
    onChange(value);
  };

  return (
    <View className="gap-2 py-3">
      <Text className="font-nunito-sans text-lg text-slate-700">{title}</Text>
      <CurrencyInput
        className="h-10 font-nunito-sans text-xl"
        value={value}
        onChangeValue={handleValueChange}
        prefix="US$ "
        delimiter=","
        separator="."
        maxValue={1000}
        precision={2}
        inputMode="numeric"
      />
    </View>
  );
};
