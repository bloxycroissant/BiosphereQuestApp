import {
  curriculum,
  type Lesson,
  type Subject,
} from "@/app/components/curriculum";
import { GradientSafeAreaView as SafeAreaView } from "@/components/gradient-safe-area";
import { useProgress } from "@/hooks/use-progress";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Href, router, useFocusEffect, usePathname } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  ImageSourcePropType,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import InteractiveLessonViewer from "./components/InteractiveLessonViewer";

const STORAGE_KEY = "@biosphere_profile_data_v1";
const PARENT_CONTROLS_KEY = "@biosphere_parent_controls_v1";
const COMPLETED_LESSONS_KEY = "@biosphere_completed_lessons_v1";

const astro = require("../../assets/BiosphereQuestAssets/Astro (Biosphere Quest Mascot).png");
const homeIcon = require("../../assets/BiosphereQuestAssets/Home Icon.png");
const coursesIcon = require("../../assets/BiosphereQuestAssets/Courses Icon.png");
const gamesIcon = require("../../assets/BiosphereQuestAssets/Games Icon.png");
const profileIcon = require("../../assets/BiosphereQuestAssets/Profile Icon.png");

const tabs = [
  { label: "Home", route: "/home", icon: homeIcon },
  { label: "Courses", route: "/explore", icon: coursesIcon },
  { label: "Games", route: "/games", icon: gamesIcon },
  { label: "Profile", route: "/profile", icon: profileIcon },
] as const;

const subjectDescriptions: Record<string, string> = {
  Math: "Master numbers, geometry, and real-world calculation skills.",
  Matter: "Investigate solids, liquids, gases, and material properties.",
  "Living Things & Environment":
    "Discover living habitats, sensory organs, and plant & animal biology.",
  "Force, Motion, & Energy":
    "Uncover the secrets of pushes, pulls, magnetism, and energy transfers.",
  "Earth & Space":
    "Study weather systems, natural resources, rocks, and celestial bodies.",
};

const learnerOutcomes: Record<string, string[]> = {
  Math: [
    "Build strong number sense and operational fluency.",
    "Identify geometric shapes, patterns, and spatial relations.",
    "Apply mathematical reasoning to solve daily problems.",
  ],
  Matter: [
    "Classify materials by observable physical properties and states.",
    "Understand heating, cooling, melting, and state changes.",
    "Learn safe sorting, absorption, and eco-friendly material handling.",
  ],
  "Living Things & Environment": [
    "Identify body organs and their specialized sensory functions.",
    "Explain how living things interact with and adapt to their habitats.",
    "Recognize lifecycles, plant structures, and environmental care.",
  ],
  "Force, Motion, & Energy": [
    "Explain how forces start, stop, and alter an object's speed or shape.",
    "Investigate everyday light, sound, heat, and electrical circuits.",
    "Discover how simple machines and magnetic forces make work easier.",
  ],
  "Earth & Space": [
    "Observe and record daily weather conditions and safety protocols.",
    "Differentiate soil, rock, landforms, and freshwater bodies.",
    "Track cyclical movements of the Sun, Moon, and starry sky.",
  ],
};

