import { GradientSafeAreaView as SafeAreaView } from "@/components/gradient-safe-area";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

interface GradeLevel {
  level: number;
  label: string;
}

interface SubjectMeta {
  name: string;
  icon: string;
  subtitle: string;
  activeBg: string;
  activeBorder: string;
  badgeBg: string;
  accentText: string;
}

const SUBJECT_META: SubjectMeta[] = [
  {
    name: "Math",
    icon: "🧮",
    subtitle: "Numbers, Logic & Problem Solving",
    activeBg: "#1e40af",
    activeBorder: "#60a5fa",
    badgeBg: "#3b82f6",
    accentText: "#dbeafe",
  },
  {
    name: "Matter",
    icon: "🧪",
    subtitle: "Atoms, Elements & Reactions",
    activeBg: "#5b21b6",
    activeBorder: "#c084fc",
    badgeBg: "#8b5cf6",
    accentText: "#f3e8ff",
  },
  {
    name: "Living Things & Environment",
    icon: "🌿",
    subtitle: "Biology, Ecosystems & Nature",
    activeBg: "#065f46",
    activeBorder: "#34d399",
    badgeBg: "#10b981",
    accentText: "#d1fae5",
  },
  {
    name: "Force, Motion, & Energy",
    icon: "⚡",
    subtitle: "Physics, Mechanics & Power",
    activeBg: "#9a3412",
    activeBorder: "#fb923c",
    badgeBg: "#f97316",
    accentText: "#ffedd5",
  },
  {
    name: "Earth & Space",
    icon: "🪐",
    subtitle: "Planets, Geology & The Cosmos",
    activeBg: "#155e75",
    activeBorder: "#22d3ee",
    badgeBg: "#06b6d4",
    accentText: "#cffafe",
  },
];

const gradeLevels: GradeLevel[] = [
  { level: 1, label: "Explorer" },
  { level: 2, label: "Adventurer" },
  { level: 3, label: "Navigator" },
  { level: 4, label: "Pioneer" },
  { level: 5, label: "Expert" },
  { level: 6, label: "Master" },
];

const astro = require("../../assets/BiosphereQuestAssets/Astro (Biosphere Quest Mascot).png");
const STORAGE_KEY = "@biosphere_profile_data_v1";

