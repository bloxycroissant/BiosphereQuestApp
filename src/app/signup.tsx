import { GradientSafeAreaView as SafeAreaView } from "@/components/gradient-safe-area";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Link, router } from "expo-router";
import { useState, useRef, useEffect } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Animated,
} from "react-native";
import { useProgress } from "@/hooks/use-progress";

const grades = [
  { level: 1, label: "Grade 1", desc: "Explorer" },
  { level: 2, label: "Grade 2", desc: "Adventurer" },
  { level: 3, label: "Grade 3", desc: "Navigator" },
  { level: 4, label: "Grade 4", desc: "Pioneer" },
  { level: 5, label: "Grade 5", desc: "Expert" },
  { level: 6, label: "Grade 6", desc: "Master" },
];

const subjects = [
  { name: "Basic Math", label: "Math", icon: "🔢" },
  { name: "Patterns", label: "Patterns", icon: "🧩" },
  { name: "Matter", label: "Matter", icon: "🧪" },
  { name: "Force", label: "Force", icon: "⚡" },
  { name: "Geometry", label: "Geometry", icon: "📐" },
];

const logo = require("../../assets/BiosphereQuestAssets/Biosphere Quest Logo.png");
const astro = require("../../assets/BiosphereQuestAssets/Astro (Biosphere Quest Mascot).png");
const stella = require("../../assets/BiosphereQuestAssets/Stella (Biosphere Quest Mascot).png");

