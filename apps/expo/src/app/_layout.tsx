import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Constants from "expo-constants";
import { LinearGradient } from "expo-linear-gradient";
import { Tabs, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { StatusBar } from "expo-status-bar";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  useClerk,
  useOAuth,
} from "@clerk/clerk-expo";
import { AntDesign, FontAwesome } from "@expo/vector-icons";

import { TRPCProvider } from "../utils/api";

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

const tabBarActiveTintColor = "blue";
const tabBarInactiveTintColor = "black";

// This is the main layout of the app
/**
 *
 *
 * @return {*}
 */
const RootLayout = () => {
  return (
    <ClerkProvider
      publishableKey={
        Constants.expoConfig?.extra?.CLERK_PUBLISHABLE_KEY as string
      }
      tokenCache={tokenCache}
    >
      <TRPCProvider>
        <SafeAreaProvider>
          <SignedIn>
            <TabsRouter />
          </SignedIn>
          <SignedOut>
            <SignInScreen />
          </SignedOut>
          <StatusBar />
        </SafeAreaProvider>
      </TRPCProvider>
    </ClerkProvider>
  );
};

export default RootLayout;
function TabsRouter() {
  const { user } = useClerk();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          padding: 2,
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor,
        tabBarInactiveTintColor,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: (props) => <AntDesign name="home" {...props} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: (props) => <AntDesign name="search1" {...props} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          tabBarIcon: (props) => <AntDesign name="calendar" {...props} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: (props) => <AntDesign name="wechat" {...props} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "User Profile",
          tabBarIcon: () => (
            <Image
              className="rounded-full"
              source={{
                uri: user?.profileImageUrl,
                width: 32,
                height: 32,
              }}
            />
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
    </Tabs>
  );
}

function SignInScreen() {
  const { onApplePress, onGooglePress } = useAuthProviders();

  return (
    <View className="flex min-h-screen w-full items-center justify-center">
      <LinearGradient
        // Background Linear Gradient
        className="absolute h-full w-full"
        colors={["#2185EE", "#22275F"]}
      />
      <View className="flex w-full gap-y-4 px-4">
        <TouchableOpacity onPress={onGooglePress} className="w-full">
          <View className="bg-white border-black flex w-full flex-row items-center justify-center rounded-xl border-2 px-8 py-4 font-bold">
            <Text className="mr-2 text-xl">Sign in</Text>
            <FontAwesome size={24} name="google" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={onApplePress} className="w-full">
          <View className="bg-white border-black flex w-full flex-row items-center justify-center rounded-xl border-2 px-8 py-4 font-bold">
            <Text className="mr-2 text-xl">Sign in</Text>
            <FontAwesome size={24} name="apple" />
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
      const { createdSessionId, setActive } = await googleOAuthFlow();
      if (createdSessionId) {
        // @ts-expect-error
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
      const { createdSessionId, setActive } = await appleOAuthFlow();
      if (createdSessionId) {
        // @ts-expect-error
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
