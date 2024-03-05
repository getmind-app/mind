import { Image, View } from "react-native";
import { Host } from "react-native-portalize";
import { Redirect, Tabs, useRootNavigationState } from "expo-router";
import { useClerk } from "@clerk/clerk-expo";
import { AntDesign } from "@expo/vector-icons";

import { Loading } from "../../components/Loading";
import { useUserHasProfileImage } from "../../hooks/user/useUserHasProfileImage";
import { useUserIsProfessional } from "../../hooks/user/useUserIsProfessional";
import { colors } from "../../utils/colors";

function TabBarIconWrapper({
    children,
    focused,
}: {
    children: React.ReactNode;
    focused: boolean;
}) {
    return (
        <View
            className={`${focused ? "bg-blue-100" : "bg-none"} rounded-lg p-1`}
        >
            {children}
        </View>
    );
}

export default function AppRouter() {
    const { user } = useClerk();
    const rootNavigationState = useRootNavigationState();
    const userHasImage = useUserHasProfileImage({ userId: null });
    const isProfessional = useUserIsProfessional();

    // https://github.com/expo/router/issues/740
    if (!rootNavigationState || !rootNavigationState.key) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Loading size={"large"} />
            </View>
        );
    }

    if (!user?.publicMetadata?.role) {
        return <Redirect href={"/onboard"} />;
    }

    return (
        <Host>
            <Tabs
                screenOptions={{
                    tabBarStyle: {
                        paddingHorizontal: 16,
                    },
                    headerShown: false,
                    tabBarShowLabel: false,
                    tabBarActiveTintColor: colors.primaryBlue,
                    tabBarInactiveTintColor: colors.black,
                }}
            >
                <Tabs.Screen
                    name="home"
                    options={{
                        title: "Home",
                        tabBarIcon: (props) => (
                            <TabBarIconWrapper focused={props.focused}>
                                <AntDesign name="home" {...props} />
                            </TabBarIconWrapper>
                        ),
                    }}
                />
                <Tabs.Screen
                    name="search"
                    options={{
                        title: "Search",
                        href: isProfessional ? null : "/search",
                        tabBarIcon: (props) => (
                            <TabBarIconWrapper focused={props.focused}>
                                <AntDesign name="search1" {...props} />
                            </TabBarIconWrapper>
                        ),
                    }}
                />
                <Tabs.Screen
                    name="calendar"
                    options={{
                        title: "Calendar",
                        tabBarIcon: (props) => (
                            <TabBarIconWrapper focused={props.focused}>
                                <AntDesign name="calendar" {...props} />
                            </TabBarIconWrapper>
                        ),
                    }}
                />
                <Tabs.Screen
                    name="settings"
                    options={{
                        title: "Settings",
                        tabBarIcon: (props) => (
                            <TabBarIconWrapper focused={props.focused}>
                                {userHasImage.data ? (
                                    <Image
                                        className="rounded-full"
                                        alt={`${user?.firstName} profile picture`}
                                        source={{
                                            uri: user?.imageUrl,
                                            width: 30,
                                            height: 30,
                                        }}
                                    />
                                ) : (
                                    <AntDesign name="user" {...props} />
                                )}
                            </TabBarIconWrapper>
                        ),
                    }}
                />
                <Tabs.Screen
                    name="psych"
                    options={{
                        title: "Psych Profile",
                        href: null,
                        tabBarStyle: {
                            maxHeight: 0,
                        },
                    }}
                />
                <Tabs.Screen
                    name="onboard"
                    options={{
                        title: "Onboard",
                        href: null,
                        tabBarStyle: {
                            maxHeight: 0,
                        },
                    }}
                />
                <Tabs.Screen
                    name="(psych)"
                    options={{
                        title: "Psych",
                        href: null,
                        tabBarStyle: {
                            maxHeight: 0,
                        },
                    }}
                />
                <Tabs.Screen
                    name="index"
                    options={{
                        title: "Index",
                        href: null,
                    }}
                />
            </Tabs>
        </Host>
    );
}
