import React, { useState } from "react";
import {
  Image,
  LayoutAnimation,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Link, useRouter, useSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

import { Header } from "../../components/Header";
import { api } from "../../utils/api";

export default function TherapistProfile() {
  const router = useRouter();
  const params = useSearchParams();
  const { data, isLoading, isError } = api.therapists.findById.useQuery({
    id: params.id as string,
  });

  function handleSchedule() {
    router.push({
      pathname: "/psych/schedule",
      params: { id: params.id },
    });
  }

  if (isError) {
    return <Text>There was an error</Text>;
  }

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  return (
    <>
      <SafeAreaView className="bg-off-white">
        <Header />
        <ScrollView showsVerticalScrollIndicator={false} className="px-4 py-2">
          <View className="flex flex-col items-center justify-center">
            <View className="flex w-full flex-row">
              <Image
                className="rounded-full"
                alt={`${data.name} picture`}
                source={{
                  uri: data.profilePictureUrl,
                  width: 96,
                  height: 96,
                }}
              />
              <View className="ml-4 flex flex-col justify-center align-middle">
                <Text className="font-nunito-sans-bold text-3xl font-bold">
                  {data.name}
                </Text>
                <TouchableOpacity onPress={() => router.push("/chat")}>
                  <View className="w-32 rounded-xl bg-white px-4 py-1.5 shadow-sm">
                    <Text className="text-center font-nunito-sans-bold text-base">
                      Message
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
            <View className="flex flex-row items-center gap-12 pt-6 align-middle">
              <View className="flex flex-col">
                <Text className="font-nunito-sans-bold text-base text-slate-500">
                  CRP
                </Text>
                <Text className="font-nunito-sans-bold text-base">
                  {data.crp}
                </Text>
              </View>
              <View className="flex flex-col">
                <Text className="font-nunito-sans-bold text-base text-slate-500">
                  Patients
                </Text>
                <Text className="font-nunito-sans-bold text-base text-blue-500">
                  42
                  <Text className="font-nunito-sans-bold text-base">
                    {" "}
                    / week
                  </Text>
                </Text>
              </View>
              <View className="flex flex-col">
                <Text className="font-nunito-sans-bold text-base text-slate-500">
                  Practicing for
                </Text>
                <Text className="font-nunito-sans-bold text-base text-blue-500">
                  {data.yearsOfExperience}
                  <Text className="font-nunito-sans-bold text-base">
                    {" "}
                    years
                  </Text>
                </Text>
              </View>
            </View>
          </View>
          <View className="pt-8">
            <AboutMe>{data.about}</AboutMe>
            {/* <Education>
              <View className="col flex flex-col gap-y-2 pb-2 pt-4">
                {data.publicMetadata.education.map(
                  ({ course, institution }, index) => (
                    <Text key={index} className="font-nunito-sans text-base">
                      {course} - {institution}
                    </Text>
                  ),
                )}
              </View>
            </Education>
            <Methodologies>
              <View className="mt-3 flex flex-row flex-wrap items-center gap-2 pb-2 pt-6">
                {data.publicMetadata.methodologies.map((methodology, index) => (
                  <View
                    key={index}
                    className="flex flex-row items-center justify-between rounded-full bg-[#2185EE] px-4 py-1 pr-2"
                  >
                    <Text className="capitalize text-white">{methodology}</Text>
                    <View className="ml-3 flex h-6 w-6 items-center justify-center rounded-full bg-white">
                      <Text className="text-sm font-bold text-[#74a7dd]">
                        ?
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </Methodologies> */}
          </View>
        </ScrollView>
      </SafeAreaView>
      <View className="absolute bottom-0 w-full rounded-t-xl bg-blue-500 px-6 pb-8 pt-4">
        <View className="flex flex-row items-center justify-between ">
          <View className="flex flex-col">
            <Text className="font-nunito-sans-bold text-base text-white shadow-sm">
              $ {data.hourlyRate}
            </Text>
            <Text className="font-nunito-sans text-base text-white">
              Online and on-site
            </Text>
          </View>
          <TouchableOpacity onPress={handleSchedule}>
            <View className="rounded-xl bg-white">
              <View className="flex flex-row items-center px-4 py-2 align-middle">
                <Text className="font-nunito-sans-bold text-base">
                  Schedule
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

function AboutMe({ children }: { children: React.ReactNode }) {
  const [aboutMeOpen, setAboutMeOpen] = useState(true);

  const toggleAboutMe = () => {
    setAboutMeOpen(!aboutMeOpen);
  };

  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

  return (
    <View className="w-full rounded-xl bg-white shadow-sm">
      <View className="px-6 py-4">
        <View className="flex flex-row items-center justify-between align-middle">
          <View className="flex flex-row items-center gap-2 align-middle">
            <Text>👤</Text>
            <Text className=" font-nunito-sans-bold text-lg">About me</Text>
          </View>
          <Pressable onPress={toggleAboutMe}>
            {aboutMeOpen ? (
              <MaterialIcons color="black" size={28} name="arrow-drop-up" />
            ) : (
              <MaterialIcons color="black" size={28} name="arrow-drop-down" />
            )}
          </Pressable>
        </View>
        {aboutMeOpen ? (
          <View className="pb-2 pt-4">
            <Text className="text-base">{children}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function Education({ children }: { children: React.ReactNode }) {
  const [educationOpen, setEducationOpen] = useState(false);

  const toggleEducation = () => {
    setEducationOpen(!educationOpen);
  };

  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

  // Esse mt-4 ta péssimo
  return (
    <View className="mt-4 w-full rounded-xl bg-white shadow-sm">
      <View className="px-6 py-4">
        <View className="flex flex-row items-center justify-between align-middle">
          <View className="flex flex-row items-center gap-2 align-middle">
            <Text>🎓</Text>
            <Text className=" font-nunito-sans-bold text-lg">Education</Text>
          </View>
          <Pressable onPress={toggleEducation}>
            {educationOpen ? (
              <MaterialIcons color="black" size={28} name="arrow-drop-up" />
            ) : (
              <MaterialIcons color="black" size={28} name="arrow-drop-down" />
            )}
          </Pressable>
        </View>
        {educationOpen ? children : null}
      </View>
    </View>
  );
}

function Methodologies({ children }: { children: React.ReactNode }) {
  const [methodologiesOpen, setMethodologiesOpen] = useState(false);

  const toggleMethodologies = () => {
    setMethodologiesOpen(!methodologiesOpen);
  };

  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

  // Esse mt-4 ta péssimo
  return (
    <View className="mt-4 w-full rounded-xl bg-white shadow-sm">
      <View className="px-6 py-4">
        <View className="flex flex-row items-center justify-between align-middle">
          <View className="flex flex-row items-center gap-2 align-middle">
            <Text>📚</Text>
            <Text className=" font-nunito-sans-bold text-lg">
              Methodologies
            </Text>
          </View>
          <Pressable onPress={toggleMethodologies}>
            {methodologiesOpen ? (
              <MaterialIcons color="black" size={28} name="arrow-drop-up" />
            ) : (
              <MaterialIcons color="black" size={28} name="arrow-drop-down" />
            )}
          </Pressable>
        </View>
        {methodologiesOpen ? children : null}
      </View>
    </View>
  );
}
