import { View } from "react-native";

import SkeletonCard from "./SkeletonCard";

export const ProfileSkeleton = () => {
  return (
    <View className="flex flex-row items-center pt-8">
      <View className="rounded-full">
        <SkeletonCard
          widthRatio={0.1}
          heightRatio={0.05}
          borderRadius={1000}
          backgroundColor="#f5f5f5"
          animationColor="#e0e0e0"
          animationDirection="horizontal"
          animationSpeed={1500}
        />
      </View>
      <View className="flex flex-col gap-2 pl-4">
        <View>
          <SkeletonCard
            widthRatio={0.3}
            heightRatio={0.015}
            borderRadius={8}
            backgroundColor="#f5f5f5"
            animationColor="#e0e0e0"
            animationDirection="horizontal"
            animationSpeed={1500}
          />
        </View>
        <View>
          <SkeletonCard
            widthRatio={0.5}
            heightRatio={0.01}
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
