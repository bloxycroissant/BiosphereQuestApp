import { GradientSafeAreaView } from "@/components/gradient-safe-area";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { supabase } from "../lib/supabase";

const STORAGE_KEY = "@biosphere_profile_data_v1";

const parseStoredProfile = (value: string | null) => {
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export default function SettingsScreen() {
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [parentGateVisible, setParentGateVisible] = useState(false);
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [hasAccount, setHasAccount] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const syncAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setHasAccount(true);
        setUserEmail(user.email || "Active User");
        return;
      }

      const savedData = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed = savedData ? JSON.parse(savedData) : null;
      if (parsed?.email?.trim()) {
        setHasAccount(true);
        setUserEmail(parsed.email);
        return;
      }

      setHasAccount(false);
      setUserEmail("");
    } catch (e) {
      console.error("Auth sync error:", e);
    }
  };

  useEffect(() => {
    syncAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setHasAccount(true);
        setUserEmail(session.user.email || "Active User");
      } else {
        setHasAccount(false);
        setUserEmail("");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useFocusEffect(
    useCallback(() => {
      syncAuth();
    }, [])
  );

  const handleDevReset = async () => {
    try {
      await supabase.auth.signOut();
      await AsyncStorage.clear();
      router.replace("/");
    } catch (error) {
      console.error("Dev reset error:", error);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to permanently delete your account and wipe all data? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await supabase.auth.signOut();
              await AsyncStorage.clear();
              router.replace("/");
            } catch (error) {
              console.error("Delete account error:", error);
            }
          },
        },
      ]
    );
  };

  const executeResetProgress = async () => {
    try {
      const savedData = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed = savedData ? JSON.parse(savedData) : {};

      const resetData = {
        ...parsed,
        streak: 0,
        lessons: 0,
        xp: 0,
        level: 0,
        nextLevelXp: 100,
        studyMinutes: 0,
        lastResetDate: Date.now(),
      };

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(resetData));
      setResetModalVisible(false);
      router.back();
    } catch (e) {
      console.error("Failed to reset progress", e);
    }
  };

  const handleParentGateSubmit = () => {
    if (securityAnswer.trim().toLowerCase() === "fluffy") {
      setParentGateVisible(false);
      setSecurityAnswer("");
      router.push("/parent-dashboard" as any);
    } else {
      Alert.alert("Access Denied", "Incorrect answer. Please try again.");
    }
  };

  return (
    <GradientSafeAreaView style={styles.safeArea} edges={['top']}>
      <Modal
        visible={resetModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setResetModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Reset Progress</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to reset your stats, study time, and streak?
              Progress also automatically resets every 30 days.
            </Text>
            <View style={styles.modalButtonRow}>
              <Pressable
                style={[styles.modalBtn, styles.modalCancelBtn]}
                onPress={() => setResetModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalBtn, styles.modalConfirmBtn]}
                onPress={executeResetProgress}
              >
                <Text style={styles.modalConfirmText}>Reset</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={parentGateVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setParentGateVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Parental Gate</Text>
            <Text style={styles.modalMessage}>
              For parents only! To access settings and limits, answer your
              security question:
            </Text>

            <Text style={styles.securityQuestion}>
              What is the name of your first pet?
            </Text>

            <TextInput
              style={styles.securityInput}
              value={securityAnswer}
              onChangeText={setSecurityAnswer}
              placeholder="Enter your answer"
              placeholderTextColor="#68779a"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.modalButtonRow}>
              <Pressable
                style={[styles.modalBtn, styles.modalCancelBtn]}
                onPress={() => {
                  setParentGateVisible(false);
                  setSecurityAnswer("");
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalBtn, styles.modalSubmitBtn]}
                onPress={handleParentGateSubmit}
              >
                <Text style={styles.modalSubmitText}>Unlock</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ width: 45 }} />
        </View>

        <Text style={styles.groupLabel}>ACCOUNT</Text>
        <View style={styles.cardGroup}>
          {!hasAccount ? (
            <Pressable
              style={styles.rowItem}
              onPress={() => router.push("/login" as any)}
            >
              <Text style={styles.rowItemText}>Login or Create Account</Text>
              <Text style={styles.rowArrow}>→</Text>
            </Pressable>
          ) : (
            <View style={styles.rowItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowItemText}>{userEmail}</Text>
                <Text style={[styles.rowItemSub, { color: "#4ade80" }]}>
                  Logged In (Verified)
                </Text>
              </View>
              <Text style={styles.rowArrow}>✓</Text>
            </View>
          )}
        </View>

        {hasAccount && (
          <View>
            <Text style={[styles.groupLabel, { marginTop: 20 }]}>
              FAMILY MANAGEMENT
            </Text>
            <View style={styles.cardGroup}>
              <Pressable
                style={styles.rowItem}
                onPress={() => setParentGateVisible(true)}
              >
                <View>
                  <Text style={styles.rowItemText}>Parental Controls</Text>
                  <Text style={styles.rowItemSub}>
                    Manage limits and screentime
                  </Text>
                </View>
                <Text style={styles.rowArrow}>🔒</Text>
              </Pressable>
            </View>
          </View>
        )}

        <Text style={[styles.groupLabel, { color: "#ff3e58", marginTop: 20 }]}>
          DANGER ZONE
        </Text>
        <Pressable
          style={[
            styles.dangerZoneCard,
            { borderBottomWidth: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
          ]}
          onPress={() => setResetModalVisible(true)}
        >
          <View>
            <Text style={styles.dangerZoneText}>Reset Progress Data</Text>
            <Text style={styles.dangerZoneSub}>
              Wipe streak, XP, and levels
            </Text>
          </View>
          <Text style={styles.dangerZoneArrow}>→</Text>
        </Pressable>

        <Pressable
          style={[styles.dangerZoneCard, { borderTopLeftRadius: 0, borderTopRightRadius: 0 }]}
          onPress={handleDeleteAccount}
        >
          <View>
            <Text style={styles.dangerZoneText}>Delete Account</Text>
            <Text style={styles.dangerZoneSub}>
              Permanently remove your profile
            </Text>
          </View>
          <Text style={styles.dangerZoneArrow}>→</Text>
        </Pressable>

        <Text style={[styles.groupLabel, { color: "#ffaa00", marginTop: 20 }]}>
          DEVELOPER TOOLS
        </Text>
        <Pressable
          style={[
            styles.dangerZoneCard,
            { borderColor: "#a36c00", backgroundColor: "#2b1e05", borderRadius: 16 },
          ]}
          onPress={handleDevReset}
        >
          <View>
            <Text style={[styles.dangerZoneText, { color: "#ffaa00" }]}>Dev Factory Reset</Text>
            <Text style={[styles.dangerZoneSub, { color: "#cc8800" }]}>
              Wipe Supabase auth & all local data
            </Text>
          </View>
          <Text style={[styles.dangerZoneArrow, { color: "#ffaa00" }]}>→</Text>
        </Pressable>
      </ScrollView>
    </GradientSafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#091426" },
  content: { padding: 20 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
    marginTop: 10,
  },
  backText: { color: "#f091f8", fontSize: 15, fontWeight: "900" },
  headerTitle: { color: "#ffffff", fontSize: 20, fontWeight: "900" },
  groupLabel: {
    color: "#8a9bbd",
    fontSize: 11,
    fontWeight: "900",
    marginBottom: 8,
    letterSpacing: 0.8,
  },
  cardGroup: {
    backgroundColor: "#131e38",
    borderColor: "#374b7c",
    borderWidth: 1.5,
    borderRadius: 16,
    overflow: "hidden",
  },
  rowItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  rowItemText: { color: "#ffffff", fontSize: 14, fontWeight: "800" },
  rowItemSub: {
    color: "#7a8fb8",
    fontSize: 11,
    marginTop: 4,
    fontWeight: "600",
  },
  rowArrow: { color: "#7a8fb8", fontSize: 16, fontWeight: "900" },
  dangerZoneCard: {
    backgroundColor: "#381622",
    borderColor: "#a32b3d",
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dangerZoneText: { color: "#ff3e58", fontSize: 14, fontWeight: "900" },
  dangerZoneSub: {
    color: "#c94a5c",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
  },
  dangerZoneArrow: { color: "#ff3e58", fontSize: 16, fontWeight: "900" },
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
  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 10,
    textAlign: "center",
  },
  modalMessage: {
    color: "#c7d0e8",
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  securityQuestion: {
    color: "#9af2bc",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 12,
    textAlign: "center",
  },
  securityInput: {
    backgroundColor: "#091426",
    borderColor: "#374b7c",
    borderWidth: 1,
    borderRadius: 10,
    color: "#fff",
    width: "100%",
    padding: 12,
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "700",
  },
  modalButtonRow: { flexDirection: "row", width: "100%" },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 6,
  },
  modalCancelBtn: {
    backgroundColor: "#202c52",
    borderWidth: 1,
    borderColor: "#4d6199",
  },
  modalCancelText: { color: "#fff", fontWeight: "800", fontSize: 13 },
  modalConfirmBtn: { backgroundColor: "#ff3e58" },
  modalConfirmText: { color: "#fff", fontWeight: "900", fontSize: 13 },
  modalSubmitBtn: { backgroundColor: "#625cff" },
  modalSubmitText: { color: "#fff", fontWeight: "900", fontSize: 13 },
});