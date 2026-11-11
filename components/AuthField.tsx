import { ReactNode } from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";

type Props = TextInputProps & {
  label: string;
  error?: string;
  trailing?: ReactNode;
};

export default function AuthField({ label, error, trailing, ...inputProps }: Props) {
  return (
    <View className="auth-field">
      <Text className="auth-label">{label}</Text>
      <View className="auth-input-wrap">
        <TextInput
          {...inputProps}
          className={`auth-input ${error ? "auth-input-error" : ""} ${trailing ? "pr-14" : ""}`}
          placeholderTextColor="#65728a"
          accessibilityLabel={label}
          accessibilityHint={error}
          aria-invalid={Boolean(error)}
        />
        {trailing ? <View className="auth-input-trailing">{trailing}</View> : null}
      </View>
      {error ? <Text className="auth-error">{error}</Text> : null}
    </View>
  );
}
