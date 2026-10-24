import { GradientSafeAreaView as SafeAreaView } from "@/components/gradient-safe-area";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const logo = require("../../assets/BiosphereQuestAssets/Biosphere Quest Logo.png");
const astro = require("../../assets/BiosphereQuestAssets/Astro (Biosphere Quest Mascot).png");
const stella = require("../../assets/BiosphereQuestAssets/Stella (Biosphere Quest Mascot).png");

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const STAR_COUNT = 10;
const ASTRONAUT_COUNT = 10;

export default function WelcomeScreen() {
  const [isChecking, setIsChecking] = useState(true);

  const astroY = useRef(new Animated.Value(0)).current;
  const stellaY = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const [hasName, hasProfile, subjectsRaw] = await Promise.all([
          AsyncStorage.getItem("explorerName"),
          AsyncStorage.getItem("@biosphere_profile_data_v1"),
          AsyncStorage.getItem("explorerSubjects"),
        ]);

        let parsedSubjects: string[] = [];
        if (subjectsRaw) {
          try {
            parsedSubjects = JSON.parse(subjectsRaw);
          } catch {
            parsedSubjects = [];
          }
        }

        if (
          hasName &&
          hasProfile &&
          Array.isArray(parsedSubjects) &&
          parsedSubjects.length >= 2
        ) {
          router.replace("/home" as any);
        } else {
          setIsChecking(false);
        }
      } catch (e) {
        console.error("Failed to check status", e);
        setIsChecking(false);
      }
    };

    checkOnboardingStatus();
  }, []);

  useEffect(() => {
    if (isChecking) return;

    Animated.loop(
      Animated.sequence([
        Animated.timing(astroY, {
          toValue: -8,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(astroY, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(stellaY, {
          toValue: -10,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(stellaY, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(buttonScale, {
          toValue: 1.03,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(buttonScale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [isChecking, astroY, stellaY, buttonScale]);

  if (isChecking) {
    return <SafeAreaView style={styles.safeArea} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {Array.from({ length: STAR_COUNT }).map((_, index) => (
          <FloatingElement key={`star-${index}`} emoji="⭐" size={22} />
        ))}
        {Array.from({ length: ASTRONAUT_COUNT }).map((_, index) => (
          <FloatingElement key={`astro-${index}`} emoji="🧑‍🚀" size={26} />
        ))}
      </View>

      <View style={styles.content} pointerEvents="box-none">
        <View style={styles.mascots} pointerEvents="none">
          <Animated.View style={{ transform: [{ translateY: astroY }] }}>
            <Image source={astro} style={styles.mascot} contentFit="contain" />
          </Animated.View>

          <Image source={logo} style={styles.logo} contentFit="contain" />

          <Animated.View style={{ transform: [{ translateY: stellaY }] }}>
            <Image source={stella} style={styles.mascot} contentFit="contain" />
          </Animated.View>
        </View>

        <Text style={styles.brand} pointerEvents="none">
          Biosphere Quest
        </Text>
        <Text style={styles.tagline} pointerEvents="none">
          Rocket your knowledge from Grade 1 to Grade 6
        </Text>

        <View style={styles.stats} pointerEvents="none">
          <Stat value="1.5M+" label="Learners" />
          <Stat value="10+" label="Courses" />
          <Stat value="2" label="Subjects" />
        </View>

        <WelcomeRow
          icon="🚀"
          title="Grade 1 to Grade 6"
          subtitle="Basic Math, and Science"
        />
        <WelcomeRow
          icon="🎮"
          title="Gamified Learning"
          subtitle="Earn XP, unlock badges, climb leaderboards"
        />
        <WelcomeRow
          icon="📅"
          title="Study Scheduler"
          subtitle="Plan sessions and track your progress"
        />
        <WelcomeRow
          icon="💡"
          title="Quiz & Flashcards"
          subtitle="Test yourself and master every concept"
        />

        <Animated.View
          pointerEvents="auto"
          style={{ transform: [{ scale: buttonScale }] }}
        >
          <Pressable
            style={styles.primary}
            onPress={() => router.push("/welcome" as any)}
          >
            <Text style={styles.primaryText}>Getting Started</Text>
          </Pressable>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

function FloatingElement({ emoji, size }: { emoji: string; size: number }) {
  const posX = useRef(
    new Animated.Value(Math.random() * (SCREEN_WIDTH - 40))
  ).current;
  const posY = useRef(
    new Animated.Value(Math.random() * (SCREEN_HEIGHT - 60))
  ).current;
  const scale = useRef(new Animated.Value(Math.random() * 0.4 + 0.7)).current;
  const opacity = useRef(new Animated.Value(Math.random() * 0.6 + 0.4)).current;
  const [isPopped, setIsPopped] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const floatAnimation = () => {
      if (!isMounted) return;

      const newX = Math.random() * (SCREEN_WIDTH - 40);
      const newY = Math.random() * (SCREEN_HEIGHT - 60);
      const duration = 4000 + Math.random() * 5000;

      Animated.parallel([
        Animated.timing(posX, {
          toValue: newX,
          duration,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(posY, {
          toValue: newY,
          duration,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (isMounted && !isPopped) {
          floatAnimation();
        }
      });
    };

    floatAnimation();

    return () => {
      isMounted = false;
    };
  }, [isPopped, posX, posY]);

  const handlePop = () => {
    if (isPopped) return;
    setIsPopped(true);

    Animated.parallel([
      Animated.timing(scale, {
        toValue: 2.2,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      posX.setValue(Math.random() * (SCREEN_WIDTH - 40));
      posY.setValue(Math.random() * (SCREEN_HEIGHT - 60));
      scale.setValue(Math.random() * 0.4 + 0.7);
      opacity.setValue(Math.random() * 0.6 + 0.4);
      setIsPopped(false);
    });
  };

  return (
    <Animated.View
      pointerEvents="auto"
      style={[
        styles.floatingContainer,
        {
          transform: [
            { translateX: posX },
            { translateY: posY },
            { scale: scale },
          ],
          opacity: opacity,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.6}
        onPress={handlePop}
        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
      >
        <Text style={{ fontSize: size }}>{emoji}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function WelcomeRow({
  icon,
  title,
  subtitle,
}: {
  icon: string;
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.row} pointerEvents="none">
      <Text style={styles.rowIcon}>{icon}</Text>
      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  mascots: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 2,
  },
  mascot: {
    width: 82,
    height: 125,
  },
  logo: {
    width: 136,
    height: 136,
    marginHorizontal: -4,
  },
  brand: {
    color: "#9d76ff",
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 2,
  },
  tagline: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 2,
  },
  stats: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginTop: 18,
    marginBottom: 18,
  },
  stat: {
    width: 78,
    height: 62,
    borderWidth: 1,
    borderColor: "#d9d8df",
    borderRadius: 17,
    backgroundColor: "#676887",
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
  },
  statLabel: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#425a9b",
    borderColor: "#6381ef",
    borderWidth: 1,
    borderRadius: 9,
    padding: 9,
    marginTop: 10,
  },
  rowIcon: {
    fontSize: 25,
    width: 38,
    textAlign: "center",
  },
  rowCopy: {
    marginLeft: 8,
  },
  rowTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
  },
  rowSubtitle: {
    color: "#fff",
    fontSize: 10,
    marginTop: 2,
  },
  primary: {
    backgroundColor: "#6258ff",
    borderRadius: 9,
    alignItems: "center",
    padding: 14,
    marginTop: 25,
  },
  primaryText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 15,
  },
  floatingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
  },
});