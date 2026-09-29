import { GradientSafeAreaView as SafeAreaView } from "@/components/gradient-safe-area";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const subjectsList = ["Math", "Patterns", "Matter", "Force", "Geometry"];
const gradeLevels = [
  { level: 1, label: "Explorer" },
  { level: 2, label: "Adventurer" },
  { level: 3, label: "Navigator" },
  { level: 4, label: "Pioneer" },
  { level: 5, label: "Expert" },
  { level: 6, label: "Master" },
];

const astro = require("../../assets/BiosphereQuestAssets/Astro (Biosphere Quest Mascot).png");

export default function WelcomeWizardScreen() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [selectedGrade, setSelectedGrade] = useState(3);
  const [selectedSubjects, setSelectedSubjects] = useState(["Math"]);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const scaleButtonAnim = useRef(new Animated.Value(1)).current;
  
  // Track press scales dynamically for grid items
  const boxScales = useRef<{ [key: string]: Animated.Value }>({}).current;

  // Helper to get or create a scale animation value for grid items
  const getBoxScale = (key: string | number) => {
    const stringKey = String(key);
    if (!boxScales[stringKey]) {
      boxScales[stringKey] = new Animated.Value(1);
    }
    return boxScales[stringKey];
  };

  const animateItemPress = (key: string | number, callback: () => void) => {
    const animValue = getBoxScale(key);
    Animated.sequence([
      Animated.timing(animValue, {
        toValue: 0.94,
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

  // Mascot floating loop animation
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
      ])
    ).start();
  }, [floatAnim]);

  // Trigger step transition animation whenever "step" changes
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

  const toggleSubject = (subject: string) => {
    animateItemPress(subject, () => {
      setSelectedSubjects((current) =>
        current.includes(subject)
          ? current.filter((item) => item !== subject)
          : [...current, subject],
      );
    });
  };

  const handleSelectGrade = (level: number) => {
    animateItemPress(level, () => {
      setSelectedGrade(level);
    });
  };

  const handleNextStep = () => {
    if (step === 1 && !name.trim()) {
      Alert.alert("Hold on!", "We need your Explorer Name to continue.");
      return;
    }
    animateButtonPress(() => setStep(step + 1));
  };

  const handleLaunch = async () => {
    if (selectedSubjects.length === 0) {
      Alert.alert("Hold on!", "Please pick at least one mission topic.");
      return;
    }

    animateButtonPress(async () => {
      try {
        await AsyncStorage.removeItem("@biosphere_profile_data_v1");

        await AsyncStorage.setItem("explorerName", name);
        await AsyncStorage.setItem("explorerGrade", selectedGrade.toString());
        await AsyncStorage.setItem(
          "explorerSubjects",
          JSON.stringify(selectedSubjects),
        );

        router.replace("/home");
      } catch (e) {
        console.error("Failed to save local data", e);
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
              step > 1 ? setStep(step - 1) : router.back();
            }}
          >
            <Text style={styles.back}>‹ Back</Text>
          </Pressable>
          <Text style={styles.stepIndicator}>Step {step} of 3</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Animated Floating Mascot */}
          <Animated.View
            style={{
              transform: [{ translateY: floatAnim }],
              alignSelf: "center",
              marginBottom: 20,
              width: "40%",
              maxHeight: 140,
            }}
          >
            <Image source={astro} style={styles.mascot} contentFit="contain" />
          </Animated.View>

          {/* Animated Content Step Container */}
          <Animated.View
            style={[
              styles.stepContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* STEP 1: NAME */}
            {step === 1 && (
              <View style={styles.innerContainer}>
                <Text style={styles.title}>What should we call you?</Text>
                <Text style={styles.subtitle}>
                  Enter your official Explorer Name.
                </Text>

                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Captain Alex"
                  placeholderTextColor="#aebee0"
                  autoFocus
                />

                <Animated.View style={{ transform: [{ scale: scaleButtonAnim }], width: "100%" }}>
                  <Pressable onPress={handleNextStep} style={styles.primary}>
                    <Text style={styles.primaryText}>Next Step →</Text>
                  </Pressable>
                </Animated.View>
              </View>
            )}

            {/* STEP 2: GRADE */}
            {step === 2 && (
              <View style={styles.innerContainer}>
                <Text style={styles.title}>Select your rank</Text>
                <Text style={styles.subtitle}>
                  What grade level are you currently in?
                </Text>

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

                <Animated.View style={{ transform: [{ scale: scaleButtonAnim }], width: "100%" }}>
                  <Pressable onPress={handleNextStep} style={styles.primary}>
                    <Text style={styles.primaryText}>Next Step →</Text>
                  </Pressable>
                </Animated.View>
              </View>
            )}

            {/* STEP 3: TOPICS */}
            {step === 3 && (
              <View style={styles.innerContainer}>
                <Text style={styles.title}>Pick your missions</Text>
                <Text style={styles.subtitle}>
                  What topics do you want to master first?
                </Text>

                <View style={styles.grid}>
                  {subjectsList.map((subject) => {
                    const isSelected = selectedSubjects.includes(subject);
                    return (
                      <Animated.View
                        key={subject}
                        style={{
                          width: "47%",
                          transform: [{ scale: getBoxScale(subject) }],
                        }}
                      >
                        <Pressable
                          onPress={() => toggleSubject(subject)}
                          style={[
                            styles.selectionBox,
                            isSelected && styles.selectionBoxActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.boxSubjectText,
                              isSelected && styles.boxTextActive,
                            ]}
                          >
                            {subject}
                          </Text>
                        </Pressable>
                      </Animated.View>
                    );
                  })}
                </View>

                <Animated.View style={{ transform: [{ scale: scaleButtonAnim }], width: "100%" }}>
                  <Pressable onPress={handleLaunch} style={styles.primaryLaunch}>
                    <Text style={styles.primaryText}>🚀 Launch App</Text>
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

const { width } = Dimensions.get("window");

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
    marginBottom: 30,
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
  },
  boxNumber: { color: "#fff", fontSize: 20, fontWeight: "900" },
  boxLabel: {
    color: "#c7d0e8",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 4,
    textAlign: "center",
  },
  boxSubjectText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center",
  },
  boxTextActive: { color: "#1c2b59" },
  primary: {
    backgroundColor: "#5857e4",
    borderRadius: 12,
    alignItems: "center",
    padding: 16,
    marginTop: 35,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  primaryLaunch: {
    backgroundColor: "#6258ff",
    borderRadius: 12,
    alignItems: "center",
    padding: 16,
    marginTop: 35,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  primaryText: { color: "#fff", fontSize: 16, fontWeight: "900" },
});