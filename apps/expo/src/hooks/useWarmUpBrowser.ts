import { useEffect } from "react";
import * as WebBrowser from "expo-web-browser";

// https://clerk.com/docs/quickstarts/get-started-with-expo
export const useWarmUpBrowser = () => {
  useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
};
