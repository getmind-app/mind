import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { groupBy } from "lodash-es";

import { CardSkeleton } from "../../components/CardSkeleton";
import { api } from "../../utils/api";
import { type Hour } from ".prisma/client";

export default function AvailableHours() {
  const { user } = useUser();

  const { data, isLoading } = api.therapists.findByUserId.useQuery({
    userId: String(user?.id),
  });

  if (isLoading) return <CardSkeleton />;

  // TODO : acertar tipagem @abdul help me
  const groupedHours = groupBy(data?.hours, "weekDay");

  return (
    <View className="h-full bg-off-white px-4 pt-12">
      <Text className="pt-12 font-nunito-sans-bold text-3xl">
        Available hours
      </Text>
      <Text className="pb-4 font-nunito-sans text-base text-slate-500">
        Set available hours for your appointments.
      </Text>

      {Object.entries(groupedHours).map(([weekDay, hours]) => (
        <View key={weekDay} className="gap-2 pb-4">
          <Text className="font-nunito-sans text-xl">
            {capitalizeWeekDay(weekDay)}
          </Text>
          <View className="flex flex-row rounded-xl bg-white px-6 py-4 align-middle shadow-sm">
            <ScrollView horizontal={true}>
              {hours.map((hour: Hour) => (
                <HourButton key={hour.id} {...hour} />
              ))}
            </ScrollView>
          </View>
        </View>
      ))}
    </View>
  );
}

function HourButton(hour: Hour) {
  return (
    <View key={hour.id}>
      <TouchableOpacity
        onPress={() => null}
        className={`mr-2 flex items-center justify-center rounded-lg bg-off-white px-5 py-3`}
      >
        <Text className={`font-nunito-sans text-base `}>{hour.startAt}:00</Text>
      </TouchableOpacity>
    </View>
  );
}

const capitalizeWeekDay = (weekDay: string): string => {
  return weekDay.charAt(0) + weekDay.slice(1).toLowerCase();
};
