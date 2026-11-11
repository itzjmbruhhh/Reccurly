import { useAuth } from "@clerk/expo";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import { styled } from "nativewind";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function Settings() {
  const { signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await signOut();
    } catch {
      Alert.alert("Couldn’t sign out", "Please check your connection and try again.");
      setIsSigningOut(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="text-2xl font-sans font-bold text-primary">Settings</Text>
      <View className="mt-6 rounded-2xl border border-border bg-card p-4">
        <Text className="text-lg font-sans font-bold text-primary">Account</Text>
        <Text className="mt-1 text-sm font-sans font-medium text-muted-foreground">
          Sign out of your Recurrly account on this device.
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: isSigningOut, busy: isSigningOut }}
          className="mt-5 min-h-12 flex-row items-center justify-center rounded-2xl bg-destructive px-4 py-3"
          disabled={isSigningOut}
          onPress={() => void handleSignOut()}
        >
          {isSigningOut ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="font-sans font-bold text-white">Sign out</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
