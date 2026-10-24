import { LinearGradient } from "expo-linear-gradient";
import {
  DarkTheme,
  DefaultTheme,
  Slot,
  ThemeProvider,
  usePathname,
} from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, useColorScheme } from "react-native";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import AppTabs from "@/components/mobile-navigation";
import { ProgressProvider } from "@/hooks/use-progress";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout(): React.JSX.Element {
  const colorScheme = useColorScheme();
  const pathname = usePathname();

  const isWelcomeOrAuth =
    pathname === "/" ||
    pathname === "/welcome" ||
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/verifyEmail" ||
    pathname === "/forgot-password" ||
    pathname === "/verify-code" ||
    pathname === "/new-password";

  const isParentRoute =
    pathname.includes("/parent-dashboard") || pathname.startsWith("/parent");

  const isStudentTabRoute =
    pathname.includes("/home") ||
    pathname.includes("/explore") ||
    pathname.includes("/courses") ||
    pathname.includes("/games") ||
    pathname.includes("/profile") ||
    pathname === "/(tabs)/home" ||
    pathname === "/(tabs)/explore" ||
    pathname === "/(tabs)/courses" ||
    pathname === "/(tabs)/games" ||
    pathname === "/(tabs)/profile";

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <ProgressProvider>
        {/* Ensures clock, battery, and wifi icons are crisp white against the dark theme */}
        <StatusBar style="light" />
        <LinearGradient
          colors={["#090b20", "#28285e", "#0b4070"]}
          style={styles.background}
        >
          <AnimatedSplashOverlay />
          {isWelcomeOrAuth || isParentRoute || !isStudentTabRoute ? (
            <AnimatedRoute />
          ) : (
            <AppTabs />
          )}
        </LinearGradient>
      </ProgressProvider>
    </ThemeProvider>
  );
}

function AnimatedRoute(): React.JSX.Element {
  const pathname = usePathname();
  const entrance = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    entrance.setValue(0);
    Animated.spring(entrance, {
      toValue: 1,
      useNativeDriver: true,
      tension: 55,
      friction: 9,
    }).start();
  }, [entrance, pathname]);

  return (
    <Animated.View
      style={{
        flex: 1,
        opacity: entrance,
        transform: [
          {
            translateY: entrance.interpolate({
              inputRange: [0, 1],
              outputRange: [12, 0],
            }),
          },
        ],
      }}
    >
      <Slot />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
});