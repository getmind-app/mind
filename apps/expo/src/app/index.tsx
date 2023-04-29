import React, { useState } from "react";
import {
  Button,
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { AntDesign } from "@expo/vector-icons";

import { GradientText } from "../components/GradientText";
import { LogoSvg } from "../components/LogoSvg";
import { api, type RouterOutputs } from "../utils/api";

const PostCard: React.FC<{
  post: RouterOutputs["post"]["all"][number];
  onDelete: () => void;
}> = ({ post, onDelete }) => {
  const router = useRouter();

  return (
    <View className="bg-white/10 flex flex-row rounded-lg p-4">
      <View className="flex-grow">
        <TouchableOpacity onPress={() => router.push(`/post/${post.id}`)}>
          <Text className="text-pink-400 text-xl font-semibold">
            {post.title}
          </Text>
          <Text className="text-white mt-2">{post.content}</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={onDelete}>
        <Text className="text-pink-400 font-bold uppercase">Delete</Text>
      </TouchableOpacity>
    </View>
  );
};

const CreatePost: React.FC = () => {
  const utils = api.useContext();

  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");

  const { mutate, error } = api.post.create.useMutation({
    async onSuccess() {
      setTitle("");
      setContent("");
      await utils.post.all.invalidate();
    },
  });

  return (
    <View className="mt-4">
      <TextInput
        className="bg-white/10 text-white mb-2 rounded p-2"
        placeholderTextColor="rgba(255, 255, 255, 0.5)"
        value={title}
        onChangeText={setTitle}
        placeholder="Title"
      />
      {error?.data?.zodError?.fieldErrors.title && (
        <Text className="text-red-500 mb-2">
          {error.data.zodError.fieldErrors.title}
        </Text>
      )}
      <TextInput
        className="bg-white/10 text-white mb-2 rounded p-2"
        placeholderTextColor="rgba(255, 255, 255, 0.5)"
        value={content}
        onChangeText={setContent}
        placeholder="Content"
      />
      {error?.data?.zodError?.fieldErrors.content && (
        <Text className="text-red-500 mb-2">
          {error.data.zodError.fieldErrors.content}
        </Text>
      )}
      <TouchableOpacity
        className="bg-pink-400 rounded p-2"
        onPress={() => {
          mutate({
            title,
            content,
          });
        }}
      >
        <Text className="text-white font-semibold">Publish post</Text>
      </TouchableOpacity>
    </View>
  );
};

function NextMeetingCard() {
  const [nextScheduledTherapist, setNextScheduledTherapist] = useState("1");

  return (
    <View className="relative rounded-2xl bg-[#F8F8F8] px-3 pb-3 pt-8">
      <View className="absolute -top-6 left-4 z-40 flex items-center justify-center  rounded-full bg-[#2185EE]">
        <Text className="text-white h-12 w-12 p-2 text-center text-2xl font-bold">
          24
        </Text>
      </View>
      <View>
        <View className="ml-2">
          <Text className="text-2xl">Monday, 14:00</Text>
          <Text className="text-gray-500 text-sm underline">
            335 Pioneer Way
          </Text>
        </View>
        <View className="mt-3 flex max-h-36 items-center justify-center overflow-hidden rounded-lg bg-[#EBEBEB] p-2">
          <Image
            source={{
              uri: "https://t3.ftcdn.net/jpg/03/96/88/32/360_F_396883284_1APy4O6kZumSUDLE33VgJ3ADdMYt39Bv.jpg",
              width: 540,
              height: 360,
            }}
          />
        </View>
        <View className="mt-3 flex flex-row justify-between rounded-lg bg-[#EBEBEB] p-4">
          <Text className="w-4/5 text-xs">
            I await you for one more step in the search for self-knowledge!
          </Text>
          <View className="flex max-h-[32px] max-w-[32px] items-center justify-center overflow-hidden rounded-full align-middle">
            <ImageBackground
              source={{
                uri: "https://images.pexels.com/photos/4098353/pexels-photo-4098353.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
              }}
              resizeMode="contain"
            >
              <Link
                className=" flex h-16 w-16 items-center justify-center"
                href={{
                  pathname: `/psych`,
                  params: { id: nextScheduledTherapist },
                }}
              />
            </ImageBackground>
          </View>
        </View>
      </View>
    </View>
  );
}

function LastNotesCard() {
  return (
    <View className="relative rounded-2xl bg-[#F8F8F8] p-3 ">
      <View>
        <SingleNote />
        <SingleNote />
        <View className="flex flex-row justify-center">
          <Text className="text-gray-500 text-sm underline">Ver notas</Text>
        </View>
      </View>
    </View>
  );
}

const Index = () => {
  const utils = api.useContext();

  const postQuery = api.post.all.useQuery();

  const deletePostMutation = api.post.delete.useMutation({
    onSettled: () => utils.post.all.invalidate(),
  });

  return (
    <SafeAreaView className="min-h-screen bg-[#FFF] px-4 pt-8">
      <ScrollView className="min-h-max" showsVerticalScrollIndicator={false}>
        <View className="h-full py-2">
          <View className="mb-6 flex flex-row items-center justify-between px-4">
            <View className="mb-2">
              <Text className="text-2xl leading-8">Next session</Text>
            </View>
            <View>
              <LogoSvg className="m-auto" />
            </View>
          </View>
          <NextMeetingCard />
          <View className="mb-2 mt-5 px-4">
            <Text className="text-2xl leading-8">Recent notes</Text>
          </View>
          <LastNotesCard />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

function SingleNote() {
  return (
    <View className="mb-2">
      <View className="flex flex-row items-center justify-start text-sm ">
        <GradientText>16th</GradientText>
        <View className="my-auto">
          <Text> February 2023</Text>
        </View>
      </View>
      <View className="flex flex-row items-center justify-evenly rounded-lg bg-[#EBEBEB] px-2 py-4">
        <Text className="text-2xl">😀</Text>
        <Text className="mx-auto w-full max-w-[75%] text-xs">
          I feel very pressured with all the demands of work and family life. I
          become...
        </Text>
        <AntDesign name="right" />
      </View>
    </View>
  );
}

export default Index;
