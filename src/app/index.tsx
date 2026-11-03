import "@/global.css";
import { Text, View } from "react-native";
import { Link } from "expo-router";

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-success">
        Welcome to Nativewind!
      </Text>
      <Link
        href="/onboarding"
        className="mt-4 rounded bg-primary text-white p-4"
      >
        Go to Onboarding
      </Link>

      <Link
        href="/(auth)/sign_in"
        className="mt-4 rounded bg-primary text-white p-4"
      >
        Go to Sign in
      </Link>

      <Link
        href="/(auth)/sign_up"
        className="mt-4 rounded bg-primary text-white p-4"
      >
        Go to Sign up
      </Link>
    </View>
  );
}
