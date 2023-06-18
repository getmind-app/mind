import React from "react";
import { Animated, StyleSheet, View } from "react-native";

type SkeletonCardProps = {
  width: number;
  height: number;
  borderRadius?: number;
  backgroundColor?: string;
  animationColor?: string;
  animationDirection?: "horizontal" | "vertical" | "topLeftToBottomRight";
  animationSpeed?: number;
};

const SkeletonCard: React.FC<SkeletonCardProps> = ({
  width,
  height,
  borderRadius = 8,
  backgroundColor = "#f5f5f5",
  animationColor = "#e0e0e0",
  animationDirection = "horizontal",
  animationSpeed = 1000,
}) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: animationSpeed,
        useNativeDriver: false,
      }),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [animatedValue, animationSpeed]);

  const interpolatedColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [backgroundColor, animationColor],
  });

  const getAnimatedStyle = () => {
    if (animationDirection === "horizontal") {
      return {
        backgroundColor: interpolatedColor,
        transform: [
          {
            translateX: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [-width, width],
            }),
          },
        ],
      };
    }

    if (animationDirection === "topLeftToBottomRight") {
      return {
        backgroundColor: interpolatedColor,
        transform: [
          {
            translateX: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [-width, width],
            }),
          },
          {
            translateY: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [-height, height],
            }),
          },
        ],
      };
    }

    return {
      backgroundColor: interpolatedColor,
      transform: [
        {
          translateY: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [-height, height],
          }),
        },
      ],
    };
  };

  return (
    <View
      style={[
        styles.container,
        {
          width,
          height,
          borderRadius,
          backgroundColor,
        },
      ]}
    >
      <Animated.View style={[StyleSheet.absoluteFill, getAnimatedStyle()]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    overflow: "hidden",
  },
});

export default SkeletonCard;
