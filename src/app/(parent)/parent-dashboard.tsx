import { GradientSafeAreaView as SafeAreaView } from "@/components/gradient-safe-area";
import React, { useEffect, useState, useRef } from "react";
import { ScrollView, StyleSheet, Text, View, Animated, Switch, Pressable, Image, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

const STORAGE_KEY = '@biosphere_profile_data_v1';
const PARENT_CONTROLS_KEY = '@biosphere_parent_controls_v1';
const ALL_USERS_KEY = '@biosphere_all_users_v1'; // Keeps track of registered accounts for email surname matching
const logo = require("../../../assets/BiosphereQuestAssets/Biosphere Quest Logo.png");

export default function ParentDashboardScreen() {
  const [studentName, setStudentName] = useState("Explorer");
  const [parentName, setParentName] = useState("Parent");
  const [gradeLevel, setGradeLevel] = useState("Grade 4");
  const [xp, setXp] = useState(50);
  const [lessonsCompleted, setLessonsCompleted] = useState(0);
  const [streak, setStreak] = useState(0);
  const [quizAccuracy, setQuizAccuracy] = useState("94%");
  const [greeting, setGreeting] = useState("Good Morning");

  const [timeCapMinutes, setTimeCapMinutes] = useState(90); 
  const [bedtimeLockEnabled, setBedtimeLockEnabled] = useState(true);
  
  const [bedtimeHourNum, setBedtimeHourNum] = useState("2");
  const [bedtimeMinute, setBedtimeMinute] = useState("30");
  const [bedtimePeriod, setBedtimePeriod] = useState<"AM" | "PM">("PM");
  const bedtimeHour = `${bedtimeHourNum}:${bedtimeMinute} ${bedtimePeriod}`;

  const [studyFirstEnabled, setStudyFirstEnabled] = useState(true);
  
  const [gradeLocks, setGradeLocks] = useState<{ [key: string]: boolean }>({
    "Grade 1": true,
    "Grade 2": true,
    "Grade 3": true,
    "Grade 4": false,
    "Grade 5": true,
    "Grade 6": true,
  });

  const entrance = useRef(new Animated.Value(0)).current;

  // Animation scaling lookup maps for fluid tactile touch response
  const scaleAnims = useRef<{ [key: string]: Animated.Value }>({}).current;

  const getScaleAnim = (key: string) => {
    if (!scaleAnims[key]) {
      scaleAnims[key] = new Animated.Value(1);
    }
    return scaleAnims[key];
  };

  const animatePressIn = (key: string) => {
    Animated.spring(getScaleAnim(key), {
      toValue: 0.88,
      useNativeDriver: true,
      speed: 30,
      bounciness: 4,
    }).start();
  };

  const animatePressOut = (key: string) => {
    Animated.spring(getScaleAnim(key), {
      toValue: 1,
      friction: 4,
      tension: 50,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    Animated.spring(entrance, {
      toValue: 1,
      useNativeDriver: true,
      tension: 55,
      friction: 9,
    }).start();

    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      setGreeting("Good Morning");
    } else if (currentHour < 18) {
      setGreeting("Good Afternoon");
    } else {
      setGreeting("Good Evening");
    }

    loadStudentDataAndControls();
  }, []);

  const extractSurname = (email: string) => {
    if (!email || !email.includes("@")) return "";
    const namePart = email.split("@")[0].toLowerCase();
    return namePart.replace(/[^a-z]/g, "");
  };

  const loadStudentDataAndControls = async () => {
    try {
      const studentData = await AsyncStorage.getItem(STORAGE_KEY);
      let activeParentEmail = "";

      if (studentData) {
        const parsed = JSON.parse(studentData);
        if (parsed.name) setStudentName(parsed.name);
        if (parsed.parentName) setParentName(parsed.parentName);
        if (parsed.gradeYear) setGradeLevel(parsed.gradeYear);
        if (parsed.parentEmail) activeParentEmail = parsed.parentEmail;
        if (parsed.xp !== undefined) setXp(parsed.xp);
        if (parsed.lessons !== undefined) setLessonsCompleted(parsed.lessons);
        if (parsed.streak !== undefined) setStreak(parsed.streak);
        if (parsed.accuracy) setQuizAccuracy(`${parsed.accuracy}%`);
      }

      // Check multi-user repository to link student & parent by shared email last name / surname
      const allUsersStr = await AsyncStorage.getItem(ALL_USERS_KEY);
      if (allUsersStr) {
        const users = JSON.parse(allUsersStr);
        // Find current logged in parent profile name if available
        const currentParent = users.find((u: any) => u.role === 'parent' && u.email === activeParentEmail) || users.find((u: any) => u.role === 'parent');
        
        if (currentParent) {
          if (currentParent.name) setParentName(currentParent.name);
          
          // Match student based on shared last name (surname) inside email handles
          const parentSurname = extractSurname(currentParent.email);
          if (parentSurname) {
            const matchingStudent = users.find((u: any) => u.role === 'student' && extractSurname(u.email) === parentSurname);
            if (matchingStudent) {
              if (matchingStudent.name) setStudentName(matchingStudent.name);
              if (matchingStudent.gradeYear) setGradeLevel(matchingStudent.gradeYear);
            }
          }
        }
      }

      const controlsData = await AsyncStorage.getItem(PARENT_CONTROLS_KEY);
      if (controlsData) {
        const controls = JSON.parse(controlsData);
        if (controls.timeCapMinutes !== undefined) setTimeCapMinutes(controls.timeCapMinutes);
        if (controls.bedtimeLockEnabled !== undefined) setBedtimeLockEnabled(controls.bedtimeLockEnabled);
        if (controls.bedtimeHour) {
          parseAndSetBedtime(controls.bedtimeHour);
        }
        if (controls.studyFirstEnabled !== undefined) setStudyFirstEnabled(controls.studyFirstEnabled);
        if (controls.gradeLocks) setGradeLocks(controls.gradeLocks);
      }
    } catch (e) {
      console.error("Failed to load controls", e);
    }
  };

  const parseAndSetBedtime = (timeStr: string) => {
    try {
      const parts = timeStr.split(" ");
      if (parts.length === 2) {
        setBedtimePeriod(parts[1] === "AM" ? "AM" : "PM");
        const hm = parts[0].split(":");
        if (hm.length === 2) {
          setBedtimeHourNum(hm[0]);
          setBedtimeMinute(hm[1]);
        }
      }
    } catch (err) {
      console.error("Error parsing bedtime string", err);
    }
  };

  const saveParentControls = async (updatedSettings: object) => {
    try {
      const currentControls = {
        timeCapMinutes,
        bedtimeLockEnabled,
        bedtimeHour: `${bedtimeHourNum}:${bedtimeMinute} ${bedtimePeriod}`,
        studyFirstEnabled,
        gradeLocks,
        ...updatedSettings,
      };
      await AsyncStorage.setItem(PARENT_CONTROLS_KEY, JSON.stringify(currentControls));
    } catch (e) {
      console.error("Failed to save parent controls", e);
    }
  };

  const adjustTimeCap = (amountMinutes: number) => {
    const newCap = Math.max(30, timeCapMinutes + amountMinutes);
    setTimeCapMinutes(newCap);
    saveParentControls({ timeCapMinutes: newCap });
  };

  const toggleGradeLock = (grade: string) => {
    const updated = { ...gradeLocks, [grade]: !gradeLocks[grade] };
    setGradeLocks(updated);
    saveParentControls({ gradeLocks: updated });
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out of the Parent Portal?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", onPress: () => router.replace("/login" as any) },
    ]);
  };

  const handleChangePassword = () => {
    router.push("/forgot-password" as any);
  };

  const handleDeleteAccount = () => {
    Alert.alert("Delete Account", "Are you sure you want to delete this parent account?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          AsyncStorage.removeItem(PARENT_CONTROLS_KEY);
          router.replace("/login" as any);
        },
      },
    ]);
  };

  const formatTimeDisplay = (totalMinutes: number) => {
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const mins = totalMinutes % 60;

    if (days > 0) {
      return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
    } else if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}m`;
    }
  };

  return (
    <LinearGradient colors={["#090b20", "#28285e", "#0b4070"]} style={styles.background}>
      <SafeAreaView style={styles.safeArea}>
        <Animated.View 
          style={[
            { flex: 1 },
            {
              opacity: entrance,
              transform: [
                {
                  translateY: entrance.interpolate({
                    inputRange: [0, 1],
                    outputRange: [12, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.headerContainer}>
              <Image source={logo} style={styles.logo} resizeMode="contain" />
              <Text style={styles.brandTitle}>Biosphere Quest</Text>
              <Text style={styles.greetingText}>
                {greeting}, <Text style={{ color: "#e875f0" }}>{parentName}</Text>!
              </Text>
            </View>

            <View style={styles.headerCard}>
              <Text style={styles.welcomeTitle}>🛡️ Parental Dashboard & Controls</Text>
              <Text style={styles.welcomeSubtitle}>
                Monitoring <Text style={{ color: "#827eff", fontWeight: "900" }}>{studentName}</Text> ({gradeLevel})
              </Text>
            </View>

            <Text style={styles.sectionTitle}>Performance & Accuracy Reports</Text>
            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <Text style={styles.metricIcon}>⚡</Text>
                <Text style={styles.metricValue}>{xp} XP</Text>
                <Text style={styles.metricLabel}>Total XP Earned</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricIcon}>📚</Text>
                <Text style={styles.metricValue}>{lessonsCompleted}</Text>
                <Text style={styles.metricLabel}>Lessons Finished</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricIcon}>🔥</Text>
                <Text style={styles.metricValue}>{streak} Days</Text>
                <Text style={styles.metricLabel}>Learning Streak</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricIcon}>🎯</Text>
                <Text style={styles.metricValue}>{quizAccuracy}</Text>
                <Text style={styles.metricLabel}>Quiz Accuracy</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Screen Time Limits & Daily Caps</Text>
            <View style={styles.controlCard}>
              <View style={styles.controlRow}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.controlTitle}>Daily Time Cap</Text>
                  <Text style={styles.controlDesc}>Restricts app access when daily limit is reached</Text>
                </View>
                <Text style={[styles.timeValueText, { marginRight: 12 }]} numberOfLines={1}>
                  {formatTimeDisplay(timeCapMinutes)}
                </Text>
              </View>
              <View style={styles.buttonRow}>
                {(["-15m", "+15m", "-1hr", "+1hr"] as const).map((label, idx) => {
                  const animKey = `timeBtn_${idx}`;
                  const minutesValue = label === "-15m" ? -15 : label === "+15m" ? 15 : label === "-1hr" ? -60 : 60;

                  return (
                    <Animated.View key={label} style={{ flex: 1, transform: [{ scale: getScaleAnim(animKey) }] }}>
                      <Pressable 
                        style={styles.adjButton} 
                        onPressIn={() => animatePressIn(animKey)}
                        onPressOut={() => animatePressOut(animKey)}
                        onPress={() => adjustTimeCap(minutesValue)}
                      >
                        <Text style={styles.adjButtonText}>{label}</Text>
                      </Pressable>
                    </Animated.View>
                  );
                })}
              </View>
            </View>

            <Text style={styles.sectionTitle}>Bedtime & Scheduled Downtime</Text>
            <View style={styles.controlCard}>
              <View style={styles.controlRow}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={styles.controlTitle}>Bedtime Background Lock</Text>
                  <Text style={styles.controlDesc}>Locks app automatically after {bedtimeHour}</Text>
                </View>
                <Switch
                  value={bedtimeLockEnabled}
                  onValueChange={(val) => {
                    setBedtimeLockEnabled(val);
                    saveParentControls({ bedtimeLockEnabled: val });
                  }}
                  trackColor={{ false: "#374151", true: "#5857e4" }}
                  thumbColor="#ffffff"
                />
              </View>

              {/* Animated Hour Selector (1-12) */}
              <Text style={styles.subLabel}>Select Hour (1 - 12):</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScrollRow}>
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"].map((hr) => {
                  const isSelected = bedtimeHourNum === hr;
                  const animKey = `hr_${hr}`;

                  return (
                    <Animated.View key={hr} style={{ transform: [{ scale: getScaleAnim(animKey) }] }}>
                      <Pressable
                        style={[styles.timeBadgeCircle, isSelected && styles.timeBadgeActive]}
                        onPressIn={() => animatePressIn(animKey)}
                        onPressOut={() => animatePressOut(animKey)}
                        onPress={() => {
                          setBedtimeHourNum(hr);
                          saveParentControls({ bedtimeHour: `${hr}:${bedtimeMinute} ${bedtimePeriod}` });
                        }}
                      >
                        <Text style={[styles.timeBadgeText, isSelected && styles.timeBadgeTextActive]}>{hr}</Text>
                      </Pressable>
                    </Animated.View>
                  );
                })}
              </ScrollView>

              {/* Minute & AM/PM Animated Selectors */}
              <View style={styles.pickerSubRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.subLabel}>Minutes:</Text>
                  <View style={styles.buttonRow}>
                    {["00", "15", "30", "45"].map((min) => {
                      const isSelected = bedtimeMinute === min;
                      const animKey = `min_${min}`;

                      return (
                        <Animated.View key={min} style={{ flex: 1, transform: [{ scale: getScaleAnim(animKey) }] }}>
                          <Pressable
                            style={[styles.smallBadge, isSelected && styles.timeBadgeActive]}
                            onPressIn={() => animatePressIn(animKey)}
                            onPressOut={() => animatePressOut(animKey)}
                            onPress={() => {
                              setBedtimeMinute(min);
                              saveParentControls({ bedtimeHour: `${bedtimeHourNum}:${min} ${bedtimePeriod}` });
                            }}
                          >
                            <Text style={[styles.timeBadgeText, isSelected && styles.timeBadgeTextActive]}>{min}</Text>
                          </Pressable>
                        </Animated.View>
                      );
                    })}
                  </View>
                </View>

                <View style={{ width: 110, marginLeft: 12 }}>
                  <Text style={styles.subLabel}>AM / PM:</Text>
                  <View style={styles.buttonRow}>
                    {(["AM", "PM"] as const).map((period) => {
                      const isSelected = bedtimePeriod === period;
                      const animKey = `period_${period}`;

                      return (
                        <Animated.View key={period} style={{ flex: 1, transform: [{ scale: getScaleAnim(animKey) }] }}>
                          <Pressable
                            style={[styles.smallBadge, isSelected && styles.timeBadgeActive]}
                            onPressIn={() => animatePressIn(animKey)}
                            onPressOut={() => animatePressOut(animKey)}
                            onPress={() => {
                              setBedtimePeriod(period);
                              saveParentControls({ bedtimeHour: `${bedtimeHourNum}:${bedtimeMinute} ${period}` });
                            }}
                          >
                            <Text style={[styles.timeBadgeText, isSelected && styles.timeBadgeTextActive]}>{period}</Text>
                          </Pressable>
                        </Animated.View>
                      );
                    })}
                  </View>
                </View>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Study-First Unlock Mechanics</Text>
            <View style={styles.controlCard}>
              <View style={styles.controlRow}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={styles.controlTitle}>Lessons Before Games</Text>
                  <Text style={styles.controlDesc}>Requires completing lessons before unlocking mini-games</Text>
                </View>
                <Switch
                  value={studyFirstEnabled}
                  onValueChange={(val) => {
                    setStudyFirstEnabled(val);
                    saveParentControls({ studyFirstEnabled: val });
                  }}
                  trackColor={{ false: "#374151", true: "#5857e4" }}
                  thumbColor="#ffffff"
                />
              </View>
            </View>

            <Text style={styles.sectionTitle}>Grade-Level Content Filter Locking</Text>
            <View style={styles.controlCard}>
              <Text style={[styles.controlDesc, { color: "#94a3b8", marginBottom: 8, fontSize: 11 }]}>
                Lock or unlock specific grade curriculum (Student is currently in {gradeLevel}):
              </Text>
              <View style={styles.gradesGrid}>
                {["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6"].map((grade) => {
                  const isLocked = gradeLocks[grade];
                  const animKey = `grade_${grade}`;

                  return (
                    <Animated.View key={grade} style={{ width: "31%", transform: [{ scale: getScaleAnim(animKey) }] }}>
                      <Pressable
                        style={[styles.gradeToggleBtn, isLocked ? styles.gradeLocked : styles.gradeUnlocked]}
                        onPressIn={() => animatePressIn(animKey)}
                        onPressOut={() => animatePressOut(animKey)}
                        onPress={() => toggleGradeLock(grade)}
                      >
                        <Text style={styles.gradeToggleText}>
                          {grade} {isLocked ? "🔒" : "🔓"}
                        </Text>
                      </Pressable>
                    </Animated.View>
                  );
                })}
              </View>
            </View>

            <Text style={styles.sectionTitle}>⚙️ Account Actions</Text>
            <View style={styles.actionCard}>
              <Pressable style={styles.actionRow} onPress={handleChangePassword}>
                <Text style={styles.actionText}>Change Password</Text>
                <Text style={styles.actionArrow}>→</Text>
              </Pressable>
              <Pressable style={styles.actionRow} onPress={handleLogout}>
                <Text style={[styles.actionText, { color: "#facc15" }]}>Log Out</Text>
                <Text style={[styles.actionArrow, { color: "#facc15" }]}>→</Text>
              </Pressable>
              <Pressable style={[styles.actionRow, { borderBottomWidth: 0 }]} onPress={handleDeleteAccount}>
                <Text style={[styles.actionText, { color: "#ff3e58" }]}>Delete Account</Text>
                <Text style={[styles.actionArrow, { color: "#ff3e58" }]}>→</Text>
              </Pressable>
            </View>
          </ScrollView>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: "transparent" },
  container: { padding: 20, gap: 14, paddingBottom: 40 },
  headerContainer: { alignItems: "center", marginBottom: 4 },
  logo: { width: 50, height: 50, marginBottom: 4 },
  brandTitle: { color: "#7564f4", fontSize: 16, fontWeight: "900", textAlign: "center", marginBottom: 2 },
  greetingText: { color: "#fff", fontSize: 18, fontWeight: "900", textAlign: "center", marginBottom: 8 },
  headerCard: {
    backgroundColor: "rgba(31, 41, 66, 0.8)",
    borderColor: "#374151",
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
  },
  welcomeTitle: { color: "#fff", fontSize: 20, fontWeight: "900", marginBottom: 4 },
  welcomeSubtitle: { color: "#94a3b8", fontSize: 13, fontWeight: "600" },
  sectionTitle: { color: "#fff", fontSize: 16, fontWeight: "900", marginTop: 6 },
  metricsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  metricCard: {
    width: "48%",
    backgroundColor: "rgba(23, 40, 73, 0.8)",
    borderColor: "#374151",
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    gap: 4,
  },
  metricIcon: { fontSize: 22 },
  metricValue: { color: "#e875f0", fontSize: 18, fontWeight: "900" },
  metricLabel: { color: "#94a3b8", fontSize: 10, fontWeight: "800", textAlign: "center" },
  controlCard: {
    backgroundColor: "rgba(31, 41, 66, 0.8)",
    borderColor: "#374151",
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  controlRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  controlTitle: { color: "#fff", fontSize: 14, fontWeight: "800", marginBottom: 2 },
  controlDesc: { color: "#94a3b8", fontSize: 11, fontWeight: "600" },
  subLabel: { color: "#cbd5e1", fontSize: 12, fontWeight: "800", marginTop: 4, marginBottom: 4 },
  timeValueText: { color: "#4ade80", fontSize: 16, fontWeight: "900" },
  buttonRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  horizontalScrollRow: { gap: 6, paddingVertical: 4 },
  pickerSubRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 2 },
  adjButton: {
    backgroundColor: "#36377e",
    borderColor: "#625cff",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  adjButtonText: { color: "#fff", fontSize: 11, fontWeight: "900" },
  timeBadgeCircle: {
    width: 38,
    height: 38,
    backgroundColor: "#1f2942",
    borderColor: "#374151",
    borderWidth: 1,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
  smallBadge: {
    backgroundColor: "#1f2942",
    borderColor: "#374151",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
  },
  timeBadgeActive: {
    backgroundColor: "#5857e4",
    borderColor: "#827eff",
  },
  timeBadgeText: { color: "#94a3b8", fontSize: 11, fontWeight: "800" },
  timeBadgeTextActive: { color: "#ffffff", fontWeight: "900" },
  gradesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  gradeToggleBtn: {
    width: "100%",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
  },
  gradeLocked: {
    backgroundColor: "rgba(127, 29, 29, 0.4)",
    borderColor: "#f87171",
  },
  gradeUnlocked: {
    backgroundColor: "rgba(20, 83, 45, 0.4)",
    borderColor: "#4ade80",
  },
  gradeToggleText: { color: "#fff", fontSize: 11, fontWeight: "900" },
  actionCard: {
    backgroundColor: "rgba(31, 41, 66, 0.8)",
    borderColor: "#374151",
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  actionText: { color: "#fff", fontSize: 14, fontWeight: "800" },
  actionArrow: { color: "#fff", fontSize: 16, fontWeight: "900" },
});