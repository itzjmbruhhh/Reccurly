import { useSignIn } from "@clerk/expo";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { usePostHog } from "posthog-react-native";
import AuthButton from "@/components/AuthButton";
import AuthField from "@/components/AuthField";
import AuthScreen from "@/components/AuthScreen";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPassword() {
  const { signIn } = useSignIn();
  const posthog = usePostHog();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState<"email" | "code" | "password">("email");
  const [fieldError, setFieldError] = useState("");
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  function clearErrors() {
    setFieldError("");
    setFormError("");
  }

  async function sendCode() {
    const cleanEmail = email.trim().toLowerCase();
    if (!emailPattern.test(cleanEmail)) {
      setFieldError("Enter a valid email address.");
      return;
    }
    clearErrors();
    setLoading(true);
    try {
      const { error: createError } = await signIn.create({ identifier: cleanEmail });
      if (createError) {
        setFormError("If an account matches that email, you’ll receive a reset code shortly. Check the address and try again.");
        return;
      }
      const { error } = await signIn.resetPasswordEmailCode.sendCode();
      if (error) {
        setFormError("If an account matches that email, you’ll receive a reset code shortly. Please wait a moment and try again.");
        return;
      }
      posthog?.capture("password_reset_requested");
      setStep("code");
    } catch {
      setFormError("We couldn’t connect securely. Check your internet connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode() {
    const cleanCode = code.trim();
    if (!/^\d{4,8}$/.test(cleanCode)) {
      setFieldError("Enter the verification code from your email.");
      return;
    }
    clearErrors();
    setLoading(true);
    try {
      const { error } = await signIn.resetPasswordEmailCode.verifyCode({ code: cleanCode });
      if (error) {
        setFormError(error.longMessage ?? "That code didn’t work. Check it and try again.");
        return;
      }
      setStep("password");
    } catch {
      setFormError("We couldn’t verify that code right now. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function updatePassword() {
    if (password.length < 8) {
      setFieldError("Use at least 8 characters for your password.");
      return;
    }
    if (password !== confirmPassword) {
      setFieldError("Your passwords don’t match.");
      return;
    }
    clearErrors();
    setLoading(true);
    try {
      const { error } = await signIn.resetPasswordEmailCode.submitPassword({ password, signOutOfOtherSessions: true });
      if (error) {
        setFormError(error.longMessage ?? "We couldn’t update your password. Try a different password.");
        return;
      }
      if (signIn.status === "complete") {
        const { error: finalizeError } = await signIn.finalize();
        if (finalizeError) {
          setFormError(finalizeError.longMessage ?? "Your password was changed, but we couldn’t start your session. Sign in with your new password.");
        } else {
          posthog?.capture("password_reset_completed");
          router.replace("/(tabs)");
        }
      } else {
        setFormError("Your password was updated. Please sign in with your new password.");
      }
    } catch {
      setFormError("We couldn’t update your password right now. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  const title = step === "email" ? "Reset your password" : step === "code" ? "Check your email" : "Create a new password";
  const subtitle = step === "email"
    ? "We’ll send a secure code to the email on your account."
    : step === "code"
      ? `Enter the code we sent to ${email.trim()}.`
      : "Choose a new password to secure your account.";

  return (
    <AuthScreen title={title} subtitle={subtitle}>
      <View className="auth-form">
        {step === "email" ? (
          <AuthField
            label="Email"
            value={email}
            onChangeText={(value) => { setEmail(value); clearErrors(); }}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            textContentType="emailAddress"
            returnKeyType="go"
            onSubmitEditing={() => void sendCode()}
            editable={!loading}
            placeholder="Enter your email"
            error={fieldError}
          />
        ) : null}
        {step === "code" ? (
          <>
            <AuthField
              label="Verification code"
              value={code}
              onChangeText={(value) => { setCode(value.replace(/\D/g, "").slice(0, 8)); clearErrors(); }}
              autoCapitalize="none"
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              maxLength={8}
              returnKeyType="go"
              onSubmitEditing={() => void verifyCode()}
              editable={!loading}
              placeholder="Enter your code"
              error={fieldError}
            />
            <Pressable onPress={() => { clearErrors(); setStep("email"); }} disabled={loading} accessibilityRole="button">
              <Text className="auth-secondary-button-text">Use a different email</Text>
            </Pressable>
          </>
        ) : null}
        {step === "password" ? (
          <>
            <AuthField
              label="New password"
              value={password}
              onChangeText={(value) => { setPassword(value); clearErrors(); }}
              autoCapitalize="none"
              autoComplete="new-password"
              textContentType="newPassword"
              secureTextEntry
              returnKeyType="next"
              editable={!loading}
              placeholder="Create a password"
              error={fieldError}
            />
            <Text className="auth-password-hint">Use at least 8 characters.</Text>
            <AuthField
              label="Confirm new password"
              value={confirmPassword}
              onChangeText={(value) => { setConfirmPassword(value); clearErrors(); }}
              autoCapitalize="none"
              autoComplete="new-password"
              textContentType="newPassword"
              secureTextEntry
              returnKeyType="go"
              onSubmitEditing={() => void updatePassword()}
              editable={!loading}
              placeholder="Re-enter your password"
            />
          </>
        ) : null}
        {formError ? <Text accessibilityRole="alert" className="auth-form-error">{formError}</Text> : null}
        <AuthButton
          label={step === "email" ? "Send reset code" : step === "code" ? "Verify code" : "Update password"}
          loading={loading}
          onPress={() => void (step === "email" ? sendCode() : step === "code" ? verifyCode() : updatePassword())}
        />
        {step === "password" ? (
          <Pressable onPress={() => { clearErrors(); setStep("code"); }} accessibilityRole="button" disabled={loading}>
            <Text className="auth-secondary-button-text">Back to verification code</Text>
          </Pressable>
        ) : null}
        <View className="auth-link-row">
          <Text className="auth-link-copy">Remembered it?</Text>
          <Link href="/(auth)/SignIn" asChild>
            <Pressable accessibilityRole="link"><Text className="auth-link">Back to sign in</Text></Pressable>
          </Link>
        </View>
      </View>
    </AuthScreen>
  );
}
