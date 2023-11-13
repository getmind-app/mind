import { View } from "react-native";

import { CardSkeleton } from "./CardSkeleton";

export function Card({
    isLoading = false,
    children,
}: {
    isLoading?: boolean;
    children: React.ReactNode;
}) {
    if (isLoading) return <CardSkeleton />;

    return (
        <View
            className="my-2 rounded-xl bg-white p-6 shadow-sm"
            style={{ elevation: 4, shadowColor: "#000", marginHorizontal: 2 }}
        >
            {children}
        </View>
    );
}
