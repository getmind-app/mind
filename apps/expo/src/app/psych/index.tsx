import { useState } from "react";
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
import { useRouter } from "expo-router";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";

import { Header } from "../../components/Header";

export default function TherapistProfile() {
  const router = useRouter();

  return (
    <SafeAreaView className="bg-off-white relative min-h-screen">
      <Header title="Professional" />
      <ScrollView className="pt-4" showsVerticalScrollIndicator={false}>
        <View className="flex flex-col items-center justify-center px-4">
          <View className="flex flex-row items-center justify-center overflow-hidden rounded-full align-middle">
            <Image
              className="rounded-full"
              alt="John Michael Williams"
              source={{
                uri: "https://images.pexels.com/photos/4098353/pexels-photo-4098353.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
                width: 126,
                height: 126,
              }}
            />
          </View>
          <Text className="font-nunito-sans-bold pt-4 text-2xl font-bold">
            John Michael Williams
          </Text>
          <View className="flex flex-row items-center gap-8 pt-4 align-middle">
            <View className="flex flex-col">
              <Text className="text-slate-500 font-nunito-sans-bold text-base">
                CRP
              </Text>
              <Text className="font-nunito-sans-bold text-base">O3/33213</Text>
            </View>
            <View className="flex flex-col">
              <Text className="text-slate-500 font-nunito-sans-bold text-base">
                Patients
              </Text>
              <View className="flex flex-row">
                <Text className="font-nunito-sans-bold text-blue-500 text-base">
                  42{" "}
                </Text>
                <Text className="font-nunito-sans-bold text-base">/ week</Text>
              </View>
            </View>
            <View className="flex flex-col">
              <Text className="text-slate-500 font-nunito-sans-bold text-base">
                Practicing for
              </Text>
              <View className="flex flex-row">
                <Text className="font-nunito-sans-bold text-blue-500 text-base">
                  4{" "}
                </Text>
                <Text className="font-nunito-sans-bold text-base">years</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity onPress={() => router.push("/chat")}>
            <View className="bg-white mt-4 rounded-xl shadow-sm">
              <View className="flex flex-row items-center gap-2 px-24 py-3 align-middle">
                <AntDesign name="message1" color="black" size={18} />
                <Text className="font-nunito-sans-bold text-base">
                  Talk to John
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
        <View className="mt-8 px-4 pb-56">
          <AboutMe />
          <Education />
          <Methodologies />
        </View>
      </ScrollView>

      <View className="bg-blue-500 absolute bottom-[104px] w-full rounded-t-xl px-6">
        <View className="flex flex-row items-center justify-between py-3">
          <View className="flex flex-col">
            <Text className="text-white font-nunito-sans-bold text-base">
              $ 150,00
            </Text>
            <Text className="text-white font-nunito-sans text-base">
              Online and on-site
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/psych/schedule")}>
            <View className="bg-white rounded-xl">
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

function AboutMe() {
  const [aboutMeOpen, setAboutMeOpen] = useState(true);

  const toggleAboutMe = () => {
    setAboutMeOpen(!aboutMeOpen);
  };

  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

  return (
    <View className="bg-white w-full rounded-xl shadow-sm">
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
            <Text className="text-base">
              I really enjoy helping people find peace of mind. I believe I was
              born with a mission to assist everyone who seeks self-awareness
              and personal growth.
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function Education() {
  const [educationOpen, setEducationOpen] = useState(false);

  const toggleEducation = () => {
    setEducationOpen(!educationOpen);
  };

  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

  // Esse mt-4 ta péssimo
  return (
    <View className="bg-white mt-4 w-full rounded-xl shadow-sm">
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
        {educationOpen ? (
          <View className="col flex flex-col gap-y-2 pb-2 pt-4">
            <Text className="font-nunito-sans text-base">
              Bachelor's Degree in Psychology - Federal University of Paraná
            </Text>
            <Text className="font-nunito-sans text-base">
              Postgraduate degree in Life Therapy - University of São Paulo
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function Methodologies() {
  const [methodologiesOpen, setMethodologiesOpen] = useState(false);

  const toggleMethodologies = () => {
    setMethodologiesOpen(!methodologiesOpen);
  };

  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

  // Esse mt-4 ta péssimo
  return (
    <View className="bg-white mt-4 w-full rounded-xl shadow-sm">
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
        {methodologiesOpen ? (
          <View className="mt-3 flex flex-row flex-wrap items-center gap-2 pb-2 pt-6">
            <View className="flex flex-row items-center justify-between rounded-full bg-[#2185EE] px-4 py-1 pr-2">
              <Text className="text-white">Behaviorism</Text>
              <View className="bg-white ml-3 flex h-6 w-6 items-center justify-center rounded-full">
                <Text className="text-sm font-bold text-[#74a7dd]">?</Text>
              </View>
            </View>
            <View className="flex flex-row items-center justify-between rounded-full bg-[#2185EE] px-4 py-1 pr-2">
              <Text className="text-white">Bioenergetic</Text>
              <View className="bg-white ml-3 flex h-6 w-6 items-center justify-center rounded-full">
                <Text className="text-sm font-bold text-[#74a7dd]">?</Text>
              </View>
            </View>
            <View className="flex flex-row items-center justify-between rounded-full bg-[#2185EE] px-4 py-1 pr-2">
              <Text className="text-white">Cognitive Behavioral Therapy</Text>
              <View className="bg-white ml-3 flex h-6 w-6 items-center justify-center rounded-full">
                <Text className="text-sm font-bold text-[#74a7dd]">?</Text>
              </View>
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}
