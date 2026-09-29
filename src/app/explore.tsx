import { GradientSafeAreaView as SafeAreaView } from "@/components/gradient-safe-area";
import { curriculum, type Lesson, type Subject } from "@/constants/curriculum";
import { useProgress } from "@/hooks/use-progress";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { Href, router, useFocusEffect, usePathname } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  ImageSourcePropType,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const STORAGE_KEY = "@biosphere_profile_data_v1";
const PARENT_CONTROLS_KEY = "@biosphere_parent_controls_v1";

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
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/home" as any);
    }
  };

  if (selected) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          <Pressable onPress={() => setSelected(null)}>
            <Text style={styles.back}>‹ Back to courses</Text>
          </Pressable>
          <View
            style={[styles.lessonHero, { borderColor: selected.subject.color }]}
          >
            <Text style={styles.bigIcon}>{selected.subject.icon}</Text>
            <Text style={styles.detailTitle}>{selected.lesson.title}</Text>
            <Text style={styles.pill}>
              {selected.lesson.difficulty} mission
            </Text>
          </View>
          <Info
            title="SUBJECT KNOWLEDGE"
            text={subjectKnowledge[selected.subject.title]}
          />
          <Info title="DEFINITION" text={selected.lesson.meaning} />
          <Info title="EXAMPLE" text={selected.lesson.example} />
          <Pressable
            onPress={() => {
              completeLesson(40);
              setSelected(null);
            }}
            style={styles.startButton}
          >
            <Text style={styles.startText}>Complete lesson · +40 XP →</Text>
          </Pressable>
        </ScrollView>
        <BottomNavigation />
      </SafeAreaView>
    );
  }

  return (
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
            <Text style={styles.activeGradeBadge}>GRADE {grade} SCHOLAR</Text>
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

        {/* Curriculum mapped with unique composite keys */}
        {curriculum[grade]?.map((subject, subjectIndex) => (
          <SubjectCard
            key={`${subject.title}-${subjectIndex}`}
            subject={subject}
            onLesson={(lesson) => setSelected({ subject, lesson })}
          />
        ))}
      </ScrollView>
      <BottomNavigation />
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

function Info({
  title,
  text,
}: {
  title: string;
  text: string;
}): React.JSX.Element {
  return (
    <View style={styles.info}>
      <Text style={styles.detailLabel}>{title}</Text>
      <Text style={styles.detailBody}>{text}</Text>
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
  lessonHero: {
    alignItems: "center",
    backgroundColor: "#182e5d",
    borderWidth: 1,
    borderRadius: 15,
    padding: 16,
  },
  bigIcon: { fontSize: 40 },
  detailTitle: {
    color: "#fff",
    fontSize: 21,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 7,
  },
  pill: { color: "#9af2bc", fontWeight: "900", marginTop: 5 },
  info: {
    backgroundColor: "#30358d",
    borderColor: "#5d62ef",
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
  },
  detailLabel: {
    color: "#f3ca45",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  detailBody: { color: "#fff", fontSize: 15, lineHeight: 23, marginTop: 8 },
  startButton: {
    backgroundColor: "#6258ff",
    borderRadius: 10,
    alignItems: "center",
    padding: 13,
    marginTop: 16,
  },
  startText: { color: "#fff", fontWeight: "900" },
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
});
