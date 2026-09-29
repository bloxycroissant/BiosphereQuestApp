import { GradientSafeAreaView as SafeAreaView } from "@/components/gradient-safe-area";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { supabase } from "../lib/supabase";

export default function ChangePasswordScreen() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  const handleUpdatePassword = async () => {
    setErrorMessage("");

    if (!newPassword.trim() || !confirmPassword.trim()) {
      console.warn(
        "⚠️ [ChangePassword] Validation error: Missing required fields",
      );
      setErrorMessage("Please fill in both password fields.");
      return;
    }

    if (newPassword.length < 6) {
      console.warn(
        "⚠️ [ChangePassword] Validation error: Password shorter than 6 characters",
      );
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      console.warn(
        "⚠️ [ChangePassword] Validation error: Passwords do not match",
      );
      setErrorMessage("The passwords entered do not match.");
      return;
    }

    try {
      setLoading(true);
      console.log(
        "🔄 [ChangePassword] Sending password update request to Supabase...",
      );

      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error(
          "❌ [ChangePassword] Password update failed:",
          error.message,
        );
        setErrorMessage(error.message);
      } else if (data?.user) {
        console.log(
          "✅ [ChangePassword] Password updated successfully for user:",
          data.user.email || data.user.id,
        );
        setNewPassword("");
        setConfirmPassword("");
        setSuccessModalVisible(true);
      }
    } catch (err: any) {
      console.error("❌ [ChangePassword] Unexpected error:", err);
      setErrorMessage(
        err?.message || "An unexpected error occurred. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Modal
        visible={successModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setSuccessModalVisible(false);
          router.back();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.successIconBadge}>
              <Text style={{ fontSize: 30 }}>✨</Text>
            </View>
            <Text style={styles.modalTitle}>Password Updated!</Text>
            <Text style={styles.modalMessage}>
              Your account password has been changed successfully. You can now
              use this password the next time you log in.
            </Text>
            <Pressable
              style={styles.modalButton}
              onPress={() => {
                setSuccessModalVisible(false);
                router.back();
              }}
            >
              <Text style={styles.modalButtonText}>Back to Settings</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={20} color="#f091f8" />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleContainer}>
          <Text style={styles.headerEmoji}>🔐</Text>
          <Text style={styles.title}>Change Password</Text>
          <Text style={styles.subtitle}>
            Set a new password for your authenticated account.
          </Text>
        </View>

        {errorMessage !== "" && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>⚠️ {errorMessage}</Text>
          </View>
        )}

        <View style={styles.cardGroup}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>NEW PASSWORD</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                value={newPassword}
                onChangeText={(val) => {
                  setNewPassword(val);
                  if (errorMessage) setErrorMessage("");
                }}
                placeholder="Enter at least 6 characters"
                placeholderTextColor="#5a6b94"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <Pressable onPress={() => setShowPassword(!showPassword)}>
                <MaterialCommunityIcons
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color="#8a9bbd"
                />
              </Pressable>
            </View>
          </View>

          <View
            style={[
              styles.inputContainer,
              { borderTopWidth: 1, borderTopColor: "#20325c" },
            ]}
          >
            <Text style={styles.inputLabel}>CONFIRM NEW PASSWORD</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                value={confirmPassword}
                onChangeText={(val) => {
                  setConfirmPassword(val);
                  if (errorMessage) setErrorMessage("");
                }}
                placeholder="Re-enter your new password"
                placeholderTextColor="#5a6b94"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
            </View>
          </View>
        </View>

        <Pressable
          style={[styles.primaryButton, loading && { opacity: 0.6 }]}
          onPress={handleUpdatePassword}
          disabled={loading}
        >
          <Text style={styles.primaryButtonText}>
            {loading ? "Updating Password..." : "Update Password"}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#091426" },
  headerRow: { paddingHorizontal: 20, paddingTop: 10 },
  backButton: { flexDirection: "row", alignItems: "center" },
  backText: {
    color: "#f091f8",
    fontSize: 15,
    fontWeight: "900",
    marginLeft: 6,
  },
  content: { padding: 20, paddingBottom: 40 },
  titleContainer: { alignItems: "center", marginBottom: 20, marginTop: 10 },
  headerEmoji: { fontSize: 44, marginBottom: 12 },
  title: { color: "#ffffff", fontSize: 24, fontWeight: "900", marginBottom: 8 },
  subtitle: {
    color: "#8a9bbd",
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    maxWidth: 300,
  },
  errorBanner: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    borderColor: "#ef4444",
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  errorBannerText: {
    color: "#fca5a5",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  cardGroup: {
    backgroundColor: "#131e38",
    borderColor: "#374b7c",
    borderWidth: 1.5,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
  },
  inputContainer: { paddingHorizontal: 16, paddingVertical: 14 },
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
    justifyContent: "space-between",
  },
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
    height: 52,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryButtonText: { color: "#ffffff", fontSize: 15, fontWeight: "800" },
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
    padding: 22,
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
    marginBottom: 12,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 18,
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
    borderRadius: 10,
    paddingVertical: 12,
    width: "100%",
    alignItems: "center",
  },
  modalButtonText: {
    color: "#ffffff",
    fontWeight: "900",
    fontSize: 14,
  },
});
