import { Text, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
  type RegisterOptions,
} from "react-hook-form";

import { formatISODate } from "../helpers/formatISODate";

type DatePickerProps = Parameters<typeof DateTimePicker>["0"];
type FormDateProps = {
  title: string;
  show: boolean;
  onValuePress?: () => void;
  handleChange: (date?: Date) => void;
};

export function FormDateInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  title,
  show,
  onValuePress: onValuePress,
  control,
  name,
  handleChange,
  error,
  ...otherProps
}: FormDateProps &
  Omit<DatePickerProps, "value"> & {
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
        <>
          <View className="gap-2 py-3">
            <Text className="font-nunito-sans text-lg text-slate-700">
              {title}
            </Text>
            <View
              className={`flex flex-row items-center rounded border border-transparent px-2 ${
                fieldState.error?.message ? "border-red-600" : ""
              }`}
            >
              <Text
                onPress={onValuePress}
                className={`flex h-10 w-full flex-row items-center justify-center  font-nunito-sans text-xl`}
              >
                {formatISODate(value)}
              </Text>
              {fieldState.error?.message ? (
                <Text className="font-nunito ml-2 text-center text-red-600">
                  {fieldState.error.message}
                </Text>
              ) : null}
            </View>
          </View>
          {show && (
            <DateTimePicker
              {...otherProps}
              display="default"
              style={{
                width: 110,
                height: 50,
              }} // TODO: Melhorar responsividade
              value={value}
              onChange={(value, date) => {
                onChange(date);
                handleChange(date);
              }}
            />
          )}
        </>
      )}
    />
  );
}
