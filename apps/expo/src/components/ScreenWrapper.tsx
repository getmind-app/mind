import { Platform, SafeAreaView, View } from "react-native";
import { usePathname, useRouter } from "expo-router";

type ScreenWrapperProps = ConstructorParameters<typeof View>[0];
export const ScreenWrapper = ({
    children,
    style,
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
                    paddingTop: Platform.OS === "android" ? 48 : 32,
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
