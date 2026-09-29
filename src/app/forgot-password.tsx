import { GradientSafeAreaView as SafeAreaView } from "@/components/gradient-safe-area";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import MaskedView from "@react-native-masked-view/masked-view";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
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

export default function ForgotPasswordScreen(): React.JSX.Element {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const handleBack = (): void => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/login" as any);
    }
  };
  const handleSendCode = async (): Promise<void> => {
    setErrorMessage("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage("Please enter your email address.");
      Alert.alert(
        "Email Required",
        "Please enter your email address to receive a recovery code.",
      );
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage("Please enter a valid email address.");
      Alert.alert("Invalid Email", "Please type a valid email address.");
      return;
    }

    try {
      setLoading(true);
      console.log(
        "🔄 [Forgot Password] Requesting recovery code from Supabase for:",
        trimmedEmail,
      );

      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail);

      if (error) {
        console.error("❌ [Forgot Password] Supabase error:", error.message);
        setErrorMessage(error.message);
        Alert.alert("Request Failed", error.message);
        return;
      }

      console.log(
        "✅ [Forgot Password] Recovery code email successfully requested for:",
        trimmedEmail,
      );

      router.push({
        pathname: "/verify-code" as any,
        params: { email: trimmedEmail },
      });
    } catch (err: any) {
      console.error("❌ [Forgot Password] Unexpected error:", err);
      const fallbackErr =
        err?.message || "An unexpected error occurred. Please try again.";
      setErrorMessage(fallbackErr);
      Alert.alert("Error", fallbackErr);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.headerRow}>
          <Pressable onPress={handleBack} style={styles.cancelButton}>
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
            <Text style={styles.pageTitle}>Forgot Password</Text>
            <Text style={styles.pageSubtitle}>
              Enter your email to receive a recovery code
            </Text>
          </View>

          {errorMessage !== "" && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>⚠️ {errorMessage}</Text>
            </View>
          )}

          <View style={styles.formContainer}>
            <Text style={styles.inputLabel}>ENTER YOUR EMAIL ADDRESS</Text>
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons
                name="email-outline"
                size={20}
                color="#8a9bbd"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                placeholder="explorer@example.com"
                placeholderTextColor="#5a6b94"
                value={email}
                onChangeText={(val: string) => {
                  setEmail(val);
                  if (errorMessage) setErrorMessage("");
                }}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
              />
            </View>
          </View>

          <Pressable
            style={[styles.primaryButton, loading && { opacity: 0.7 }]}
            onPress={handleSendCode}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>Send Recovery Code</Text>
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
    maxWidth: 280,
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
  formContainer: { marginBottom: 24 },
  inputLabel: {
    color: "#7a8fb8",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#131e38",
    borderColor: "#374b7c",
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: { marginRight: 12 },
  textInput: {
    flex: 1,
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
    padding: 0,
  },
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
