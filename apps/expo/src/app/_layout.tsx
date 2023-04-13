import React from "react";
import { Image, ImageBackground, Text, View } from "react-native";
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
            tabBarStyle: {
              padding: 10,
            },
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
            name="profile"
            options={{
              href: "/profile",
              title: "",
              tabBarIcon: () => (
                <View className="bg-black flex h-8 w-8 items-center justify-center overflow-hidden rounded-full p-2">
                  <Image
                    source={{
                      uri: "https://instagram.fbfh4-1.fna.fbcdn.net/v/t51.2885-19/279431092_363187039100213_6227785362765906586_n.jpg?stp=dst-jpg_s150x150&_nc_ht=instagram.fbfh4-1.fna.fbcdn.net&_nc_cat=105&_nc_ohc=3tCxG1dQWeQAX-XkQ2K&edm=ACWDqb8BAAAA&ccb=7-5&oh=00_AfAlqxgZh-LcwA3GfvIRh_qWnDnQ32zG2RQ_k2oYnX5PTw&oe=643D1051&_nc_sid=1527a3",
                      width: 32,
                      height: 32,
                    }}
                  />
                </View>
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
