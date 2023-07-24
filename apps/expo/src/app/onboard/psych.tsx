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
import { zodResolver } from "@hookform/resolvers/zod";
import { cpf } from "cpf-cnpj-validator";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormCurrencyInput } from "../../components/FormCurrencyInput";
import { FormDateInput } from "../../components/FormDateInput";
import { FormTextInput } from "../../components/FormTextInput";
import { formatISODate } from "../../helpers/formatISODate";
import { api } from "../../utils/api";

const schema = z.object({
  document: z
    .string({
      required_error: "The document is required",
    })
    .min(11, "Your document must be 11 characters long")
    .refine((value) => cpf.isValid(value), "Must be a valid CPF"),
  fullName: z
    .string({
      required_error: "Full name is required",
    })
    .min(2, "Full name must be at least 2 characters"),
  yearsOfExperience: z
    .string({
      required_error: "Your years of experience is required",
    })
    .min(0, "Please provide a valid number of years"),
  hourlyRate: z
    .number({
      required_error: "Your hourly rate is required",
    })
    .min(0, "Please provide a valid hourly rate"),
  crp: z
    .string({
      required_error: "Your CRP is required",
    })
    .min(8, "Your CRP must be valid"),
});

export default function OnboardPsychScreen() {
  const { user } = useUser();
  const router = useRouter();

  const [showBirthdayPicker, setShowBirthdayPicker] = useState(false);

  const {
    control,
    handleSubmit,
    register,
    formState: { isValid, errors },
    getValues,
  } = useForm({
    defaultValues: {
      name: "",
      birthday: new Date(),
      document: "",
      crp: "",
      yearsOfExperience: "",
      hourlyRate: "",
      formValidated: "",
    },
    resolver: zodResolver(schema),
  });
  const onSubmit = handleSubmit((data) => {
    mutate({
      ...data,
      userId: String(user?.id),
      profilePictureUrl: String(user?.profileImageUrl),
      about: "",
      dateOfBirth: data.birthday,
      yearsOfExperience: parseInt(data.yearsOfExperience),
      hourlyRate: parseInt(data.hourlyRate),
    });
  });

  const { mutate, isLoading } = api.therapists.create.useMutation({
    onSuccess: () => {
      router.push("/"); // TODO: acredito que aqui teriamos que fazer mais validaçoes
    },
  });

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
              control={control}
              rules={{
                required: {
                  value: true,
                  message: "Your full name is required",
                },
                min: {
                  value: 2,
                  message: "Full name must be at least 2 characters",
                },
              }}
              name="name"
              title="🖋️ Full Name"
              placeholder="John Doe"
            />
            <FormDateInput
              title="🥳 Birthday"
              name="birthday"
              control={control}
              show={showBirthdayPicker}
              handleChange={() => setShowBirthdayPicker(false)}
              onTitlePress={() => setShowBirthdayPicker(!showBirthdayPicker)}
            />
            <Text
              onPress={() => setShowBirthdayPicker(true)}
              className={`h-10 w-full font-nunito-sans text-xl`}
            >
              {formatISODate(getValues("birthday"))}
            </Text>
            <FormTextInput
              control={control}
              name="document"
              title="🪪 Document (CPF)"
              placeholder="123.456.789-01"
            />

            <FormTextInput
              control={control}
              name="crp"
              title="🧠 CRP"
              placeholder="02/43243"
            />
            <FormTextInput
              title="🗣️ Experience"
              placeholder="2"
              unit="years"
              control={control}
              name="yearsOfExperience"
              inputMode="numeric"
            />
            <FormCurrencyInput
              name="hourlyRate"
              control={control}
              title="💰 Hourly Rate"
            />
          </ScrollView>
          <TouchableOpacity className="w-full" onPress={onSubmit}>
            <View
              className={`mt-8 flex w-full items-center justify-center rounded-xl bg-blue-500 py-2`}
            >
              <Text
                className={`font-nunito-sans-bold text-lg ${
                  isValid ? "text-white" : "text-black"
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
