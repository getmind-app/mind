import { View } from "react-native";

import { CardSkeleton } from "./CardSkeleton";

export function Card({
    isLoading = false,
    paddingHorizontal = 6,
    paddingVertical = 6,
    children,
}: {
    isLoading?: boolean;
    paddingHorizontal?: number;
    paddingVertical?: number;
    children: React.ReactNode;
}) {
    if (isLoading) return <CardSkeleton />;

    return (
        <View
            className={`my-2 rounded-xl bg-white shadow-sm py-${paddingVertical} px-${paddingHorizontal}`}
            style={{ elevation: 2 }}
        >
            {children}
        </View>
    );
}
