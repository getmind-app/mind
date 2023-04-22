import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Profile from ".";
import TherapistProfile from "./psych";
import TherapistSchedule from "./psych/schedule";

const Stack = createNativeStackNavigator();

const ProfileStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" component={Profile} />
      <Stack.Screen name="psych/index" component={TherapistProfile} />
      <Stack.Screen name="psych/schedule/index" component={TherapistSchedule} />
    </Stack.Navigator>
  );
};

export default ProfileStack;
