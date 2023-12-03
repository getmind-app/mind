import { View } from "react-native";

import { CardSkeleton } from "./CardSkeleton";

type StyleObject = ConstructorParameters<typeof View>[0]["style"];

type color = "white" | "red" | "orange";

const colorToBackgroundMapper: {
    [key in color]: string;
} = {
    white: "#fff",
    red: "#ef4444",
    orange: "#f97316",
};

export function Card({
    isLoading = false,
    children,
    style = {},
    color = "white",
}: {
    isLoading?: boolean;
    children: React.ReactNode;
    style?: StyleObject;
    color?: color;
}) {
    if (isLoading) return <CardSkeleton />;

    return (
        <View
            style={{
                elevation: 2,
                marginHorizontal: 2,
                marginVertical: 8,
                borderRadius: 12,
                backgroundColor: colorToBackgroundMapper[color],
                ...(typeof style === "object" && style !== null ? style : {}),
            }}
        >
            {children}
        </View>
    );
}
