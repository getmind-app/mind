import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";

import { FormCurrencyInput } from "../../components/FormCurrencyInput";
import { FormDateInput } from "../../components/FormDateInput";
import { FormTextInput } from "../../components/FormTextInput";
import { api } from "../../utils/api";

export default function OnboardPsychScreen() {
  const { user } = useUser();
  const router = useRouter();

  const [name, setName] = useState<string>(user?.fullName ?? "");
  const [birthday, setBirthday] = useState<Date>(new Date());
  const [document, setDocument] = useState<string>("");
  const [crp, setCrp] = useState<string>("");
  const [yearsOfExperience, setYearsOfExperience] = useState<string>("");
  const [hourlyRate, setHourlyRate] = useState<number>(0.0);

  const [formValidated, setFormValidated] = useState<boolean>(true);

  const { mutate, isLoading } = api.therapists.create.useMutation({
    onSuccess: () => {
      router.push("/"); // TODO: acredito que aqui teriamos que fazer mais validaçoes
    },
  });

  // TODO: validar campos https://chat.openai.com/share/fc55daf1-562c-48e8-b51d-2a87dc8e0638
  // Não sei se seria melhor usar o Formik ou o Yup (Formik já no projeto)
  const handleNext = () => {
    if (
      name &&
      birthday &&
      document &&
      crp &&
      yearsOfExperience &&
      hourlyRate
    ) {
      mutate({
        name,
        dateOfBirth: birthday,
        document,
        crp,
        yearsOfExperience: parseInt(yearsOfExperience),
        hourlyRate,
        about: "", // TODO: arrumar isso, queria que fosse opcional
        userId: String(user?.id),
        profilePictureUrl: String(user?.profileImageUrl),
      });
    }
  };

  if (isLoading) {
    return (
      <View className="flex h-full flex-col items-center justify-center">
        <Text className="text-2xl">Loading...</Text>
      </View>
    );
  }

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
            <View className="flex flex-row items-center justify-between">
              <Text className="pt-12 font-nunito-sans-bold text-3xl">
                Onboard
              </Text>
            </View>
            <FormTextInput
              value={name}
              title="🖋️ Full Name"
              placeholder="John Doe"
              onChange={setName}
            />
            <FormDateInput
              title="🥳 Birthday"
              value={birthday}
              onChange={setBirthday}
            />
            <FormTextInput
              value={document}
              title="🪪 Document"
              placeholder="054.408.229-09"
              onChange={setDocument}
            />
            <FormTextInput
              value={crp}
              title="🧠 CRP"
              placeholder="02/43243"
              onChange={setCrp}
            />
            <FormTextInput
              value={yearsOfExperience}
              title="🗣️ Experience"
              placeholder="2"
              complement="years"
              onChange={setYearsOfExperience}
              inputType="numeric"
            />
            <FormCurrencyInput
              value={hourlyRate}
              title="💰 Hourly Rate"
              onChange={setHourlyRate}
            />
          </ScrollView>
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
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
