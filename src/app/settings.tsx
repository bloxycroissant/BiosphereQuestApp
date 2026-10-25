import { GradientSafeAreaView } from "@/components/gradient-safe-area";
import { useProgress } from "@/hooks/use-progress";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  BackHandler,
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
  const progress = useProgress() as any;
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [parentGateVisible, setParentGateVisible] = useState(false);
  const [gradeModalVisible, setGradeModalVisible] = useState(false);
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [savedKeyword, setSavedKeyword] = useState("");
  const [hasAccount, setHasAccount] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [isGoogleAuth, setIsGoogleAuth] = useState(false);
  const [currentGrade, setCurrentGrade] = useState(1);
  const [pendingGrade, setPendingGrade] = useState(1);
  const { openParentControls } = useLocalSearchParams<{
    openParentControls?: string;
  }>();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleBack = useCallback((): void => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/home" as any);
    }
  }, []);

  const syncAuth = async (): Promise<void> => {
    try {
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
        data: { session },
      } = await supabase.auth.getSession();

      const activeUser = session?.user ?? null;

      if (activeUser) {
        setHasAccount(true);
        setUserEmail(activeUser.email || "Active User");

        const isGoogle =
          activeUser.app_metadata?.provider === "google" ||
          activeUser.identities?.some((id: any) => id.provider === "google");
        setIsGoogleAuth(Boolean(isGoogle));
        return;
      }

      // No active Supabase session: clear stale email/authProvider from local storage if present
      if (parsed && (parsed.email || parsed.authProvider)) {
        delete parsed.email;
        delete parsed.authProvider;
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
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
    // Auth and saved settings are synchronized from external providers.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void syncAuth();

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
      void syncAuth();

      const onBackPress = (): boolean => {
        if (gradeModalVisible) {
          setGradeModalVisible(false);
          return true;
        }
        if (resetModalVisible) {
          setResetModalVisible(false);
          return true;
        }
        if (parentGateVisible) {
          setParentGateVisible(false);
          setSecurityAnswer("");
          return true;
        }
        if (deleteModalVisible) {
          if (!isDeleting) {
            setDeleteModalVisible(false);
            setDeletePassword("");
          }
          return true;
        }

        handleBack();
        return true; // Prevents Android from exiting the app on single swipe/press
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );

      return () => subscription.remove();
    }, [
      gradeModalVisible,
      resetModalVisible,
      parentGateVisible,
      deleteModalVisible,
      isDeleting,
      handleBack,
    ]),
  );

  const handleUpdateGrade = async (newGrade: number): Promise<void> => {
    try {
      setCurrentGrade(newGrade);
      await AsyncStorage.setItem("explorerGrade", newGrade.toString());

      const savedData = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed = savedData ? JSON.parse(savedData) : {};
      parsed.gradeYear = `Grade ${newGrade}`;
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));

      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;

      if (user) {
        await supabase.auth.updateUser({
          data: { grade_level: newGrade.toString() },
        });
        await supabase
          .from("profiles")
          .update({
            grade_year: `Grade ${newGrade}`,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);
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
      const userKeys = [
        STORAGE_KEY,
        "@biosphere_completed_lessons_v1",
        "@biosphere_study_sessions_v1",
        "@biosphere_recent_lessons",
        "@biosphere_recent_games_v1",
        "explorerName",
        "explorerUsername",
      ];
      await AsyncStorage.multiRemove(userKeys);

      setHasAccount(false);
      setUserEmail("");
      setIsGoogleAuth(false);
      Alert.alert("Logged Out", "You have been logged out of your account.");
      router.replace("/home" as any);
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

  const handleDeleteAccount = (): void => {
    setDeletePassword("");
    setDeleteModalVisible(true);
  };

  const confirmDeleteAccount = async (): Promise<void> => {
    if (!deletePassword.trim()) {
      Alert.alert(
        "Required",
        isGoogleAuth
          ? "Please type DELETE to confirm."
          : "Please enter your password to confirm.",
      );
      return;
    }

    setIsDeleting(true);

    try {
      if (!isGoogleAuth) {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: userEmail,
          password: deletePassword,
        });

        if (authError) {
          setIsDeleting(false);
          Alert.alert(
            "Authentication Failed",
            "Incorrect password. Please try again.",
          );
          return;
        }
      } else {
        if (deletePassword.trim().toUpperCase() !== "DELETE") {
          setIsDeleting(false);
          Alert.alert(
            "Confirmation Mismatch",
            'Please type "DELETE" to confirm.',
          );
          return;
        }
      }

      const { error: rpcError } = await supabase.rpc("delete_user", {
        p_email: userEmail,
      });

      if (rpcError) {
        setIsDeleting(false);
        Alert.alert("Error Deleting Account", rpcError.message);
        return;
      }

      try {
        await supabase.auth.signOut();
      } catch (_signOutErr) {}

      await AsyncStorage.clear();

      if (typeof progress?.resetProgress === "function") {
        await progress.resetProgress();
      }

      setIsDeleting(false);
      setDeleteModalVisible(false);
      setDeletePassword("");
      setHasAccount(false);
      setUserEmail("");
      setIsGoogleAuth(false);

      router.replace("/" as any);
    } catch (err: any) {
      setIsDeleting(false);
      Alert.alert("Error", err?.message || "An unexpected error occurred.");
    }
  };

  const executeResetProgress = async (): Promise<void> => {
    try {
      const savedData = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed = savedData ? JSON.parse(savedData) : {};
      const guestUsername = await AsyncStorage.getItem("explorerUsername");
      const guestName = await AsyncStorage.getItem("explorerName");

      const targetName =
        parsed.username || parsed.name || guestUsername || guestName || "";

      try {
        await supabase.rpc("reset_user_progress", {
          p_name: targetName,
        });
      } catch (cloudErr) {
        console.error("Cloud reset error:", cloudErr);
      }

      const allKeys = await AsyncStorage.getAllKeys();
      const keysToRemove = allKeys.filter(
        (key) =>
          key !== STORAGE_KEY &&
          key !== PARENT_CONTROLS_KEY &&
          key !== "explorerName" &&
          key !== "explorerUsername" &&
          key !== "explorerGrade" &&
          key !== "explorerSubjects" &&
          !key.startsWith("sb-"),
      );
      if (keysToRemove.length > 0) {
        await AsyncStorage.multiRemove(keysToRemove);
      }

      const resetData = {
        ...parsed,
        streak: 0,
        lessons: 0,
        xp: 0,
        level: 0,
        nextLevelXp: 100,
        studyMinutes: 0,
        badgeUnlockDates: {},
        lastResetDate: Date.now(),
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(resetData));

      if (typeof progress?.resetProgress === "function") {
        await progress.resetProgress();
      } else if (
        typeof progress?.leaderboardXp === "number" &&
        progress.leaderboardXp > 0 &&
        typeof progress?.addXp === "function"
      ) {
        progress.addXp(-progress.leaderboardXp);
      }

      setResetModalVisible(false);
      Alert.alert(
        "Progress Reset",
        "Your XP, levels, badges, and completed lessons have been reset to 0.",
      );
      router.replace("/home" as any);
    } catch (e) {
      console.error("Failed to reset progress", e);
      Alert.alert("Error", "Could not reset progress. Please try again.");
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
                const isSelected = pendingGrade === g.level;
                return (
                  <Pressable
                    key={g.level}
                    style={[
                      styles.gradeBox,
                      isSelected && styles.gradeBoxActive,
                    ]}
                    onPress={() => setPendingGrade(g.level)}
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

            <View style={[styles.modalButtonRow, { marginTop: 8 }]}>
              <Pressable
                style={[styles.modalBtn, styles.modalCancelBtn]}
                onPress={() => setGradeModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalBtn, styles.modalSubmitBtn]}
                onPress={() => void handleUpdateGrade(pendingGrade)}
              >
                <Text style={styles.modalSubmitText}>Confirm Grade</Text>
              </Pressable>
            </View>
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
              Are you sure you want to reset your XP, levels, badges, completed
              lessons, study time, and streak back to 0?
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

      {/* Delete Account Password Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          if (!isDeleting) {
            setDeleteModalVisible(false);
            setDeletePassword("");
          }
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={[styles.modalTitle, { color: "#ff4d67" }]}>
              Delete Account
            </Text>
            <Text style={styles.modalMessage}>
              {isGoogleAuth
                ? 'This action is permanent and cannot be undone. Type "DELETE" below to confirm.'
                : "This action is permanent and cannot be undone. Enter your account password to confirm deletion:"}
            </Text>

            <TextInput
              style={[styles.securityInput, { borderColor: "#a32b3d" }]}
              value={deletePassword}
              onChangeText={setDeletePassword}
              placeholder={
                isGoogleAuth ? 'Type "DELETE"' : "Enter your password"
              }
              placeholderTextColor="#68779a"
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={!isGoogleAuth}
              editable={!isDeleting}
            />

            <View style={styles.modalButtonRow}>
              <Pressable
                style={[styles.modalBtn, styles.modalCancelBtn]}
                disabled={isDeleting}
                onPress={() => {
                  setDeleteModalVisible(false);
                  setDeletePassword("");
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[
                  styles.modalBtn,
                  styles.modalConfirmBtn,
                  isDeleting && { opacity: 0.6 },
                ]}
                disabled={isDeleting}
                onPress={confirmDeleteAccount}
              >
                <Text style={styles.modalConfirmText}>
                  {isDeleting ? "Deleting..." : "Confirm Delete"}
                </Text>
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
          <Pressable onPress={handleBack} hitSlop={12}>
            <Text style={styles.backText}>← Back</Text>
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
                    { borderTopWidth: 1, borderTopColor: "#202c5c" },
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
                  { borderTopWidth: 1, borderTopColor: "#202c5c" },
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
            onPress={() => {
              setPendingGrade(currentGrade);
              setGradeModalVisible(true);
            }}
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

        {/* ABOUT US SECTION */}
        <Text style={[styles.groupLabel, { marginTop: 20 }]}>ABOUT</Text>
        <View style={styles.cardGroup}>
          <Pressable
            style={styles.rowItem}
            onPress={() => router.push("/about-us" as any)}
          >
            <View>
              <Text style={styles.rowItemText}>About Us</Text>
              <Text style={styles.rowItemSub}>
                Learn more about Biosphere Quest
              </Text>
            </View>
          </Pressable>
        </View>
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