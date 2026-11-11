import { useSignIn } from "@clerk/expo";
import { router, Link } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import AuthButton from "@/components/AuthButton";
import AuthField from "@/components/AuthField";
import AuthScreen from "@/components/AuthScreen";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
type MfaStrategy = "email_code" | "phone_code" | "totp" | "backup_code";

export default function SignIn() {
  const { signIn } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mfaStrategy, setMfaStrategy] = useState<MfaStrategy | null>(null);
  const [mfaCode, setMfaCode] = useState("");

  async function beginMfa() {
    const strategies = signIn.supportedSecondFactors.map((factor) => factor.strategy);
    const preferredStrategies: MfaStrategy[] = ["email_code", "phone_code", "totp", "backup_code"];
    const nextStrategy = preferredStrategies.find((strategy) => strategies.some((supported) => supported === strategy)) ?? null;
    setMfaStrategy(nextStrategy);
    if (!nextStrategy) {
      setFormError("This account needs an additional verification method that isn’t available in the app. Contact support for help signing in.");
      return;
    }
    if (nextStrategy === "email_code") {
      const { error } = await signIn.mfa.sendEmailCode();
      if (error) setFormError(error.longMessage ?? "We couldn’t send your verification code. Try again.");
    } else if (nextStrategy === "phone_code") {
      const { error } = await signIn.mfa.sendPhoneCode();
      if (error) setFormError(error.longMessage ?? "We couldn’t send your verification code. Try again.");
    }
  }

  async function chooseMfa(strategy: MfaStrategy) {
    setMfaStrategy(strategy);
    setMfaCode("");
    setFormError("");
    if (strategy === "email_code") {
      const { error } = await signIn.mfa.sendEmailCode();
      if (error) setFormError(error.longMessage ?? "We couldn’t send your verification code. Try again.");
    } else if (strategy === "phone_code") {
      const { error } = await signIn.mfa.sendPhoneCode();
      if (error) setFormError(error.longMessage ?? "We couldn’t send your verification code. Try again.");
    }
  }

  async function verifyMfa() {
    if (!mfaStrategy || !mfaCode.trim()) {
      setFormError("Enter your verification code to continue.");
      return;
    }
    setLoading(true);
    setFormError("");
    try {
      const params = { code: mfaCode.trim() };
      const result = mfaStrategy === "email_code"
        ? await signIn.mfa.verifyEmailCode(params)
        : mfaStrategy === "phone_code"
          ? await signIn.mfa.verifyPhoneCode(params)
          : mfaStrategy === "totp"
            ? await signIn.mfa.verifyTOTP(params)
            : await signIn.mfa.verifyBackupCode(params);
      if (result.error) {
        setFormError(result.error.longMessage ?? "That code didn’t work. Check it and try again.");
        return;
      }
      if (signIn.status === "complete") {
        const { error } = await signIn.finalize();
        if (error) setFormError(error.longMessage ?? "We couldn’t start your session. Please try again.");
        else router.replace("/(tabs)");
      } else {
        setFormError("We couldn’t complete verification. Try another method or request a new code.");
      }
    } catch {
      setFormError("We couldn’t verify your code right now. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function submit() {
    const cleanEmail = email.trim().toLowerCase();
    const nextEmailError = emailPattern.test(cleanEmail) ? "" : "Enter a valid email address.";
    const nextPasswordError = password.length > 0 ? "" : "Enter your password.";
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    setFormError("");
    if (nextEmailError || nextPasswordError) return;

    setLoading(true);
    try {
      const { error } = await signIn.password({ emailAddress: cleanEmail, password });
      if (error) {
        setFormError(error.longMessage ?? "We couldn’t sign you in. Check your details and try again.");
      } else if (signIn.status === "complete") {
        const { error: finalizeError } = await signIn.finalize();
        if (finalizeError) {
          setFormError(finalizeError.longMessage ?? "Your account was verified, but we couldn’t start your session. Try again.");
        } else {
          router.replace("/(tabs)");
        }
      } else if (signIn.status === "needs_second_factor" || signIn.status === "needs_client_trust") {
        await beginMfa();
      } else {
        setFormError("We need one more step to finish signing you in. Please try again or contact support.");
      }
    } catch {
      setFormError("We couldn’t connect securely. Check your internet connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScreen
      title={mfaStrategy ? "Verify it’s you" : "Welcome back"}
      subtitle={mfaStrategy ? "Complete a quick security check to protect your account." : "Sign in to continue managing your subscriptions."}
    >
      <View className="auth-form">
        {!mfaStrategy ? <AuthField
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
        /> : null}
        {!mfaStrategy ? <AuthField
          label="Password"
          value={password}
          onChangeText={(value) => { setPassword(value); setPasswordError(""); setFormError(""); }}
          autoCapitalize="none"
          autoComplete="current-password"
          textContentType="password"
          secureTextEntry={!showPassword}
          returnKeyType="go"
          onSubmitEditing={() => void submit()}
          editable={!loading}
          placeholder="Enter your password"
          error={passwordError}
          trailing={(
            <Pressable onPress={() => setShowPassword((visible) => !visible)} accessibilityRole="button" accessibilityLabel={showPassword ? "Hide password" : "Show password"}>
              <Text className="auth-show-password">{showPassword ? "Hide" : "Show"}</Text>
            </Pressable>
          )}
        /> : null}
        {!mfaStrategy ? <View className="auth-forgot-row">
          <Link href="/(auth)/ForgotPassword" asChild>
            <Pressable accessibilityRole="link"><Text className="auth-link">Forgot password?</Text></Pressable>
          </Link>
        </View> : null}
        {mfaStrategy ? (
          <>
            <Text className="auth-helper">
              {mfaStrategy === "email_code" ? "Enter the code sent to your email." : mfaStrategy === "phone_code" ? "Enter the code sent to your phone." : mfaStrategy === "totp" ? "Enter the code from your authenticator app." : "Enter one of your backup codes."}
            </Text>
            <AuthField
              label={mfaStrategy === "backup_code" ? "Backup code" : "Verification code"}
              value={mfaCode}
              onChangeText={(value) => { setMfaCode(value); setFormError(""); }}
              autoCapitalize="characters"
              autoComplete="one-time-code"
              textContentType="oneTimeCode"
              returnKeyType="go"
              onSubmitEditing={() => void verifyMfa()}
              editable={!loading}
              placeholder="Enter your code"
            />
            {signIn.supportedSecondFactors.some((factor) => factor.strategy !== mfaStrategy) ? (
              <View className="auth-mfa-options">
                <Text className="auth-helper">Try another method:</Text>
                {signIn.supportedSecondFactors.map((factor) => {
                  const strategy = factor.strategy as MfaStrategy;
                  if (strategy === mfaStrategy) return null;
                  const label = strategy === "email_code" ? "Email code" : strategy === "phone_code" ? "Text message" : strategy === "totp" ? "Authenticator app" : strategy === "backup_code" ? "Backup code" : null;
                  return label ? (
                    <Pressable key={strategy} onPress={() => void chooseMfa(strategy)} disabled={loading} accessibilityRole="button">
                      <Text className="auth-link">{label}</Text>
                    </Pressable>
                  ) : null;
                })}
              </View>
            ) : null}
          </>
        ) : null}
        {formError ? <Text accessibilityRole="alert" className="auth-form-error">{formError}</Text> : null}
        <AuthButton label={mfaStrategy ? "Verify and continue" : "Sign in"} loading={loading} onPress={() => void (mfaStrategy ? verifyMfa() : submit())} />
        {!mfaStrategy ? <View className="auth-link-row">
          <Text className="auth-link-copy">New to Recurrly?</Text>
          <Link href="/(auth)/SignUp" asChild>
            <Pressable accessibilityRole="link"><Text className="auth-link">Create an account</Text></Pressable>
          </Link>
        </View> : null}
      </View>
    </AuthScreen>
  );
}
