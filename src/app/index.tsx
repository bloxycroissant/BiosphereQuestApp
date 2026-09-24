import { GradientSafeAreaView as SafeAreaView } from "@/components/gradient-safe-area";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

const logo = require("../../assets/BiosphereQuestAssets/Biosphere Quest Logo.png");
const astro = require("../../assets/BiosphereQuestAssets/Astro (Biosphere Quest Mascot).png");
const stella = require("../../assets/BiosphereQuestAssets/Stella (Biosphere Quest Mascot).png");

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.mascots}>
          <Image source={astro} style={styles.mascot} contentFit="contain" />
          <Image source={logo} style={styles.logo} contentFit="contain" />
          <Image source={stella} style={styles.mascot} contentFit="contain" />
        </View>
        <Text style={styles.brand}>Biosphere Quest</Text>
        <Text style={styles.tagline}>
          Rocket your knowledge from Grade 1 to College
        </Text>
        <View style={styles.stats}>
          <Stat value="1.5M+" label="Learners" />
          <Stat value="10+" label="Courses" />
          <Stat value="2" label="Subjects" />
        </View>
        <WelcomeRow
          icon="🎓"
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
          icon="🏆"
          title="Quiz & Flashcards"
          subtitle="Test yourself and master every concept"
        />
        <Link href="/signup" asChild>
          <Pressable style={styles.primary}>
            <Text style={styles.primaryText}>Getting Started</Text>
          </Pressable>
        </Link>
        <Link href="/login" asChild>
          <Pressable style={styles.secondary}>
            <Text style={styles.secondaryText}>I already have an account</Text>
          </Pressable>
        </Link>
      </View>
    </SafeAreaView>
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
    <View style={styles.row}>
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
  secondary: {
    borderColor: "#6558df",
    borderWidth: 1,
    borderRadius: 9,
    alignItems: "center",
    padding: 13,
    marginTop: 14,
  },
  secondaryText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 14,
  },
});
