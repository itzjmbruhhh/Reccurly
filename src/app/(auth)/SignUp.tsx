import { useSignUp } from "@clerk/expo";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import AuthButton from "@/components/AuthButton";
import AuthField from "@/components/AuthField";
import AuthScreen from "@/components/AuthScreen";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignUp() {
  const { signUp } = useSignUp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [verificationStep, setVerificationStep] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [codeError, setCodeError] = useState("");
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function createAccount() {
    const cleanEmail = email.trim().toLowerCase();
    const nextEmailError = emailPattern.test(cleanEmail) ? "" : "Enter a valid email address.";
    const nextPasswordError = password.length >= 8 ? "" : "Use at least 8 characters for your password.";
    const nextConfirmError = password === confirmPassword ? "" : "Your passwords don’t match.";
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    setConfirmError(nextConfirmError);
    setFormError("");
    if (nextEmailError || nextPasswordError || nextConfirmError) return;

    setLoading(true);
    try {
      const { error } = await signUp.password({ emailAddress: cleanEmail, password });
      if (error) {
        setFormError(error.longMessage || error.message || "We couldn’t create your account. Review your details and try again.");
        return;
      }

      const { error: sendError } = await signUp.verifications.sendEmailCode();
      if (sendError) {
        setFormError(sendError.longMessage || sendError.message || "We couldn’t send your verification code. Try again shortly.");
        return;
      }
      setVerificationStep(true);
      setNotice(`We sent a verification code to ${cleanEmail}.`);
    } catch (error) {
      setFormError(error instanceof Error && error.message ? error.message : "We couldn’t connect securely. Check your internet connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyEmail() {
    const cleanCode = code.trim();
    if (!/^\d{4,8}$/.test(cleanCode)) {
      setCodeError("Enter the verification code from your email.");
      return;
    }
    setCodeError("");
    setFormError("");
    setLoading(true);
    try {
      const { error } = await signUp.verifications.verifyEmailCode({ code: cleanCode });
      if (error) {
        setFormError(error.longMessage || error.message || "That code didn’t work. Check it and try again.");
        return;
      }
      const { error: finalizeError } = await signUp.finalize();
      if (finalizeError) {
        setFormError(finalizeError.longMessage || finalizeError.message || "Your email is verified, but we couldn’t start your session. Try again.");
      } else {
        router.replace("/(tabs)");
      }
    } catch (error) {
      setFormError(error instanceof Error && error.message ? error.message : "We couldn’t verify your email right now. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function resendCode() {
    if (loading) return;
    setLoading(true);
    setFormError("");
    try {
      const { error } = await signUp.verifications.sendEmailCode();
      if (error) setFormError(error.longMessage || error.message || "We couldn’t send a new code. Try again shortly.");
      else setNotice("A new verification code is on its way.");
    } catch (error) {
      setFormError(error instanceof Error && error.message ? error.message : "We couldn’t send a new code right now. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScreen
      title={verificationStep ? "Check your email" : "Create your account"}
      subtitle={verificationStep ? "Verify your email to keep your subscriptions in sync." : "One clear view of every renewal, all in one place."}
    >
      <View className="auth-form">
        {verificationStep ? (
          <>
            <Text className="auth-helper">{notice || `Enter the code we sent to ${email.trim()}.`}</Text>
            <AuthField
              label="Verification code"
              value={code}
              onChangeText={(value) => { setCode(value.replace(/\D/g, "").slice(0, 8)); setCodeError(""); setFormError(""); }}
              autoCapitalize="none"
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              maxLength={8}
              returnKeyType="go"
              onSubmitEditing={() => void verifyEmail()}
              editable={!loading}
              placeholder="Enter your code"
              error={codeError}
            />
            {formError ? <Text accessibilityRole="alert" className="auth-form-error">{formError}</Text> : null}
            <AuthButton label="Verify email" loading={loading} onPress={() => void verifyEmail()} />
            <View className="auth-resend-row">
              <Text className="auth-helper">Didn’t receive the email?</Text>
              <Pressable onPress={() => void resendCode()} disabled={loading} accessibilityRole="button">
                <Text className="auth-link">Resend code</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <>
            <AuthField
              label="Email"
              value={email}
              onChangeText={(value) => { setEmail(value); setEmailError(""); setFormError(""); }}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
              returnKeyType="next"
              editable={!loading}
              placeholder="Enter your email"
              error={emailError}
            />
            <AuthField
              label="Password"
              value={password}
              onChangeText={(value) => { setPassword(value); setPasswordError(""); setFormError(""); }}
              autoCapitalize="none"
              autoComplete="new-password"
              textContentType="newPassword"
              secureTextEntry={!showPassword}
              returnKeyType="next"
              editable={!loading}
              placeholder="Create a password"
              error={passwordError}
              trailing={(
                <Pressable onPress={() => setShowPassword((visible) => !visible)} accessibilityRole="button" accessibilityLabel={showPassword ? "Hide password" : "Show password"}>
                  <Text className="auth-show-password">{showPassword ? "Hide" : "Show"}</Text>
                </Pressable>
              )}
            />
            <Text className="auth-password-hint">Use at least 8 characters.</Text>
            <AuthField
              label="Confirm password"
              value={confirmPassword}
              onChangeText={(value) => { setConfirmPassword(value); setConfirmError(""); setFormError(""); }}
              autoCapitalize="none"
              autoComplete="new-password"
              textContentType="newPassword"
              secureTextEntry={!showPassword}
              returnKeyType="go"
              onSubmitEditing={() => void createAccount()}
              editable={!loading}
              placeholder="Re-enter your password"
              error={confirmError}
            />
            {formError ? <Text accessibilityRole="alert" className="auth-form-error">{formError}</Text> : null}
            <AuthButton label="Create account" loading={loading} onPress={() => void createAccount()} />
            {/* Required for Clerk's legacy bot sign-up protection on web. */}
            <View nativeID="clerk-captcha" />
            <Text className="auth-legal-copy">Your email is verified before your account is activated.</Text>
          </>
        )}
        {!verificationStep ? (
          <View className="auth-link-row">
            <Text className="auth-link-copy">Already have an account?</Text>
            <Link href="/(auth)/SignIn" asChild>
              <Pressable accessibilityRole="link"><Text className="auth-link">Sign in</Text></Pressable>
            </Link>
          </View>
        ) : null}
      </View>
    </AuthScreen>
  );
}
