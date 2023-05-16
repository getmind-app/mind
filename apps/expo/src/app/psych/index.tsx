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
import { MaterialIcons } from "@expo/vector-icons";

export default function TherapistProfile() {
  const router = useRouter();

  const schedule = () => {
    router.push("/psych/schedule");
  };

  const chat = () => {
    router.push("/chat");
  };

  return (
    <SafeAreaView className="min-h-screen bg-[#FFF] pt-8">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex flex-col items-center justify-center px-4">
          <View className="flex flex-row items-center justify-center overflow-hidden rounded-full pt-8 align-middle">
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
          <Text
            className="pt-4 text-2xl font-bold"
            style={{ fontFamily: "Nunito-Sans-Bold" }}
          >
            John Michael Williams
          </Text>
          <View className="flex flex-row">
            <Text
              className="text-slate-500 text-base"
              style={{ fontFamily: "Nunito-Sans" }}
            >
              Online and On Site
            </Text>
            <Text
              className="text-slate-500 pl-1 text-base"
              style={{ fontFamily: "Nunito-Sans" }}
            >
              |
            </Text>
            <Text
              className="text-slate-500 pl-1 text-base underline"
              style={{ fontFamily: "Nunito-Sans" }}
            >
              45723-43
            </Text>
          </View>
          <View className="flex flex-row gap-x-4">
            <TouchableOpacity onPress={schedule}>
              <View className="bg-blue-500 mt-4 rounded-xl shadow-sm">
                <View className="items-center">
                  <View className="px-16 py-2">
                    <Text
                      className="text-white text-lg"
                      style={{ fontFamily: "Nunito-Sans-Bold" }}
                    >
                      Schedule
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={chat}>
              <View className="bg-white mt-4 rounded-xl shadow-sm">
                <View className="items-center">
                  <View className="px-4 py-2">
                    <Text
                      className="text-white text-lg"
                      style={{ fontFamily: "Nunito-Sans-Bold" }}
                    >
                      <MaterialIcons color="black" size={20} name="chat" />
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <View className="mt-8 px-4">
          <AboutMe />
          <Education />
          <Methodologies />
        </View>
      </ScrollView>
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
      <View className="px-8 py-4">
        <View className="flex flex-row items-center justify-between align-middle">
          <View className="flex flex-row items-center gap-2 align-middle">
            <Text>👤</Text>
            <Text
              className=" text-lg"
              style={{ fontFamily: "Nunito-Sans-Bold" }}
            >
              About me
            </Text>
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
            <Text className="text-base" style={{ fontFamily: "Nunito-Sans" }}>
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
      <View className="px-8 py-4">
        <View className="flex flex-row items-center justify-between align-middle">
          <View className="flex flex-row items-center gap-2 align-middle">
            <Text>🎓</Text>
            <Text
              className=" text-lg"
              style={{ fontFamily: "Nunito-Sans-Bold" }}
            >
              Education
            </Text>
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
            <Text className="text-base" style={{ fontFamily: "Nunito-Sans" }}>
              Bachelor's Degree in Psychology - Federal University of Paraná
            </Text>
            <Text className="text-base" style={{ fontFamily: "Nunito-Sans" }}>
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
      <View className="px-8 py-4">
        <View className="flex flex-row items-center justify-between align-middle">
          <View className="flex flex-row items-center gap-2 align-middle">
            <Text>📚</Text>
            <Text
              className=" text-lg"
              style={{ fontFamily: "Nunito-Sans-Bold" }}
            >
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
