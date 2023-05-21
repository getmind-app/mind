import React, { useEffect } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type AccordionProps = {
  title: React.ReactNode;
  children: React.ReactNode;
  expanded: boolean;
  setExpanded: (n: boolean) => void;
  maxHeight: number;
};

export const AnimatedCard = ({
  title,
  children,
  expanded: expandedProp,
  setExpanded: setExpandedProp,
  maxHeight,
}: AccordionProps) => {
  const expanded = useSharedValue(expandedProp);
  const animationHeight = useSharedValue(expandedProp ? maxHeight : 0);

  useEffect(() => {
    expanded.value = expandedProp;
    animationHeight.value = expandedProp ? maxHeight : 0;
  }, [expandedProp]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: withTiming(animationHeight.value, { duration: 200 }),
    };
  });

  const toggleAccordion = () => {
    expanded.value = !expanded.value;
    animationHeight.value = expanded.value ? maxHeight : 0;
    setExpandedProp(!expanded.value);
  };

  return (
    <View className={"bg-off-white relative mt-3 rounded-2xl p-3"}>
      <TouchableOpacity className={"rounded"} onPress={toggleAccordion}>
        {title}
      </TouchableOpacity>
      <Animated.View
        style={{
          overflow: "hidden",
          ...animatedStyle,
        }}
      >
        <View
          style={{
            overflow: "hidden",
          }}
        >
          {children}
        </View>
      </Animated.View>
    </View>
  );
};
