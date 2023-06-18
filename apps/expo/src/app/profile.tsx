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
  const { data } = (api.therapists as any).findByUserId.useQuery({
    userId: user?.id,
  });

  return (
    <SafeAreaView className="min-h-screen bg-off-white ">
      <View className="h-full px-4 py-2">
        <View className="flex flex-row items-center justify-between">
          <Text className="pt-12 font-nunito-sans-bold text-3xl">Profile</Text>
        </View>
        <View className="flex flex-row items-center gap-x-4 pt-4 align-middle">
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
              {data?.name && <Text className="text-2xl">{data.name}</Text>}
            </View>
            <View>
              {user?.publicMetadata && (
                <Text className="font-nunito-sans text-lg text-slate-500">
                  {user.publicMetadata.role == "patient"
                    ? "Patient"
                    : "Professional"}
                </Text>
              )}
            </View>
          </View>
        </View>
        <ScrollView
          className="min-h-max pt-12"
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
    console.log("Clearing user metadata");
    await mutateAsync();
    await user?.reload();
  }

  return (
    <View className="mt-8 rounded bg-white shadow-sm">
      <Text className="pt-4 text-center font-nunito-sans-bold text-2xl">
        Dev Options
      </Text>
      <View className="rounded-lg p-2">
        <TouchableOpacity onPress={clearUserMetaData}>
          <View className="flex items-center justify-center rounded bg-gray-500 py-3">
            <Text className="font-nunito-sans text-lg text-white">
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
      <View className="m-2 gap-y-2 rounded-xl bg-white p-8 shadow-sm">
        <View className="flex flex-row items-center justify-center">
          {props.icon}
        </View>
        <Text className="text-center font-nunito-sans text-2xl">
          {props.label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