export default function ExploreScreen(): React.JSX.Element {
  const { completeLesson } = useProgress();
  const [grade, setGrade] = useState(1);
  const [activeSubject, setActiveSubject] = useState<Subject | null>(null);
  const [selected, setSelected] = useState<{
    subject: Subject;
    lesson: Lesson;
  } | null>(null);

  const [completedLessonKeys, setCompletedLessonKeys] = useState<string[]>([]);

  const screenTransition = React.useMemo(() => new Animated.Value(0), []);
  const transitionInProgress = useRef(false);

  const loadCompletedLessons = async (): Promise<void> => {
    try {
      const data = await AsyncStorage.getItem(COMPLETED_LESSONS_KEY);
      if (data) {
        setCompletedLessonKeys(JSON.parse(data));
      }
    } catch (e) {
      console.error("Failed to load completed lessons", e);
    }
  };

  const markLessonCompleted = async (
    subjectTitle: string,
    lessonTitle: string,
  ): Promise<void> => {
    const key = `${grade}_${subjectTitle}_${lessonTitle}`;
    if (!completedLessonKeys.includes(key)) {
      const updated = [...completedLessonKeys, key];
      setCompletedLessonKeys(updated);
      try {
        await AsyncStorage.setItem(
          COMPLETED_LESSONS_KEY,
          JSON.stringify(updated),
        );
      } catch (e) {
        console.error("Failed to save completed lesson key", e);
      }
    }
  };

  const openLesson = (subject: Subject, lesson: Lesson): void => {
    if (transitionInProgress.current || selected) return;
    transitionInProgress.current = true;
    screenTransition.setValue(0);
    setSelected({ subject, lesson });

    requestAnimationFrame(() => {
      Animated.timing(screenTransition, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        transitionInProgress.current = false;
      });
    });
  };

  const finishLesson = (xpReward?: number): void => {
    if (transitionInProgress.current || !selected) return;

    transitionInProgress.current = true;
    Animated.timing(screenTransition, {
      toValue: 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        if (xpReward !== undefined) {
          void completeLesson(15, xpReward);
          void markLessonCompleted(
            selected.subject.title,
            selected.lesson.title,
          );
        }
        setSelected(null);
      }
      transitionInProgress.current = false;
    });
  };

  const closeLesson = (): void => finishLesson();

  const lessonScreenOpacity = screenTransition;
  const lessonScreenScale = screenTransition.interpolate({
    inputRange: [0, 1],
    outputRange: [0.985, 1],
  });

  const fetchActiveGrade = async (): Promise<void> => {
    try {
      const parentData = await AsyncStorage.getItem(PARENT_CONTROLS_KEY);
      let locks: Record<string, boolean> = {};
      if (parentData) {
        const controls = JSON.parse(parentData);
        if (controls.gradeLocks) {
          locks = controls.gradeLocks;
        }
      }

      const profileData = await AsyncStorage.getItem(STORAGE_KEY);
      let targetGrade = 1;

      if (profileData) {
        const parsed = JSON.parse(profileData);
        if (parsed.gradeYear) {
          const match = parsed.gradeYear.match(/\d+/);
          if (match) targetGrade = parseInt(match[0], 10);
        }
      } else {
        const guestGrade = await AsyncStorage.getItem("explorerGrade");
        if (guestGrade) targetGrade = parseInt(guestGrade, 10);
      }

      if (!isNaN(targetGrade) && targetGrade >= 1 && targetGrade <= 6) {
        if (locks[`Grade ${targetGrade}`]) {
          Alert.alert(
            "Grade Locked",
            `Grade ${targetGrade} curriculum has been locked by parental controls.`,
          );
        } else {
          setGrade(targetGrade);
        }
      }
    } catch (e) {
      console.error("Error reading saved grade in explore", e);
    }
  };

  useEffect(() => {
    void fetchActiveGrade();
    void loadCompletedLessons();
  }, []);

  useFocusEffect(
    useCallback(() => {
      void fetchActiveGrade();
      void loadCompletedLessons();
    }, []),
  );

  const handleBack = (): void => {
    if (selected) {
      closeLesson();
      return;
    }
    if (activeSubject) {
      setActiveSubject(null);
      return;
    }
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/home" as Href);
    }
  };

  const subjects = curriculum[grade] || [];

  return (
    <View style={styles.screenContainer}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.content,
            activeSubject && { paddingBottom: 30 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Pressable onPress={handleBack}>
              <Text style={styles.back}>Back</Text>
            </Pressable>
            <View style={styles.headerTitle}>
              <Image source={astro} style={styles.headerMascot} />
              <Text style={styles.title}>
                {activeSubject ? activeSubject.title : "My Courses"}
              </Text>
            </View>
          </View>

          <View style={styles.activeGradeBanner}>
            <View>
              <Text style={styles.activeGradeBadge}>GRADE {grade} SCHOLAR</Text>
              <Text style={styles.activeGradeSubtitle}>
                Active Math & Science Curriculum
              </Text>
            </View>
            <Pressable
              style={styles.changeGradeBtn}
              onPress={() => router.push("/settings" as Href)}
            >
              <Text style={styles.changeGradeText}>Change ⚙️</Text>
            </Pressable>
          </View>

          {!activeSubject && (
            <View style={styles.categoriesContainer}>
              <Text style={styles.sectionHeading}>
                CHOOSE A LEARNING DOMAIN
              </Text>
              {subjects.map((subj, index) => {
                const completedCount = subj.lessons.filter((lesson) =>
                  completedLessonKeys.includes(
                    `${grade}_${subj.title}_${lesson.title}`,
                  ),
                ).length;

                return (
                  <Pressable
                    key={`${subj.title}-${index}`}
                    style={styles.categoryCardPressable}
                    onPress={() => setActiveSubject(subj)}
                  >
                    <LinearGradient
                      colors={[subj.color + "38", subj.color + "12", "#0f1a34"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[
                        styles.categoryCardGradient,
                        { borderColor: subj.color },
                      ]}
                    >
                      <View style={styles.categoryCardTop}>
                        <View
                          style={[
                            styles.categoryIconBubble,
                            {
                              backgroundColor: subj.color + "28",
                              borderColor: subj.color + "66",
                            },
                          ]}
                        >
                          <Text style={styles.categoryIcon}>{subj.icon}</Text>
                        </View>
                        <View style={styles.categoryMeta}>
                          <Text style={styles.categoryTitle}>{subj.title}</Text>
                          <Text style={styles.categoryLessonCount}>
                            {completedCount} / {subj.lessons.length} Missions
                            Completed
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.categoryArrowBadge,
                            {
                              backgroundColor: subj.color + "33",
                              borderColor: subj.color + "66",
                            },
                          ]}
                        >
                          <Text style={styles.categoryArrow}>Open</Text>
                        </View>
                      </View>
                      <Text style={styles.categoryDescription}>
                        {subjectDescriptions[subj.title] ||
                          "Explore essential lessons and interactive quests."}
                      </Text>
                    </LinearGradient>
                  </Pressable>
                );
              })}
            </View>
          )}

          {activeSubject && (
            <View style={styles.missionsContainer}>
              <LinearGradient
                colors={[
                  activeSubject.color + "35",
                  activeSubject.color + "10",
                  "#101b36",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.outcomesCard,
                  { borderColor: activeSubject.color },
                ]}
              >
                <View style={styles.outcomesHeader}>
                  <Text style={styles.outcomesHeaderIcon}>🎯</Text>
                  <Text style={styles.outcomesHeaderTitle}>
                    Learner Outcomes
                  </Text>
                </View>
                <Text style={styles.outcomesSub}>
                  By the end of this domain, students will:
                </Text>
                {(
                  learnerOutcomes[activeSubject.title] || [
                    "Explore foundational principles.",
                    "Practice hands-on concepts with instant quizzes.",
                  ]
                ).map((outcome, oIdx) => (
                  <View key={oIdx} style={styles.outcomeRow}>
                    <Text
                      style={[
                        styles.outcomeBullet,
                        { color: activeSubject.color },
                      ]}
                    >
                      ✦
                    </Text>
                    <Text style={styles.outcomeText}>{outcome}</Text>
                  </View>
                ))}
              </LinearGradient>

              <Text style={styles.sectionHeading}>MISSION TRACK</Text>

              {activeSubject.lessons.map((lesson, idx) => {
                const isCompleted = completedLessonKeys.includes(
                  `${grade}_${activeSubject.title}_${lesson.title}`,
                );
                const isPreviousCompleted =
                  idx === 0 ||
                  completedLessonKeys.includes(
                    `${grade}_${activeSubject.title}_${activeSubject.lessons[idx - 1].title}`,
                  );
                const isUnlocked = isPreviousCompleted;

                return (
                  <Pressable
                    key={`${activeSubject.title}-${lesson.title}-${idx}`}
                    style={styles.lessonPressable}
                    onPress={() => {
                      if (!isUnlocked) {
                        Alert.alert(
                          "Mission Locked",
                          `Complete Mission ${idx} to unlock "${lesson.title}"!`,
                        );
                        return;
                      }
                      openLesson(activeSubject, lesson);
                    }}
                  >
                    <LinearGradient
                      colors={
                        isCompleted
                          ? ["#133334", "#0e222a"]
                          : isUnlocked
                            ? [
                                activeSubject.color + "28",
                                activeSubject.color + "0d",
                                "#152445",
                              ]
                            : ["#101a31", "#0b1222"]
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[
                        styles.lessonCard,
                        !isUnlocked && styles.lessonCardLocked,
                        isCompleted && styles.lessonCardCompleted,
                        isUnlocked &&
                          !isCompleted && {
                            borderColor: activeSubject.color + "66",
                          },
                      ]}
                    >
                      <View
                        style={[
                          styles.lessonBadge,
                          !isUnlocked && styles.lessonBadgeLocked,
                          isCompleted && styles.lessonBadgeCompleted,
                          isUnlocked &&
                            !isCompleted && {
                              backgroundColor: activeSubject.color,
                            },
                        ]}
                      >
                        <Text style={styles.lessonBadgeText}>
                          {isCompleted ? "✓" : isUnlocked ? `${idx + 1}` : "🔒"}
                        </Text>
                      </View>

                      <View style={styles.lessonDetails}>
                        <Text
                          style={[
                            styles.lessonCardTitle,
                            !isUnlocked && styles.lessonCardTitleLocked,
                          ]}
                        >
                          {lesson.title}
                        </Text>
                        <Text style={styles.lessonCardSubtitle}>
                          {isCompleted
                            ? "Completed (+15 XP earned)"
                            : isUnlocked
                              ? `${lesson.difficulty} Mission • Ready to Explore`
                              : "Locked Mission"}
                        </Text>
                      </View>

                      <Text
                        style={[
                          styles.lessonCardArrow,
                          !isUnlocked && { opacity: 0.3 },
                        ]}
                      >
                        {isUnlocked ? "Play" : "Locked"}
                      </Text>
                    </LinearGradient>
                  </Pressable>
                );
              })}
            </View>
          )}
        </ScrollView>

        {!activeSubject && <BottomNavigation />}
      </SafeAreaView>

      {selected && (
        <Animated.View
          style={[
            styles.screenLayer,
            {
              opacity: lessonScreenOpacity,
              transform: [{ scale: lessonScreenScale }],
            },
          ]}
        >
          <View style={styles.fullScreenWrapper}>
            <InteractiveLessonViewer
              gradeLevel={grade}
              initialSubject={selected.subject}
              initialLesson={selected.lesson}
              onBack={closeLesson}
              onComplete={(xpReward) => finishLesson(xpReward)}
            />
          </View>
        </Animated.View>
      )}
    </View>
  );
}

