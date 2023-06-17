import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FormDateInput } from "../../components/FormDateInput";
import { FormTextInput } from "../../components/FormTextInput";

export default function OnboardPsychScreen() {
  const [name, setName] = useState<string>();
  const [birthday, setBirthday] = useState<Date>(new Date());
  const [document, setDocument] = useState<string>();
  const [crp, setCrp] = useState<string>();
  const [formValidated, setFormValidated] = useState<boolean>(true);

  // TODO: validar campos https://chat.openai.com/share/fc55daf1-562c-48e8-b51d-2a87dc8e0638

  const handleNext = () => {
    if (name && birthday && document && crp) {
    }
  };

  return (
    <SafeAreaView className="min-h-screen bg-off-white ">
      <View className="h-full px-4 py-2">
        <View className="flex flex-row items-center justify-between">
          <Text className="pt-12 font-nunito-sans-bold text-3xl">Onboard</Text>
        </View>
        <ScrollView
          className="min-h-max pt-4"
          showsVerticalScrollIndicator={false}
        >
          <FormTextInput
            title="🖋️ Name"
            placeholder="John Doe"
            onChange={setName}
          />
          <FormDateInput
            title="🥳 Birthday"
            value={birthday}
            onChange={setBirthday}
          />
          <FormTextInput
            title="🪪 Document"
            placeholder="054.408.229-09"
            onChange={setDocument}
          />
          <FormTextInput
            title="🧠 CRP"
            placeholder="02/43243"
            onChange={setCrp}
          />
          <TouchableOpacity
            className="w-full"
            disabled={!formValidated}
            onPress={handleNext}
          >
            <View
              className={`mt-8 flex w-full items-center justify-center rounded-xl ${
                formValidated ? "bg-blue-500" : "bg-gray-300 opacity-50"
              } py-2`}
            >
              <Text
                className={`font-nunito-sans-bold text-lg ${
                  formValidated ? "text-white" : "text-black"
                }`}
              >
                Next
              </Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
