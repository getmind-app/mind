import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Profile from ".";
import TherapistProfile from "./psych";
import FinishSessionAppointment from "./psych/finish";
import SessionPayment from "./psych/payment";
import TherapistSchedule from "./psych/schedule";

const Stack = createNativeStackNavigator();

const ProfileStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        animationDuration: 150,
      }}
    >
      <Stack.Screen name="index" component={Profile} />
      <Stack.Screen name="psych/index" component={TherapistProfile} />
      <Stack.Screen name="psych/schedule/index" component={TherapistSchedule} />
      <Stack.Screen name="psych/payment/index" component={SessionPayment} />
      <Stack.Screen
        name="psych/finish/index"
        component={FinishSessionAppointment}
      />
    </Stack.Navigator>
  );
};

export default ProfileStack;
