import { curriculum, type Subject } from "@/app/components/curriculum";
import { GradientSafeAreaView } from "@/components/gradient-safe-area";
import { normalizeXpValue, useProgress } from "@/hooks/use-progress";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const logo = require("../../assets/BiosphereQuestAssets/Biosphere Quest Logo.png");
const target = require("../../assets/BiosphereQuestAssets/target.png");

const STORAGE_KEY = "@biosphere_profile_data_v1";
const PARENT_CONTROLS_KEY = "@biosphere_parent_controls_v1";
const LAST_LESSON_KEY = "@biosphere_last_lesson_v1";
const COMPLETED_LESSONS_KEY = "@biosphere_completed_lessons_v1";
const RECENT_GAMES_KEY = "@biosphere_recent_games_v1";
const STUDY_SESSIONS_KEY = "@biosphere_study_sessions_v1";

interface ActiveLessonData {
  grade: number;
  subjectTitle: string;
  lessonTitle: string;
  icon: string;
  difficulty: string;
  color?: string;
}

interface MiniGameMeta {
  key: string;
  title: string;
  subtitle: string;
  icon: string;
  badge: string;
  isRecent: boolean;
}

interface StudySession {
  id: string;
  title: string;
  category: string;
  dateStr: string;
  dayOfWeek: string;
  startTime: string;
  durationHours: number;
  durationMinutes: number;
  notes: string;
  reminder: string;
}

interface LeaderboardNotification {
  id: string;
  type: "weekly" | "daily";
  title: string;
  message: string;
  timestamp: string;
  badge: string;
}

