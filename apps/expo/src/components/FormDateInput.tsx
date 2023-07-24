import { Text, View } from "react-native";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
  type RegisterOptions,
} from "react-hook-form";

type FormInputProps = {
  title: string;
  show: boolean;
  onTitlePress?: () => void;
  handleChange: (date?: Date) => void;
};

export function FormDateInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  title,
  show,
  onTitlePress,
  control,
  name,
  handleChange,
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
      render={({ field: { onChange, value }, fieldState }) => (
        <View className="gap-2 py-3">
          <Text
            onPress={onTitlePress}
            className="font-nunito-sans text-lg text-slate-700"
          >
            {title}
          </Text>
          {show && (
            <DateTimePicker
              minimumDate={new Date(1920, 1, 1)}
              maximumDate={new Date()}
              style={{ width: 110, height: 50 }} // TODO: Melhorar responsividade
              value={value}
              onChange={(value, date) => {
                onChange(date);
                handleChange(date);
              }}
            />
          )}
        </View>
      )}
    />
  );
}
