import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  Linking,
  Text,
  TouchableOpacity,
  View,
  type Animated,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Constants from "expo-constants";
import { loadAsync, useFonts } from "expo-font";
import { SplashScreen, Tabs, usePathname, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { StatusBar } from "expo-status-bar";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  useClerk,
  useOAuth,
} from "@clerk/clerk-expo";
import {
  NunitoSans_400Regular,
  NunitoSans_700Bold,
} from "@expo-google-fonts/nunito-sans";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { TRPCProvider } from "../utils/api";

type tabBarStyle = Animated.WithAnimatedValue<StyleProp<ViewStyle>>;

const tokenCache = {
  getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      return Promise.resolve(null);
    }
  },
  saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return Promise.resolve();
    }
  },
};

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
    <View className={`${focused ? "bg-blue-100" : "bg-none"} rounded-lg p-2`}>
      {children}
    </View>
  );
}

const RootLayout = () => {
  // https://docs.expo.dev/archive/classic-updates/preloading-and-caching-assets/#pre-loading-and-caching-assets
  const [appIsReady, setAppIsReady] = useState(false);

  const [fontsLoaded] = useFonts({
    "Nunito-Sans": NunitoSans_400Regular,
    "Nunito-Sans-Bold": NunitoSans_700Bold,
  });

  useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        SplashScreen.preventAutoHideAsync();
        const iconsFont = [
          loadAsync(AntDesign.font),
          loadAsync(FontAwesome.font),
          loadAsync(MaterialIcons.font),
        ];

        await Promise.all([...iconsFont]);
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
        SplashScreen.hideAsync();
      }
    }

    loadResourcesAndDataAsync();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ClerkProvider
      publishableKey={
        Constants.expoConfig?.extra?.CLERK_PUBLISHABLE_KEY as string
      }
      tokenCache={tokenCache}
    >
      <TRPCProvider>
        <SafeAreaProvider>
          <>
            <SignedIn>
              <TabsRouter />
            </SignedIn>
            <SignedOut>
              <SignInScreen />
            </SignedOut>
            <StatusBar />
          </>
        </SafeAreaProvider>
      </TRPCProvider>
    </ClerkProvider>
  );
};

export default RootLayout;
function TabsRouter() {
  const { user } = useClerk();
  const router = useRouter();
  const path = usePathname();

  // Se user não escolheu role, vai para tela de escolha
  useEffect(() => {
    if (!user?.publicMetadata?.role) {
      router.push("/choose-role");
    }
  }, [user]);

  const tabBarStyle: tabBarStyle = useMemo(() => {
    if (path === "/choose-role" || path === "/psych/finish") {
      return {
        height: 0,
      };
    }

    return {
      height: "10%",
      maxHeight: 80,
    } as tabBarStyle;
  }, [path]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle,
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
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: (props) => (
            <TabBarIconWrapper focused={props.focused}>
              <AntDesign name="message1" {...props} />
            </TabBarIconWrapper>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "User Profile",
          tabBarIcon: (props) =>
            path === "/choose-role" || path === "/psych/finish" ? null : (
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
        }}
      />
      <Tabs.Screen
        name="choose-role"
        options={{
          title: "Choose role",
          href: null,
        }}
      />
    </Tabs>
  );
}

function SignInScreen() {
  const { onApplePress, onGooglePress } = useAuthProviders();

  return (
    <View className="bg-off-white flex min-h-screen w-full items-center justify-center">
      <Text className="text-3xl" style={{ fontFamily: "Nunito-Sans" }}>
        Welcome back!
      </Text>
      <Text
        className="text-gray-500 mb-12 mt-2 text-base"
        style={{ fontFamily: "Nunito-Sans" }}
      >
        Simply schedule and pay for your sessions.
      </Text>
      <View className="flex w-full gap-y-4 px-8">
        <View className="flex items-center justify-center">
          <Image
            alt=""
            source={require("../../assets/login_mind.png")}
            style={{ width: 200, height: 200 }}
            resizeMode="contain"
          />
        </View>
        <TouchableOpacity onPress={onGooglePress} className="w-full">
          <View className="bg-blue-500  mt-8 flex w-full flex-row items-center justify-center rounded-xl px-8 py-4 font-bold shadow-sm">
            <FontAwesome color="white" size={22} name="google" />
            <Text
              style={{ fontFamily: "Nunito-Sans" }}
              className="text-white ml-4 text-xl"
            >
              Sign in with{" "}
            </Text>
            <Text
              style={{ fontFamily: "Nunito-Sans-Bold" }}
              className=" text-white text-xl"
            >
              Google
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={onApplePress} className="w-full">
          <View className="bg-white flex w-full flex-row items-center justify-center rounded-xl px-8 py-4 font-bold shadow-sm">
            <FontAwesome size={22} name="apple" />
            <Text
              style={{ fontFamily: "Nunito-Sans" }}
              className="ml-4 text-xl"
            >
              Sign in with{" "}
            </Text>
            <Text
              style={{ fontFamily: "Nunito-Sans-Bold" }}
              className="text-xl"
            >
              Apple
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function useAuthProviders() {
  const { startOAuthFlow: googleOAuthFlow } = useOAuth({
    strategy: "oauth_google",
  });
  const { startOAuthFlow: appleOAuthFlow } = useOAuth({
    strategy: "oauth_apple",
  });

  const onGooglePress = React.useCallback(async () => {
    try {
      const { createdSessionId, setActive } = await googleOAuthFlow({
        redirectUrl: (await Linking.getInitialURL()) as string,
      });
      if (createdSessionId && setActive) {
        setActive({ session: createdSessionId });
      } else {
        throw new Error(
          "There are unmet requirements, modifiy this else to handle them",
        );
      }
    } catch (err) {
      console.log(JSON.stringify(err, null, 2));
      console.log("error signing in", err);
    }
  }, []);

  const onApplePress = React.useCallback(async () => {
    try {
      const { createdSessionId, setActive } = await appleOAuthFlow({
        redirectUrl: (await Linking.getInitialURL()) as string,
      });
      if (createdSessionId && setActive) {
        setActive({ session: createdSessionId });
      } else {
        throw new Error(
          "There are unmet requirements, modifiy this else to handle them",
        );
      }
    } catch (err) {
      console.log(JSON.stringify(err, null, 2));
      console.log("error signing in", err);
    }
  }, []);

  return {
    onGooglePress,
    onApplePress,
  };
}
