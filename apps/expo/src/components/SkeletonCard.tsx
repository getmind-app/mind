import React from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";

type SkeletonCardProps = {
  widthRatio?: number;
  heightRatio?: number;
  borderRadius?: number;
  backgroundColor?: string;
  animationColor?: string;
  animationDirection?: "horizontal" | "vertical" | "topLeftToBottomRight";
  animationSpeed?: number;
};

const SkeletonCard: React.FC<SkeletonCardProps> = ({
  widthRatio = 0.8,
  heightRatio = 0.5,
  borderRadius = 8,
  backgroundColor = "#f5f5f5",
  animationColor = "#e0e0e0",
  animationDirection = "horizontal",
  animationSpeed = 1000,
}) => {
  const { width, height } = Dimensions.get("window");

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

  const cardWidth = width * widthRatio;
  const cardHeight = height * heightRatio;

  const getAnimatedStyle = () => {
    if (animationDirection === "horizontal") {
      return {
        backgroundColor: interpolatedColor,
        transform: [
          {
            translateX: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [-cardWidth, cardWidth],
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
              outputRange: [-cardWidth, cardWidth],
            }),
          },
          {
            translateY: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [-cardHeight, cardHeight],
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
            outputRange: [-cardHeight, cardHeight],
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
          width: cardWidth,
          height: cardHeight,
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
