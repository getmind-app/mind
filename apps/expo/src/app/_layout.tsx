import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AntDesign } from "@expo/vector-icons";

import { TRPCProvider } from "../utils/api";

// This is the main layout of the app
/**
 *
 *
 * @return {*}
 */
const RootLayout = () => {
  return (
    <TRPCProvider>
      <SafeAreaProvider>
        {/*
          The Stack component displays the current page.
          It also allows you to configure your screens 
        */}
        <Tabs
          screenOptions={{
            headerShown: false,
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: "",
              tabBarIcon: () => (
                <AntDesign name="home" size={24} color={"blue"} />
              ),
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
              tabBarIcon: () => (
                <AntDesign name="wechat" size={24} color="black" />
              ),
            }}
          />
          <Tabs.Screen
            name="profile/index"
            options={{
              href: "/profile",
              title: "",
              tabBarIcon: () => (
                <AntDesign name="user" size={24} color="black" />
              ),
            }}
          />
        </Tabs>
        <StatusBar />
      </SafeAreaProvider>
    </TRPCProvider>
  );
};

export default RootLayout;
