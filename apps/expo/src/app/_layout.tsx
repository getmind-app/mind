import React, { useEffect, useState } from "react";
import {
  Image,
  Text,
  TouchableOpacity,
  View,
  type Animated,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Constants from "expo-constants";
import { loadAsync } from "expo-font";
import { SplashScreen, Tabs, useRouter } from "expo-router";
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
  useFonts,
} from "@expo-google-fonts/nunito-sans";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { LogoSvg } from "../components/LogoSvg";
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
    <View className={`${focused ? "bg-blue-100" : "bg-none"} rounded-lg p-1`}>
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
    (async function loadResourcesAndDataAsync() {
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
    })();
  }, []);

  if (!fontsLoaded || !appIsReady) {
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
              <StatusBar translucent />
            </SignedIn>
            <SignedOut>
              <SignInScreen />
            </SignedOut>
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

  // Se user não escolheu role, vai para tela de escolha
  useEffect(() => {
    if (!user?.publicMetadata?.role) {
      router.push("/onboard");
    }
  }, [user]);

  return (
    <Tabs
      screenOptions={{
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
        name="onboard"
        options={{
          title: "Choose role",
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
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          href: null,
        }}
      />
    </Tabs>
  );
}

function SignInScreen() {
  const { onApplePress, onGooglePress } = useAuthProviders();

  return (
    <View className="flex h-full w-full items-center justify-center bg-off-white">
      <View className="relative bottom-12 right-4">
        <LogoSvg />
      </View>
      <Text className="pt-4 font-nunito-sans text-3xl">Welcome</Text>
      <Text className="font-nunito-sans text-base text-gray-500">
        Let us help. Focus on connecting.
      </Text>
      <View className="flex w-full gap-y-4 px-8">
        <View className="flex items-center justify-center pt-8">
          <Image
            alt=""
            source={require("../../assets/login_mind.png")}
            style={{ width: 200, height: 200 }}
            resizeMode="contain"
          />
        </View>
        <TouchableOpacity onPress={onGooglePress} className="w-full">
          <View className="mt-8  flex w-full flex-row items-center justify-center rounded-xl bg-blue-500 px-8 py-4 font-bold shadow-sm">
            <FontAwesome color="white" size={22} name="google" />
            <Text className="ml-4 font-nunito-sans text-xl text-white">
              Sign in with{" "}
            </Text>
            <Text className=" font-nunito-sans-bold text-xl text-white">
              Google
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={onApplePress} className="w-full">
          <View className="flex w-full flex-row items-center justify-center rounded-xl bg-white px-8 py-4 font-bold shadow-sm">
            <FontAwesome size={22} name="apple" />
            <Text className="ml-4 font-nunito-sans text-xl">Sign in with </Text>
            <Text className="font-nunito-sans text-xl">Apple</Text>
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
      const { createdSessionId, setActive } = await googleOAuthFlow({});
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
      const { createdSessionId, setActive } = await appleOAuthFlow({});
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
