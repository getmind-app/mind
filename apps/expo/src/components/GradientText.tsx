import { View } from "react-native";
import { Defs, LinearGradient, Stop, Svg, Text } from "react-native-svg";

export function GradientText({ children }: { children?: React.ReactNode }) {
  return (
    <View>
      <Svg height="32" width="32">
        <Defs>
          <LinearGradient
            id="saco"
            x1="0"
            y1="0"
            x2="64"
            y2="64"
            gradientUnits="userSpaceOnUse"
            gradientTransform="matrix(6.034471,0,0,6.034471,-376.07971,-656.69603)"
          >
            <Stop offset={1} stopColor={"#1FA7F4"} stopOpacity={1} />
            <Stop offset={0} stopColor={"#000"} stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <Text
          fill="url(#saco)"
          fontSize="18"
          fontWeight="bold"
          x="50%"
          y="22"
          textAnchor="middle"
        >
          {children}
        </Text>
      </Svg>
    </View>
  );
}
