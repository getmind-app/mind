import { Platform, SafeAreaView, View } from "react-native";

type ScreenWrapperProps = ConstructorParameters<typeof View>[0];
export const ScreenWrapper = ({
    children,
    paddingTop = Platform.OS === "android" ? 48 : 16,
    style,
    ...rest
}: ScreenWrapperProps & {
    paddingTop?: number;
}): JSX.Element => {
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
                    paddingTop: paddingTop,
                    paddingBottom: Platform.OS === "android" ? 16 : 0,
                    ...(typeof style === "object" ? style : {}),
                }}
                {...rest}
            >
                {children}
            </View>
        </SafeAreaView>
    );
};
