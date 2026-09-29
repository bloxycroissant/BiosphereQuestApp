import { GradientSafeAreaView as SafeAreaView } from "@/components/gradient-safe-area";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import MaskedView from "@react-native-masked-view/masked-view";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { supabase } from "../lib/supabase";

const logo = require("../../assets/BiosphereQuestAssets/Biosphere Quest Logo.png");

interface GradientTextProps {
  style: any;
  children: string;
}

function GradientText({
  style,
  children,
}: GradientTextProps): React.JSX.Element {
  return (
    <MaskedView
      maskElement={
        <Text style={[style, { backgroundColor: "transparent" }]}>
          {children}
        </Text>
      }
    >
      <LinearGradient
        colors={["#a78bfa", "#e879f9"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={[style, { opacity: 0 }]}>{children}</Text>
      </LinearGradient>
    </MaskedView>
  );
}

export default function VerifyCodeScreen(): React.JSX.Element {
  const params = useLocalSearchParams();
  const email = typeof params.email === "string" ? params.email : "";

  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isCodeInvalid, setIsCodeInvalid] = useState(false);
  const [countdown, setCountdown] = useState(30);

  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const handleTextChange = (text: string, index: number): void => {
    const cleanedText = text.replace(/[^0-9]/g, "");
    const newCode = [...code];
    newCode[index] = cleanedText;
    setCode(newCode);

    if (errorMessage) setErrorMessage("");
    if (isCodeInvalid) setIsCodeInvalid(false);

    if (cleanedText && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number): void => {
    if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyCode = async (): Promise<void> => {
    setErrorMessage("");
    setIsCodeInvalid(false);
    const fullCode = code.join("").trim();

    if (fullCode.length < 6) {
      const msg = "Please enter the complete 6-digit verification code.";
      setErrorMessage(msg);
      setIsCodeInvalid(true);
      Alert.alert("Invalid Code", msg);
      return;
    }

    if (!email) {
      const msg =
        "No email address found. Please restart the password reset flow.";
      setErrorMessage(msg);
      Alert.alert("Missing Email", msg);
      return;
    }

    try {
      setLoading(true);
      console.log("🔄 [VerifyOtp] Verifying 6-digit recovery code for:", email);

      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: fullCode,
        type: "recovery",
      });

      if (error) {
        console.error(
          "❌ [VerifyOtp] Code verification failed:",
          error.message,
        );

        const friendlyMessage =
          error.message.toLowerCase().includes("token has expired") ||
          error.message.toLowerCase().includes("invalid") ||
          error.message.toLowerCase().includes("otp")
            ? "Incorrect verification code. Please check the code in your email and try again."
            : error.message;

        setErrorMessage(friendlyMessage);
        setIsCodeInvalid(true);
        Alert.alert("Incorrect Code", friendlyMessage);

        setCode(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        return;
      }

      if (data?.session) {
        console.log(
          "✅ [VerifyOtp] Code verified! Routing to set new password...",
        );
        router.push({
          pathname: "/new-password" as any,
          params: { email: email.trim() },
        });
      }
    } catch (err: any) {
      console.error("❌ [VerifyOtp] Unexpected error:", err);
      const fallback =
        "Verification failed. Please double-check the code and try again.";
      setErrorMessage(fallback);
      setIsCodeInvalid(true);
      Alert.alert("Verification Error", fallback);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async (): Promise<void> => {
    if (countdown > 0 || resending) return;

    if (!email) {
      Alert.alert(
        "Missing Email",
        "Please go back and re-enter your email address.",
      );
      return;
    }

    try {
      setResending(true);
      setErrorMessage("");
      setIsCodeInvalid(false);
      console.log("🔄 [ResendOtp] Requesting fresh recovery code for:", email);

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());

      if (error) {
        console.error("❌ [ResendOtp] Resend failed:", error.message);
        setErrorMessage(error.message);
        Alert.alert("Resend Failed", error.message);
        return;
      }

      console.log("✅ [ResendOtp] Fresh recovery code sent to:", email);
      setCountdown(30);
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      Alert.alert(
        "Code Sent",
        "A new 6-digit recovery code has been sent to your email.",
      );
    } catch (err: any) {
      console.error("❌ [ResendOtp] Unexpected error:", err);
      Alert.alert("Error", "Could not resend recovery code. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.cancelButton}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={20}
              color="#f091f8"
            />
            <Text style={styles.cancelText}>Back</Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <Image source={logo} style={styles.logo} contentFit="contain" />
            <GradientText style={styles.brandTitle}>
              Biosphere Quest
            </GradientText>
            <Text style={styles.pageTitle}>Enter Verification Code</Text>
            <Text style={styles.pageSubtitle}>
              We sent a 6-digit code to {email || "your email"}
            </Text>
          </View>

          {errorMessage !== "" && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>⚠️ {errorMessage}</Text>
            </View>
          )}

          <View style={styles.codeContainer}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                style={[
                  styles.codeInputBox,
                  digit !== "" && styles.codeInputBoxActive,
                  isCodeInvalid && styles.codeInputBoxError,
                ]}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(text) => handleTextChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                placeholderTextColor="#5a6b94"
                autoFocus={index === 0}
              />
            ))}
          </View>

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive code? </Text>
            <Pressable
              onPress={handleResendCode}
              disabled={countdown > 0 || resending}
            >
              <Text
                style={[
                  styles.resendAction,
                  (countdown > 0 || resending) && styles.resendActionDisabled,
                ]}
              >
                {resending
                  ? "Sending..."
                  : countdown > 0
                    ? `Resend (${countdown}s)`
                    : "Resend Code"}
              </Text>
            </Pressable>
          </View>

          <Pressable
            style={[styles.primaryButton, loading && { opacity: 0.7 }]}
            onPress={handleVerifyCode}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>Verify Code</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#091426" },
  headerRow: { paddingHorizontal: 20, paddingTop: 10 },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  cancelText: {
    color: "#f091f8",
    fontSize: 16,
    fontWeight: "800",
    marginLeft: 6,
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    paddingBottom: 40,
  },
  logoContainer: { alignItems: "center", marginBottom: 24 },
  logo: { width: 80, height: 80, marginBottom: 14 },
  brandTitle: {
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 10,
    letterSpacing: 0.5,
    textAlign: "center",
    color: "#ffffff",
  },
  pageTitle: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 8,
  },
  pageSubtitle: {
    color: "#8a9bbd",
    fontSize: 14,
    textAlign: "center",
    maxWidth: 300,
  },
  errorBanner: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    borderColor: "#ef4444",
    borderWidth: 1.2,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  errorBannerText: {
    color: "#fca5a5",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    paddingHorizontal: 6,
  },
  codeInputBox: {
    width: 48,
    height: 58,
    backgroundColor: "#131e38",
    borderColor: "#374b7c",
    borderWidth: 1.5,
    borderRadius: 14,
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },
  codeInputBoxActive: {
    borderColor: "#625cff",
    backgroundColor: "#1a2544",
  },
  codeInputBoxError: {
    borderColor: "#ef4444",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  resendText: { color: "#8a9bbd", fontSize: 14 },
  resendAction: { color: "#f091f8", fontSize: 14, fontWeight: "800" },
  resendActionDisabled: { color: "#5a6b94" },
  primaryButton: {
    backgroundColor: "#625cff",
    borderRadius: 14,
    height: 54,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#625cff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: { color: "#ffffff", fontSize: 16, fontWeight: "900" },
});
