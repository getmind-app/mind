import { Image, StyleSheet, View } from "react-native";
import {
    Circle,
    Defs,
    G,
    LinearGradient,
    Stop,
    Svg,
    type SvgProps,
} from "react-native-svg";

export function LogoSvg(props: SvgProps) {
    return (
        <Svg
            width={32}
            height={32}
            viewBox="0 0 500 500"
            id="SVGRoot"
            style={StyleSheet.absoluteFillObject}
            {...props}
        >
            <Defs>
                <LinearGradient
                    id="saco"
                    x1="77.550934"
                    y1="121.4492"
                    x2="127.29355"
                    y2="181.3414"
                    gradientUnits="userSpaceOnUse"
                    gradientTransform="matrix(6.034471,0,0,6.034471,-376.07971,-656.69603)"
                >
                    <Stop offset={1} stopColor={"#2897fb"} stopOpacity={1} />
                    <Stop offset={0} stopColor={"#192a70"} stopOpacity={1} />
                </LinearGradient>
            </Defs>
            <G fill={"url(#saco)"}>
                <Circle
                    fillOpacity={1}
                    strokeWidth={1.59662}
                    cx="250"
                    cy="250"
                    r="237.10881"
                />
            </G>
        </Svg>
    );
}
