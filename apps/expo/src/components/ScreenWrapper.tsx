import { SafeAreaView, View } from "react-native";

type ScreenWrapperProps = ConstructorParameters<typeof View>[0];
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
            <View
                style={{
                    flex: 1,
                    paddingHorizontal: 16,
                    paddingTop: 64,
                }}
                {...rest}
            >
                {children}
            </View>
        </SafeAreaView>
    );
};
