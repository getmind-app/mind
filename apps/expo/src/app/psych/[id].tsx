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
import { useRouter, useSearchParams } from "expo-router";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";

import { Header } from "../../components/Header";
import { api } from "../../utils/api";

export default function TherapistProfile() {
  const router = useRouter();
  const params = useSearchParams();
  const { data, isLoading, isError } = api.users.getProfessional.useQuery({
    id: params.id as string,
  });

  if (isError) {
    return <Text>There was an error</Text>;
  }

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  return (
    <SafeAreaView>
      <Header title="Professional" />
      <ScrollView className="pt-4" showsVerticalScrollIndicator={false}>
        <View className="flex flex-col items-center justify-center px-4">
          <View className="flex flex-row items-center justify-center overflow-hidden rounded-full align-middle">
            <Image
              className="rounded-full"
              alt={`${data.firstName} ${data.lastName} picture`}
              source={{
                uri: data.profileImageUrl,
                width: 126,
                height: 126,
              }}
            />
          </View>
          <Text className="pt-4 font-nunito-sans-bold text-2xl font-bold">
            {data.firstName} {data.lastName}
          </Text>
          <View className="flex flex-row items-center gap-8 pt-4 align-middle">
            <View className="flex flex-col">
              <Text className="font-nunito-sans-bold text-base text-slate-500">
                CRP
              </Text>
              <Text className="font-nunito-sans-bold text-base">
                {data.publicMetadata.crp}
              </Text>
            </View>
            <View className="flex flex-col">
              <Text className="font-nunito-sans-bold text-base text-slate-500">
                Patients
              </Text>
              <View className="flex flex-row">
                <Text className="font-nunito-sans-bold text-base text-blue-500">
                  {data.publicMetadata.weeklyAppointments}
                </Text>
                <Text className="font-nunito-sans-bold text-base"> / week</Text>
              </View>
            </View>
            <View className="flex flex-col">
              <Text className="font-nunito-sans-bold text-base text-slate-500">
                Practicing for
              </Text>
              <View className="flex flex-row">
                <Text className="font-nunito-sans-bold text-base text-blue-500">
                  {data.publicMetadata.yearsOfExperience}
                </Text>
                <Text className="font-nunito-sans-bold text-base"> years</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity onPress={() => router.push("/chat")}>
            <View className="mt-4 rounded-xl bg-white shadow-sm">
              <View className="flex flex-row items-center gap-2 px-24 py-3 align-middle">
                <AntDesign name="message1" color="black" size={18} />
                <Text className="font-nunito-sans-bold text-base">
                  Talk to {data.firstName}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
        <View className="mt-8 px-4">
          <AboutMe>{data.publicMetadata.about}</AboutMe>
          <Education>
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
                    <Text className="text-sm font-bold text-[#74a7dd]">?</Text>
                  </View>
                </View>
              ))}
            </View>
          </Methodologies>
        </View>
      </ScrollView>
      <View className="bottom-0 w-full rounded-t-md bg-blue-500 px-6 pb-2">
        <View className="flex flex-row items-center justify-between ">
          <View className="flex flex-col">
            <Text className="font-nunito-sans-bold text-base text-white">
              $ {data.publicMetadata.hourlyRate}
            </Text>
            <Text className="font-nunito-sans text-base text-white">
              Online and on-site
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/psych/schedule")}>
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
    </SafeAreaView>
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
