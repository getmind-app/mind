import { Text } from "react-native";

export const Title = ({ title }: { title: string }): JSX.Element => {
    return <Text className="font-nunito-sans-bold text-3xl">{title}</Text>;
};
