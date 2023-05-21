import {
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useClerk } from "@clerk/clerk-expo";
import { MaterialIcons } from "@expo/vector-icons";

import { api } from "../utils/api";

export default function UserProfileScreen() {
  const { user, signOut } = useClerk();

  return (
    <SafeAreaView className="bg-off-white min-h-screen ">
      <View className="h-full py-2">
        <View className="flex flex-row items-center justify-between px-4">
          <Text className="font-nunito-sans-bold pt-12 text-3xl">Profile</Text>
        </View>
        <View className="flex flex-row items-center gap-x-4 px-4 pt-4 align-middle">
          <Image
            className="rounded-full"
            alt={`${user?.firstName}'s profile picture`}
            source={{
              uri: user?.profileImageUrl,
              width: 80,
              height: 80,
            }}
          />
          <View className="flex flex-col">
            <View>
              {user?.fullName && (
                <Text className="text-2xl">{user.fullName}</Text>
              )}
            </View>
            <View>
              {user?.publicMetadata && (
                <Text className="text-slate-500 font-nunito-sans text-lg">
                  {user.publicMetadata.role == "patient"
                    ? "Patient"
                    : "Professional"}
                </Text>
              )}
            </View>
          </View>
        </View>
        <ScrollView
          className="min-h-max px-4 pt-12"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex flex-col items-center justify-center">
            <View className="flex flex-row">
              <Card
                label="Settings"
                icon={<MaterialIcons size={32} name="settings" />}
                onPress={signOut}
              />
              <Card
                label="Sign Out"
                icon={<MaterialIcons size={32} name="logout" />}
                onPress={signOut}
              />
            </View>
          </View>

          {process.env.NODE_ENV === "development" ? (
            <DevelopmentOptions />
          ) : null}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function DevelopmentOptions() {
  // TODO: Remove type casting
  const { mutateAsync } = (api.users as any).clearMetadata.useMutation({});
  const { user } = useClerk();

  async function clearUserMetaData() {
    await mutateAsync();
    await user?.reload();
  }

  return (
    <View className="bg-white mt-8 rounded shadow-sm">
      <Text className="font-nunito-sans-bold pt-4 text-center text-2xl">
        Dev Options
      </Text>
      <View className="rounded-lg p-2">
        <TouchableOpacity onPress={clearUserMetaData}>
          <View className="bg-gray-500 flex items-center justify-center rounded py-3">
            <Text className="text-white font-nunito-sans text-lg">
              Reset user metadata
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Card(props: { label: string; icon: any; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={() => props.onPress()}>
      <View className="bg-white m-2 gap-y-2 rounded-xl p-8 shadow-sm">
        <View className="flex flex-row items-center justify-center">
          {props.icon}
        </View>
        <Text className="font-nunito-sans text-center text-2xl">
          {props.label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
