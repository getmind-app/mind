import { registerRootComponent } from "expo";
import { ExpoRoot, SplashScreen } from "expo-router";

SplashScreen.preventAutoHideAsync();
export function App() {
  const ctx = require.context("./src/app");

  return <ExpoRoot context={ctx} />;
}

registerRootComponent(App);