export default function WelcomeWizardScreen(): React.JSX.Element {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [fadeAnim] = useState(() => new Animated.Value(1));
  const [slideAnim] = useState(() => new Animated.Value(0));
  const [floatAnim] = useState(() => new Animated.Value(0));
  const [scaleButtonAnim] = useState(() => new Animated.Value(1));
  const [boxScales] = useState<Record<string, Animated.Value>>(() => {
    const scales: Record<string, Animated.Value> = {};
    [...gradeLevels.map((grade) => String(grade.level)), ...SUBJECT_META.map((item) => item.name)].forEach(
      (key) => {
        scales[key] = new Animated.Value(1);
      },
    );
    return scales;
  });

  const getBoxScale = (key: string | number) => boxScales[String(key)];

  const animateItemPress = (key: string | number, callback: () => void) => {
    const animValue = getBoxScale(key);
    Animated.sequence([
      Animated.timing(animValue, {
        toValue: 0.95,
        duration: 70,
        useNativeDriver: true,
      }),
      Animated.timing(animValue, {
        toValue: 1,
        duration: 70,
        useNativeDriver: true,
      }),
    ]).start(() => callback());
  };

  // Intercept both UI Back button and Android hardware back press
  const handleBackNavigation = useCallback(() => {
    setErrorMessage(null);
    if (step > 1) {
      setStep((prev) => prev - 1);
    } else {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/" as any);
      }
    }
    return true;
  }, [step]);

  useEffect(() => {
    const backSubscription = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackNavigation,
    );
    return () => backSubscription.remove();
  }, [handleBackNavigation]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [floatAnim]);

  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(20);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [step, fadeAnim, slideAnim]);

  const animateButtonPress = (callback: () => void) => {
    Animated.sequence([
      Animated.timing(scaleButtonAnim, {
        toValue: 0.96,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(scaleButtonAnim, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start(() => callback());
  };

  const toggleSubject = (subject: string): void => {
    setErrorMessage(null);
    animateItemPress(subject, () => {
      setSelectedSubjects((current) =>
        current.includes(subject)
          ? current.filter((item) => item !== subject)
          : [...current, subject],
      );
    });
  };

  const handleSelectGrade = (level: number) => {
    setErrorMessage(null);
    animateItemPress(level, () => {
      setSelectedGrade(level);
    });
  };

  const handleNextStep = (): void => {
    if (step === 1 && !fullName.trim()) {
      setErrorMessage("⚠️ Please input or enter your full name to continue.");
      return;
    }
    if (step === 2 && !username.trim()) {
      setErrorMessage(
        "⚠️ Please input or enter your Explorer Username to continue.",
      );
      return;
    }
    if (step === 3 && selectedGrade === null) {
      setErrorMessage(
        "⚠️ Please choose your grade level first before moving to Step 4.",
      );
      return;
    }

    setErrorMessage(null);
    animateButtonPress(() => setStep(step + 1));
  };

  const handleLaunch = async (): Promise<void> => {
    if (selectedGrade === null) {
      setErrorMessage("⚠️ Please go back and select your grade level.");
      return;
    }
    if (selectedSubjects.length < 2) {
      setErrorMessage(
        "⚠️ Please select at least 2 mission subjects to begin your adventure.",
      );
      return;
    }
    if (!fullName.trim() || !username.trim()) {
      setErrorMessage("⚠️ Please complete your name and username first.");
      return;
    }

    setErrorMessage(null);

    animateButtonPress(async () => {
      try {
        await AsyncStorage.removeItem(STORAGE_KEY);

        await AsyncStorage.setItem("explorerName", fullName.trim());
        await AsyncStorage.setItem("explorerUsername", username.trim());
        await AsyncStorage.setItem("explorerGrade", selectedGrade.toString());
        await AsyncStorage.setItem(
          "explorerSubjects",
          JSON.stringify(selectedSubjects),
        );

        const initialProfile = {
          name: fullName.trim(),
          username: username.trim(),
          gradeYear: `Grade ${selectedGrade}`,
          xp: 0,
          level: 0,
          nextLevelXp: 100,
          streak: 0,
          lessons: 0,
          lastResetDate: Date.now(),
          lastActiveDate: new Date().toDateString(),
        };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(initialProfile));

        router.replace("/home" as any);
      } catch (e) {
        console.error("Failed to save local data", e);
        setErrorMessage("⚠️ Failed to save your profile. Please try again.");
      }
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <Pressable
            onPress={() => {
              if (step > 1) {
                setStep(step - 1);
              } else {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace("/login" as any);
                }
              }
            }}
          >
            <Text style={styles.back}>Back</Text>
          </Pressable>
          <Text style={styles.stepIndicator}>Step {step} of 4</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={{
              transform: [{ translateY: floatAnim }],
              alignSelf: "center",
              marginBottom: 16,
              width: "40%",
              maxHeight: 130,
            }}
          >
            <Image source={astro} style={styles.mascot} contentFit="contain" />
          </Animated.View>

          <Animated.View
            style={[
              styles.stepContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* STEP 1: FULL NAME */}
            {step === 1 && (
              <View style={styles.innerContainer}>
                <Text style={styles.title}>What is your name?</Text>
                <Text style={styles.subtitle}>
                  Enter your full name for your official profile.
                </Text>

                {errorMessage && (
                  <View style={styles.warningBanner}>
                    <Text style={styles.warningText}>{errorMessage}</Text>
                  </View>
                )}

                <TextInput
                  style={[
                    styles.input,
                    errorMessage ? styles.inputError : null,
                  ]}
                  value={fullName}
                  onChangeText={(text) => {
                    setFullName(text);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="e.g. Alex Johnson"
                  placeholderTextColor="#aebee0"
                  autoFocus
                />

                <Animated.View
                  style={{
                    transform: [{ scale: scaleButtonAnim }],
                    width: "100%",
                  }}
                >
                  <Pressable onPress={handleNextStep} style={styles.primary}>
                    <Text style={styles.primaryText}>Next Step</Text>
                  </Pressable>
                </Animated.View>
              </View>
            )}

            {/* STEP 2: EXPLORER USERNAME */}
            {step === 2 && (
              <View style={styles.stepContainer}>
                <Text style={styles.title}>What should we call you?</Text>
                <Text style={styles.subtitle}>
                  Choose an Explorer username for your quests and rankings.
                </Text>

                {errorMessage && (
                  <View style={styles.warningBanner}>
                    <Text style={styles.warningText}>{errorMessage}</Text>
                  </View>
                )}

                <TextInput
                  style={[
                    styles.input,
                    errorMessage ? styles.inputError : null,
                  ]}
                  value={username}
                  onChangeText={(text) => {
                    setUsername(text);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="e.g. CaptainAlex"
                  placeholderTextColor="#aebee0"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoFocus
                />

                <Animated.View
                  style={{
                    transform: [{ scale: scaleButtonAnim }],
                    width: "100%",
                  }}
                >
                  <Pressable onPress={handleNextStep} style={styles.primary}>
                    <Text style={styles.primaryText}>Next Step</Text>
                  </Pressable>
                </Animated.View>
              </View>
            )}

            {/* STEP 3: GRADE LEVEL */}
            {step === 3 && (
              <View style={styles.stepContainer}>
                <Text style={styles.title}>Select your rank</Text>
                <Text style={styles.subtitle}>
                  What grade level are you currently in?
                </Text>

                {errorMessage && (
                  <View style={styles.warningBanner}>
                    <Text style={styles.warningText}>{errorMessage}</Text>
                  </View>
                )}

                <View style={styles.grid}>
                  {gradeLevels.map((g) => {
                    const isSelected = selectedGrade === g.level;
                    return (
                      <Animated.View
                        key={g.level}
                        style={{
                          width: "47%",
                          transform: [{ scale: getBoxScale(g.level) }],
                        }}
                      >
                        <Pressable
                          onPress={() => handleSelectGrade(g.level)}
                          style={[
                            styles.selectionBox,
                            isSelected && styles.selectionBoxActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.boxNumber,
                              isSelected && styles.boxTextActive,
                            ]}
                          >
                            {g.level}
                          </Text>
                          <Text
                            style={[
                              styles.boxLabel,
                              isSelected && styles.boxTextActive,
                            ]}
                          >
                            {g.label}
                          </Text>
                        </Pressable>
                      </Animated.View>
                    );
                  })}
                </View>

                <Animated.View
                  style={{
                    transform: [{ scale: scaleButtonAnim }],
                    width: "100%",
                  }}
                >
                  <Pressable onPress={handleNextStep} style={styles.primary}>
                    <Text style={styles.primaryText}>Next Step</Text>
                  </Pressable>
                </Animated.View>
              </View>
            )}

            {/* STEP 4: MISSION TOPICS & LAUNCH */}
            {step === 4 && (
              <View style={styles.stepContainer}>
                <Text style={styles.title}>Pick your missions</Text>
                <Text style={styles.subtitle}>
                  Choose at least 2 topics you want to master first.
                </Text>

                <View style={styles.counterPill}>
                  <Text style={styles.counterPillText}>
                    {selectedSubjects.length} of {SUBJECT_META.length} Missions
                    Selected
                  </Text>
                </View>

                {errorMessage && (
                  <View style={styles.warningBanner}>
                    <Text style={styles.warningText}>{errorMessage}</Text>
                  </View>
                )}

                <View style={styles.missionList}>
                  {SUBJECT_META.map((item) => {
                    const isSelected = selectedSubjects.includes(item.name);
                    return (
                      <Animated.View
                        key={item.name}
                        style={{
                          width: "100%",
                          transform: [{ scale: getBoxScale(item.name) }],
                        }}
                      >
                        <Pressable
                          onPress={() => toggleSubject(item.name)}
                          style={[
                            styles.missionCard,
                            isSelected && {
                              backgroundColor: item.activeBg,
                              borderColor: item.activeBorder,
                              borderWidth: 2,
                              shadowColor: item.activeBorder,
                              shadowOpacity: 0.45,
                              shadowRadius: 8,
                              elevation: 6,
                            },
                          ]}
                        >
                          <View
                            style={[
                              styles.missionIconWrap,
                              isSelected && { backgroundColor: item.badgeBg },
                            ]}
                          >
                            <Text style={styles.missionIcon}>{item.icon}</Text>
                          </View>

                          <View style={styles.missionTextWrap}>
                            <Text style={styles.missionTitle}>{item.name}</Text>
                            <Text
                              style={[
                                styles.missionSubtitle,
                                isSelected && { color: item.accentText },
                              ]}
                            >
                              {item.subtitle}
                            </Text>
                          </View>

                          <View
                            style={[
                              styles.missionCheckCircle,
                              isSelected && {
                                backgroundColor: item.activeBorder,
                                borderColor: "#ffffff",
                              },
                            ]}
                          >
                            {isSelected && (
                              <Text style={styles.missionCheckMark}>✓</Text>
                            )}
                          </View>
                        </Pressable>
                      </Animated.View>
                    );
                  })}
                </View>

                <Animated.View
                  style={{
                    transform: [{ scale: scaleButtonAnim }],
                    width: "100%",
                  }}
                >
                  <Pressable
                    onPress={handleLaunch}
                    style={[
                      styles.primaryLaunch,
                      selectedSubjects.length >= 2 && styles.primaryLaunchReady,
                    ]}
                  >
                    <Text style={styles.primaryText}>
                      {selectedSubjects.length < 2
                        ? `Pick ${2 - selectedSubjects.length} more mission${
                            2 - selectedSubjects.length === 1 ? "" : "s"
                          }...`
                        : "🚀 Launch Adventure"}
                    </Text>
                  </Pressable>
                </Animated.View>
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#091426" },
  keyboardView: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 10,
  },
  back: { color: "#e582ff", fontWeight: "800", fontSize: 16 },
  stepIndicator: { color: "#8a9fc4", fontWeight: "700", fontSize: 14 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
    justifyContent: "center",
  },
  mascot: {
    width: "100%",
    aspectRatio: 0.8,
  },
  stepContainer: {
    width: "100%",
    alignItems: "center",
  },
  innerContainer: {
    width: "100%",
    alignItems: "center",
  },
  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "900",
    textAlign: "center",
  },
  subtitle: {
    color: "#c7d0e8",
    textAlign: "center",
    fontSize: 14,
    marginTop: 8,
    marginBottom: 18,
  },
  warningBanner: {
    backgroundColor: "rgba(255, 107, 129, 0.16)",
    borderColor: "#ff6b81",
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 14,
    width: "100%",
  },
  warningText: {
    color: "#ff8fa3",
    fontSize: 13,
    fontWeight: "800",
    textAlign: "center",
  },
  input: {
    backgroundColor: "#36377e",
    borderColor: "#625cff",
    borderWidth: 1,
    borderRadius: 12,
    color: "#fff",
    padding: 18,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    width: "100%",
  },
  inputError: {
    borderColor: "#ff6b81",
    borderWidth: 1.5,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
    gap: 12,
  },
  selectionBox: {
    backgroundColor: "#36377e",
    borderColor: "#625cff",
    borderWidth: 1,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 10,
  },
  selectionBoxActive: {
    backgroundColor: "#f5cd47",
    borderColor: "#fff",
    borderWidth: 2,
  },
  boxNumber: { color: "#fff", fontSize: 20, fontWeight: "900" },
  boxLabel: {
    color: "#c7d0e8",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 4,
    textAlign: "center",
  },
  boxTextActive: { color: "#1c2b59" },
  counterPill: {
    backgroundColor: "rgba(98, 92, 255, 0.25)",
    borderColor: "#625cff",
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  counterPillText: {
    color: "#d8d4ff",
    fontSize: 12,
    fontWeight: "800",
  },
  missionList: {
    width: "100%",
    gap: 11,
  },
  missionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#232958",
    borderColor: "#484d96",
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 14,
    width: "100%",
  },
  missionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  missionIcon: {
    fontSize: 22,
  },
  missionTextWrap: {
    flex: 1,
    paddingRight: 8,
  },
  missionTitle: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900",
  },
  missionSubtitle: {
    color: "#9aa8c7",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
  },
  missionCheckCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#6c78a8",
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  missionCheckMark: {
    color: "#091426",
    fontSize: 13,
    fontWeight: "900",
  },
  primary: {
    backgroundColor: "#5857e4",
    borderRadius: 12,
    alignItems: "center",
    padding: 16,
    marginTop: 30,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  primaryLaunch: {
    backgroundColor: "#3e4274",
    borderRadius: 12,
    alignItems: "center",
    padding: 16,
    marginTop: 26,
    width: "100%",
  },
  primaryLaunchReady: {
    backgroundColor: "#10b981",
    shadowColor: "#34d399",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  },
  primaryText: { color: "#fff", fontSize: 16, fontWeight: "900" },
});
