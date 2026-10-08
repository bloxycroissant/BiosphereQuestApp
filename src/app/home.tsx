import {
  curriculum,
  type Lesson,
  type Subject,
} from "@/app/components/curriculum";
import { GradientSafeAreaView } from "@/components/gradient-safe-area";
import { normalizeXpValue, useProgress } from "@/hooks/use-progress";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const logo = require("../../assets/BiosphereQuestAssets/Biosphere Quest Logo.png");
const target = require("../../assets/BiosphereQuestAssets/target.png");

const STORAGE_KEY = "@biosphere_profile_data_v1";
const PARENT_CONTROLS_KEY = "@biosphere_parent_controls_v1";
const LAST_LESSON_KEY = "@biosphere_last_lesson_v1";
const RECENT_GAMES_KEY = "@biosphere_recent_games_v1";

interface ActiveLessonData {
  grade: number;
  subjectTitle: string;
  lessonTitle: string;
  icon: string;
  difficulty: string;
}

interface MiniGameMeta {
  key: string;
  title: string;
  subtitle: string;
  icon: string;
  badge: string;
  isRecent: boolean;
}

const ALL_ARCADE_GAMES = [
  { key: "flashcards", title: "Flashcards", subtitle: "Formulas & definitions", icon: "🧠", defaultBadge: "Smart" },
  { key: "scramble", title: "Word Scramble", subtitle: "Science terminology", icon: "🔤", defaultBadge: "Spelling" },
  { key: "memory", title: "Memory Match", subtitle: "Flip & pair icons", icon: "⭐", defaultBadge: "Memory" },
  { key: "ninja", title: "Number Ninja", subtitle: "Rapid arithmetic", icon: "⚡", defaultBadge: "Speed" },
  { key: "whack", title: "Whack-a-Number", subtitle: "Pop correct target", icon: "🎯", defaultBadge: "Action" },
  { key: "codebreaker", title: "Codebreaker", subtitle: "Defuse the vault", icon: "🔥", defaultBadge: "Vault" },
];

