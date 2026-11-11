import { ActivityIndicator, Pressable, Text } from "react-native";

type Props = {
  label: string;
  loading?: boolean;
  disabled?: boolean;
  onPress: () => void;
};

export default function AuthButton({ label, loading = false, disabled = false, onPress }: Props) {
  const unavailable = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: unavailable, busy: loading }}
      className={`auth-button ${unavailable ? "auth-button-disabled" : ""}`}
      disabled={unavailable}
      onPress={onPress}
    >
      {loading ? (
        <ActivityIndicator color="#081126" />
      ) : (
        <Text className="auth-button-text">{label}</Text>
      )}
    </Pressable>
  );
}
