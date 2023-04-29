import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Constants from "expo-constants";
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
import { AntDesign } from "@expo/vector-icons";

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
          padding: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "",
          tabBarIcon: () => <AntDesign name="home" size={24} color={"blue"} />,
        }}
      />
      <Tabs.Screen
        name="search/index"
        options={{
          href: "/search",
          title: "",
          tabBarIcon: () => (
            <AntDesign name="search1" size={24} color="black" />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar/index"
        options={{
          href: "/calendar",
          title: "",
          tabBarIcon: () => (
            <AntDesign name="calendar" size={24} color="black" />
          ),
        }}
      />
      <Tabs.Screen
        name="chat/index"
        options={{
          href: "/chat",
          title: "",
          tabBarIcon: () => <AntDesign name="wechat" size={24} color="black" />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: "/profile",
          title: "",
          tabBarIcon: () => (
            <View className="bg-black flex h-8 w-8 items-center justify-center overflow-hidden rounded-full p-2">
              <Image
                source={{
                  uri: user?.profileImageUrl,
                  width: 32,
                  height: 32,
                }}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

function SignInScreen() {
  const router = useRouter();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const onSignInPress = React.useCallback(async () => {
    try {
      const { createdSessionId, signIn, signUp, setActive } =
        await startOAuthFlow();
      if (createdSessionId) {
        // @ts-expect-error
        setActive({ session: createdSessionId });
      } else {
        // Modify this code to use signIn or signUp to set this missing requirements you set in your dashboard.
        throw new Error(
          "There are unmet requirements, modifiy this else to handle them",
        );
      }
    } catch (err) {
      console.log(JSON.stringify(err, null, 2));
      console.log("error signing in", err);
    }
  }, []);

  const onSignUpPress = () => router.replace("SignUp");

  return (
    <View className="p-12">
      <TouchableOpacity onPress={onSignInPress}>
        <Text>Sign in</Text>
      </TouchableOpacity>

      <View>
        <Text>Have an account?</Text>
      </View>
    </View>
  );
}
