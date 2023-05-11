import {
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function CalendarScreen() {
  return (
    <SafeAreaView>
      <View className="mt-24">
        <View className="flex min-h-screen w-full gap-y-8 px-4">
          <Text className="fon px-4 text-3xl">Você é:</Text>
          <View className="items-center">
            <TouchableOpacity className="w-full">
              <View className="bg-white flex w-full flex-row rounded-xl shadow-sm">
                <View className="items-center">
                  <View className="gap-y-2 px-4 py-10">
                    <Text className="ml-4 text-2xl">Paciente</Text>
                    <Text className="text-slate-500 ml-4 text-lg font-light">
                      Buscando ajuda ou só{"\n"}alguém para conversar
                    </Text>
                  </View>
                </View>
                <Image
                  alt=""
                  source={require("../../assets/profissional_2.png")}
                  className="ml-1 mt-8 h-36 w-36"
                  resizeMode="contain"
                />
              </View>
            </TouchableOpacity>
          </View>
          <View className="items-center">
            <TouchableOpacity className="w-full">
              <View className="bg-white flex w-full flex-row rounded-xl shadow-sm">
                <Image
                  alt=""
                  source={require("../../assets/paciente.png")}
                  className="ml-9 mt-8 h-36 w-36"
                  resizeMode="contain"
                />
                <View className="items-center">
                  <View className="gap-y-2 px-4 py-10">
                    <Text className="ml-4 text-2xl">Profissional</Text>
                    <Text className="text-slate-500 ml-4 text-lg font-light">
                      Conheça e atenda{"\n"}novos pacientes
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
