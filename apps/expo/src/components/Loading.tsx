import { ActivityIndicator } from "react-native";

type Props = ConstructorParameters<typeof ActivityIndicator>[0];

export function Loading(props: Props) {
    return <ActivityIndicator {...props} color={props.color} />;
}
