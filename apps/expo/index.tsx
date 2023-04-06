import { useCallback } from "react";
import { registerRootComponent } from "expo";
import { useFonts } from "expo-font";
import { ExpoRoot, SplashScreen } from "expo-router";

SplashScreen.preventAutoHideAsync();
export function App() {
  const ctx = require.context("./src/app");

  return <ExpoRoot context={ctx} />;
}

registerRootComponent(App);
