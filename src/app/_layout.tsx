import { Stack, SplashScreen } from "expo-router";
import {useEffect} from "react";
import { useFonts } from "expo-font";
import "@/global.css";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

export default function RootLayout() {

  const [fontsLoaded, fontError] = useFonts({
    'sans-regular': require('../../assets/fonts/PlusJakartaSans-Regular.ttf'),
    'sans-bold': require('../../assets/fonts/PlusJakartaSans-Bold.ttf'),
    'sans-medium': require('../../assets/fonts/PlusJakartaSans-Medium.ttf'),
    'sans-semibold': require('../../assets/fonts/PlusJakartaSans-SemiBold.ttf'),
    'sans-extrabold': require('../../assets/fonts/PlusJakartaSans-ExtraBold.ttf'),
    'sans-light': require('../../assets/fonts/PlusJakartaSans-Light.ttf')
  })

  useEffect(() => {
    if (fontError) {
      console.error("Failed to load fonts:", fontError);
    }

    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded, fontError])

  if (!fontsLoaded && !fontError) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}
