import { ClerkProvider, useAuth, useUser } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { Stack, SplashScreen, useRouter, useSegments } from "expo-router";
import { PostHogProvider } from "posthog-react-native";
import { useEffect, useRef } from "react";
import { ActivityIndicator, View } from "react-native";
import "@/global.css";
import { posthog, posthogLogger } from "@/lib/posthog";
import { SubscriptionsProvider } from "@/src/components/SubscriptionsProvider";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error("Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to your .env file.");
}
const clerkPublishableKey = publishableKey as string;

export const unstable_settings = {
  anchor: "(tabs)",
};

function RootNavigator() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const previousUserId = useRef<string | null | undefined>(undefined);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!posthog || !isLoaded) return;

    const userId = isSignedIn ? user?.id : null;
    if (isSignedIn && !userId) return;
    if (previousUserId.current === userId) return;

    if (previousUserId.current && userId) {
      posthogLogger?.info("authenticated session changing", {
        authentication_state: "switching",
      });
      posthog.reset();
    }

    if (userId) {
      const email = user?.primaryEmailAddress?.emailAddress;
      posthog.identify(userId, {
        $set: {
          ...(email ? { email } : {}),
        },
      });
      posthogLogger?.info("authenticated session ready", {
        authentication_state: "signed_in",
      });
    } else if (previousUserId.current) {
      posthogLogger?.info("authenticated session ended", {
        authentication_state: "signed_out",
      });
      posthog.reset();
    }

    previousUserId.current = userId;
  }, [isLoaded, isSignedIn, user]);

  useEffect(() => {
    if (!isLoaded) return;

    const inAuthGroup = segments[0] === "(auth)";
    if (!isSignedIn && !inAuthGroup) {
      router.replace("/(auth)/SignIn");
    } else if (isSignedIn && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [isLoaded, isSignedIn, router, segments]);

  useEffect(() => {
    if (isLoaded) void SplashScreen.hideAsync();
  }, [isLoaded]);

  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="#ea7a53" />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  const app = (
    <SubscriptionsProvider>
      <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={tokenCache}>
        <RootNavigator />
      </ClerkProvider>
    </SubscriptionsProvider>
  );

  return posthog ? <PostHogProvider client={posthog}>{app}</PostHogProvider> : app;
}
