import { GradientSafeAreaView as SafeAreaView } from "@/components/gradient-safe-area";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";

export default function ParentDashboard() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.greeting}>🛡️ Parent Control Center</Text>
          <Text style={styles.subtext}>Monitoring Captain Alex's Mission</Text>
        </View>

        {/* Quick Stats Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Daily Screen Time</Text>
          <Text style={styles.statValue}>45 mins / 60 mins</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: "75%" }]} />
          </View>
        </View>

        {/* Recent Quests Feed */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent Activity</Text>
          <View style={styles.activityRow}>
            <Text style={styles.activityText}>🔢 Basic Math Quiz</Text>
            <Text style={styles.scoreText}>90% (Mastered)</Text>
          </View>
        </View>

        <Pressable style={styles.actionButton} onPress={() => alert("Screen time paused!")}>
          <Text style={styles.actionButtonText}>⏸️ Pause Child's Device</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#091426" },
  container: { padding: 20, gap: 14 },
  header: { marginBottom: 10 },
  greeting: { color: "#fff", fontSize: 22, fontWeight: "900" },
  subtext: { color: "#c7d0e8", fontSize: 12, marginTop: 2 },
  card: {
    backgroundColor: "#131f38",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#26355d",
    gap: 8,
  },
  cardTitle: { color: "#9af2bc", fontSize: 12, fontWeight: "900" },
  statValue: { color: "#fff", fontSize: 18, fontWeight: "800" },
  progressBarBg: { height: 8, backgroundColor: "#1b2a4e", borderRadius: 4, overflow: "hidden" },
  progressBarFill: { height: "100%", backgroundColor: "#5857e4" },
  activityRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  activityText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  scoreText: { color: "#63e1e8", fontSize: 13, fontWeight: "800" },
  actionButton: {
    backgroundColor: "#e582ff",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginTop: 10,
  },
  actionButtonText: { color: "#091426", fontSize: 14, fontWeight: "900" },
});