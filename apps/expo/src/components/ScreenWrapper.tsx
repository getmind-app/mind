import { View } from "react-native";

export const ScreenWrapper = ({
    children,
}: {
    children: React.ReactNode;
}): JSX.Element => {
    return <View className="h-full bg-off-white px-4 pt-24">{children}</View>;
};
