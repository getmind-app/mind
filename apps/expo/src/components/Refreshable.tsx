import { ScrollView } from "react-native";

type RefreshableProps = ConstructorParameters<typeof ScrollView>[0];
export const Refreshable = ({
    children,
    ...rest
}: RefreshableProps): JSX.Element => {
    return (
        <ScrollView showsVerticalScrollIndicator={false} {...rest}>
            {children}
        </ScrollView>
    );
};
