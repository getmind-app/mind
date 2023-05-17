import React, { useCallback, useEffect } from "react";
import {
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  type Animated,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Constants from "expo-constants";
import { useFonts } from "expo-font";
import { Tabs, usePathname, useRouter } from "expo-router";
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

const tabBarActiveTintColor = "#3b82f6";
const tabBarInactiveTintColor = "black";

// This is the main layout of the app
/**
 *
 *
 * @return {*}
 */
const RootLayout = () => {
  // TODO: Imagino que essa não seja a melhor forma de usar fontes...
  // Carrega as fontes
  const [fontsLoaded] = useFonts({
    "Nunito-Sans": require("../../assets/fonts/NunitoSans-Regular.ttf"),
    "Nunito-Sans-Bold": require("../../assets/fonts/NunitoSans-Bold.ttf"),
  });

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
    if (path === "/choose-role") {
      return {
        height: 0,
      };
    }

    return {
      height: "10%",
      maxHeight: 80,
      margin: 8,
      borderRadius: 12,
      shadowColor: "#000",
      shadowRadius: 12,
      position: "absolute",
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
          tabBarIcon: (props) => <AntDesign name="message1" {...props} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "User Profile",
          tabBarIcon: () =>
            path === "/choose-role" || path === "/psych/finish" ? null : (
              <Image
                className="rounded-full"
                alt={`${user?.firstName} profile picture`}
                source={{
                  uri: user?.profileImageUrl,
                  width: 30,
                  height: 30,
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
    <View className="flex min-h-screen w-full items-center justify-center">
      <Text className="text-3xl" style={{ fontFamily: "Nunito-Sans" }}>
        Welcome back!
      </Text>
      <Text
        className="text-gray-500 mb-12 mt-2 text-base"
        style={{ fontFamily: "Nunito-Sans" }}
      >
        Simply schedule and pay for your sessions.
      </Text>
      <View className="flex w-full gap-y-4 px-4">
        <View className="flex items-center justify-center">
          <Image
            alt=""
            source={require("../../assets/login_mind.png")}
            style={{ width: 250, height: 250 }}
            resizeMode="contain"
          />
        </View>
        <TouchableOpacity onPress={onGooglePress} className="w-full">
          <View className="bg-white mt-8 flex w-full flex-row items-center justify-center rounded-xl px-8 py-4 font-bold shadow-sm">
            <FontAwesome size={22} name="google" />
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
      const { createdSessionId, setActive } = await googleOAuthFlow();
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
      const { createdSessionId, setActive } = await appleOAuthFlow();
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
