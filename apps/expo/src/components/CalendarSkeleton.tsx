import { View } from "react-native";

import SkeletonCard from "./SkeletonCard";

export const CalendarSkeleton = () => {
  return (
    <View className="mt-4 flex flex-row rounded-xl bg-white px-6 py-8 shadow-sm">
      <View className="flex flex-col gap-4">
        <View>
          <SkeletonCard
            widthRatio={0.3}
            heightRatio={0.01}
            borderRadius={8}
            backgroundColor="#f5f5f5"
            animationColor="#e0e0e0"
            animationDirection="horizontal"
            animationSpeed={1500}
          />
        </View>
        <View>
          <SkeletonCard
            widthRatio={0.6}
            heightRatio={0.02}
            borderRadius={8}
            backgroundColor="#f5f5f5"
            animationColor="#e0e0e0"
            animationDirection="horizontal"
            animationSpeed={1500}
          />
        </View>
      </View>
    </View>
  );
};
