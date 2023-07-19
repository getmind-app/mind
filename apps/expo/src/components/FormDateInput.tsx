import { Text, View } from "react-native";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

type FormInputProps = {
  title: string;
  value: Date;
  onChange: (value: Date) => void;
  show: boolean;
  onTitlePress?: () => void;
};

export const FormDateInput = ({
  title,
  value,
  onChange,
  show,
  onTitlePress,
}: FormInputProps) => {
  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    if (selectedDate) onChange(selectedDate);
  };

  return (
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
          onChange={handleDateChange}
        />
      )}
    </View>
  );
};
