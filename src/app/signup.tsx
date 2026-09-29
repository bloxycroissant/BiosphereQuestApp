import { GradientSafeAreaView as SafeAreaView } from "@/components/gradient-safe-area";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { Link, router } from "expo-router";
import React, { useState } from "react";
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
  type TextInputProps,
} from "react-native";
import { supabase } from "../lib/supabase";

const STORAGE_KEY = "@biosphere_profile_data_v1";

const logo = require("../../assets/BiosphereQuestAssets/Biosphere Quest Logo.png");
const astro = require("../../assets/BiosphereQuestAssets/Astro (Biosphere Quest Mascot).png");
const stella = require("../../assets/BiosphereQuestAssets/Stella (Biosphere Quest Mascot).png");

export default function SignupScreen(): React.JSX.Element {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);

  const handleSignup = async (): Promise<void> => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      Alert.alert("Required Field", "Please enter an email address.");
      return;
    }

    if (!emailRegex.test(trimmedEmail)) {
      Alert.alert("Invalid Email", "Please type a valid email address.");
      return;
    }

    if (!password) {
      Alert.alert("Required Field", "Please enter a password.");
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        "Weak Password",
        "Password must be at least 6 characters long.",
      );
      return;
    }

    if (isSigningUp) return;
    setIsSigningUp(true);

    try {
      const guestName =
        (await AsyncStorage.getItem("explorerName")) || "Explorer";
      const guestUsername =
        (await AsyncStorage.getItem("explorerUsername")) ||
        guestName ||
        "Explorer";
      const guestGrade = (await AsyncStorage.getItem("explorerGrade")) || "1";
      const guestSubjects =
        (await AsyncStorage.getItem("explorerSubjects")) || "[]";

      let parsedSubjects: unknown = [];
      try {
        parsedSubjects = JSON.parse(guestSubjects);
      } catch {
        parsedSubjects = [];
      }

      console.log("🚀 Sending signup to Supabase with email:", trimmedEmail);

      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            full_name: guestName,
            username: guestUsername,
            grade_level: guestGrade,
            topics: Array.isArray(parsedSubjects) ? parsedSubjects : [],
            level: 0,
          },
        },
      });

      console.log("🛑 Supabase Response Error:", error);

      if (error) {
        Alert.alert("Signup Failed", error.message);
        return;
      }

      const savedData = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed = savedData ? JSON.parse(savedData) : {};
      parsed.name = guestName;
      parsed.username = guestUsername;
      parsed.email = trimmedEmail;
      parsed.authProvider = "email";
      parsed.gradeYear = `Grade ${guestGrade}`;
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));

      if (!data?.session) {
        Alert.alert(
          "Check Your Email",
          "We sent a confirmation email. Please verify it before logging in.",
        );
        router.push({
          pathname: "/verifyEmail" as any,
          params: { email: trimmedEmail },
        });
        return;
      }

      router.replace("/home" as any);
    } catch (error) {
      console.error("Signup error:", error);
      Alert.alert("Error", "An unexpected error occurred during signup.");
    } finally {
      setIsSigningUp(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <Pressable
              onPress={() =>
                router.canGoBack() ? router.back() : router.replace("/" as any)
              }
            >
              <Text style={styles.back}>‹ Back</Text>
            </Pressable>

            <View style={styles.mascots}>
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

            <View style={styles.formContainer}>
              <Text style={styles.title}>Create Your Account</Text>
              <Text style={styles.subtitle}>
                Save your progress across all devices
              </Text>

              <Field
                label="EMAIL"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="student@email.com"
              />

              <View style={styles.field}>
                <Text style={styles.label}>PASSWORD</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    placeholder="••••••••••"
                    placeholderTextColor="#aebee0"
                    style={styles.passwordInput}
                  />
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={showPassword ? "eye" : "eye-off"}
                      size={20}
                      color="#aebee0"
                    />
                  </Pressable>
                </View>
              </View>

              <Pressable
                onPress={handleSignup}
                style={[styles.primary, isSigningUp && { opacity: 0.7 }]}
                disabled={isSigningUp}
              >
                <Text style={styles.primaryText}>
                  {isSigningUp ? "Creating Account..." : "Sign Up Free"}
                </Text>
              </Pressable>

              <Text style={styles.footer}>
                Already have an account?{" "}
                <Link href="/login" style={styles.link}>
                  Log In
                </Link>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({
  label,
  ...props
}: { label: string } & TextInputProps): React.JSX.Element {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        style={styles.input}
        placeholderTextColor="#aebee0"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#091426" },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 12,
  },
  back: { color: "#e582ff", fontWeight: "800" },
  mascots: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    marginTop: 10,
  },
  mascot: { width: 70, height: 100 },
  logo: { width: 105, height: 105, marginHorizontal: -4 },
  brand: {
    color: "#7564f4",
    fontSize: 26,
    fontWeight: "900",
    textAlign: "center",
  },
  tagline: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 20,
  },
  formContainer: {
    gap: 10,
  },
  title: { color: "#fff", fontSize: 20, fontWeight: "900", marginTop: 2 },
  subtitle: { color: "#c7d0e8", fontSize: 12, marginBottom: 8 },
  field: { marginTop: 4 },
  label: { color: "#fff", fontWeight: "800", fontSize: 11, marginBottom: 4 },
  input: {
    backgroundColor: "#36377e",
    borderColor: "#625cff",
    borderWidth: 1,
    borderRadius: 9,
    color: "#fff",
    padding: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#36377e",
    borderColor: "#625cff",
    borderWidth: 1,
    borderRadius: 9,
    paddingRight: 10,
  },
  passwordInput: { flex: 1, color: "#fff", padding: 12 },
  eyeIcon: { padding: 4 },
  primary: {
    backgroundColor: "#a638ff",
    borderRadius: 9,
    alignItems: "center",
    padding: 14,
    marginTop: 16,
  },
  primaryText: { color: "#fff", fontSize: 14, fontWeight: "900" },
  footer: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "800",
    marginTop: 24,
  },
  link: { color: "#63e1e8", fontWeight: "900" },
});
