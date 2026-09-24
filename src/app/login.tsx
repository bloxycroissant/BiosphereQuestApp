import { GradientSafeAreaView as SafeAreaView } from "@/components/gradient-safe-area";
import { Ionicons } from "@expo/vector-icons";
import { makeRedirectUri } from "expo-auth-session";
import { Image } from "expo-image";
import { Link, router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useState, useRef } from "react";
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
import { supabase } from "../lib/supabase";
import { useProgress } from "@/hooks/use-progress";
import AsyncStorage from "@react-native-async-storage/async-storage";

WebBrowser.maybeCompleteAuthSession();

const logo = require("../../assets/BiosphereQuestAssets/Biosphere Quest Logo.png");
const astro = require("../../assets/BiosphereQuestAssets/Astro (Biosphere Quest Mascot).png");
const stella = require("../../assets/BiosphereQuestAssets/Stella (Biosphere Quest Mascot).png");
const googleLogo = require("../../assets/BiosphereQuestAssets/Google Logo.png");

export default function LoginScreen() {
  const { registeredUser } = useProgress() as any;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"student" | "parent">("student");

  // Animation values for sliding & scaling
  const roleTabScale = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const handleRoleSwitch = (newRole: "student" | "parent") => {
    if (role === newRole) return;

    Animated.sequence([
      Animated.spring(roleTabScale, { toValue: 0.96, useNativeDriver: true }),
      Animated.spring(roleTabScale, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();

    const direction = newRole === "parent" ? 1 : -1;
    slideAnim.setValue(direction * 30);
    
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    setRole(newRole);
  };

  const handleGoogleLogin = async () => {
    try {
      const redirectUrl = makeRedirectUri();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;
      
      if (!data?.url) {
        console.error("No OAuth URL returned from Supabase");
        Alert.alert("Login Error", "Could not generate Google sign-in URL.");
        return;
      }

      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectUrl
      );

      if (result.type === "success" && result.url) {
        console.log("Successfully logged in via Google!");
        navigateBasedOnRole();
      }
    } catch (error) {
      console.error("WebBrowser auth error:", error);
      Alert.alert("Login Error", "Something went wrong opening the login window. Please try again.");
    }
  };

  const navigateBasedOnRole = async () => {
    const isParentEmail = email.toLowerCase().includes("parent"); 

    if (role === "parent" || isParentEmail) {
      router.replace("/parent-dashboard" as any);
    } else {
      router.replace("/(tabs)/home" as any);
    }
  };

  const handleLogin = () => {
    if (!email.trim()) {
      Alert.alert("Required Field", "Please enter your email address.");
      return;
    }
    if (!password) {
      Alert.alert("Required Field", "Please enter your password.");
      return;
    }

    const targetEmail = registeredUser?.email;
    const targetPassword = registeredUser?.password;

    if (targetEmail && targetPassword) {
      if (email.trim() === targetEmail && password === targetPassword) {
        navigateBasedOnRole();
      } else {
        Alert.alert("Login Failed", "Incorrect email or password. Please check your credentials.");
      }
    } else {
      navigateBasedOnRole();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.content}>
            <Pressable onPress={() => router.back()}>
              <Text style={styles.back}>‹ Back</Text>
            </Pressable>

            <View style={styles.mascots}>
              <Image source={astro} style={styles.mascot} contentFit="contain" />
              <Image source={logo} style={styles.logo} contentFit="contain" />
              <Image source={stella} style={styles.mascot} contentFit="contain" />
            </View>

            <Text style={styles.brand}>Biosphere Quest</Text>
            <Text style={styles.tagline}>
              Rocket your knowledge to the stars
            </Text>

            {/* Role Switcher Selector with Animated Container */}
            <Animated.View style={[styles.roleContainer, { transform: [{ scale: roleTabScale }] }]}>
              <Pressable
                style={[styles.roleTab, role === "student" && styles.roleTabActive]}
                onPress={() => handleRoleSwitch("student")}
              >
                <Text style={[styles.roleText, role === "student" && styles.roleTextActive]}>
                  🎓 Student Login
                </Text>
              </Pressable>
              <Pressable
                style={[styles.roleTab, role === "parent" && styles.roleTabActive]}
                onPress={() => handleRoleSwitch("parent")}
              >
                <Text style={[styles.roleText, role === "parent" && styles.roleTextActive]}>
                  🛡️ Parent Login
                </Text>
              </Pressable>
            </Animated.View>

            {/* Sliding Form Container */}
            <Animated.View 
              style={[
                styles.formContainer, 
                { transform: [{ translateX: slideAnim }] }
              ]}
            >
              <Text style={styles.title}>
                {role === "student" ? "Welcome Back, Explorer!" : "Parent Portal Access"}
              </Text>
              <Text style={styles.subtitle}>
                {role === "student" 
                  ? "Continue your learning journey" 
                  : "Manage screentime, limits, and student progress"}
              </Text>

              <Field
                label="EMAIL"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder={role === "student" ? "student@email.com" : "parent@email.com"}
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

              <Link href="/forgot-password" style={styles.forgot}>
                Forgot Password?
              </Link>

              <Pressable onPress={handleLogin} style={styles.primary}>
                <Text style={styles.primaryText}>
                  {role === "student" ? "Log In as Student" : "Log In as Parent"}
                </Text>
              </Pressable>

              <View style={styles.divider}>
                <View style={styles.line} />
                <Text style={styles.or}>or</Text>
                <View style={styles.line} />
              </View>

              <Pressable style={styles.google} onPress={handleGoogleLogin}>
                <Image
                  source={googleLogo}
                  style={styles.googleLogo}
                  contentFit="contain"
                />
                <Text style={styles.googleText}>Continue with Google</Text>
              </Pressable>

              <Text style={styles.footer}>
                Don't have an account?{" "}
                <Link href="/signup" style={styles.link}>
                  Sign Up Free
                </Link>
              </Text>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({
  label,
  ...props
}: { label: string } & React.ComponentProps<typeof TextInput>) {
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
    marginBottom: 4,
  },
  roleContainer: {
    flexDirection: "row",
    backgroundColor: "#1f2942",
    borderRadius: 12,
    padding: 4,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: "#374151",
  },
  roleTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 9,
  },
  roleTabActive: {
    backgroundColor: "#5857e4",
  },
  roleText: {
    color: "#94a3b8",
    fontWeight: "800",
    fontSize: 13,
  },
  roleTextActive: {
    color: "#ffffff",
  },
  formContainer: {
    gap: 10,
  },
  title: { color: "#fff", fontSize: 20, fontWeight: "900", marginTop: 2 },
  subtitle: { color: "#c7d0e8", fontSize: 12, marginBottom: 4 },
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
  forgot: {
    color: "#817af0",
    fontSize: 11,
    fontWeight: "800",
    textAlign: "right",
    marginTop: 2,
  },
  primary: {
    backgroundColor: "#5857e4",
    borderRadius: 9,
    alignItems: "center",
    padding: 14,
    marginTop: 4,
  },
  primaryText: { color: "#fff", fontSize: 14, fontWeight: "900" },
  divider: { flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 6 },
  line: { flex: 1, height: 1, backgroundColor: "#aaa9c6" },
  or: { color: "#fff", fontWeight: "900" },
  google: {
    borderColor: "#625cff",
    borderWidth: 1,
    borderRadius: 9,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
  },
  googleLogo: { width: 20, height: 20, marginRight: 8 },
  googleText: { color: "#fff", fontWeight: "900", fontSize: 14 },
  footer: { color: "#fff", textAlign: "center", fontWeight: "800", marginTop: 8 },
  link: { color: "#63e1e8", fontWeight: "900" },
});