export default function HomeScreen(): React.JSX.Element {
  const progress = useProgress();
  const appear = useRef(new Animated.Value(0)).current;
  const levelUpAnim = useRef(new Animated.Value(-120)).current;

  const [userName, setUserName] = useState("Explorer");
  const [userGrade, setUserGrade] = useState("1");

  const [streak, setStreak] = useState(0);
  const [level, setLevel] = useState(0);
  const [lessons, setLessons] = useState(0);
  const [xp, setXp] = useState(0);
  const [studyMinutes, setStudyMinutes] = useState(0);

  const prevLevelRef = useRef<number | null>(null);
  const [levelUpText, setLevelUpText] = useState("");
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [greeting, setGreeting] = useState("Good morning");

  const [isLocked, setIsLocked] = useState(false);
  const [lockMessage, setLockMessage] = useState("");
  const [gradeLocks, setGradeLocks] = useState<{ [key: string]: boolean }>({});

  const [lastLesson, setLastLesson] = useState<ActiveLessonData | null>(null);
  const [displayGames, setDisplayGames] = useState<MiniGameMeta[]>([]);

  const nextLevelXp = progress.nextLevelXp || 100;
  const width =
    `${Math.min(100, Math.round((xp / nextLevelXp) * 100))}%` as any;

  useEffect(() => {
    checkParentRules();
    const interval = setInterval(checkParentRules, 20000);
    return () => clearInterval(interval);
  }, []);

  const checkParentRules = async () => {
    try {
      const data = await AsyncStorage.getItem(PARENT_CONTROLS_KEY);
      if (!data) return;
      const controls = JSON.parse(data);

      if (controls.gradeLocks) {
        setGradeLocks(controls.gradeLocks);
      }

      if (controls.bedtimeLockEnabled && controls.bedtimeHour) {
        if (checkIsBedtime(controls.bedtimeHour)) {
          setIsLocked(true);
          setLockMessage(
            `🌙 Bedtime Lock Active!\nYour parent set bedtime for ${controls.bedtimeHour}. Time to rest!`,
          );
          return;
        }
      }
      setIsLocked(false);
    } catch (e) {
      console.error("Error reading parent controls", e);
    }
  };

  const checkIsBedtime = (bedtimeStr: string) => {
    try {
      const [timePart, period] = bedtimeStr.split(" ");
      let [hourStr, minStr] = timePart.split(":");
      let targetHour = parseInt(hourStr, 10);
      const targetMin = parseInt(minStr, 10);

      if (period === "PM" && targetHour < 12) targetHour += 12;
      if (period === "AM" && targetHour === 12) targetHour = 0;

      const now = new Date();
      const currentTotalMins = now.getHours() * 60 + now.getMinutes();
      const targetTotalMins = targetHour * 60 + targetMin;

      return currentTotalMins >= targetTotalMins;
    } catch {
      return false;
    }
  };

  const navigateToRoute = (path: string) => {
    try {
      router.push(path as any);
    } catch (err) {
      router.replace(path as any);
    }
  };

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting("Good morning");
    } else if (hour >= 12 && hour < 17) {
      setGreeting("Good afternoon");
    } else {
      setGreeting("Good evening");
    }
  }, []);

  const triggerLevelUpAnimation = (oldLvl: number, newLvl: number) => {
    const formattedOld = String(oldLvl).padStart(2, "0");
    const formattedNew = String(newLvl).padStart(2, "0");
    setLevelUpText(
      `Congratulations! You leveled up from ${formattedOld} to ${formattedNew}!`,
    );

    setShowLevelUp(true);
    levelUpAnim.setValue(-120);

    Animated.spring(levelUpAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();

    setTimeout(() => {
      Animated.timing(levelUpAnim, {
        toValue: -120,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowLevelUp(false);
        setLevelUpText("");
      });
    }, 3500);
  };

  const loadArcadeGames = async () => {
    try {
      const recentRaw = await AsyncStorage.getItem(RECENT_GAMES_KEY);
      const recentKeys: string[] = recentRaw ? JSON.parse(recentRaw) : [];

      const availableRecents = recentKeys.filter((k) =>
        ALL_ARCADE_GAMES.some((g) => g.key === k),
      );

      let firstTwoKeys: string[] = [];
      if (availableRecents.length >= 2) {
        firstTwoKeys = [availableRecents[0], availableRecents[1]];
      } else if (availableRecents.length === 1) {
        const fallback = ALL_ARCADE_GAMES.find((g) => g.key !== availableRecents[0]);
        firstTwoKeys = [availableRecents[0], fallback ? fallback.key : "ninja"];
      } else {
        firstTwoKeys = ["flashcards", "ninja"];
      }

      const remainingGames = ALL_ARCADE_GAMES.filter(
        (g) => !firstTwoKeys.includes(g.key),
      );
      const randomPicked =
        remainingGames[Math.floor(Math.random() * remainingGames.length)] ||
        remainingGames[0];

      const finalList: MiniGameMeta[] = [
        ...firstTwoKeys.map((key) => {
          const item = ALL_ARCADE_GAMES.find((g) => g.key === key)!;
          return {
            key: item.key,
            title: item.title,
            subtitle: item.subtitle,
            icon: item.icon,
            badge: "Recent",
            isRecent: true,
          };
        }),
        {
          key: randomPicked.key,
          title: randomPicked.title,
          subtitle: randomPicked.subtitle,
          icon: randomPicked.icon,
          badge: "Featured",
          isRecent: false,
        },
      ];

      setDisplayGames(finalList);
    } catch (e) {
      console.error("Failed to load arcade games", e);
    }
  };

  const loadSharedProgress = async () => {
    try {
      const guestName = await AsyncStorage.getItem("explorerName");
      const guestUsername = await AsyncStorage.getItem("explorerUsername");
      const guestGrade = await AsyncStorage.getItem("explorerGrade");

      let resolvedGrade = 1;

      const savedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);

        if (parsed.username && parsed.username.trim()) {
          setUserName(parsed.username.trim());
        } else if (parsed.name && parsed.name.trim()) {
          setUserName(parsed.name.trim());
        } else if (guestUsername && guestUsername.trim()) {
          setUserName(guestUsername.trim());
        } else if (guestName && guestName.trim()) {
          setUserName(guestName.trim());
        }

        if (parsed.gradeYear) {
          const match = String(parsed.gradeYear).match(/\d+/);
          if (match) {
            setUserGrade(match[0]);
            resolvedGrade = parseInt(match[0], 10);
          }
        } else if (guestGrade) {
          const match = String(guestGrade).match(/\d+/);
          const val = match ? match[0] : guestGrade;
          setUserGrade(val);
          resolvedGrade = parseInt(val, 10);
        }

        const restoredXp = normalizeXpValue(parsed.xp);
        const newLvl = Number.isFinite(parsed.level)
          ? parsed.level
          : Math.floor(restoredXp / 100) + 1;
        const previousLevel = prevLevelRef.current;

        setLevel(() => {
          if (previousLevel !== null && newLvl > previousLevel) {
            triggerLevelUpAnimation(previousLevel, newLvl);
          }
          prevLevelRef.current = newLvl;
          return newLvl;
        });

        setStreak(parsed.streak !== undefined ? parsed.streak : 0);
        setLessons(parsed.lessons !== undefined ? parsed.lessons : 0);
        setXp(restoredXp);
        setStudyMinutes(
          parsed.studyMinutes !== undefined ? parsed.studyMinutes : 0,
        );
      } else {
        if (guestUsername && guestUsername.trim()) {
          setUserName(guestUsername.trim());
        } else if (guestName && guestName.trim()) {
          setUserName(guestName.trim());
        }

        if (guestGrade) {
          const match = String(guestGrade).match(/\d+/);
          const val = match ? match[0] : guestGrade;
          setUserGrade(val);
          resolvedGrade = parseInt(val, 10);
        }

        setLevel(0);
        prevLevelRef.current = 0;
        setStreak(0);
        setLessons(0);
        setXp(0);
        setStudyMinutes(0);
      }

      const lastLessonRaw = await AsyncStorage.getItem(LAST_LESSON_KEY);
      if (lastLessonRaw) {
        const parsedLast = JSON.parse(lastLessonRaw);
        if (parsedLast.grade === resolvedGrade) {
          setLastLesson(parsedLast);
          return;
        }
      }

      const gradeSubjects = curriculum[resolvedGrade] || curriculum[1];
      if (gradeSubjects && gradeSubjects.length > 0) {
        const firstSub = gradeSubjects[0];
        const firstLes = firstSub.lessons[0];
        setLastLesson({
          grade: resolvedGrade,
          subjectTitle: firstSub.title,
          lessonTitle: firstLes.title,
          icon: firstSub.icon,
          difficulty: firstLes.difficulty,
        });
      }
    } catch (e) {
      console.error("Failed to load shared progress on home", e);
    }
  };

  useEffect(() => {
    loadSharedProgress();
    loadArcadeGames();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSharedProgress();
      loadArcadeGames();
    }, []),
  );

  useEffect(() => {
    Animated.spring(appear, {
      toValue: 1,
      useNativeDriver: true,
      tension: 45,
      friction: 8,
    }).start();
  }, [appear]);

  const activeGradeSubjects = curriculum[parseInt(userGrade, 10) || 1] || [];
  const secondarySubject = activeGradeSubjects[1] || activeGradeSubjects[0];

  const launchMiniGame = (gameKey: string) => {
    router.push({
      pathname: "/games",
      params: { autoOpenGame: gameKey },
    } as any);
  };

  return (
    <GradientSafeAreaView style={styles.safeArea} edges={["top"]}>
      {Boolean(showLevelUp && levelUpText.trim()) && (
        <Animated.View
          style={[
            styles.levelUpBanner,
            { transform: [{ translateY: levelUpAnim }] },
          ]}
        >
          <Text style={styles.levelUpText}>{levelUpText}</Text>
        </Animated.View>
      )}

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.greeting}>
            <Image source={logo} style={styles.avatar} contentFit="contain" />
            <View>
              <Text style={styles.small}>
                {greeting},{userGrade ? ` Grade ${userGrade}` : ""}
              </Text>
              <Text style={styles.name}>{userName}</Text>
            </View>
          </View>
          <Text style={styles.bell}>🔔</Text>
        </View>

        <Animated.View
          style={{
            opacity: appear,
            transform: [
              {
                translateY: appear.interpolate({
                  inputRange: [0, 1],
                  outputRange: [16, 0],
                }),
              },
            ],
          }}
        >
          <View style={styles.progress}>
            <View style={styles.labels}>
              <Text style={styles.label}>Streak: {streak}</Text>
              <Text style={styles.label}>Level: {level}</Text>
              <Text style={styles.label}>{lessons} Lessons</Text>
            </View>
            <View style={styles.levelRow}>
              <Text style={styles.label}>Level {level}</Text>
              <Text style={styles.xp}>{xp} XP</Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width }]} />
            </View>
          </View>

          <Text style={styles.section}>Continue Learning</Text>
          <View style={styles.cards}>
            <Pressable
              onPress={() => navigateToRoute("/explore")}
              style={styles.course}
            >
              <Text style={styles.courseIcon}>
                {lastLesson ? lastLesson.icon : "📖"}
              </Text>
              <Text style={styles.courseTitle} numberOfLines={1}>
                {lastLesson ? lastLesson.lessonTitle : "Start Mission"}
              </Text>
              <Text style={styles.courseSub}>
                {lastLesson
                  ? `${lastLesson.subjectTitle} • Grade ${lastLesson.grade}`
                  : `Grade ${userGrade}`}
              </Text>
            </Pressable>

            {secondarySubject && (
              <Pressable
                onPress={() => navigateToRoute("/explore")}
                style={styles.course}
              >
                <Text style={styles.courseIcon}>{secondarySubject.icon}</Text>
                <Text style={styles.courseTitle} numberOfLines={1}>
                  {secondarySubject.lessons[0]?.title || secondarySubject.title}
                </Text>
                <Text style={styles.courseSub}>
                  {secondarySubject.title} • Grade {userGrade}
                </Text>
              </Pressable>
            )}
          </View>

          <Pressable
            style={styles.challenge}
            onPress={() => launchMiniGame("quiz")}
          >
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={styles.challengeTag}>DAILY CHALLENGE</Text>
              <Text style={styles.challengeTitle}>Science & Math Quiz</Text>
              <Text style={styles.challengeSub}>
                5 questions • +150 XP • Tap to Start!
              </Text>
            </View>
            <Image source={target} style={styles.target} contentFit="contain" />
          </Pressable>

          <Text style={styles.section}>Study Time</Text>
          <View style={styles.study}>
            <Text style={styles.studyValue}>
              {Math.floor(studyMinutes / 60)}h {studyMinutes % 60}m
            </Text>
            <Text style={styles.studyCopy}>
              Keep learning to grow your weekly progress.
            </Text>
          </View>

          <Text style={styles.section}>Arcade Challenges</Text>
          <View style={styles.arcadeStack}>
            {displayGames.map((game) => (
              <Pressable
                key={game.key}
                style={[
                  styles.arcadeGameRow,
                  game.isRecent ? styles.recentGameBorder : styles.featuredGameBorder,
                ]}
                onPress={() => launchMiniGame(game.key)}
              >
                <View style={styles.arcadeIconBubble}>
                  <Text style={styles.arcadeIconText}>{game.icon}</Text>
                </View>
                <View style={styles.arcadeGameMeta}>
                  <View style={styles.arcadeTitleLine}>
                    <Text style={styles.arcadeGameTitle}>{game.title}</Text>
                    <View
                      style={[
                        styles.gameBadgePill,
                        game.isRecent ? styles.badgeRecent : styles.badgeFeatured,
                      ]}
                    >
                      <Text style={styles.gameBadgePillText}>{game.badge}</Text>
                    </View>
                  </View>
                  <Text style={styles.arcadeGameDesc} numberOfLines={1}>
                    {game.subtitle}
                  </Text>
                </View>
                <View style={styles.arcadePlayButton}>
                  <Text style={styles.arcadePlayText}>Play</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </Animated.View>
      </ScrollView>

      <Modal visible={isLocked} animationType="fade" transparent={true}>
        <View style={styles.lockOverlay}>
          <Pressable
            style={styles.lockBackdropButton}
            onPress={() => {
              setIsLocked(false);
              router.replace("/");
            }}
          />
          <View style={styles.lockContentContainer} pointerEvents="box-none">
            <View style={styles.lockCopy} pointerEvents="none">
              <Text style={styles.lockEmoji}>🛡️</Text>
              <Text style={styles.lockTitle}>Locked by Parent</Text>
              <Text style={styles.lockDesc}>{lockMessage}</Text>
              <Text style={styles.lockActionHint}>
                Tap anywhere else to return to the welcome screen
              </Text>
            </View>
            <Pressable
              style={styles.parentControlsButton}
              onPress={() => {
                setIsLocked(false);
                router.push({
                  pathname: "/settings",
                  params: { openParentControls: "true" },
                } as any);
              }}
            >
              <Text style={styles.parentControlsButtonText}>
                Parental Controls
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </GradientSafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#091426" },
  levelUpBanner: {
    position: "absolute",
    top: 15,
    left: 18,
    right: 18,
    zIndex: 999,
    backgroundColor: "#464<ae",
    borderColor: "#ffdf4e",
    borderWidth: 2,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  levelUpText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 13,
    textAlign: "center",
  },
  content: { padding: 18, paddingBottom: 40 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: { flexDirection: "row", alignItems: "center", gap: 8 },
  avatar: { width: 44, height: 44 },
  small: { color: "#d6dced", fontSize: 12 },
  name: { color: "#fff", fontWeight: "900", fontSize: 18 },
  bell: {
    color: "#d0c6ff",
    fontSize: 20,
    borderColor: "#725df2",
    borderWidth: 1,
    borderRadius: 20,
    padding: 7,
  },
  progress: {
    backgroundColor: "#202866",
    borderColor: "#625cff",
    borderWidth: 1,
    borderRadius: 13,
    padding: 10,
    marginTop: 18,
  },
  labels: { flexDirection: "row", justifyContent: "space-between" },
  label: { color: "#fff", fontSize: 11, fontWeight: "800" },
  levelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },
  xp: { color: "#edaa39", fontWeight: "900" },
  track: { backgroundColor: "#000", height: 7, borderRadius: 5, marginTop: 5 },
  fill: { height: "100%", backgroundColor: "#df6ce8", borderRadius: 5 },
  section: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "900",
    marginTop: 20,
    marginBottom: 9,
  },
  cards: { flexDirection: "row", gap: 10 },
  course: {
    flex: 1,
    minHeight: 102,
    backgroundColor: "#172849",
    borderColor: "#4568cf",
    borderWidth: 1,
    borderRadius: 15,
    padding: 11,
  },
  courseIcon: { color: "#f1bd48", fontSize: 27, fontWeight: "900" },
  courseTitle: { color: "#fff", fontWeight: "900", marginTop: 4, fontSize: 13 },
  courseSub: { color: "#bac7e0", fontSize: 10, marginTop: 2 },
  challenge: {
    backgroundColor: "#4642ae",
    borderColor: "#c2cf34",
    borderWidth: 1,
    borderRadius: 17,
    padding: 12,
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  challengeTag: { color: "#ffdf4e", fontWeight: "900", fontSize: 10 },
  challengeTitle: { color: "#fff", fontWeight: "900", fontSize: 17 },
  challengeSub: { color: "#fff", fontSize: 10 },
  target: { width: 55, height: 55 },
  study: {
    backgroundColor: "#172849",
    borderColor: "#4568cf",
    borderWidth: 1,
    borderRadius: 13,
    padding: 14,
  },
  studyValue: { color: "#7ce1ff", fontWeight: "900", fontSize: 22 },
  studyCopy: { color: "#c0cbe0", fontSize: 11, marginTop: 4 },
  arcadeStack: {
    gap: 10,
    marginTop: 4,
  },
  arcadeGameRow: {
    backgroundColor: "#131d3b",
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  recentGameBorder: {
    borderColor: "#3b82f6",
  },
  featuredGameBorder: {
    borderColor: "#f59e0b",
  },
  arcadeIconBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1e2c56",
    alignItems: "center",
    justifyContent: "center",
  },
  arcadeIconText: {
    fontSize: 22,
  },
  arcadeGameMeta: {
    flex: 1,
  },
  arcadeTitleLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  arcadeGameTitle: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
  },
  gameBadgePill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeRecent: {
    backgroundColor: "#1d4ed8",
  },
  badgeFeatured: {
    backgroundColor: "#b45309",
  },
  gameBadgePillText: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "900",
  },
  arcadeGameDesc: {
    color: "#94a3b8",
    fontSize: 11,
    marginTop: 2,
  },
  arcadePlayButton: {
    backgroundColor: "#4f46e5",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  arcadePlayText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "900",
  },
  lockOverlay: {
    flex: 1,
    position: "relative",
    backgroundColor: "rgba(9, 11, 32, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  lockContentContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    width: "100%",
  },
  lockBackdropButton: {
    ...StyleSheet.absoluteFill,
  },
  lockCopy: {
    alignItems: "center",
    width: "100%",
  },
  parentControlsButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#a5b4fc",
    backgroundColor: "#252b58",
  },
  parentControlsButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },
  lockEmoji: { fontSize: 50, marginBottom: 12 },
  lockTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 8,
    textAlign: "center",
  },
  lockDesc: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
  },
  lockActionHint: {
    color: "#818cf8",
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
    textDecorationLine: "underline",
  },
});