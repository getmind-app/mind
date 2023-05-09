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
            <TouchableOpacity onPress={null} className="w-full">
              <View className="bg-white flex w-full flex-row items-center rounded-xl shadow-sm">
                <View className="gap-y-2 px-4 py-12">
                  <Text className="ml-4 text-2xl">Paciente</Text>
                  <Text className="text-slate-500 ml-4 text-lg font-light">
                    Buscando ajuda ou só{"\n"}alguém para conversar
                  </Text>
                </View>
                <View>
                  <Image
                    alt=""
                    source={require("../../assets/paciente.png")}
                    style={{
                      width: 150,
                      height: 150,
                      position: "absolute",
                      left: 10,
                      top: -54,
                    }}
                    resizeMode="contain"
                  />
                </View>
              </View>
            </TouchableOpacity>
          </View>
          <View className="items-center">
            <TouchableOpacity onPress={null} className="w-full">
              <View className="bg-white flex w-full flex-row items-center rounded-xl shadow-sm">
                <View className="gap-y-2 px-4 py-12">
                  <Text className="ml-4 text-2xl">Profissional</Text>
                  <Text className="text-slate-500 ml-4 text-lg font-light">
                    Quer atender mais e{"\n"}conhecer novas pessoas
                  </Text>
                </View>
                <View>
                  <Image
                    alt=""
                    source={require("../../assets/profissional.png")}
                    style={{
                      width: 180,
                      height: 180,
                      position: "absolute",
                      left: -27,
                      top: -84,
                    }}
                    resizeMode="contain"
                  />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
