import { GradientSafeAreaView as SafeAreaView } from "@/components/gradient-safe-area";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { supabase } from "../lib/supabase";

const logo = require("../../assets/BiosphereQuestAssets/Biosphere Quest Logo.png");

export default function VerifyScreen() {
  const { email } = useLocalSearchParams<{ email?: string | string[] }>();
  const emailAddress = Array.isArray(email) ? (email[0] ?? "") : (email ?? "");

  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  useEffect(() => {
    if (resendTimer <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleVerify = async () => {
    const normalizedCode = code.trim();

    if (!emailAddress) {
      Alert.alert(
        "Missing Email",
        "We couldn't find your email address. Please try again.",
      );
      return;
    }

    if (!normalizedCode || normalizedCode.length < 6) {
      Alert.alert(
        "Invalid Code",
        "Please enter the 6-digit code sent to your email.",
      );
      return;
    }

    setIsVerifying(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email: emailAddress,
        token: normalizedCode,
        type: "signup",
      });

      if (error) {
        Alert.alert("Verification Failed", error.message);
        return;
      }

      const guestName =
        (await AsyncStorage.getItem("explorerName")) || "Explorer";
      const profileData = await AsyncStorage.getItem(
        "@biosphere_profile_data_v1",
      );
      const parsed = profileData ? JSON.parse(profileData) : {};

      const updatedProfile = {
        ...parsed,
        email: emailAddress,
        name: guestName,
      };

      await AsyncStorage.setItem(
        "@biosphere_profile_data_v1",
        JSON.stringify(updatedProfile),
      );
      setIsVerifying(false);
      router.replace("/home" as any);
    } catch (error) {
      console.error("Verification error:", error);
      Alert.alert("Error", "An unexpected error occurred during verification.");
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;

    if (!emailAddress) {
      Alert.alert(
        "Missing Email",
        "We couldn't find your email address. Please try again.",
      );
      return;
    }

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: emailAddress,
      });

      if (error) throw error;

      Alert.alert("Sent!", "A new code has been sent to your email.");
      setResendTimer(60);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.content}>
          <Pressable
            onPress={() =>
              router.canGoBack() ? router.back() : router.replace("/signup")
            }
            style={styles.backButton}
          >
            <Text style={styles.back}>‹ Back</Text>
          </Pressable>

          <Image source={logo} style={styles.logo} contentFit="contain" />

          <Text style={styles.title}>Verify Your Email</Text>
          <Text style={styles.subtitle}>
            We sent a secure 6-digit code to{" "}
            <Text style={styles.highlight}>{emailAddress}</Text>. Enter it below
            to activate your account.
          </Text>

          <View style={styles.inputWrapper}>
            <TextInput
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={6}
              placeholder="••••••"
              placeholderTextColor="#4d5d80"
              style={styles.codeInput}
              autoFocus
            />
          </View>

          <Pressable
            onPress={handleVerify}
            style={styles.primary}
            disabled={isVerifying}
          >
            <Text style={styles.primaryText}>
              {isVerifying ? "Verifying..." : "Confirm Code"}
            </Text>
          </Pressable>

          <Pressable
            onPress={handleResend}
            style={styles.resendButton}
            disabled={resendTimer > 0}
          >
            <Text
              style={[
                styles.resendText,
                resendTimer > 0 && styles.resendTextDisabled,
              ]}
            >
              {resendTimer > 0
                ? `Resend Code in ${resendTimer}s`
                : "Didn't receive it? Resend Code"}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#091426" },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 24,
  },
  back: { color: "#e582ff", fontWeight: "800", fontSize: 16 },
  logo: { width: 120, height: 120, marginBottom: 20 },
  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    color: "#8a9bbd",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  highlight: { color: "#9af2bc", fontWeight: "800" },
  inputWrapper: {
    width: "100%",
    alignItems: "center",
    marginBottom: 24,
  },
  codeInput: {
    backgroundColor: "#131e38",
    borderColor: "#625cff",
    borderWidth: 2,
    borderRadius: 16,
    color: "#fff",
    fontSize: 32,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: 8,
    width: "80%",
    paddingVertical: 16,
  },
  primary: {
    backgroundColor: "#625cff",
    borderRadius: 12,
    alignItems: "center",
    padding: 16,
    width: "100%",
    marginBottom: 20,
  },
  primaryText: { color: "#fff", fontSize: 16, fontWeight: "900" },
  resendButton: {
    paddingVertical: 10,
  },
  resendText: { color: "#63e1e8", fontSize: 14, fontWeight: "800" },
  resendTextDisabled: { color: "#4d5d80" },
});
