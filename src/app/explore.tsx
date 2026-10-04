import {
  curriculum,
  type Lesson,
  type Subject,
} from "@/app/components/curriculum";
import { GradientSafeAreaView as SafeAreaView } from "@/components/gradient-safe-area";
import { useProgress } from "@/hooks/use-progress";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { Href, router, useFocusEffect, usePathname } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  ImageSourcePropType,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import NotebookBookViewer from "./components/notebookbookviewer";

const STORAGE_KEY = "@biosphere_profile_data_v1";
const PARENT_CONTROLS_KEY = "@biosphere_parent_controls_v1";
const VIEW_PREF_KEY = "@biosphere_preferred_lesson_view_v1";

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

const subjectKnowledge: Record<string, string> = {
  Math: "Build number sense, solve problems, and connect math to real-life decisions.",
  Matter: "Explore materials, their properties, and how matter changes.",
  "Living Things & Environment":
    "Study life, habitats, adaptations, and healthy ecosystems.",
  "Force, Motion, & Energy":
    "Discover how forces change motion and how energy moves.",
  "Earth & Space":
    "Understand Earth systems, weather, rocks, and space patterns.",
};

export default function ExploreScreen(): React.JSX.Element {
  const { completeLesson } = useProgress();
  const [grade, setGrade] = useState(1);
  const [selected, setSelected] = useState<{
    subject: Subject;
    lesson: Lesson;
  } | null>(null);
  const [pendingLesson, setPendingLesson] = useState<{
    subject: Subject;
    lesson: Lesson;
  } | null>(null);
  const [lessonView, setLessonView] = useState<"notebook" | "classic" | null>(
    null,
  );
  const [isLessonChooserVisible, setIsLessonChooserVisible] = useState(false);
  const [preferredView, setPreferredView] = useState<
    "notebook" | "classic" | null
  >(null);

  useEffect(() => {
    const loadPreference = async () => {
      try {
        const saved = await AsyncStorage.getItem(VIEW_PREF_KEY);
        if (saved === "notebook" || saved === "classic") {
          setPreferredView(saved);
        }
      } catch (e) {
        console.error("Error reading lesson view preference", e);
      }
    };
    loadPreference();
  }, []);

  const updatePreferredView = async (view: "notebook" | "classic") => {
    setPreferredView(view);
    try {
      await AsyncStorage.setItem(VIEW_PREF_KEY, view);
    } catch (e) {
      console.error("Error saving lesson view preference", e);
    }
  };

  const screenTransition = React.useMemo(() => new Animated.Value(0), []);
  const transitionInProgress = useRef(false);

  const launchLesson = (
    subject: Subject,
    lesson: Lesson,
    view: "notebook" | "classic",
  ) => {
    if (transitionInProgress.current) return;
    transitionInProgress.current = true;
    screenTransition.setValue(0);
    setSelected({ subject, lesson });
    setLessonView(view);

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

  const openLesson = (subject: Subject, lesson: Lesson): void => {
    if (transitionInProgress.current || selected || pendingLesson) return;

    if (preferredView) {
      launchLesson(subject, lesson, preferredView);
    } else {
      setPendingLesson({ subject, lesson });
      setIsLessonChooserVisible(true);
    }
  };

  const chooseLessonView = (view: "notebook" | "classic"): void => {
    if (!pendingLesson) return;
    const currentPending = pendingLesson;
    setPendingLesson(null);
    setIsLessonChooserVisible(false);

    void updatePreferredView(view);
    launchLesson(currentPending.subject, currentPending.lesson, view);
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
        }
        setSelected(null);
        setLessonView(null);
      }
      transitionInProgress.current = false;
    });
  };

  const closeLesson = (): void => finishLesson();

  const courseScreenOpacity = screenTransition.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });
  const courseScreenScale = screenTransition.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.985],
  });
  const notebookScreenOpacity = screenTransition;
  const notebookScreenScale = screenTransition.interpolate({
    inputRange: [0, 1],
    outputRange: [0.985, 1],
  });

  const fetchActiveGrade = async (): Promise<void> => {
    try {
      // Check parent locks
      const parentData = await AsyncStorage.getItem(PARENT_CONTROLS_KEY);
      let locks: Record<string, boolean> = {};
      if (parentData) {
        const controls = JSON.parse(parentData);
        if (controls.gradeLocks) {
          locks = controls.gradeLocks;
        }
      }

      // Check user's selected grade from profile / wizard
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
    fetchActiveGrade();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchActiveGrade();
    }, []),
  );

  const handleBack = (): void => {
    if (selected) {
      closeLesson();
      return;
    }
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/home" as any);
    }
  };

  return (
    <View style={styles.screenContainer}>
      <Animated.View
        pointerEvents={selected ? "none" : "auto"}
        style={[
          styles.screenLayer,
          {
            opacity: courseScreenOpacity,
            transform: [{ scale: courseScreenScale }],
          },
        ]}
      >
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Pressable onPress={handleBack}>
                <Text style={styles.back}> Back</Text>
              </Pressable>
              <View style={styles.headerTitle}>
                <Image source={astro} style={styles.headerMascot} />
                <Text style={styles.title}> My Courses</Text>
              </View>
            </View>

            <View style={styles.search}>
              <Text style={styles.searchText}>⌕ Search courses...</Text>
            </View>

            {/* Clean Active Grade Status Banner (Manual Tabs Removed) */}
            <View style={styles.activeGradeBanner}>
              <View>
                <Text style={styles.activeGradeBadge}>
                  GRADE {grade} SCHOLAR
                </Text>
                <Text style={styles.activeGradeSubtitle}>
                  Active Math & Science Curriculum
                </Text>
              </View>
              <Pressable
                style={styles.changeGradeBtn}
                onPress={() => router.push("/settings" as any)}
              >
                <Text style={styles.changeGradeText}>Change ⚙️</Text>
              </Pressable>
            </View>

            {/* View Mode Toggle Switch */}
            <View style={styles.viewToggleContainer}>
              <Text style={styles.viewToggleLabel}>LESSON FORMAT</Text>
              <View style={styles.viewToggleTrack}>
                <Pressable
                  style={[
                    styles.viewToggleSegment,
                    (preferredView ?? "notebook") === "notebook" &&
                      styles.viewToggleSegmentActive,
                  ]}
                  onPress={() => updatePreferredView("notebook")}
                >
                  <Text
                    style={[
                      styles.viewToggleText,
                      (preferredView ?? "notebook") === "notebook" &&
                        styles.viewToggleTextActive,
                    ]}
                  >
                    📖 Notebook
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.viewToggleSegment,
                    preferredView === "classic" &&
                      styles.viewToggleSegmentActive,
                  ]}
                  onPress={() => updatePreferredView("classic")}
                >
                  <Text
                    style={[
                      styles.viewToggleText,
                      preferredView === "classic" &&
                        styles.viewToggleTextActive,
                    ]}
                  >
                    ⚡ Quick Lesson
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Curriculum mapped with unique composite keys */}
            {curriculum[grade]?.map((subject, subjectIndex) => (
              <SubjectCard
                key={`${subject.title}-${subjectIndex}`}
                subject={subject}
                onLesson={(lesson) => openLesson(subject, lesson)}
              />
            ))}
          </ScrollView>
          <BottomNavigation />
        </SafeAreaView>
      </Animated.View>

      {selected && (
        <Animated.View
          style={[
            styles.screenLayer,
            {
              opacity: notebookScreenOpacity,
              transform: [{ scale: notebookScreenScale }],
            },
          ]}
        >
          {lessonView === "notebook" && (
            <NotebookBookViewer
              gradeLevel={grade}
              initialSubject={selected.subject}
              initialLesson={selected.lesson}
              onBack={closeLesson}
              onComplete={(xpReward) => finishLesson(xpReward)}
            />
          )}
          {lessonView === "classic" && (
            <ClassicLessonView
              subject={selected.subject}
              lesson={selected.lesson}
              onBack={closeLesson}
              onComplete={() => finishLesson(40)}
            />
          )}
        </Animated.View>
      )}

      <Modal
        visible={isLessonChooserVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setIsLessonChooserVisible(false);
          setPendingLesson(null);
        }}
      >
        <View style={styles.chooserBackdrop}>
          <View style={styles.chooserPanel}>
            <Text style={styles.chooserTitle}>Choose a lesson view</Text>
            <Text style={styles.chooserLesson}>
              {pendingLesson?.lesson.title}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => chooseLessonView("notebook")}
              style={styles.chooserOption}
            >
              <Text style={styles.chooserOptionTitle}>Notebook</Text>
              <Text style={styles.chooserOptionDescription}>
                Explore the full lesson, one page at a time.
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => chooseLessonView("classic")}
              style={styles.chooserOption}
            >
              <Text style={styles.chooserOptionTitle}>Quick lesson</Text>
              <Text style={styles.chooserOptionDescription}>
                Read the key idea, definition, and example.
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setIsLessonChooserVisible(false);
                setPendingLesson(null);
              }}
              style={styles.chooserCancel}
            >
              <Text style={styles.chooserCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function ClassicLessonView({
  subject,
  lesson,
  onBack,
  onComplete,
}: {
  subject: Subject;
  lesson: Lesson;
  onBack: () => void;
  onComplete: () => void;
}): React.JSX.Element {
  return (
    <SafeAreaView style={styles.classicSafeArea} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.classicContent}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          accessibilityRole="button"
          onPress={onBack}
          style={styles.classicBackButton}
        >
          <Text style={styles.classicBackText}> Back to courses</Text>
        </Pressable>
        <View style={[styles.classicHero, { borderColor: subject.color }]}>
          <Text style={styles.classicIcon}>{subject.icon}</Text>
          <Text style={styles.classicTitle}>{lesson.title}</Text>
          <Text style={styles.classicDifficulty}>
            {lesson.difficulty} mission
          </Text>
        </View>
        <View style={styles.classicInfo}>
          <Text style={styles.classicInfoLabel}>About this subject</Text>
          <Text style={styles.classicInfoText}>
            {subjectKnowledge[subject.title]}
          </Text>
        </View>
        <View style={styles.classicInfo}>
          <View style={styles.classicSectionHeader}>
            <View style={styles.classicSectionNumber}>
              <Text style={styles.classicSectionNumberText}>1</Text>
            </View>
            <View style={styles.classicSectionHeading}>
              <Text style={styles.classicInfoLabel}>The big idea</Text>
              <Text style={styles.classicInfoHeading}>What does it mean?</Text>
            </View>
          </View>
          <Text style={styles.classicInfoText}>{lesson.meaning}</Text>
          <View style={styles.classicGuide}>
            <Text style={styles.classicGuideTitle}>Keep this in mind</Text>
            <Text style={styles.classicGuideText}>
              Look for this idea in the example below.
            </Text>
          </View>
        </View>
        <View style={styles.classicInfo}>
          <View style={styles.classicSectionHeader}>
            <View style={styles.classicSectionNumber}>
              <Text style={styles.classicSectionNumberText}>2</Text>
            </View>
            <View style={styles.classicSectionHeading}>
              <Text style={styles.classicInfoLabel}>Let’s look</Text>
              <Text style={styles.classicInfoHeading}>
                See it in an example
              </Text>
            </View>
          </View>
          <Text style={styles.classicInfoText}>{lesson.example}</Text>
          <View style={styles.classicGuide}>
            <Text style={styles.classicGuideTitle}>Think it through</Text>
            <View style={styles.classicGuideStep}>
              <Text style={styles.classicGuideStepNumber}>1</Text>
              <Text style={styles.classicGuideText}>
                Read what happens in the example.
              </Text>
            </View>
            <View style={styles.classicGuideStep}>
              <Text style={styles.classicGuideStepNumber}>2</Text>
              <Text style={styles.classicGuideText}>
                Find the part that shows the big idea.
              </Text>
            </View>
            <View style={styles.classicGuideStep}>
              <Text style={styles.classicGuideStepNumber}>3</Text>
              <Text style={styles.classicGuideText}>
                Explain how the two are connected.
              </Text>
            </View>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={onComplete}
          style={styles.classicCompleteButton}
        >
          <Text style={styles.classicCompleteText}>
            Complete lesson · +40 XP →
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function SubjectCard({
  subject,
  onLesson,
}: {
  subject: Subject;
  onLesson: (lesson: Lesson) => void;
}): React.JSX.Element {
  return (
    <View style={[styles.subject, { borderColor: subject.color }]}>
      <View style={styles.subjectHeader}>
        <Text style={styles.subjectIcon}>{subject.icon}</Text>
        <View style={styles.subjectCopy}>
          <Text style={styles.subjectTitle}>{subject.title}</Text>
          <Text style={styles.subjectSub}>
            {subject.lessons.length} lessons · Grade-ready missions
          </Text>
        </View>
      </View>
      <Text style={styles.knowledge}>{subjectKnowledge[subject.title]}</Text>

      {/* Unique key composed of subject, title, and index to eliminate duplicate key warning */}
      {subject.lessons.map((lesson, index) => (
        <Pressable
          key={`${subject.title}-${lesson.title}-${index}`}
          onPress={() => onLesson(lesson)}
          style={styles.lesson}
        >
          <View style={styles.lessonNumber}>
            <Text style={styles.lessonNumberText}>{index + 1}</Text>
          </View>
          <View style={styles.lessonCopy}>
            <Text style={styles.lessonTitle}>{lesson.title}</Text>
            <Text style={styles.lessonDifficulty}>
              {lesson.difficulty} challenge
            </Text>
          </View>
          <Text style={styles.lessonArrow}>›</Text>
        </Pressable>
      ))}
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
  screenContainer: { flex: 1 },
  screenLayer: {
    ...StyleSheet.absoluteFill,
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
  search: {
    marginTop: 14,
    backgroundColor: "#30358d",
    borderColor: "#5c60ee",
    borderWidth: 1,
    borderRadius: 20,
    padding: 10,
  },
  searchText: { color: "#cbc9f3", fontSize: 12 },
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
  subject: {
    backgroundColor: "#132844",
    borderWidth: 1,
    borderRadius: 17,
    padding: 10,
    marginBottom: 12,
  },
  subjectHeader: { flexDirection: "row", alignItems: "center", gap: 9 },
  subjectIcon: { fontSize: 25 },
  subjectCopy: { flex: 1 },
  subjectTitle: { color: "#fff", fontWeight: "900", fontSize: 14 },
  subjectSub: { color: "#bcc8df", fontSize: 10, marginTop: 2 },
  knowledge: { color: "#d7e1f2", fontSize: 10, lineHeight: 15, marginTop: 8 },
  lesson: {
    backgroundColor: "#243d75",
    borderRadius: 11,
    padding: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 7,
  },
  lessonNumber: {
    width: 27,
    height: 27,
    borderRadius: 15,
    backgroundColor: "#2b77ca",
    alignItems: "center",
    justifyContent: "center",
  },
  lessonNumberText: { color: "#fff", fontWeight: "900" },
  lessonCopy: { flex: 1 },
  lessonTitle: { color: "#fff", fontWeight: "800", fontSize: 12 },
  lessonDifficulty: { color: "#b9c9e5", fontSize: 9, marginTop: 2 },
  lessonArrow: { color: "#fff", fontSize: 24 },
  chooserBackdrop: {
    flex: 1,
    justifyContent: "center",
    padding: 22,
    backgroundColor: "rgba(4, 10, 28, 0.78)",
  },
  chooserPanel: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#6866ee",
    backgroundColor: "#17284e",
  },
  chooserTitle: { color: "#fff", fontSize: 20, fontWeight: "900" },
  chooserLesson: {
    color: "#c7d4ee",
    fontSize: 14,
    marginTop: 5,
    marginBottom: 14,
  },
  chooserOption: {
    padding: 14,
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#555bd2",
    backgroundColor: "#2c367f",
  },
  chooserOptionTitle: { color: "#fff", fontSize: 16, fontWeight: "800" },
  chooserOptionDescription: {
    color: "#d8def7",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
  chooserCancel: {
    alignSelf: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 6,
  },
  chooserCancelText: { color: "#c9c7fa", fontSize: 14, fontWeight: "700" },
  classicSafeArea: { flex: 1, backgroundColor: "#0b142d" },
  classicContent: { flexGrow: 1, padding: 18, paddingBottom: 24 },
  classicBackButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    marginBottom: 8,
  },
  classicBackText: { color: "#df91f4", fontSize: 15, fontWeight: "800" },
  classicHero: {
    alignItems: "center",
    padding: 20,
    marginBottom: 16,
    borderRadius: 22,
    borderWidth: 1.5,
    backgroundColor: "#172e59",
  },
  classicIcon: { fontSize: 52, marginBottom: 8 },
  classicTitle: {
    color: "#fff",
    fontSize: 23,
    lineHeight: 29,
    fontWeight: "900",
    textAlign: "center",
  },
  classicDifficulty: {
    color: "#81e6b1",
    fontSize: 15,
    fontWeight: "800",
    marginTop: 8,
  },
  classicInfo: {
    padding: 18,
    marginBottom: 15,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#575ee5",
    backgroundColor: "#303783",
  },
  classicInfoLabel: {
    color: "#ffda61",
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 4,
  },
  classicInfoHeading: {
    color: "#fff",
    fontSize: 19,
    lineHeight: 25,
    fontWeight: "900",
  },
  classicInfoText: {
    color: "#f4f5ff",
    fontSize: 18,
    lineHeight: 29,
    marginTop: 12,
  },
  classicSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  classicSectionNumber: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderRadius: 19,
    backgroundColor: "#6255f5",
  },
  classicSectionNumberText: { color: "#fff", fontSize: 18, fontWeight: "900" },
  classicSectionHeading: { flex: 1 },
  classicGuide: {
    padding: 14,
    marginTop: 16,
    borderRadius: 14,
    backgroundColor: "#202b70",
  },
  classicGuideTitle: {
    color: "#ffda61",
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 7,
  },
  classicGuideText: { flex: 1, color: "#f4f5ff", fontSize: 15, lineHeight: 22 },
  classicGuideStep: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 7,
  },
  classicGuideStepNumber: {
    width: 23,
    height: 23,
    textAlign: "center",
    textAlignVertical: "center",
    marginRight: 9,
    borderRadius: 12,
    overflow: "hidden",
    color: "#17284e",
    backgroundColor: "#ffda61",
    fontSize: 13,
    fontWeight: "900",
  },
  classicCompleteButton: {
    minHeight: 58,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "#6255f5",
  },
  classicCompleteText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "900",
    textAlign: "center",
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