export default function SignUpScreen() {
  const { setRegisteredUser } = useProgress() as any;
  const [role, setRole] = useState<"student" | "parent">("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<number>(3);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([
    "Basic Math",
  ]);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const roleTabScale = useRef(new Animated.Value(1)).current;
  const formSectionAnim = useRef(new Animated.Value(1)).current;
  
  // Grade press animations mapping
  const gradeScales = useRef(
    grades.reduce((acc, g) => {
      acc[g.level] = new Animated.Value(1);
      return acc;
    }, {} as Record<number, Animated.Value>)
  ).current;

  // Subject press animations mapping
  const subjectScales = useRef(
    subjects.reduce((acc, subj) => {
      acc[subj.name] = new Animated.Value(1);
      return acc;
    }, {} as Record<string, Animated.Value>)
  ).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 7, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleRoleSwitch = (newRole: "student" | "parent") => {
    if (role === newRole) return;

    Animated.sequence([
      Animated.spring(roleTabScale, { toValue: 0.95, useNativeDriver: true }),
      Animated.spring(roleTabScale, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();

    Animated.sequence([
      Animated.timing(formSectionAnim, { toValue: 0.4, duration: 100, useNativeDriver: true }),
      Animated.timing(formSectionAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    setRole(newRole);
  };

  const handleSelectGrade = (level: number) => {
    Animated.sequence([
      Animated.spring(gradeScales[level], { toValue: 0.9, useNativeDriver: true }),
      Animated.spring(gradeScales[level], { toValue: 1.08, friction: 3, useNativeDriver: true }),
      Animated.spring(gradeScales[level], { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();

    setSelectedGrade(level);
  };

  const toggleSubject = (subjectName: string) => {
    Animated.sequence([
      Animated.spring(subjectScales[subjectName], { toValue: 0.9, useNativeDriver: true }),
      Animated.spring(subjectScales[subjectName], { toValue: 1.08, friction: 3, useNativeDriver: true }),
      Animated.spring(subjectScales[subjectName], { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();

    setSelectedSubjects((current) =>
      current.includes(subjectName)
        ? current.filter((item) => item !== subjectName)
        : [...current, subjectName],
    );
  };

  const handleSignUp = () => {
    if (!name.trim()) {
      Alert.alert("Required Field", "Please enter your full name.");
      return;
    }
    if (!email.trim()) {
      Alert.alert("Required Field", "Please enter your email address.");
      return;
    }
    if (!password || password.length < 6) {
      Alert.alert(
        "Invalid Password",
        "Password must be at least 6 characters.",
      );
      return;
    }
    if (role === "student" && selectedSubjects.length === 0) {
      Alert.alert(
        "Select Lessons",
        "Please pick at least one subject to start.",
      );
      return;
    }

    if (setRegisteredUser) {
      setRegisteredUser({ 
        name, 
        email, 
        password, 
        role, 
        grade: role === "student" ? selectedGrade : undefined, 
        selectedSubjects 
      });
    }

    Alert.alert(
      "Success!", 
      role === "student" 
        ? `Student account (Grade ${selectedGrade}) created successfully!` 
        : "Parent account created successfully!"
    );
    router.replace("/login");
  };

  const isParent = role === "parent";

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 30 }}>
          <Animated.View 
            style={[
              styles.content, 
              { 
                opacity: fadeAnim, 
                transform: [{ translateY: slideAnim }] 
              }
            ]}
          >
            <Pressable onPress={() => router.back()} style={styles.backContainer}>
              <Text style={styles.back}>‹ Back</Text>
            </Pressable>

            {/* Larger Prominent Logo & Mascots */}
            <View style={styles.mascotsContainer}>
              <Image
                source={astro}
                style={styles.mascot}
                contentFit="contain"
              />
              <Image source={logo} style={styles.logo} contentFit="contain" />
              <Image
                source={stella}
                style={styles.mascot}
                contentFit="contain"
              />
            </View>

            <Text style={styles.brand}>Biosphere Quest</Text>
            <Text style={styles.tagline}>
              Rocket your knowledge to the stars
            </Text>

            {/* Role Switcher */}
            <Animated.View style={[styles.roleContainer, { transform: [{ scale: roleTabScale }] }]}>
              <Pressable
                style={[styles.roleTab, role === "student" && styles.roleTabActive]}
                onPress={() => handleRoleSwitch("student")}
              >
                <Text style={[styles.roleText, role === "student" && styles.roleTextActive]}>
                  🎓 Student Sign Up
                </Text>
              </Pressable>
              <Pressable
                style={[styles.roleTab, role === "parent" && styles.roleTabActive]}
                onPress={() => handleRoleSwitch("parent")}
              >
                <Text style={[styles.roleText, role === "parent" && styles.roleTextActive]}>
                  🛡️ Parent Account
                </Text>
              </Pressable>
            </Animated.View>

            <Animated.View style={[{ opacity: formSectionAnim }, isParent && styles.parentExpandedSection]}>
              <Text style={[styles.title, isParent && styles.parentTitle]}>
                {role === "student" ? "Ready for your space mission?" : "Create your parent account"}
              </Text>
              <Text style={[styles.subtitle, isParent && styles.parentSubtitle]}>
                {role === "student" ? "Customize your learning capsule below" : "Set up monitoring & screen time controls"}
              </Text>

              {role === "student" && (
                <View style={styles.studentSectionBox}>
                  {/* Grade Level Selector */}
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionLabel}>⭐ SELECT YOUR GRADE LEVEL</Text>
                  </View>
                  <View style={styles.gradesGrid}>
                    {grades.map((g) => {
                      const isSelected = selectedGrade === g.level;
                      return (
                        <Animated.View 
                          key={g.level} 
                          style={{ flex: 1, transform: [{ scale: gradeScales[g.level] }] }}
                        >
                          <Pressable
                            onPress={() => handleSelectGrade(g.level)}
                            style={[styles.gradeCard, isSelected && styles.gradeCardSelected]}
                          >
                            <Text style={[styles.gradeCardNum, isSelected && styles.gradeCardNumSelected]}>
                              {g.level}
                            </Text>
                            <Text 
                              numberOfLines={1}
                              style={[styles.gradeCardDesc, isSelected && styles.gradeCardDescSelected]}
                            >
                              {g.desc}
                            </Text>
                          </Pressable>
                        </Animated.View>
                      );
                    })}
                  </View>

                  {/* Subject Picker - Single Inline Row with Animation */}
                  <View style={[styles.sectionHeaderRow, { marginTop: 10 }]}>
                    <Text style={styles.sectionLabel}>🚀 PICK YOUR QUEST TOPICS</Text>
                    <Text style={styles.selectionHintCount}>
                      {selectedSubjects.length} selected
                    </Text>
                  </View>
                  <View style={styles.gradesGrid}>
                    {subjects.map((subj) => {
                      const selected = selectedSubjects.includes(subj.name);
                      return (
                        <Animated.View 
                          key={subj.name} 
                          style={{ flex: 1, transform: [{ scale: subjectScales[subj.name] }] }}
                        >
                          <Pressable
                            onPress={() => toggleSubject(subj.name)}
                            style={[styles.gradeCard, selected && styles.subjectCardSelected]}
                          >
                            <Text style={styles.subjectIcon}>{subj.icon}</Text>
                            <Text 
                              numberOfLines={1}
                              style={[styles.gradeCardDesc, selected && styles.subjectCardDescSelected]}
                            >
                              {subj.label}
                            </Text>
                          </Pressable>
                        </Animated.View>
                      );
                    })}
                  </View>
                </View>
              )}

              <View style={styles.credentialsContainer}>
                <Field
                  label={role === "student" ? "Your Explorer Name" : "Full name"}
                  value={name}
                  onChangeText={setName}
                  placeholder={role === "student" ? "e.g. Captain Alex" : "Parent / Guardian full name"}
                  isParent={isParent}
                />
                <Field
                  label="Email Address"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="you@email.com"
                  isParent={isParent}
                />

                <View style={[styles.field, isParent && styles.parentField]}>
                  <Text style={[styles.label, isParent && styles.parentLabel]}>Password</Text>
                  <View style={[styles.inputContainer, isParent && styles.parentInputContainer]}>
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      placeholder="Min. 6 characters"
                      placeholderTextColor="#aebee0"
                      style={[styles.passwordInput, isParent && styles.parentPasswordInput]}
                    />
                    <Pressable
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeIcon}
                    >
                      <Ionicons
                        name={showPassword ? "eye" : "eye-off"}
                        size={isParent ? 24 : 20}
                        color="#aebee0"
                      />
                    </Pressable>
                  </View>
                </View>
              </View>

              {/* Larger, Bolder Primary Button */}
              <Pressable onPress={handleSignUp} style={[styles.primary, isParent && styles.parentPrimary]}>
                <Text style={[styles.primaryText, isParent && styles.parentPrimaryText]}>
                  {role === "student" ? "🚀 Launch Mission & Sign Up" : "Create Parent Account"}
                </Text>
              </Pressable>

              <Text style={[styles.footer, isParent && styles.parentFooter]}>
                Already have an account?{" "}
                <Link href="/login" style={[styles.link, isParent && styles.parentLink]}>
                  Log In
                </Link>
              </Text>
            </Animated.View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({
  label,
  isParent,
  ...props
}: { label: string; isParent?: boolean } & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={[styles.field, isParent && styles.parentField]}>
      <Text style={[styles.label, isParent && styles.parentLabel]}>{label}</Text>
      <TextInput
        {...props}
        style={[styles.input, isParent && styles.parentInput]}
        placeholderTextColor="#aebee0"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#091426" },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 6,
  },
  backContainer: { alignSelf: "flex-start", paddingVertical: 4 },
  back: { color: "#e582ff", fontWeight: "800", fontSize: 14 },
  
  mascotsContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    marginBottom: -4,
  },
  mascot: { width: 75, height: 110 },
  logo: { width: 115, height: 115, marginHorizontal: -8 },
  
  brand: {
    color: "#9d7aff",
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
  },
  tagline: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 4,
  },
  roleContainer: {
    flexDirection: "row",
    backgroundColor: "#1f2942",
    borderRadius: 14,
    padding: 4,
    marginVertical: 2,
    borderWidth: 1,
    borderColor: "#374151",
  },
  roleTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 11,
  },
  roleTabActive: {
    backgroundColor: "#6258ff",
  },
  roleText: {
    color: "#94a3b8",
    fontWeight: "800",
    fontSize: 12,
  },
  roleTextActive: {
    color: "#ffffff",
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 2,
  },
  subtitle: { color: "#c7d0e8", textAlign: "center", fontSize: 11, marginBottom: 4 },
  
  studentSectionBox: {
    backgroundColor: "#131f38",
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: "#26355d",
    gap: 4,
    marginTop: 2,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionLabel: { color: "#9af2bc", fontSize: 10, fontWeight: "900", letterSpacing: 0.5 },
  selectionHintCount: { color: "#94a3b8", fontSize: 10, fontWeight: "800" },

  gradesGrid: {
    flexDirection: "row",
    gap: 3,
    marginTop: 3,
  },
  gradeCard: {
    backgroundColor: "#1b2a4e",
    borderColor: "#2d4277",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 1,
    alignItems: "center",
  },
  gradeCardSelected: {
    backgroundColor: "#f1c65b",
    borderColor: "#fff",
  },
  gradeCardNum: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "900",
  },
  gradeCardNumSelected: {
    color: "#091426",
  },
  gradeCardDesc: {
    color: "#8fa2cc",
    fontSize: 7.5,
    fontWeight: "700",
    textAlign: "center",
  },
  gradeCardDescSelected: {
    color: "#3a2d04",
  },

  subjectCardSelected: {
    backgroundColor: "#584cf4",
    borderColor: "#b6a9ff",
  },
  subjectIcon: {
    fontSize: 11,
    marginBottom: 1,
  },
  subjectCardDescSelected: {
    color: "#fff",
  },

  credentialsContainer: {
    gap: 4,
    marginTop: 4,
  },
  field: { marginTop: 2 },
  label: { color: "#fff", fontWeight: "800", fontSize: 11, marginBottom: 4 },
  input: {
    backgroundColor: "#1b2a4e",
    borderColor: "#2d4277",
    borderWidth: 1,
    borderRadius: 10,
    color: "#fff",
    padding: 10,
    fontSize: 13,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1b2a4e",
    borderColor: "#2d4277",
    borderWidth: 1,
    borderRadius: 10,
    paddingRight: 10,
  },
  passwordInput: { flex: 1, color: "#fff", padding: 10, fontSize: 13 },
  eyeIcon: { padding: 4 },
  
  primary: {
    backgroundColor: "#6258ff",
    borderRadius: 14,
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#8a82ff",
    shadowColor: "#6258ff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  primaryText: { color: "#fff", fontSize: 15, fontWeight: "900", letterSpacing: 0.5 },
  
  footer: { color: "#c7d0e8", textAlign: "center", fontWeight: "800", marginTop: 6, fontSize: 12 },
  link: { color: "#63e1e8", fontWeight: "900" },

  parentExpandedSection: {
    gap: 10,
    marginTop: 6,
  },
  parentTitle: {
    fontSize: 22,
  },
  parentSubtitle: {
    fontSize: 13,
    marginBottom: 4,
  },
  parentField: {
    marginTop: 6,
  },
  parentLabel: {
    fontSize: 13,
    marginBottom: 6,
  },
  parentInput: {
    padding: 14,
    fontSize: 15,
    borderRadius: 12,
  },
  parentInputContainer: {
    borderRadius: 12,
  },
  parentPasswordInput: {
    padding: 14,
    fontSize: 15,
  },
  parentPrimary: {
    padding: 16,
    marginTop: 12,
    borderRadius: 14,
  },
  parentPrimaryText: {
    fontSize: 16,
  },
  parentFooter: {
    fontSize: 13,
    marginTop: 8,
  },
  parentLink: {
    fontSize: 13,
  },
});