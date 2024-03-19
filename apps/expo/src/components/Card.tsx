import { View } from "react-native";

import { CardSkeleton } from "./CardSkeleton";

export function Card({
    isLoading = false,
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
            className={`my-2 rounded-xl bg-white shadow-sm`}
            style={{ elevation: 2, paddingHorizontal: 24, paddingVertical: 24 }}
        >
            {children}
        </View>
    );
}
