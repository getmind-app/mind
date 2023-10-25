import { SafeAreaView, ScrollView } from "react-native";

type ScreenWrapperProps = ConstructorParameters<typeof ScrollView>[0];

export const ScreenWrapper = ({
    children,
    ...rest
}: ScreenWrapperProps): JSX.Element => {
    return (
        <SafeAreaView
            style={{
                flex: 1,
                backgroundColor: "#f8f8f8",
            }}
        >
            <ScrollView
                style={{
                    flex: 1,
                    paddingHorizontal: 16,
                    paddingTop: 64,
                }}
                {...rest}
            >
                {children}
            </ScrollView>
        </SafeAreaView>
    );
};
