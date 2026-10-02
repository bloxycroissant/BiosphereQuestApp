import { GradientSafeAreaView } from "@/components/gradient-safe-area";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    Alert,
    Image,
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
const PARENT_CONTROLS_KEY = "@biosphere_parent_controls_v1";

const logo = require("../../assets/BiosphereQuestAssets/Biosphere Quest Logo.png");
const googleLogo = require("../../assets/BiosphereQuestAssets/Google Logo.png");

const gradeLevels = [
  { level: 1, label: "Explorer" },
  { level: 2, label: "Adventurer" },
  { level: 3, label: "Navigator" },
  { level: 4, label: "Pioneer" },
  { level: 5, label: "Expert" },
  { level: 6, label: "Master" },
];

export default function SettingsScreen(): React.JSX.Element {
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [parentGateVisible, setParentGateVisible] = useState(false);
  const [gradeModalVisible, setGradeModalVisible] = useState(false);
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [savedKeyword, setSavedKeyword] = useState("");
  const [hasAccount, setHasAccount] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [isGoogleAuth, setIsGoogleAuth] = useState(false);
  const [currentGrade, setCurrentGrade] = useState(1);
  const { openParentControls } = useLocalSearchParams<{
    openParentControls?: string;
  }>();

  const handleBack = (): void => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/home" as any);
    }
  };

  const syncAuth = async (): Promise<void> => {
    try {
      // Load current grade
      const savedData = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed = savedData ? JSON.parse(savedData) : null;
      if (parsed?.gradeYear) {
        const match = parsed.gradeYear.match(/\d+/);
        if (match) setCurrentGrade(parseInt(match[0], 10));
      } else {
        const guestGrade = await AsyncStorage.getItem("explorerGrade");
        if (guestGrade) setCurrentGrade(parseInt(guestGrade, 10));
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setHasAccount(true);
        setUserEmail(user.email || "Active User");

        const isGoogle =
          user.app_metadata?.provider === "google" ||
          user.identities?.some((id: any) => id.provider === "google");
        setIsGoogleAuth(Boolean(isGoogle));
        return;
      }

      if (parsed?.email?.trim()) {
        setHasAccount(true);
        setUserEmail(parsed.email);
        setIsGoogleAuth(parsed.authProvider === "google");
        return;
      }

      setHasAccount(false);
      setUserEmail("");
      setIsGoogleAuth(false);
    } catch (e) {
      console.error("Auth sync error:", e);
      setHasAccount(false);
      setUserEmail("");
      setIsGoogleAuth(false);
    }
  };

  useEffect(() => {
    syncAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setHasAccount(true);
        setUserEmail(session.user.email || "Active User");
        const isGoogle =
          session.user.app_metadata?.provider === "google" ||
          session.user.identities?.some((id: any) => id.provider === "google");
        setIsGoogleAuth(Boolean(isGoogle));
      } else {
        setHasAccount(false);
        setUserEmail("");
        setIsGoogleAuth(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useFocusEffect(
    useCallback(() => {
      syncAuth();
    }, []),
  );

  const handleUpdateGrade = async (newGrade: number): Promise<void> => {
    try {
      setCurrentGrade(newGrade);
      await AsyncStorage.setItem("explorerGrade", newGrade.toString());

      const savedData = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed = savedData ? JSON.parse(savedData) : {};
      parsed.gradeYear = `Grade ${newGrade}`;
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));

      // Sync metadata to Supabase if authenticated
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase.auth.updateUser({
          data: { grade_level: newGrade.toString() },
        });
      }

      setGradeModalVisible(false);
      Alert.alert(
        "Grade Level Updated",
        `Your curriculum is now set to Grade ${newGrade}.`,
      );
    } catch (error) {
      console.error("Failed to update grade", error);
      Alert.alert("Error", "Could not update grade level.");
    }
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();

      const savedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        parsed.email = "";
        parsed.authProvider = "";
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      }

      setHasAccount(false);
      setUserEmail("");
      setIsGoogleAuth(false);
      Alert.alert("Logged Out", "You have been logged out of your account.");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleParentControlsPress = useCallback(async (): Promise<void> => {
    try {
      const controlsData = await AsyncStorage.getItem(PARENT_CONTROLS_KEY);
      const controls = controlsData ? JSON.parse(controlsData) : null;
      const keyword = controls?.parentKeyword?.trim();

      if (!keyword) {
        router.push("/parent-dashboard" as any);
      } else {
        setSavedKeyword(keyword);
        setParentGateVisible(true);
      }
    } catch (e) {
      router.push("/parent-dashboard" as any);
    }
  }, []);

  useEffect(() => {
    if (openParentControls !== "true") return;

    const frameId = requestAnimationFrame(() => {
      void handleParentControlsPress();
    });

    return () => cancelAnimationFrame(frameId);
  }, [openParentControls, handleParentControlsPress]);

  const handleParentGateSubmit = (): void => {
    if (securityAnswer.trim().toLowerCase() === savedKeyword.toLowerCase()) {
      setParentGateVisible(false);
      setSecurityAnswer("");
      router.push("/parent-dashboard" as any);
    } else {
      Alert.alert("Access Denied", "Incorrect keyword. Please try again.");
    }
  };

  const handleDevReset = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      await AsyncStorage.clear();
      router.replace("/" as any);
    } catch (error) {
      console.error("Dev reset error:", error);
    }
  };

  const handleDeleteAccount = (): void => {
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
              router.replace("/" as any);
            } catch (error) {
              console.error("Delete account error:", error);
            }
          },
        },
      ],
    );
  };

  const executeResetProgress = async (): Promise<void> => {
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
      handleBack();
    } catch (e) {
      console.error("Failed to reset progress", e);
    }
  };

  return (
    <GradientSafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Change Grade Modal */}
      <Modal
        visible={gradeModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setGradeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select Grade Level </Text>
            <Text style={styles.modalMessage}>
              Update your rank to receive grade-specific Math and Science
              missions:
            </Text>

            <View style={styles.gradeGrid}>
              {gradeLevels.map((g) => {
                const isSelected = currentGrade === g.level;
                return (
                  <Pressable
                    key={g.level}
                    style={[
                      styles.gradeBox,
                      isSelected && styles.gradeBoxActive,
                    ]}
                    onPress={() => handleUpdateGrade(g.level)}
                  >
                    <Text
                      style={[
                        styles.gradeNumber,
                        isSelected && styles.gradeTextActive,
                      ]}
                    >
                      {g.level}
                    </Text>
                    <Text
                      style={[
                        styles.gradeLabel,
                        isSelected && styles.gradeTextActive,
                      ]}
                    >
                      Grade {g.level}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              style={[
                styles.modalBtn,
                styles.modalCancelBtn,
                { width: "100%", marginTop: 10 },
              ]}
              onPress={() => setGradeModalVisible(false)}
            >
              <Text style={styles.modalCancelText}>Close </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Reset Progress Modal */}
      <Modal
        visible={resetModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setResetModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Reset Progress </Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to reset your stats, study time, and streak?
              Progress also automatically resets every 30 days.
            </Text>
            <View style={styles.modalButtonRow}>
              <Pressable
                style={[styles.modalBtn, styles.modalCancelBtn]}
                onPress={() => setResetModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel </Text>
              </Pressable>
              <Pressable
                style={[styles.modalBtn, styles.modalConfirmBtn]}
                onPress={executeResetProgress}
              >
                <Text style={styles.modalConfirmText}>Reset </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Parental Gate Modal */}
      <Modal
        visible={parentGateVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setParentGateVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Parental Gate </Text>
            <Text style={styles.modalMessage}>
              Enter the parental keyword to access dashboard settings and
              limits:
            </Text>

            <TextInput
              style={styles.securityInput}
              value={securityAnswer}
              onChangeText={setSecurityAnswer}
              placeholder="Enter security keyword"
              placeholderTextColor="#68779a"
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={true}
            />

            <View style={styles.modalButtonRow}>
              <Pressable
                style={[styles.modalBtn, styles.modalCancelBtn]}
                onPress={() => {
                  setParentGateVisible(false);
                  setSecurityAnswer("");
                }}
              >
                <Text style={styles.modalCancelText}>Cancel </Text>
              </Pressable>
              <Pressable
                style={[styles.modalBtn, styles.modalSubmitBtn]}
                onPress={handleParentGateSubmit}
              >
                <Text style={styles.modalSubmitText}>Unlock </Text>
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
          <Pressable onPress={handleBack}>
            <Text style={styles.backText}> Back </Text>
          </Pressable>
          <Text style={styles.headerTitle}>Settings </Text>
          <View style={{ width: 45 }} />
        </View>

        <Text style={styles.groupLabel}>ACCOUNT </Text>
        <View style={styles.cardGroup}>
          {!hasAccount ? (
            <Pressable
              style={styles.rowItem}
              onPress={() => router.push("/login" as any)}
            >
              <Text style={styles.rowItemText}>Login or Create Account</Text>
              <Text style={styles.rowArrow}> </Text>
            </Pressable>
          ) : (
            <View>
              <View style={styles.rowItem}>
                <Image
                  source={isGoogleAuth ? googleLogo : logo}
                  style={styles.providerLogo}
                  resizeMode="contain"
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.rowItemText}>{userEmail} </Text>
                  <Text style={[styles.rowItemSub, { color: "#4ade80" }]}>
                    {isGoogleAuth ? "Google Logged In" : "Logged In (Verified)"}
                  </Text>
                </View>
                <Text style={styles.rowArrow}>✓ </Text>
              </View>

              {!isGoogleAuth && (
                <Pressable
                  style={[
                    styles.rowItem,
                    { borderTopWidth: 1, borderTopColor: "# <0> <5c" },
                  ]}
                  onPress={() => router.push("/change-password" as any)}
                >
                  <Text style={styles.rowItemText}>Change Password </Text>
                  <Text style={styles.rowArrow}> </Text>
                </Pressable>
              )}

              <Pressable
                style={[
                  styles.rowItem,
                  { borderTopWidth: 1, borderTopColor: "# <0> <5c" },
                ]}
                onPress={handleLogout}
              >
                <Text style={[styles.rowItemText, { color: "#f87171" }]}>
                  Log Out{" "}
                </Text>
                <Text style={[styles.rowArrow, { color: "#f87171" }]}> </Text>
              </Pressable>
            </View>
          )}
        </View>

        <Text style={[styles.groupLabel, { marginTop: 20 }]}>
          ACADEMIC PREFERENCES
        </Text>
        <View style={styles.cardGroup}>
          <Pressable
            style={styles.rowItem}
            onPress={() => setGradeModalVisible(true)}
          >
            <View>
              <Text style={styles.rowItemText}>Change Grade Level </Text>
              <Text style={styles.rowItemSub}>
                Currently Grade {currentGrade}{" "}
              </Text>
            </View>
            <Text style={styles.rowArrow}> </Text>
          </Pressable>
        </View>

        {hasAccount && (
          <View>
            <Text style={[styles.groupLabel, { marginTop: 20 }]}>
              FAMILY MANAGEMENT
            </Text>
            <View style={styles.cardGroup}>
              <Pressable
                style={styles.rowItem}
                onPress={handleParentControlsPress}
              >
                <View>
                  <Text style={styles.rowItemText}>Parental Controls </Text>
                  <Text style={styles.rowItemSub}>
                    Manage limits and screentime
                  </Text>
                </View>
                <Text style={styles.rowArrow}>🔒 </Text>
              </Pressable>
            </View>
          </View>
        )}

        {hasAccount && (
          <View>
            <Text
              style={[styles.groupLabel, { color: "#ff3e58", marginTop: 20 }]}
            >
              DANGER ZONE
            </Text>
            <Pressable
              style={[
                styles.dangerZoneCard,
                {
                  borderBottomWidth: 0,
                  borderBottomLeftRadius: 0,
                  borderBottomRightRadius: 0,
                },
              ]}
              onPress={() => setResetModalVisible(true)}
            >
              <View>
                <Text style={styles.dangerZoneText}>Reset Progress Data </Text>
                <Text style={styles.dangerZoneSub}>
                  Wipe streak, XP, and levels
                </Text>
              </View>
              <Text style={styles.dangerZoneArrow}> </Text>
            </Pressable>

            <Pressable
              style={[
                styles.dangerZoneCard,
                { borderTopLeftRadius: 0, borderTopRightRadius: 0 },
              ]}
              onPress={handleDeleteAccount}
            >
              <View>
                <Text style={styles.dangerZoneText}>Delete Account </Text>
                <Text style={styles.dangerZoneSub}>
                  Permanently remove your profile
                </Text>
              </View>
              <Text style={styles.dangerZoneArrow}> </Text>
            </Pressable>
          </View>
        )}

        {/* DEVELOPER TOOLS */}
        <Text style={[styles.groupLabel, { color: "#ffaa00", marginTop: 20 }]}>
          DEVELOPER TOOLS
        </Text>
        <Pressable
          style={[
            styles.dangerZoneCard,
            {
              borderColor: "#a>6c00",
              backgroundColor: "# <b1e05",
              borderRadius: 16,
            },
          ]}
          onPress={handleDevReset}
        >
          <View>
            <Text style={[styles.dangerZoneText, { color: "#ffaa00" }]}>
              Dev Factory Reset{" "}
            </Text>
            <Text style={[styles.dangerZoneSub, { color: "#cc8800" }]}>
              For testing only (to be removed on final product)
            </Text>
          </View>
          <Text style={[styles.dangerZoneArrow, { color: "#ffaa00" }]}> </Text>
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
  providerLogo: {
    width: 28,
    height: 28,
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
  gradeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
    gap: 10,
    marginBottom: 12,
  },
  gradeBox: {
    backgroundColor: "#091426",
    borderColor: "#374b7c",
    borderWidth: 1.5,
    borderRadius: 12,
    width: "30%",
    alignItems: "center",
    paddingVertical: 12,
  },
  gradeBoxActive: {
    backgroundColor: "#625cff",
    borderColor: "#8d89ff",
  },
  gradeNumber: { color: "#fff", fontSize: 18, fontWeight: "900" },
  gradeLabel: {
    color: "#8a9bbd",
    fontSize: 10,
    fontWeight: "800",
    marginTop: 2,
  },
  gradeTextActive: { color: "#ffffff" },
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
