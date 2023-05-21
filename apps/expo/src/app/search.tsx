import { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SearchScreen() {
  const [search, setSearch] = useState("");

  return (
    <SafeAreaView className="bg-white min-h-screen px-4 pt-8">
      <View className="h-full py-2">
        <View className="mb-6 flex flex-row items-center justify-between px-4">
          <View className="mb-2">
            <Text className="text-2xl leading-8">Search</Text>
          </View>
        </View>
        <View>
          <View className="mb-6 flex flex-row items-center justify-between px-4">
            <TextInput
              className="py-2"
              onChangeText={setSearch}
              autoFocus={false}
              value={search}
              placeholder="Looking for a therapist?"
            />
            <View>
              <TouchableOpacity>
                <Text className="text-gray-500 text-sm underline">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
      <ScrollView className="min-h-max" showsVerticalScrollIndicator={false}>
        <View className="h-full py-2"></View>
      </ScrollView>
    </SafeAreaView>
  );
}
