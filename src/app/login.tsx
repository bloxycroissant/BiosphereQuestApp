import { GradientSafeAreaView as SafeAreaView } from "@/components/gradient-safe-area";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { makeRedirectUri } from "expo-auth-session";
import { Image } from "expo-image";
import { Link, router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useState, type ComponentProps } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { supabase } from "../lib/supabase";

WebBrowser.maybeCompleteAuthSession();

const STORAGE_KEY = "@biosphere_profile_data_v1";

const logo = require("../../assets/BiosphereQuestAssets/Biosphere Quest Logo.png");
const astro = require("../../assets/BiosphereQuestAssets/Astro (Biosphere Quest Mascot).png");
const stella = require("../../assets/BiosphereQuestAssets/Stella (Biosphere Quest Mascot).png");
const googleLogo = require("../../assets/BiosphereQuestAssets/Google Logo.png");

type FieldProps = ComponentProps<typeof TextInput> & {
  label: string;
};

const extractParamsFromUrl = (url: string): Record<string, string> => {
  const params: Record<string, string> = {};

  const queryPart = url.split("?")[1]?.split("#")[0];
  if (queryPart) {
    queryPart.split("&").forEach((part) => {
      const [key, value] = part.split("=");
      if (key && value) {
        params[key] = decodeURIComponent(value);
      }
    });
  }

  const hashPart = url.split("#")[1];
  if (hashPart) {
    hashPart.split("&").forEach((part) => {
      const [key, value] = part.split("=");
      if (key && value) {
        params[key] = decodeURIComponent(value);
      }
    });
  }

  return params;
};

