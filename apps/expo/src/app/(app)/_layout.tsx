import { Image, View } from "react-native";
import { Redirect, Tabs } from "expo-router";
import { useClerk } from "@clerk/clerk-expo";
import { AntDesign } from "@expo/vector-icons";

const tabBarActiveTintColor = "#2563eb"; // blue 600
const tabBarInactiveTintColor = "black";

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

    if (!user?.publicMetadata?.role) {
        return <Redirect href={"/onboard"} />;
    }

    return (
        <Tabs
            screenOptions={{
                tabBarStyle: {
                    paddingHorizontal: 16,
                },
                headerShown: false,
                tabBarShowLabel: false,
                tabBarActiveTintColor,
                tabBarInactiveTintColor,
            }}
        >
            <Tabs.Screen
                name="index"
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
                    href:
                        user?.publicMetadata?.role === "professional"
                            ? null
                            : "/search",
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
                name="profile"
                options={{
                    title: "User Profile",
                    tabBarIcon: (props) => (
                        <TabBarIconWrapper focused={props.focused}>
                            <Image
                                className="rounded-full"
                                alt={`${user?.firstName} profile picture`}
                                source={{
                                    uri: user?.profileImageUrl,
                                    width: 30,
                                    height: 30,
                                }}
                            />
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
                name="(psych)"
                options={{
                    title: "Psych Settings",
                    href: null,
                    tabBarStyle: {
                        maxHeight: 0,
                    },
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: "Settings",
                    href: null,
                    tabBarStyle: {
                        maxHeight: 0,
                    },
                }}
            />
            <Tabs.Screen
                name="notes"
                options={{
                    title: "Notes",
                    href: null,
                }}
            />
        </Tabs>
    );
}
