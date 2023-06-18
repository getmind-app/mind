import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter, useSearchParams } from "expo-router";

import { api } from "../../utils/api";

// TODO: no futuro precisamos deixar editar a nota
export default function Note() {
  const router = useRouter();
  const params = useSearchParams();

  const { data, isLoading } = (api.notes as any).findById.useQuery({
    id: params.id,
  });

  const { mutate } = (api.notes as any).delete.useMutation({
    onSuccess: () => {
      router.push("/");
    },
  });

  function handleDelete() {
    mutate({ id: params.id });
  }

  if (isLoading) return <Text>Loading...</Text>;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="bg-off-white pb-4 pt-16">
        <View className="h-full px-4 py-2">
          <ScrollView
            className="min-h-max pt-4"
            showsVerticalScrollIndicator={false}
          >
            <View className="flex flex-row items-center justify-between pt-12">
              <Text className="font-nunito-sans-bold text-3xl ">
                <Text className="text-blue-500">{data.createdAt.getDay()}</Text>{" "}
                {data.createdAt.toLocaleString("en", {
                  month: "long",
                })}
              </Text>
              <TouchableOpacity onPress={handleDelete}>
                <View className="rounded-xl bg-red-500">
                  <View className="flex flex-row items-center px-4 py-2 align-middle">
                    <Text className="font-nunito-sans-bold text-base text-white">
                      Delete
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
            <Text className="w-full py-4">{data.content}</Text>
          </ScrollView>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