const ALL_ARCADE_GAMES = [
  {
    key: "flashcards",
    title: "Flashcards",
    subtitle: "Formulas & definitions",
    icon: "🧠",
    defaultBadge: "Smart",
  },
  {
    key: "scramble",
    title: "Word Scramble",
    subtitle: "Science terminology",
    icon: "🔤",
    defaultBadge: "Spelling",
  },
  {
    key: "memory",
    title: "Memory Match",
    subtitle: "Flip & pair icons",
    icon: "⭐",
    defaultBadge: "Memory",
  },
  {
    key: "ninja",
    title: "Number Ninja",
    subtitle: "Rapid arithmetic",
    icon: "⚡",
    defaultBadge: "Speed",
  },
  {
    key: "whack",
    title: "Whack-a-Number",
    subtitle: "Pop correct target",
    icon: "🎯",
    defaultBadge: "Action",
  },
  {
    key: "codebreaker",
    title: "Codebreaker",
    subtitle: "Defuse the vault",
    icon: "🔥",
    defaultBadge: "Vault",
  },
];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const MONTH_SHORT = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
];
const WEEKDAY_NAMES_FULL = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
];
const WEEKDAYS_SHORT = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const CATEGORIES = ["Science", "Math", "Ecology", "Biology", "General"];
const REMINDERS = ["None", "5 mins before", "10 mins before", "30 mins before"];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function HomeScreen(): React.JSX.Element {
  const progress = useProgress();
  const appear = useRef(new Animated.Value(0)).current;
  const levelUpAnim = useRef(new Animated.Value(-120)).current;

  const floatAnim = useRef(new Animated.Value(0)).current;
  const bellPulseAnim = useRef(new Animated.Value(1)).current;
  const xpPulseAnim = useRef(new Animated.Value(1)).current;

  const slideAnim = useRef(new Animated.Value(0)).current;
  const sessionsListAnim = useRef(new Animated.Value(0)).current;
  const modalBadgePulse = useRef(new Animated.Value(1)).current;

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
  const [recentLessons, setRecentLessons] = useState<ActiveLessonData[]>([]);
  const [hasCourseRecords, setHasCourseRecords] = useState(false);
  const [welcomeSubjects, setWelcomeSubjects] = useState<string[]>([]);
  const [displayGames, setDisplayGames] = useState<MiniGameMeta[]>([]);

  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState(now.getDate());
  const [isCalendarCollapsed, setIsCalendarCollapsed] = useState(false);

  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [isAddSessionModalOpen, setIsAddSessionModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);

  const [leaderboardNotifications, setLeaderboardNotifications] = useState<LeaderboardNotification[]>([]);

  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("Science");
  const [formStartHour, setFormStartHour] = useState(9);
  const [formStartMin, setFormStartMin] = useState(0);
  const [formStartPeriod, setFormStartPeriod] = useState<"AM" | "PM">("AM");
  const [formDurationHours, setFormDurationHours] = useState(0);
  const [formDurationMins, setFormDurationMins] = useState(30);
  const [formNotes, setFormNotes] = useState("");
  const [formReminder, setFormReminder] = useState("10 mins before");

  const nextLevelXp = progress.nextLevelXp || 100;
  const width = `${Math.min(100, Math.round((xp / nextLevelXp) * 100))}%` as any;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -5,
          duration: 1300,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1300,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(bellPulseAnim, {
          toValue: 1.18,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(bellPulseAnim, {
          toValue: 1,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.delay(3500),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(xpPulseAnim, {
          toValue: 0.75,
          duration: 800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(xpPulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(modalBadgePulse, {
          toValue: 1.1,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(modalBadgePulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    checkParentRules();
    const interval = setInterval(checkParentRules, 20000);
    return () => clearInterval(interval);
  }, []);

  // Generate Leaderboard Notifications (Weekly & Daily)
  useEffect(() => {
    const generateLeaderboardAlerts = () => {
      const mockRank = xp > 5000 ? 1 : xp > 3000 ? 2 : xp > 1500 ? 3 : 4;
      
      const weeklyAlert: LeaderboardNotification = {
        id: "weekly-lb-1",
        type: "weekly",
        title: mockRank === 1 ? "🏆 Weekly Champion!" : `🥇 Weekly Leaderboard: Rank #${mockRank}`,
        message: mockRank === 1 
          ? `Congratulations ${userName}! You finished #1 on the Weekly Champions Leaderboard with ${xp} XP!`
          : `Great job ${userName}! You completed the week at place #${mockRank} with ${xp} XP. Keep learning to reach #1!`,
        timestamp: "Weekly Summary",
        badge: mockRank === 1 ? "WINNER" : "TOP RANK",
      };

      const dailyAlert: LeaderboardNotification = {
        id: "daily-lb-1",
        type: "daily",
        title: `📊 Daily Rank Update: #${mockRank}`,
        message: `Hello ${userName}! Your account is currently at rank #${mockRank} on today's leaderboard with ${xp} XP.`,
        timestamp: "Today",
        badge: "DAILY UPDATE",
      };

      setLeaderboardNotifications([weeklyAlert, dailyAlert]);
    };

    generateLeaderboardAlerts();
  }, [userName, xp]);

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfWeek = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const formatSelectedDateKey = (dayNum: number, m = currentMonth, y = currentYear) => {
    const formattedMonth = String(m + 1).padStart(2, "0");
    const formattedDay = String(dayNum).padStart(2, "0");
    return `${y}-${formattedMonth}-${formattedDay}`;
  };

  const triggerSlideAnimation = (direction: "up" | "down", callback: () => void) => {
    const startVal = direction === "up" ? 18 : -18;
    slideAnim.setValue(startVal);
    callback();
    Animated.spring(slideAnim, {
      toValue: 0,
      friction: 7,
      tension: 110,
      useNativeDriver: true,
    }).start();
  };

  const handlePrevMonth = () => {
    triggerSlideAnimation("up", () => {
      let nextMonth = currentMonth - 1;
      let nextYear = currentYear;
      if (nextMonth < 0) {
        nextMonth = 11;
        nextYear = currentYear - 1;
      }
      setCurrentMonth(nextMonth);
      setCurrentYear(nextYear);

      const maxDays = getDaysInMonth(nextMonth, nextYear);
      setSelectedDay((prev) => Math.min(prev, maxDays));
      triggerSessionListAnimation();
    });
  };

  const handleNextMonth = () => {
    triggerSlideAnimation("down", () => {
      let nextMonth = currentMonth + 1;
      let nextYear = currentYear;
      if (nextMonth > 11) {
        nextMonth = 0;
        nextYear = currentYear + 1;
      }
      setCurrentMonth(nextMonth);
      setCurrentYear(nextYear);

      const maxDays = getDaysInMonth(nextMonth, nextYear);
      setSelectedDay((prev) => Math.min(prev, maxDays));
      triggerSessionListAnimation();
    });
  };

  const triggerSessionListAnimation = () => {
    sessionsListAnim.setValue(0);
    Animated.spring(sessionsListAnim, {
      toValue: 1,
      friction: 6,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handleSelectDayNumber = (dayNum: number) => {
    setSelectedDay(dayNum);
    triggerSessionListAnimation();
  };

  const loadStudySessions = async () => {
    try {
      const stored = await AsyncStorage.getItem(STUDY_SESSIONS_KEY);
      if (stored) {
        setStudySessions(JSON.parse(stored));
      } else {
        const todayStr = formatSelectedDateKey(now.getDate(), now.getMonth(), now.getFullYear());
        const initialSample: StudySession[] = [
          {
            id: "1",
            title: "Biosphere Lab Quiz Review",
            category: "Science",
            dateStr: todayStr,
            dayOfWeek: WEEKDAY_NAMES_FULL[now.getDay()],
            startTime: "9:00 AM",
            durationHours: 0,
            durationMinutes: 30,
            notes: "Review plant germination and energy laws",
            reminder: "10 mins before",
          },
        ];
        setStudySessions(initialSample);
        await AsyncStorage.setItem(STUDY_SESSIONS_KEY, JSON.stringify(initialSample));
      }
      sessionsListAnim.setValue(1);
    } catch (e) {
      console.error("Failed to load study sessions", e);
    }
  };

  const handleSaveStudySession = async () => {
    const dateKey = formatSelectedDateKey(selectedDay);
    const dateObj = new Date(currentYear, currentMonth, selectedDay);
    const formattedStartTime = `${formStartHour}:${String(formStartMin).padStart(2, "0")} ${formStartPeriod}`;

    const newSession: StudySession = {
      id: Date.now().toString(),
      title: formTitle.trim() || "Study Session",
      category: formCategory,
      dateStr: dateKey,
      dayOfWeek: WEEKDAY_NAMES_FULL[dateObj.getDay()],
      startTime: formattedStartTime,
      durationHours: formDurationHours,
      durationMinutes: formDurationMins,
      notes: formNotes,
      reminder: formReminder,
    };

    const updated = [newSession, ...studySessions];
    setStudySessions(updated);
    try {
      await AsyncStorage.setItem(STUDY_SESSIONS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save study session", e);
    }

    setFormTitle("");
    setIsAddSessionModalOpen(false);
    triggerSessionListAnimation();
  };

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
            "🌙 Bedtime Lock Active!\nYour parent set bedtime for " +
              controls.bedtimeHour +
              ". Time to rest!",
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
      "Congratulations! You leveled up from " +
        formattedOld +
        " to " +
        formattedNew +
        "!",
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
        const fallback = ALL_ARCADE_GAMES.find(
          (g) => g.key !== availableRecents[0],
        );
        firstTwoKeys = [availableRecents[0], fallback ? fallback.key : "ninja"];
      } else {
        firstTwoKeys = ["flashcards", "ninja"];
      }

      const remainingGames = ALL_ARCADE_GAMES.filter(
        (g) => !firstTwoKeys.includes(g.key) && g.key !== "quiz",
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
          badge: "Suggested",
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
      const initialSubjects = await AsyncStorage.getItem("explorerSubjects");

      if (initialSubjects) {
        setWelcomeSubjects(JSON.parse(initialSubjects));
      } else {
        setWelcomeSubjects([]);
      }

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

      setLastLesson(progress.lastLesson);
      setHasCourseRecords(progress.completedLessons.length > 0);

      const recentStr = await AsyncStorage.getItem("@biosphere_recent_lessons");
      if (recentStr) {
        setRecentLessons(JSON.parse(recentStr));
      } else if (progress.lastLesson) {
        const gradeSubjs = curriculum[resolvedGrade] || [];
        const matched = gradeSubjs.find(
          (s) => s.title === progress.lastLesson?.subjectTitle,
        );
        setRecentLessons([
          {
            ...progress.lastLesson,
            color: matched?.color || "#4f46e5",
          } as ActiveLessonData,
        ]);
      }
    } catch (e) {
      console.error("Failed to load shared progress on home", e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadSharedProgress();
      loadArcadeGames();
      loadStudySessions();
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

  const launchMiniGame = (gameKey: string) => {
    router.push({
      pathname: "/games",
      params: { autoOpenGame: gameKey },
    } as any);
  };

  const handleOpenSubjectFromHome = (subjectTitle: string) => {
    router.push({
      pathname: "/explore",
      params: { autoOpenSubject: subjectTitle },
    } as any);
  };

  const createCardPressHandler = (action: () => void) => {
    const scale = new Animated.Value(1);

    const onPressIn = () => {
      Animated.spring(scale, {
        toValue: 0.95,
        friction: 4,
        useNativeDriver: true,
      }).start();
    };

    const onPressOut = () => {
      Animated.spring(scale, {
        toValue: 1,
        friction: 3,
        tension: 180,
        useNativeDriver: true,
      }).start(() => {
        action();
      });
    };

    return { scale, onPressIn, onPressOut };
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDayOffset = getFirstDayOfWeek(currentMonth, currentYear);

  const prevMonthIndex = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const daysInPrevMonth = getDaysInMonth(prevMonthIndex, prevMonthYear);

  const activeDateObj = new Date(currentYear, currentMonth, selectedDay);
  const activeDayOfWeekName = WEEKDAY_NAMES_FULL[activeDateObj.getDay()];

  const targetDateKey = formatSelectedDateKey(selectedDay);
  const activeDaySessions = studySessions.filter((s) => s.dateStr === targetDateKey);

  const sessionListTranslateY = sessionsListAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [12, 0],
  });

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
            <Animated.View style={{ transform: [{ translateY: floatAnim }] }}>
              <Image source={logo} style={styles.avatar} contentFit="contain" />
            </Animated.View>
            <View>
              <Text style={styles.small}>
                {greeting},{userGrade ? ` Grade ${userGrade}` : ""}
              </Text>
              <Text style={styles.name}>{userName}</Text>
            </View>
          </View>
          <Pressable onPress={() => setIsNotificationsModalOpen(true)}>
            <Animated.Text
              style={[
                styles.bell,
                { transform: [{ scale: bellPulseAnim }] },
              ]}
            >
              🔔
            </Animated.Text>
          </Pressable>
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
              <Animated.View
                style={[
                  styles.fill,
                  { width, opacity: xpPulseAnim },
                ]}
              />
            </View>
          </View>

          {!hasCourseRecords ? (
            <View>
              <Text style={styles.sectionTitle}>
                Start Your First Lesson 🚀
              </Text>

              <View style={styles.recentLessonsStack}>
                {(() => {
                  const gradeSubjs =
                    curriculum[parseInt(userGrade, 10) || 1] || curriculum[1];

                  let displaySubjs = welcomeSubjects
                    .map((ws) =>
                      gradeSubjs.find(
                        (s) => s.title.toLowerCase() === ws.toLowerCase(),
                      ),
                    )
                    .filter(Boolean) as Subject[];

                  if (displaySubjs.length >= 3) {
                    displaySubjs = displaySubjs
                      .sort(() => 0.5 - Math.random())
                      .slice(0, 2);
                  }

                  return displaySubjs.map((subjDef, idx) => {
                    const cardHandler = createCardPressHandler(() =>
                      handleOpenSubjectFromHome(subjDef.title)
                    );

                    return (
                      <AnimatedPressable
                        key={idx}
                        style={[
                          styles.recentLessonCard,
                          { transform: [{ scale: cardHandler.scale }] },
                        ]}
                        onPressIn={cardHandler.onPressIn}
                        onPressOut={cardHandler.onPressOut}
                      >
                        <LinearGradient
                          colors={[
                            subjDef.color || "#4f46e5",
                            (subjDef.color || "#4f46e5") + "99",
                          ]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.recentLessonGradient}
                        >
                          <View style={styles.recentLessonIconBubble}>
                            <Text style={styles.recentLessonIcon}>
                              {subjDef.icon}
                            </Text>
                          </View>
                          <View style={styles.recentLessonMeta}>
                            <Text style={styles.recentLessonTitle}>
                              Grade {userGrade} Course
                            </Text>
                            <Text
                              style={styles.recentLessonSubtitle}
                              numberOfLines={1}
                            >
                              {subjDef.title}
                            </Text>
                          </View>
                          <View style={styles.recentLessonPlayBtn}>
                            <Text
                              style={[
                                styles.recentLessonPlayText,
                                { color: subjDef.color || "#4f46e5" },
                              ]}
                            >
                              Start
                            </Text>
                          </View>
                        </LinearGradient>
                      </AnimatedPressable>
                    );
                  });
                })()}
              </View>
            </View>
          ) : (
            <View>
              <Text style={styles.section}>Continue Learning</Text>

              <View style={styles.recentLessonsStack}>
                {recentLessons.map((lesson, index) => {
                  const cardHandler = createCardPressHandler(() =>
                    handleOpenSubjectFromHome(lesson.subjectTitle)
                  );

                  return (
                    <AnimatedPressable
                      key={index}
                      style={[
                        styles.recentLessonCard,
                        { transform: [{ scale: cardHandler.scale }] },
                      ]}
                      onPressIn={cardHandler.onPressIn}
                      onPressOut={cardHandler.onPressOut}
                    >
                      <LinearGradient
                        colors={[
                          lesson.color || "#4f46e5",
                          (lesson.color || "#4f46e5") + "99",
                        ]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.recentLessonGradient}
                      >
                        <View style={styles.recentLessonIconBubble}>
                          <Text style={styles.recentLessonIcon}>
                            {lesson.icon}
                          </Text>
                        </View>
                        <View style={styles.recentLessonMeta}>
                          <Text style={styles.recentLessonTitle}>
                            {lesson.subjectTitle}
                          </Text>
                          <Text
                            style={styles.recentLessonSubtitle}
                            numberOfLines={1}
                          >
                            {lesson.lessonTitle}
                          </Text>
                        </View>
                        <View style={styles.recentLessonPlayBtn}>
                          <Text
                            style={[
                              styles.recentLessonPlayText,
                              { color: lesson.color || "#4f46e5" },
                            ]}
                          >
                            Resume
                          </Text>
                        </View>
                      </LinearGradient>
                    </AnimatedPressable>
                  );
                })}
              </View>
            </View>
          )}

          {(() => {
            const challengeHandler = createCardPressHandler(() =>
              launchMiniGame("quiz")
            );

            return (
              <AnimatedPressable
                style={[
                  styles.challenge,
                  { transform: [{ scale: challengeHandler.scale }] },
                ]}
                onPressIn={challengeHandler.onPressIn}
                onPressOut={challengeHandler.onPressOut}
              >
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.challengeTag}>DAILY CHALLENGE</Text>
                  <Text style={styles.challengeTitle}>Science & Math Quiz</Text>
                  <Text style={styles.challengeSub}>
                    5 questions • +150 XP • Tap to Start!
                  </Text>
                </View>
                <Animated.View style={{ transform: [{ translateY: floatAnim }] }}>
                  <Image source={target} style={styles.target} contentFit="contain" />
                </Animated.View>
              </AnimatedPressable>
            );
          })()}

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
            {displayGames.map((game) => {
              const gameHandler = createCardPressHandler(() =>
                launchMiniGame(game.key)
              );

              return (
                <AnimatedPressable
                  key={game.key}
                  style={[
                    styles.arcadeGameRow,
                    game.isRecent
                      ? styles.recentGameBorder
                      : styles.featuredGameBorder,
                    { transform: [{ scale: gameHandler.scale }] },
                  ]}
                  onPressIn={gameHandler.onPressIn}
                  onPressOut={gameHandler.onPressOut}
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
                          game.isRecent
                            ? styles.badgeRecent
                            : styles.badgeFeatured,
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
                </AnimatedPressable>
              );
            })}
          </View>

          {/* CALENDAR WIDGET */}
          <Text style={styles.section}>Study Calendar & Schedule</Text>
          <View style={styles.calendarWidget}>
            <View style={styles.calendarTopHeader}>
              <Text style={styles.calendarTopHeaderDate}>
                {activeDayOfWeekName}, {MONTH_NAMES[currentMonth]} {selectedDay}
              </Text>
              <Pressable
                style={styles.calendarCollapseBtn}
                onPress={() => setIsCalendarCollapsed(!isCalendarCollapsed)}
              >
                <Text style={styles.calendarCollapseIcon}>
                  {isCalendarCollapsed ? "⌄" : "⌃"}
                </Text>
              </Pressable>
            </View>

            {!isCalendarCollapsed && (
              <>
                <View style={styles.monthTitleRow}>
                  <Text style={styles.monthTitleText}>
                    {MONTH_NAMES[currentMonth]} {currentYear}
                  </Text>
                  <View style={styles.monthNavArrowsGroup}>
                    <Pressable style={styles.arrowIconBtn} onPress={handlePrevMonth}>
                      <Text style={styles.caretIconText}>▲</Text>
                    </Pressable>
                    <Pressable style={styles.arrowIconBtn} onPress={handleNextMonth}>
                      <Text style={styles.caretIconText}>▼</Text>
                    </Pressable>
                  </View>
                </View>

                <Animated.View
                  style={{
                    transform: [{ translateY: slideAnim }],
                    opacity: slideAnim.interpolate({
                      inputRange: [-18, 0, 18],
                      outputRange: [0.3, 1, 0.3],
                    }),
                  }}
                >
                  <View style={styles.calendarGridHeaderRow}>
                    {WEEKDAYS_SHORT.map((dayLabel) => (
                      <Text key={dayLabel} style={styles.weekdayHeaderText}>
                        {dayLabel}
                      </Text>
                    ))}
                  </View>

                  <View style={styles.calendarGridContainer}>
                    {[...Array(firstDayOffset)].map((_, i) => {
                      const prevDayNum = daysInPrevMonth - firstDayOffset + i + 1;
                      return (
                        <View key={`prev-${i}`} style={styles.calendarDayCell}>
                          <Text style={styles.calendarDayCellTextDimmed}>
                            {prevDayNum}
                          </Text>
                        </View>
                      );
                    })}

                    {[...Array(daysInMonth)].map((_, i) => {
                      const dayNum = i + 1;
                      const isSelected = selectedDay === dayNum;
                      const dateKey = formatSelectedDateKey(dayNum);
                      const hasSession = studySessions.some((s) => s.dateStr === dateKey);

                      return (
                        <Pressable
                          key={`day-${dayNum}`}
                          style={[
                            styles.calendarDayCell,
                            isSelected && styles.calendarDayCellSelected,
                          ]}
                          onPress={() => handleSelectDayNumber(dayNum)}
                        >
                          <Text
                            style={[
                              styles.calendarDayCellText,
                              isSelected && styles.calendarDayCellTextSelected,
                            ]}
                          >
                            {dayNum}
                          </Text>
                          {hasSession && !isSelected && (
                            <View style={styles.calendarDot} />
                          )}
                        </Pressable>
                      );
                    })}

                    {(() => {
                      const totalCellsUsed = firstDayOffset + daysInMonth;
                      const remainingSlots = (7 - (totalCellsUsed % 7)) % 7;
                      const extraSlotsNeeded = totalCellsUsed + remainingSlots < 35 
                        ? remainingSlots + 7 
                        : remainingSlots;

                      return [...Array(extraSlotsNeeded)].map((_, i) => (
                        <View key={`next-${i}`} style={styles.calendarDayCell}>
                          <Text style={styles.calendarDayCellTextDimmed}>
                            {i + 1}
                          </Text>
                        </View>
                      ));
                    })()}
                  </View>
                </Animated.View>
              </>
            )}

            <View style={styles.agendaHeaderRow}>
              <Text style={styles.selectedDateHeadline}>
                Study Sessions
              </Text>
              <Pressable
                style={styles.addScheduleBtn}
                onPress={() => setIsAddSessionModalOpen(true)}
              >
                <Text style={styles.addScheduleBtnText}>+ Schedule</Text>
              </Pressable>
            </View>

            <Animated.View
              style={[
                styles.sessionsContainer,
                {
                  opacity: sessionsListAnim,
                  transform: [{ translateY: sessionListTranslateY }],
                },
              ]}
            >
              {activeDaySessions.length === 0 ? (
                <Text style={styles.noSessionsText}>
                  No study sessions planned for this date. Tap "+ Schedule" to add one!
                </Text>
              ) : (
                activeDaySessions.map((session) => (
                  <View key={session.id} style={styles.sessionItemCard}>
                    <View style={styles.sessionCardLeft}>
                      <View style={styles.sessionCategoryPill}>
                        <Text style={styles.sessionCategoryText}>
                          {session.category}
                        </Text>
                      </View>
                      <Text style={styles.sessionTitleText}>{session.title}</Text>
                      {session.notes ? (
                        <Text style={styles.sessionNotesText} numberOfLines={1}>
                          {session.notes}
                        </Text>
                      ) : null}
                    </View>
                    <View style={styles.sessionCardRight}>
                      <Text style={styles.sessionTimeText}>{session.startTime}</Text>
                      <Text style={styles.sessionDurationText}>
                        {session.durationHours > 0 ? `${session.durationHours}h ` : ""}
                        {session.durationMinutes}m
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </Animated.View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* NOTIFICATIONS MODAL WITH LEADERBOARD ALERTS */}
      <Modal
        visible={isNotificationsModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsNotificationsModalOpen(false)}
      >
        <View style={styles.sessionModalBackdrop}>
          <View style={styles.sessionModalContainer}>
            <View style={styles.sessionModalHeader}>
              <Text style={styles.sessionModalHeaderTitle}>🔔 Notifications</Text>
              <Pressable
                style={styles.sessionModalSaveBtn}
                onPress={() => setIsNotificationsModalOpen(false)}
              >
                <Text style={styles.sessionModalSaveBtnText}>Close</Text>
              </Pressable>
            </View>

            <ScrollView
              contentContainerStyle={styles.sessionModalContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.formSectionHeader}>LEADERBOARD UPDATES</Text>
              {leaderboardNotifications.map((lb) => (
                <View key={lb.id} style={styles.formCard}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <View style={styles.lbBadgePill}>
                      <Text style={styles.lbBadgePillText}>{lb.badge}</Text>
                    </View>
                    <Text style={{ color: "#94a3b8", fontSize: 10, fontWeight: "700" }}>
                      {lb.timestamp}
                    </Text>
                  </View>
                  <Text style={{ color: "#ffffff", fontSize: 15, fontWeight: "900", marginTop: 6 }}>
                    {lb.title}
                  </Text>
                  <Text style={{ color: "#cbd5e1", fontSize: 12, fontWeight: "600", marginTop: 4, lineHeight: 18 }}>
                    {lb.message}
                  </Text>
                </View>
              ))}

              <Text style={styles.formSectionHeader}>UPCOMING STUDY REMINDERS</Text>
              {studySessions.length === 0 ? (
                <View style={styles.formCard}>
                  <Text style={styles.noSessionsText}>
                    No active study reminders scheduled yet.
                  </Text>
                </View>
              ) : (
                studySessions.map((session) => (
                  <View key={session.id} style={styles.formCard}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <Text style={{ color: "#38bdf8", fontWeight: "900", fontSize: 11 }}>
                        {session.category.toUpperCase()} • {session.reminder}
                      </Text>
                      <Text style={{ color: "#94a3b8", fontSize: 10, fontWeight: "700" }}>
                        {session.dateStr}
                      </Text>
                    </View>
                    <Text style={{ color: "#ffffff", fontSize: 15, fontWeight: "900", marginTop: 4 }}>
                      {session.title}
                    </Text>
                    <Text style={{ color: "#818cf8", fontSize: 12, fontWeight: "800", marginTop: 2 }}>
                      ⏰ Start Time: {session.startTime} ({session.durationHours > 0 ? `${session.durationHours}h ` : ""}{session.durationMinutes}m)
                    </Text>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ADD STUDY SESSION MODAL */}
      <Modal
        visible={isAddSessionModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAddSessionModalOpen(false)}
      >
        <View style={styles.sessionModalBackdrop}>
          <View style={styles.sessionModalContainer}>
            <View style={styles.sessionModalHeader}>
              <Pressable onPress={() => setIsAddSessionModalOpen(false)}>
                <Text style={styles.sessionModalCancelText}>Cancel</Text>
              </Pressable>
              <View style={styles.sessionModalHeaderTitleGroup}>
                <Animated.View
                  style={[
                    styles.sessionModalDateBadge,
                    { transform: [{ scale: modalBadgePulse }] },
                  ]}
                >
                  <Text style={styles.sessionModalDateBadgeMonth}>
                    {MONTH_SHORT[currentMonth]}
                  </Text>
                  <Text style={styles.sessionModalDateBadgeDay}>{selectedDay}</Text>
                </Animated.View>
                <Text style={styles.sessionModalHeaderTitle}>Add Study Session</Text>
              </View>
              <Pressable
                style={styles.sessionModalSaveBtn}
                onPress={handleSaveStudySession}
              >
                <Text style={styles.sessionModalSaveBtnText}>Save</Text>
              </Pressable>
            </View>

            <ScrollView
              contentContainerStyle={styles.sessionModalContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.formSectionHeader}>CORE INFORMATION</Text>
              <View style={styles.formCard}>
                <Text style={styles.formFieldLabel}>SESSION TITLE / TOPIC *</Text>
                <TextInput
                  style={styles.formTextInput}
                  placeholder="e.g. Biosphere Lab Quiz Review"
                  placeholderTextColor="#64748b"
                  value={formTitle}
                  onChangeText={setFormTitle}
                />

                <View style={styles.formDivider} />

                <Text style={styles.formFieldLabel}>CATEGORY / SUBJECT</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.formChipsRow}
                >
                  {CATEGORIES.map((cat) => {
                    const isSel = formCategory === cat;
                    const chipHandler = createCardPressHandler(() => setFormCategory(cat));

                    return (
                      <AnimatedPressable
                        key={cat}
                        style={[
                          styles.formChip,
                          isSel && styles.formChipSelected,
                          { transform: [{ scale: chipHandler.scale }] },
                        ]}
                        onPressIn={chipHandler.onPressIn}
                        onPressOut={chipHandler.onPressOut}
                      >
                        <Text
                          style={[
                            styles.formChipText,
                            isSel && styles.formChipTextSelected,
                          ]}
                        >
                          {cat}
                        </Text>
                      </AnimatedPressable>
                    );
                  })}
                </ScrollView>
              </View>

              <Text style={styles.formSectionHeader}>TIMING & SCHEDULE</Text>
              <View style={styles.formCard}>
                <Text style={styles.formFieldLabel}>TARGET DATE</Text>
                <Text style={{ color: "#ffffff", fontWeight: "900", fontSize: 13, marginBottom: 12 }}>
                  {MONTH_NAMES[currentMonth]} {selectedDay}, {currentYear}
                </Text>

                <View style={styles.formDivider} />

                <Text style={styles.formFieldLabel}>PRESET START TIME</Text>
                <View style={styles.timePickerRow}>
                  {[
                    { h: 8, m: 0, p: "AM" as const },
                    { h: 9, m: 0, p: "AM" as const },
                    { h: 10, m: 0, p: "AM" as const },
                    { h: 2, m: 0, p: "PM" as const },
                    { h: 4, m: 0, p: "PM" as const },
                    { h: 7, m: 0, p: "PM" as const },
                  ].map((preset, idx) => {
                    const isSel =
                      formStartHour === preset.h &&
                      formStartMin === preset.m &&
                      formStartPeriod === preset.p;
                    const label = `${preset.h}:00 ${preset.p}`;
                    const timeHandler = createCardPressHandler(() => {
                      setFormStartHour(preset.h);
                      setFormStartMin(preset.m);
                      setFormStartPeriod(preset.p);
                    });

                    return (
                      <AnimatedPressable
                        key={idx}
                        style={[
                          styles.formChip,
                          isSel && styles.formChipSelected,
                          { transform: [{ scale: timeHandler.scale }] },
                        ]}
                        onPressIn={timeHandler.onPressIn}
                        onPressOut={timeHandler.onPressOut}
                      >
                        <Text
                          style={[
                            styles.formChipText,
                            isSel && styles.formChipTextSelected,
                          ]}
                        >
                          {label}
                        </Text>
                      </AnimatedPressable>
                    );
                  })}
                </View>

                <View style={styles.formDivider} />

                <Text style={styles.formFieldLabel}>CUSTOMIZE TIME</Text>
                <View style={styles.customTimeRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.formFieldSubLabel}>HOUR</Text>
                    <View style={styles.counterControl}>
                      <Pressable
                        style={styles.counterBtn}
                        onPress={() => setFormStartHour((h) => (h <= 1 ? 12 : h - 1))}
                      >
                        <Text style={styles.counterBtnText}>-</Text>
                      </Pressable>
                      <Text style={styles.counterValueText}>{formStartHour}</Text>
                      <Pressable
                        style={styles.counterBtn}
                        onPress={() => setFormStartHour((h) => (h >= 12 ? 1 : h + 1))}
                      >
                        <Text style={styles.counterBtnText}>+</Text>
                      </Pressable>
                    </View>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.formFieldSubLabel}>MINUTE</Text>
                    <View style={styles.counterControl}>
                      <Pressable
                        style={styles.counterBtn}
                        onPress={() => setFormStartMin((m) => (m <= 0 ? 45 : m - 15))}
                      >
                        <Text style={styles.counterBtnText}>-</Text>
                      </Pressable>
                      <Text style={styles.counterValueText}>
                        {String(formStartMin).padStart(2, "0")}
                      </Text>
                      <Pressable
                        style={styles.counterBtn}
                        onPress={() => setFormStartMin((m) => (m >= 45 ? 0 : m + 15))}
                      >
                        <Text style={styles.counterBtnText}>+</Text>
                      </Pressable>
                    </View>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.formFieldSubLabel}>AM / PM</Text>
                    <Pressable
                      style={styles.periodToggleBtn}
                      onPress={() =>
                        setFormStartPeriod((p) => (p === "AM" ? "PM" : "AM"))
                      }
                    >
                      <Text style={styles.periodToggleText}>{formStartPeriod}</Text>
                    </Pressable>
                  </View>
                </View>

                <View style={styles.formDivider} />

                <View style={styles.durationRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.formFieldLabel}>DURATION (HOURS)</Text>
                    <View style={styles.counterControl}>
                      <Pressable
                        style={styles.counterBtn}
                        onPress={() => setFormDurationHours(Math.max(0, formDurationHours - 1))}
                      >
                        <Text style={styles.counterBtnText}>-</Text>
                      </Pressable>
                      <Text style={styles.counterValueText}>{formDurationHours}</Text>
                      <Pressable
                        style={styles.counterBtn}
                        onPress={() => setFormDurationHours(formDurationHours + 1)}
                      >
                        <Text style={styles.counterBtnText}>+</Text>
                      </Pressable>
                    </View>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.formFieldLabel}>DURATION (MINUTES)</Text>
                    <View style={styles.counterControl}>
                      <Pressable
                        style={styles.counterBtn}
                        onPress={() => setFormDurationMins(Math.max(0, formDurationMins - 15))}
                      >
                        <Text style={styles.counterBtnText}>-</Text>
                      </Pressable>
                      <Text style={styles.counterValueText}>{formDurationMins}</Text>
                      <Pressable
                        style={styles.counterBtn}
                        onPress={() => setFormDurationMins(formDurationMins + 15)}
                      >
                        <Text style={styles.counterBtnText}>+</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </View>

              <Text style={styles.formSectionHeader}>ADDITIONAL DETAILS</Text>
              <View style={styles.formCard}>
                <Text style={styles.formFieldLabel}>DESCRIPTION / NOTES</Text>
                <TextInput
                  style={[styles.formTextInput, { minHeight: 60 }]}
                  placeholder="Add specific goals, chapters, or items to bring..."
                  placeholderTextColor="#64748b"
                  multiline
                  value={formNotes}
                  onChangeText={setFormNotes}
                />

                <View style={styles.formDivider} />

                <Text style={styles.formFieldLabel}>REMINDER NOTIFICATION</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.formChipsRow}
                >
                  {REMINDERS.map((r) => {
                    const isSel = formReminder === r;
                    const remHandler = createCardPressHandler(() => setFormReminder(r));

                    return (
                      <AnimatedPressable
                        key={r}
                        style={[
                          styles.formChip,
                          isSel && styles.formChipSelected,
                          { transform: [{ scale: remHandler.scale }] },
                        ]}
                        onPressIn={remHandler.onPressIn}
                        onPressOut={remHandler.onPressOut}
                      >
                        <Text
                          style={[
                            styles.formChipText,
                            isSel && styles.formChipTextSelected,
                          ]}
                        >
                          {r}
                        </Text>
                      </AnimatedPressable>
                    );
                  })}
                </ScrollView>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

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
    backgroundColor: "#4642ae",
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
  content: { padding: 16, paddingBottom: 36 },
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
    marginTop: 16,
  },
  labels: { flexDirection: "row", justifyContent: "space-between" },
  label: { color: "#fff", fontSize: 11, fontWeight: "800" },
  levelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  xp: { color: "#edaa39", fontWeight: "900" },
  track: { backgroundColor: "#000", height: 7, borderRadius: 5, marginTop: 5 },
  fill: { height: "100%", backgroundColor: "#df6ce8", borderRadius: 5 },
  
  calendarWidget: {
    backgroundColor: "#161c2e",
    borderColor: "#232a3f",
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginTop: 8,
  },
  calendarTopHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  calendarTopHeaderDate: {
    color: "#e2e8f0",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  calendarCollapseBtn: {
    backgroundColor: "#21293e",
    borderRadius: 6,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  calendarCollapseIcon: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "700",
  },
  monthTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  monthTitleText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  monthNavArrowsGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  arrowIconBtn: {
    padding: 3,
  },
  caretIconText: {
    color: "#94a3b8",
    fontSize: 9,
  },
  calendarGridHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  weekdayHeaderText: {
    flex: 1,
    textAlign: "center",
    color: "#f8fafc",
    fontSize: 12,
    fontWeight: "700",
  },
  calendarGridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  calendarDayCell: {
    width: "14.28%",
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 1,
    position: "relative",
  },
  calendarDayCellSelected: {
    backgroundColor: "#38bdf8",
    borderRadius: 16,
  },
  calendarDayCellText: {
    color: "#f8fafc",
    fontSize: 13,
    fontWeight: "500",
  },
  calendarDayCellTextDimmed: {
    color: "#475569",
    fontSize: 13,
    fontWeight: "400",
  },
  calendarDayCellTextSelected: {
    color: "#0f172a",
    fontWeight: "700",
  },
  calendarDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#38bdf8",
    position: "absolute",
    bottom: 2,
  },

  agendaHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#21293e",
  },
  selectedDateHeadline: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  addScheduleBtn: {
    backgroundColor: "#8b5cf6",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  addScheduleBtnText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "900",
  },
  sessionsContainer: {
    marginTop: 6,
  },
  noSessionsText: {
    color: "#64748b",
    fontSize: 11,
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 8,
  },
  sessionItemCard: {
    backgroundColor: "#1e273e",
    borderRadius: 10,
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
    borderLeftWidth: 3,
    borderLeftColor: "#38bdf8",
  },
  sessionCardLeft: { flex: 1, paddingRight: 8 },
  sessionCategoryPill: {
    backgroundColor: "rgba(56, 189, 248, 0.15)",
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    marginBottom: 3,
  },
  sessionCategoryText: {
    color: "#38bdf8",
    fontSize: 9,
    fontWeight: "900",
  },
  sessionTitleText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800",
  },
  sessionNotesText: {
    color: "#94a3b8",
    fontSize: 10,
    marginTop: 1,
  },
  sessionCardRight: { alignItems: "flex-end" },
  sessionTimeText: {
    color: "#7dd3fc",
    fontSize: 11,
    fontWeight: "900",
  },
  sessionDurationText: {
    color: "#94a3b8",
    fontSize: 9,
    fontWeight: "700",
    marginTop: 1,
  },

  sessionModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(3, 7, 18, 0.9)",
    justifyContent: "flex-end",
  },
  sessionModalContainer: {
    backgroundColor: "#0d152a",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: "90%",
    padding: 20,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  sessionModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  sessionModalCancelText: {
    color: "#e879f9",
    fontSize: 15,
    fontWeight: "900",
  },
  sessionModalHeaderTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sessionModalDateBadge: {
    backgroundColor: "#ef4444",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignItems: "center",
  },
  sessionModalDateBadgeMonth: {
    color: "#ffffff",
    fontSize: 8,
    fontWeight: "900",
  },
  sessionModalDateBadgeDay: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "900",
  },
  sessionModalHeaderTitle: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "900",
  },
  sessionModalSaveBtn: {
    backgroundColor: "#a855f7",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  sessionModalSaveBtnText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
  },
  sessionModalContent: {
    paddingVertical: 16,
    gap: 16,
  },
  formSectionHeader: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  formCard: {
    backgroundColor: "#141f3d",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  lbBadgePill: {
    backgroundColor: "#8b5cf6",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  lbBadgePillText: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "900",
  },
  formFieldLabel: {
    color: "#818cf8",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  formFieldSubLabel: {
    color: "#64748b",
    fontSize: 9,
    fontWeight: "900",
    marginBottom: 4,
  },
  formTextInput: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
    paddingVertical: 4,
  },
  formDivider: {
    height: 1,
    backgroundColor: "#1e293b",
    marginVertical: 12,
  },
  formChipsRow: {
    flexDirection: "row",
    gap: 8,
  },
  timePickerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  customTimeRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  periodToggleBtn: {
    backgroundColor: "#1e293b",
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  periodToggleText: {
    color: "#38bdf8",
    fontSize: 13,
    fontWeight: "900",
  },
  formChip: {
    backgroundColor: "#1e293b",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#334155",
  },
  formChipSelected: {
    backgroundColor: "#8b5cf6",
    borderColor: "#c084fc",
  },
  formChipText: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "800",
  },
  formChipTextSelected: {
    color: "#ffffff",
    fontWeight: "900",
  },
  durationRow: {
    flexDirection: "row",
    gap: 16,
  },
  counterControl: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e293b",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    justifyContent: "space-between",
  },
  counterBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  counterBtnText: {
    color: "#a855f7",
    fontSize: 16,
    fontWeight: "900",
  },
  counterValueText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
  },

  section: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "900",
    marginTop: 20,
    marginBottom: 9,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "900",
    marginTop: 20,
    marginBottom: 9,
  },
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

  recentLessonsStack: { gap: 12, marginTop: 4 },
  recentLessonCard: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  recentLessonGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
  },
  recentLessonIconBubble: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  recentLessonIcon: { fontSize: 24 },
  recentLessonMeta: { flex: 1 },
  recentLessonTitle: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  recentLessonSubtitle: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900",
    marginTop: 3,
  },
  recentLessonPlayBtn: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  recentLessonPlayText: { fontSize: 13, fontWeight: "900" },
});