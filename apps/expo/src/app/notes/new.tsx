import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";

import { Header } from "../../components/Header";
import { api } from "../../utils/api";

export default function NewNote() {
  const { user } = useUser();
  const router = useRouter();
  const [content, setContent] = useState("");

  const { mutate, isLoading } = api.notes.create.useMutation({
    onSuccess: () => {
      router.push("/");
    },
  });

  function handleNewNote() {
    mutate({
      content: content,
      createdAt: new Date(),
      // TODO: receber o id do usuário como parâmetro
      userId: String(user?.id),
    });
  }

  if (isLoading) return <View className="h-full bg-off-white"></View>;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Header />
      <View className="bg-off-white pb-4 pt-6">
        <View className="h-full px-8 py-2">
          <ScrollView
            className="min-h-max"
            showsVerticalScrollIndicator={false}
          >
            <View className="flex flex-row items-center justify-between">
              <Text className=" font-nunito-sans-bold text-3xl">New note</Text>
              <TouchableOpacity onPress={handleNewNote}>
                <View className="rounded-xl bg-blue-500">
                  <View className="flex flex-row items-center px-4 py-2 align-middle">
                    <Text className="font-nunito-sans-bold text-base text-white">
                      Create
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
            <TextInput
              className="w-full py-4 font-nunito-sans text-lg"
              onChangeText={setContent}
              value={content}
              placeholder="Write your note here"
            />
          </ScrollView>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
