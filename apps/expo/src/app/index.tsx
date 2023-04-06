import React from "react";
import {
  Button,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { FlashList } from "@shopify/flash-list";

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
  return (
    <View className="relative rounded-2xl bg-[#F8F8F8] px-3 pb-3 pt-8">
      <View className="absolute -top-6 left-4 z-40  rounded-full bg-[#2185EE] p-2 ">
        <Text className="text-white text-2xl font-bold">16</Text>
      </View>
      <View>
        <Text className="text-2xl">Segunda-feira, 14:00</Text>
        <Text className="text-gray-500 text-sm underline">
          Av. Ermelino de Leão, 134
        </Text>
        <View className="mt-3  rounded-lg bg-[#EBEBEB] p-2">
          <View className="overflow-hidden">
            <Image
              source={{
                uri: "https://t3.ftcdn.net/jpg/03/96/88/32/360_F_396883284_1APy4O6kZumSUDLE33VgJ3ADdMYt39Bv.jpg",
                width: 480,
                height: 240,
              }}
            />
          </View>
        </View>
        <View className="mt-3 flex flex-row justify-between rounded-lg bg-[#EBEBEB] p-4">
          <Text className="w-4/5">
            Te espero para mais um passo em busca do auto conhecimento!
          </Text>
          <View className="flex w-1/5 items-center justify-center overflow-hidden rounded-full align-middle">
            <Image
              source={{
                uri: "https://images.pexels.com/photos/4098353/pexels-photo-4098353.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
                width: 48,
                height: 48,
              }}
            />
          </View>
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
    <SafeAreaView className="bg-[#DFDFDF] p-4">
      <Stack.Screen options={{ title: "Home" }} />
      {/* Changes page title visible on the header */}
      <View className="mb-4 flex flex-row items-center justify-between px-4">
        <Text className="text-3xl">Próxima sessão</Text>
        <LogoSvg />
      </View>

      <View>
        <View>
          <NextMeetingCard />
          {/* <Text className="text-white mx-auto pb-2 text-5xl font-bold">
            Create <Text className="text-pink-400">T3</Text> Turbo
          </Text>

          <Button
            onPress={() => void utils.post.all.invalidate()}
            title="Refresh posts"
            color={"#f472b6"}
          />

          <View className="py-2">
            <Text className="text-white font-semibold italic">
              Press on a post
            </Text>
          </View>

          <FlashList
            data={postQuery.data}
            estimatedItemSize={20}
            ItemSeparatorComponent={() => <View className="h-2" />}
            renderItem={(p) => (
              <PostCard
                post={p.item}
                onDelete={() => deletePostMutation.mutate(p.item.id)}
              />
            )}
          />

          <CreatePost /> */}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Index;