export default function LoginScreen(): React.JSX.Element {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleGoogleLogin = async (): Promise<void> => {
    try {
      setGoogleLoading(true);
      setErrorMessage("");

      const redirectUrl = makeRedirectUri();
      console.log("🔗 [Google Auth] Using redirect URI:", redirectUrl);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;

      if (!data?.url) {
        Alert.alert("Login Error", "Could not generate Google sign-in URL.");
        return;
      }

      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectUrl,
      );

      if (result.type === "success" && result.url) {
        console.log(
          "🔄 [Google Auth] Auth session success, parsing URL parameters...",
        );
        const params = extractParamsFromUrl(result.url);

        let activeUser = null;

        if (params.code) {
          const { data: sessionData, error: sessionErr } =
            await supabase.auth.exchangeCodeForSession(params.code);
          if (sessionErr) throw sessionErr;
          activeUser = sessionData.user;
        } else if (params.access_token && params.refresh_token) {
          const { data: sessionData, error: sessionErr } =
            await supabase.auth.setSession({
              access_token: params.access_token,
              refresh_token: params.refresh_token,
            });
          if (sessionErr) throw sessionErr;
          activeUser = sessionData.user;
        } else {
          const { data: userData } = await supabase.auth.getUser();
          activeUser = userData?.user ?? null;
        }

        if (activeUser) {
          console.log(
            "✅ [Google Auth] Logged in successfully as:",
            activeUser.email,
          );

          const savedData = await AsyncStorage.getItem(STORAGE_KEY);
          const parsed = savedData ? JSON.parse(savedData) : {};
          const guestName = await AsyncStorage.getItem("explorerName");
          const guestUsername = await AsyncStorage.getItem("explorerUsername");

          const resolvedName =
            activeUser.user_metadata?.full_name ||
            activeUser.user_metadata?.name ||
            guestName ||
            parsed.name ||
            "Explorer";

          const resolvedUsername =
            activeUser.user_metadata?.username ||
            guestUsername ||
            parsed.username ||
            activeUser.email?.split("@")[0] ||
            "Explorer";

          parsed.email = activeUser.email;
          parsed.authProvider = "google";
          parsed.name = resolvedName;
          parsed.username = resolvedUsername;

          if (!activeUser.user_metadata?.username && resolvedUsername) {
            await supabase.auth.updateUser({
              data: {
                username: resolvedUsername,
                full_name: resolvedName,
              },
            });
          }

          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
          router.replace("/home" as any);
        } else {
          throw new Error("Could not retrieve session from Google redirect.");
        }
      }
    } catch (error: any) {
      console.error("❌ [Google Auth] OAuth error:", error);
      const friendlyMsg =
        error?.message || "Something went wrong during Google sign-in.";
      setErrorMessage(friendlyMsg);
      Alert.alert("Google Sign-In Failed", friendlyMsg);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleLogin = async (): Promise<void> => {
    setErrorMessage("");

    if (!email.trim()) {
      setErrorMessage("Please enter your email address.");
      Alert.alert("Required Field", "Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage(
        "Invalid email address. Please enter a valid email address.",
      );
      Alert.alert("Invalid Email", "Please type a valid email address.");
      return;
    }

    if (!password) {
      setErrorMessage("Please enter your password.");
      Alert.alert("Required Field", "Please enter your password.");
      return;
    }

    try {
      setLoading(true);
      console.log("🔄 [Auth] Attempting Supabase login for:", email.trim());

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        console.error("❌ [Auth] Login error:", error.message);

        const friendlyMessage =
          error.message.toLowerCase().includes("invalid login credentials") ||
          error.message.toLowerCase().includes("invalid grant")
            ? "Invalid email or password."
            : error.message || "Invalid email or password.";

        setErrorMessage(friendlyMessage);
        Alert.alert("Login Failed", friendlyMessage);
        return;
      }

      if (data?.session && data?.user) {
        console.log("✅ [Auth] Logged in successfully:", data.user.email);

        const savedData = await AsyncStorage.getItem(STORAGE_KEY);
        const parsed = savedData ? JSON.parse(savedData) : {};
        const guestName = await AsyncStorage.getItem("explorerName");
        const guestUsername = await AsyncStorage.getItem("explorerUsername");

        parsed.email = data.user.email;
        parsed.authProvider = "email";

        parsed.name =
          data.user.user_metadata?.full_name ||
          parsed.name ||
          guestName ||
          "Explorer";

        parsed.username =
          data.user.user_metadata?.username ||
          parsed.username ||
          guestUsername ||
          data.user.email?.split("@")[0] ||
          "Explorer";

        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        router.replace("/home" as any);
      }
    } catch (err: any) {
      console.error("❌ [Auth] Unexpected login error:", err);
      const fallbackErr = "Invalid email or password. Please try again.";
      setErrorMessage(fallbackErr);
      Alert.alert("Login Error", fallbackErr);
    } finally {
      setLoading(false);
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
        >
          <View style={styles.content}>
            <Pressable onPress={() => router.back()}>
              <Text style={styles.back}> Back</Text>
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
              <Text style={styles.title}>Welcome Back, Explorer!</Text>
              <Text style={styles.subtitle}>
                Continue your learning journey
              </Text>

              {errorMessage !== "" && (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorBannerText}>⚠️ {errorMessage}</Text>
                </View>
              )}

              <Field
                label="EMAIL"
                value={email}
                onChangeText={(text: string) => {
                  setEmail(text);
                  if (errorMessage) setErrorMessage("");
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="student@email.com"
              />

              <View style={styles.field}>
                <Text style={styles.label}>PASSWORD</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    value={password}
                    onChangeText={(text: string) => {
                      setPassword(text);
                      if (errorMessage) setErrorMessage("");
                    }}
                    secureTextEntry={!showPassword}
                    placeholder="••••••••••"
                    placeholderTextColor="#aebee0"
                    style={styles.passwordInput}
                    autoCapitalize="none"
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

              <Pressable
                onPress={handleLogin}
                style={[styles.primary, loading && { opacity: 0.7 }]}
                disabled={loading || googleLoading}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.primaryText}>Log In</Text>
                )}
              </Pressable>

              <View style={styles.divider}>
                <View style={styles.line} />
                <Text style={styles.or}>or</Text>
                <View style={styles.line} />
              </View>

              <Pressable
                style={[styles.google, googleLoading && { opacity: 0.7 }]}
                onPress={handleGoogleLogin}
                disabled={loading || googleLoading}
              >
                {googleLoading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Image
                      source={googleLogo}
                      style={styles.googleLogo}
                      contentFit="contain"
                    />
                    <Text style={styles.googleText}>Continue with Google</Text>
                  </View>
                )}
              </Pressable>

              <Text style={styles.footer}>
                Don't have an account?{" "}
                <Link href="/signup" style={styles.link}>
                  Sign Up Free
                </Link>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, ...props }: FieldProps): React.JSX.Element {
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
  errorBanner: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    borderColor: "#ef4444",
    borderWidth: 1.2,
    borderRadius: 10,
    padding: 10,
    marginBottom: 6,
  },
  errorBannerText: {
    color: "#fca5a5",
    fontSize: 12.5,
    fontWeight: "800",
    textAlign: "center",
  },
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
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 6,
  },
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
  footer: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "800",
    marginTop: 8,
  },
  link: { color: "#63e1e8", fontWeight: "900" },
});
