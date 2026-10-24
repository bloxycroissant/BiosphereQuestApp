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
  Modal,
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
  children: React.ReactNode;
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

export default function NewPasswordScreen(): React.JSX.Element {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  const handleResetPassword = async (): Promise<void> => {
    setErrorMessage("");

    if (!password.trim() || !confirmPassword.trim()) {
      const msg = "Please fill out all fields before resetting your password.";
      setErrorMessage(msg);
      Alert.alert("Incomplete Form", msg);
      return;
    }

    if (password.length < 8) {
      const msg = "Password must be at least 8 characters long.";
      setErrorMessage(msg);
      Alert.alert("Invalid Password", msg);
      return;
    }

    const hasNumberOrSpecial = /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(
      password,
    );
    if (!hasNumberOrSpecial) {
      const msg =
        "Password must contain at least 1 number or special character.";
      setErrorMessage(msg);
      Alert.alert("Weak Password", msg);
      return;
    }

    if (password !== confirmPassword) {
      const msg =
        "The passwords entered do not match. Please verify both fields.";
      setErrorMessage(msg);
      Alert.alert("Passwords Don't Match", msg);
      return;
    }

    try {
      setLoading(true);
      console.log("🔄 [NewPassword] Updating user password in Supabase...");

      const { data, error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        console.error("❌ [NewPassword] Password update error:", error.message);
        setErrorMessage(error.message);
        Alert.alert("Password Update Failed", error.message);
        return;
      }

      if (data?.user) {
        console.log(
          "✅ [NewPassword] Password reset succeeded for:",
          data.user.email,
        );
        setSuccessModalVisible(true);
      }
    } catch (err: any) {
      console.error("❌ [NewPassword] Unexpected reset error:", err);
      const fallbackErr =
        err?.message || "An unexpected error occurred. Please try again.";
      setErrorMessage(fallbackErr);
      Alert.alert("Error", fallbackErr);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessDismiss = async (): Promise<void> => {
    setSuccessModalVisible(false);
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error("Error signing out recovery session:", e);
    }
    router.replace("/login" as any);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Modal
        visible={successModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleSuccessDismiss}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.successIconBadge}>
              <Text style={{ fontSize: 32 }}>✨</Text>
            </View>
            <Text style={styles.modalTitle}>Password Changed!</Text>
            <Text style={styles.modalMessage}>
              Your password has been successfully updated. You can now use your
              new password to log in.
            </Text>
            <Pressable
              style={styles.modalButton}
              onPress={handleSuccessDismiss}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

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
            <Text style={styles.pageTitle}>Set New Password</Text>
            <Text style={styles.pageSubtitle}>
              Please create a new password for your account
            </Text>
          </View>

          {errorMessage !== "" && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>⚠️ {errorMessage}</Text>
            </View>
          )}

          <View style={styles.formContainer}>
            <Text style={styles.inputLabel}>ENTER NEW PASSWORD</Text>
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons
                name="lock-outline"
                size={20}
                color="#8a9bbd"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                placeholder="••••••••••"
                placeholderTextColor="#5a6b94"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(val: string) => {
                  setPassword(val);
                  if (errorMessage) setErrorMessage("");
                }}
                autoCapitalize="none"
              />
              <Pressable onPress={() => setShowPassword(!showPassword)}>
                <MaterialCommunityIcons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="#8a9bbd"
                />
              </Pressable>
            </View>

            <Text style={[styles.inputLabel, { marginTop: 16 }]}>
              CONFIRM NEW PASSWORD
            </Text>
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons
                name="lock-outline"
                size={20}
                color="#8a9bbd"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                placeholder="••••••••••"
                placeholderTextColor="#5a6b94"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={(val: string) => {
                  setConfirmPassword(val);
                  if (errorMessage) setErrorMessage("");
                }}
                autoCapitalize="none"
              />
              <Pressable
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <MaterialCommunityIcons
                  name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="#8a9bbd"
                />
              </Pressable>
            </View>

            <View style={styles.requirementsBox}>
              <Text style={styles.reqTitle}>Password must contain:</Text>
              <Text style={styles.reqItem}>• At least 8 characters</Text>
              <Text style={styles.reqItem}>
                • At least 1 number or special character
              </Text>
            </View>
          </View>

          <Pressable
            style={[styles.primaryButton, loading && { opacity: 0.7 }]}
            onPress={handleResetPassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>Reset Password</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#091426",
  },
  headerRow: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
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
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
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
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 6,
  },
  pageSubtitle: {
    color: "#8a9bbd",
    fontSize: 14,
    textAlign: "center",
  },
  errorBanner: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    borderColor: "#ef4444",
    borderWidth: 1.2,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorBannerText: {
    color: "#fca5a5",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  formContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    color: "#7a8fb8",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.6,
    marginBottom: 6,
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
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    padding: 0,
  },
  requirementsBox: {
    marginTop: 14,
    backgroundColor: "#131e38",
    borderColor: "#374b7c",
    borderWidth: 1.5,
    padding: 14,
    borderRadius: 12,
  },
  reqTitle: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 6,
  },
  reqItem: {
    color: "#8a9bbd",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
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
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "900",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(9, 20, 38, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: "#131e38",
    borderColor: "#625cff",
    borderWidth: 1.5,
    borderRadius: 18,
    padding: 24,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
  },
  successIconBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(98, 92, 255, 0.2)",
    borderColor: "#625cff",
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 8,
    textAlign: "center",
  },
  modalMessage: {
    color: "#c7d0e8",
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: "#625cff",
    borderRadius: 12,
    paddingVertical: 13,
    width: "100%",
    alignItems: "center",
  },
  modalButtonText: {
    color: "#ffffff",
    fontWeight: "900",
    fontSize: 15,
  },
});
