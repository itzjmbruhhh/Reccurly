import "@/global.css";
import { Text } from "react-native";
import { Link } from "expo-router";
import { styled } from "nativewind";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="text-5xl font-sans font-extrabold">Home</Text>
      <Link
        href="/Onboarding"
        className="mt-4 font-sans font-bold rounded bg-primary text-white p-4"
      >
        Go to Onboarding
      </Link>

      <Link
        href="/(auth)/SignIn"
        className="mt-4 font-sans font-bold rounded bg-primary text-white p-4"
      >
        Go to Sign in
      </Link>

      <Link
        href="/(auth)/SignUp"
        className="mt-4 font-sans font-bold rounded bg-primary text-white p-4"
      >
        Go to Sign up
      </Link>
    </SafeAreaView>
  );
}