function BottomNavigation(): React.JSX.Element {
  const pathname = usePathname();
  return (
    <View style={navStyles.navigation}>
      {tabs.map((tab) => {
        const active =
          pathname === tab.route ||
          (tab.route === "/explore" && pathname.includes("explore"));
        return (
          <NavigationItem
            key={tab.route}
            label={tab.label}
            icon={tab.icon}
            active={active}
            onPress={() => router.replace(tab.route as Href)}
          />
        );
      })}
    </View>
  );
}

function NavigationItem({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon: ImageSourcePropType;
  active: boolean;
  onPress: () => void;
}): React.JSX.Element {
  const motion = useRef(new Animated.Value(active ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(motion, {
      toValue: active ? 1 : 0,
      useNativeDriver: true,
      tension: 70,
      friction: 8,
    }).start();
  }, [active, motion]);

  const iconScale = motion.interpolate({
    inputRange: [0, 1],
    outputRange: [0.92, 1.04],
  });
  const iconLift = motion.interpolate({
    inputRange: [0, 1],
    outputRange: [2, -1],
  });

  return (
    <Pressable onPress={onPress} style={navStyles.tab}>
      <Animated.View
        style={[navStyles.activeBackground, { opacity: motion }]}
      />
      <Animated.View
        style={{ transform: [{ scale: iconScale }, { translateY: iconLift }] }}
      >
        <Image source={icon} style={navStyles.icon} contentFit="contain" />
      </Animated.View>
      <Text style={navStyles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screenContainer: { flex: 1, backgroundColor: "#091426" },
  screenLayer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#091426",
    zIndex: 100,
    elevation: 10,
  },
  fullScreenWrapper: {
    flex: 1,
    backgroundColor: "#091426",
  },
  safeArea: { flex: 1, backgroundColor: "#091426" },
  scrollView: {
    flex: 1,
    ...Platform.select({
      web: {
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      },
    }),
  },
  content: { padding: 18, paddingBottom: 95 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  back: { color: "#e582ff", fontWeight: "800", fontSize: 14 },
  headerTitle: { flexDirection: "row", alignItems: "center", gap: 7 },
  headerMascot: { width: 40, height: 40 },
  title: { color: "#fff", fontWeight: "900", fontSize: 21 },
  activeGradeBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#132347",
    borderColor: "#284382",
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginVertical: 14,
  },
  activeGradeBadge: {
    color: "#ffd05a",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  activeGradeSubtitle: {
    color: "#a6b9dd",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  changeGradeBtn: {
    backgroundColor: "#203463",
    borderColor: "#4a69ad",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  changeGradeText: { color: "#ffffff", fontSize: 11, fontWeight: "800" },
  sectionHeading: {
    color: "#8199cb",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: 4,
  },
  categoriesContainer: {
    gap: 12,
  },
  categoryCardPressable: {
    borderRadius: 18,
    overflow: "hidden",
  },
  categoryCardGradient: {
    borderWidth: 1.5,
    borderRadius: 18,
    padding: 16,
  },
  categoryCardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  categoryIconBubble: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryIcon: {
    fontSize: 26,
  },
  categoryMeta: {
    flex: 1,
  },
  categoryTitle: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "900",
  },
  categoryLessonCount: {
    color: "#dfd6c9",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
  },
  categoryArrowBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryArrow: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800",
  },
  categoryDescription: {
    color: "#c3d3f5",
    fontSize: 12.5,
    lineHeight: 18,
    marginTop: 10,
  },
  missionsContainer: {
    gap: 10,
  },
  outcomesCard: {
    borderWidth: 1.5,
    borderRadius: 18,
    padding: 16,
    marginBottom: 8,
  },
  outcomesHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  outcomesHeaderIcon: {
    fontSize: 18,
  },
  outcomesHeaderTitle: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900",
  },
  outcomesSub: {
    color: "#8fa9de",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 8,
  },
  outcomeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 4,
  },
  outcomeBullet: {
    fontSize: 11,
    marginTop: 2,
  },
  outcomeText: {
    color: "#e2eafc",
    fontSize: 12.5,
    lineHeight: 18,
    flex: 1,
    fontWeight: "600",
  },
  lessonPressable: {
    borderRadius: 14,
    overflow: "hidden",
  },
  lessonCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  lessonCardLocked: {
    borderColor: "#1d2b4a",
    opacity: 0.65,
  },
  lessonCardCompleted: {
    borderColor: "#22c55e",
  },
  lessonBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#524be3",
    alignItems: "center",
    justifyContent: "center",
  },
  lessonBadgeLocked: {
    backgroundColor: "#202c44",
  },
  lessonBadgeCompleted: {
    backgroundColor: "#16806b",
  },
  lessonBadgeText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "900",
  },
  lessonDetails: {
    flex: 1,
  },
  lessonCardTitle: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
  },
  lessonCardTitleLocked: {
    color: "#8b9ec7",
  },
  lessonCardSubtitle: {
    color: "#a4b7dd",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  lessonCardArrow: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800",
  },
});

const navStyles = StyleSheet.create({
  navigation: {
    backgroundColor: "#050505",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingTop: 6,
    paddingBottom: 8,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: "#17264a",
  },
  tab: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingVertical: 6,
    borderRadius: 24,
    position: "relative",
  },
  activeBackground: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#003d3d",
    borderRadius: 24,
  },
  icon: { width: 28, height: 28 },
  label: { color: "#a9dcff", fontSize: 12, fontWeight: "700", marginTop: 3 },
  viewToggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#101d3b",
    borderColor: "#203768",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14,
  },
  viewToggleLabel: {
    color: "#9db0d6",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  viewToggleTrack: {
    flexDirection: "row",
    backgroundColor: "#182a52",
    borderRadius: 8,
    padding: 3,
    gap: 4,
  },
  viewToggleSegment: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  viewToggleSegmentActive: {
    backgroundColor: "#524be3",
  },
  viewToggleText: {
    color: "#8fa3cb",
    fontSize: 11,
    fontWeight: "700",
  },
  viewToggleTextActive: {
    color: "#ffffff",
    fontWeight: "800",
  },
});
