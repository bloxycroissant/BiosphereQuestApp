import { GradientSafeAreaView } from "@/components/gradient-safe-area";
import { normalizeXpValue, useProgress } from "@/hooks/use-progress";
import { supabase } from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAudioPlayer } from "expo-audio";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { CodebreakerGame } from "./components/minigames/CodebreakerGame";
import { FlashcardGame } from "./components/minigames/FlashcardGame";
import { MemoryMatchGame } from "./components/minigames/MemoryMatchGame";
import { NumberNinjaGame } from "./components/minigames/NumberNinjaGame";
import { QuizGame } from "./components/minigames/QuizGame";
import { WhackANumberGame } from "./components/minigames/WhackANumberGame";
import { WordScrambleGame } from "./components/minigames/WordScrambleGame";
import TutorialModal from "./components/TutorialModal";
import { GradeLevel, Subject } from "./data/questionGenerators";

const PROFILE_STORAGE_KEY = "@biosphere_profile_data_v1";
const PARENT_CONTROLS_KEY = "@biosphere_parent_controls_v1";
const RECENT_GAMES_KEY = "@biosphere_recent_games_v1";
const gameThemeMusic = require("../../assets/BiosphereQuestSoundEffectsandMusic/The Game Show Theme Music - (192 Kbps).mp3");

interface GameItem {
  key: string;
  title: string;
  subtitle: string;
  icon: any;
  difficulty: string;
  xpText: string;
  badge: string;
  tutorial?: {
    objective: string;
    steps: string[];
  };
  isPlaceholder?: boolean;
}

interface MiniGameMeta {
  key: string;
  title: string;
  subtitle: string;
  icon: string;
  badge: string;
  isRecent: boolean;
}

interface LeaderboardEntry {
  id: string;
  full_name: string;
  weekly_xp: number;
}

const ALL_ARCADE_GAMES = [
  { key: "flashcards", title: "Flashcards", subtitle: "Formulas & definitions", icon: "🧠", defaultBadge: "Smart" },
  { key: "scramble", title: "Word Scramble", subtitle: "Science terminology", icon: "🔤", defaultBadge: "Spelling" },
  { key: "memory", title: "Memory Match", subtitle: "Flip & pair icons", icon: "⭐", defaultBadge: "Memory" },
  { key: "ninja", title: "Number Ninja", subtitle: "Rapid arithmetic", icon: "⚡", defaultBadge: "Speed" },
  { key: "whack", title: "Whack-a-Number", subtitle: "Pop correct target", icon: "🎯", defaultBadge: "Action" },
  { key: "codebreaker", title: "Codebreaker", subtitle: "Defuse the vault", icon: "🔥", defaultBadge: "Vault" },
];

const gameCatalog: GameItem[] = [
  {
    key: "flashcards",
    title: "Flashcards",
    subtitle: "Formulas & definitions",
    icon: require("../../assets/BiosphereQuestAssets/Flashcards Icon.png"),
    difficulty: "Easy",
    xpText: "+80 XP",
    badge: "🧠 Smart",
    tutorial: {
      objective: "Review essential formulas and terms to strengthen your core knowledge.",
      steps: [
        "Read the prompt or question carefully.",
        "Tap the card to flip and reveal the answer.",
        "Swipe or select your confidence level to proceed.",
      ],
    },
  },
  {
    key: "scramble",
    title: "Word Scramble",
    subtitle: "Science terminology",
    icon: require("../../assets/BiosphereQuestAssets/Word Scramble.png"),
    difficulty: "Medium",
    xpText: "+90 XP",
    badge: "🔤 Fun",
    tutorial: {
      objective: "Unscramble the letters to correctly spell key science and math terms.",
      steps: [
        "Look at the scrambled letters on screen.",
        "Tap letters in the correct order to spell the word.",
        "Submit your answer before the timer runs out!",
      ],
    },
  },
  {
    key: "memory",
    title: "Memory Match",
    subtitle: "Flip & pair icons",
    icon: require("../../assets/BiosphereQuestAssets/Brain Icon.png"),
    difficulty: "Medium",
    xpText: "Up to +240 XP",
    badge: "⭐ Match",
    tutorial: {
      objective: "Flip and match pairs of science icons to test your memory skills.",
      steps: [
        "Tap a card to flip it over.",
        "Find its matching pair among the hidden cards.",
        "Clear all pairs as fast as possible to earn bonus XP.",
      ],
    },
  },
  {
    key: "ninja",
    title: "Number Ninja",
    subtitle: "Rapid arithmetic",
    icon: require("../../assets/BiosphereQuestAssets/Ninja Icon.png"),
    difficulty: "Hard",
    xpText: "+50 XP/ ans",
    badge: "⚡ Swift",
    tutorial: {
      objective: "Solve rapid-fire arithmetic problems quickly before time runs out.",
      steps: [
        "Read the math equation quickly.",
        "Type or select the correct numerical result.",
        "Keep your streak alive for maximum XP gains.",
      ],
    },
  },
  {
    key: "whack",
    title: "Whack-a-Number",
    subtitle: "Pop correct target",
    icon: require("../../assets/BiosphereQuestAssets/Hammer Icon.png"),
    difficulty: "Hard",
    xpText: "Up to +120 XP",
    badge: "🎯 Action",
    tutorial: {
      objective: "Tap the correct popping numbers matching the prompt as fast as you can.",
      steps: [
        "Read the target instruction at the top.",
        "Tap the matching numbers as they pop up.",
        "Avoid tapping incorrect targets!",
      ],
    },
  },
  {
    key: "codebreaker",
    title: "Codebreaker",
    subtitle: "Defuse the vault",
    icon: require("../../assets/BiosphereQuestAssets/Bomb Icon.png"),
    difficulty: "Impossible",
    xpText: "Up to +500 XP",
    badge: "🔥 Expert",
    tutorial: {
      objective: "Solve the secure combinations to defuse the vault before time expires.",
      steps: [
        "Analyze clues and patterns provided on screen.",
        "Input the correct digit combination.",
        "Defuse the vault successfully before time runs out.",
      ],
    },
  },
];

const quizGameItem: GameItem = {
  key: "quiz",
  title: "Math & Science Epic Quiz",
  subtitle: "5 questions • Earn massive XP",
  icon: require("../../assets/BiosphereQuestAssets/Brain Icon.png"),
  difficulty: "Easy",
  xpText: "+150 XP",
  badge: "🚀 Epic",
  tutorial: {
    objective: "Answer multiple-choice questions correctly to score big XP points.",
    steps: [
      "Read each multiple-choice question carefully.",
      "Select the best answer from the given options.",
      "Complete all questions to claim your XP reward.",
    ],
  },
};

const getDifficultyColor = (diff: string) => {
  switch (diff) {
    case "Easy": return "#39d4ff";
    case "Medium": return "#4ade80";
    case "Hard": return "#facc15";
    case "Impossible": return "#ef4444";
    default: return "#4ade80";
  }
};

const getInitials = (name?: string) => {
  if (!name || name === "---") return "–";
  const parts = name.trim().split(/\s+/);
  if (parts.length > 1 && parts[0] && parts[1]) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export default function GamesScreen() {
  const params = useLocalSearchParams<{ autoOpenGame?: string }>();
  const { leaderboardXp, addXp, completeGame, recordRecentGame } = useProgress();
  const [difficulty, setDifficulty] = useState("All");
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [activeGameRunning, setActiveGameRunning] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(1);
  const [selectedTutorialGame, setSelectedTutorialGame] = useState<any | null>(null);
  const [memorySubjectPickerVisible, setMemorySubjectPickerVisible] = useState(false);
  const [memorySubject, setMemorySubject] = useState<Subject>("Both");

  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const [displayGames, setDisplayGames] = useState<MiniGameMeta[]>([]);

  const musicPlayer = useAudioPlayer(gameThemeMusic);
  const [isMuted, setIsMuted] = useState(false);

  const [lockedModalInfo, setLockedModalInfo] = useState<{ visible: boolean; gradeNum: number }>({
    visible: false,
    gradeNum: 1,
  });

  const [studyFirstEnabled, setStudyFirstEnabled] = useState(false);
  const [gradeLocks, setGradeLocks] = useState<{ [key: string]: boolean }>({});

  const filterAnims = useRef({
    All: new Animated.Value(1), Easy: new Animated.Value(1),
    Medium: new Animated.Value(1), Hard: new Animated.Value(1), Impossible: new Animated.Value(1),
  }).current;

  const cardAnims = useRef({
    quiz: new Animated.Value(1), flashcards: new Animated.Value(1),
    scramble: new Animated.Value(1), memory: new Animated.Value(1),
    ninja: new Animated.Value(1), whack: new Animated.Value(1), codebreaker: new Animated.Value(1),
  }).current;

  const tutorialAnim = useRef(new Animated.Value(0)).current;
  const lockedModalAnim = useRef(new Animated.Value(0)).current;
  const gridAnim = useRef(new Animated.Value(1)).current;
  const entrance = useRef(new Animated.Value(0)).current;
  const leaderboardPulse = useRef(new Animated.Value(1)).current;
  const memorySubjectModalAnim = useRef(new Animated.Value(0)).current;

  const startTimeRef = useRef(Date.now());
  const timeSavedRef = useRef(false);

  useEffect(() => {
    return () => {
      const saveStudyTime = async () => {
        if (timeSavedRef.current) return;
        timeSavedRef.current = true;
        const elapsedMs = Date.now() - startTimeRef.current;
        const elapsedMinutes = Math.max(1, Math.round(elapsedMs / 60000));

        try {
          const profileRaw = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
          if (profileRaw) {
            const profile = JSON.parse(profileRaw);
            profile.studyMinutes = (profile.studyMinutes || 0) + elapsedMinutes;
            await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
          }
        } catch (e) {
          console.error("Failed to save study time", e);
        }
      };
      void saveStudyTime();
    };
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (musicPlayer) {
      try {
        musicPlayer.loop = true;
        musicPlayer.volume = isMuted ? 0 : 0.15;
        musicPlayer.play();
      } catch (e) {
        console.log("Error playing background music", e);
      }
    }

    return () => {
      if (musicPlayer) {
        try {
          musicPlayer.pause();
          musicPlayer.seekTo(0);
        } catch (e) {
          console.log("Error pausing background music on unmount", e);
        }
      }
    };
  }, [musicPlayer, isMuted]);

  const toggleMute = () => {
    if (!musicPlayer) return;
    try {
      if (isMuted) {
        musicPlayer.volume = 0.15;
        setIsMuted(false);
      } else {
        musicPlayer.volume = 0;
        setIsMuted(true);
      }
    } catch (error) {
      console.log("Failed to toggle audio mute", error);
    }
  };

  const fetchInitialData = async () => {
    try {
      const gradeData = await AsyncStorage.getItem("explorerGrade");
      if (gradeData) {
        const numericGrade = parseInt(gradeData.replace(/[^0-9]/g, ""), 10) || 1;
        setSelectedGrade(numericGrade as GradeLevel);
      }

      const data = await AsyncStorage.getItem(PARENT_CONTROLS_KEY);
      if (data) {
        const controls = JSON.parse(data);
        if (controls.studyFirstEnabled !== undefined) {
          setStudyFirstEnabled(controls.studyFirstEnabled);
        }
        if (controls.gradeLocks) {
          setGradeLocks(controls.gradeLocks);
        }
      }
    } catch (e) {
      console.error("Error reading initial data in games", e);
    }
  };

  // Helper to read current player's local XP & username
  const getLocalPlayerStats = async () => {
    const profileRaw = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
    const guestUsername = await AsyncStorage.getItem("explorerUsername");
    const guestName = await AsyncStorage.getItem("explorerName");

    let localXp = normalizeXpValue(leaderboardXp);
    let localName = (guestUsername || guestName || "Explorer").trim();

    if (profileRaw) {
      const parsed = JSON.parse(profileRaw);
      localXp = Math.max(localXp, normalizeXpValue(parsed.xp));
      localName = (parsed.username || parsed.name || localName).trim();
    }

    return { localName, localXp };
  };

  // --- SYNC XP TO SUPABASE ---
  const syncXpToSupabase = async (earnedXp: number) => {
    if (earnedXp <= 0) return;
    try {
      const { localName, localXp } = await getLocalPlayerStats();
      await supabase.rpc("sync_user_xp", {
        p_name: localName,
        p_xp: localXp + earnedXp,
      });
    } catch (err) {
      console.error("Failed to sync XP to Supabase:", err);
    }
  };

  // --- FETCH LIVE LEADERBOARD & COEXIST WITH BOTS ---
  const fetchLeaderboard = async () => {
    try {
      setLoadingLeaderboard(true);

      // 1. Get local player stats (e.g. your 1545 XP) and sync to Supabase
      const { localName, localXp } = await getLocalPlayerStats();
      await supabase.rpc("sync_user_xp", {
        p_name: localName,
        p_xp: localXp,
      });

      // 2. Fetch the top 5 profiles from Supabase (Real Users + Bots)
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, weekly_xp")
        .order("weekly_xp", { ascending: false })
        .limit(5);

      if (error) throw error;

      const cloudList: LeaderboardEntry[] = (data || []).map((row: any, idx: number) => ({
        id: String(row.id ?? idx),
        full_name: row.full_name?.trim() || "Explorer",
        weekly_xp: Number(row.weekly_xp) || 0,
      }));

      // 3. Ensure current player coexists in the list with their latest XP
      const alreadyInList = cloudList.some(
        (p) => p.full_name.toLowerCase() === localName.toLowerCase()
      );

      let combinedList = [...cloudList];
      if (!alreadyInList) {
        combinedList.push({
          id: "local-player",
          full_name: localName,
          weekly_xp: localXp,
        });
      } else {
        combinedList = combinedList.map((p) =>
          p.full_name.toLowerCase() === localName.toLowerCase()
            ? { ...p, weekly_xp: Math.max(p.weekly_xp, localXp) }
            : p
        );
      }

      combinedList.sort((a, b) => b.weekly_xp - a.weekly_xp);
      setLeaderboardData(combinedList.slice(0, 5));
    } catch (e) {
      console.error("Error fetching leaderboard from Supabase:", e);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadArcadeGames();
      void fetchLeaderboard();
    }, [leaderboardXp]),
  );

  useEffect(() => {
    if (params.autoOpenGame) {
      const targetKey = String(params.autoOpenGame);
      const targetGame =
        targetKey === "quiz"
          ? quizGameItem
          : gameCatalog.find((g) => g.key === targetKey);

      if (targetGame) {
        void recordRecentGame(targetGame.key);
        setSelectedGame(targetGame.key);
        setSelectedTutorialGame(targetGame);
      }
    }
  }, [params.autoOpenGame]);

  const matchedGames =
    difficulty === "All"
      ? gameCatalog
      : gameCatalog.filter((item) => item.difficulty === difficulty);

  const paddedGames: GameItem[] = [...matchedGames];
  while (paddedGames.length < 6) {
    paddedGames.push({
      isPlaceholder: true,
      key: `placeholder-${paddedGames.length}`,
      title: "",
      subtitle: "",
      icon: null,
      difficulty: "",
      xpText: "",
      badge: "",
    });
  }

  const chunkedGames = [
    paddedGames.slice(0, 3),
    paddedGames.slice(3, 6),
  ];

  // Ensure podium always has 3 entries
  const podiumEntries: LeaderboardEntry[] = [
    leaderboardData[0] || { id: "empty-1", full_name: "---", weekly_xp: 0 },
    leaderboardData[1] || { id: "empty-2", full_name: "---", weekly_xp: 0 },
    leaderboardData[2] || { id: "empty-3", full_name: "---", weekly_xp: 0 },
  ];

  useEffect(() => {
    Animated.spring(entrance, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  }, [entrance]);

  useEffect(() => {
    Animated.sequence([
      Animated.spring(leaderboardPulse, { toValue: 1.03, useNativeDriver: true }),
      Animated.spring(leaderboardPulse, { toValue: 1, useNativeDriver: true }),
    ]).start();
  }, [leaderboardXp, leaderboardPulse]);

  useEffect(() => {
    if (selectedTutorialGame) {
      tutorialAnim.setValue(0);
      Animated.spring(tutorialAnim, {
        toValue: 1,
        tension: 65,
        friction: 6,
        useNativeDriver: true,
      }).start();
    }
  }, [selectedTutorialGame, tutorialAnim]);

  useEffect(() => {
    if (lockedModalInfo.visible) {
      lockedModalAnim.setValue(0);
      Animated.spring(lockedModalAnim, {
        toValue: 1,
        tension: 65,
        friction: 6,
        useNativeDriver: true,
      }).start();
    }
  }, [lockedModalInfo.visible, lockedModalAnim]);

  useEffect(() => {
    if (!memorySubjectPickerVisible) return;
    memorySubjectModalAnim.setValue(0);
    Animated.spring(memorySubjectModalAnim, {
      toValue: 1,
      tension: 58,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, [memorySubjectPickerVisible, memorySubjectModalAnim]);

  const handleFilterPress = (item: string) => {
    Animated.sequence([
      Animated.timing(gridAnim, { toValue: 0.95, duration: 60, useNativeDriver: true }),
      Animated.spring(gridAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();

    setDifficulty(item);
    const anim = filterAnims[item as keyof typeof filterAnims];
    if (anim) {
      Animated.sequence([
        Animated.spring(anim, { toValue: 1.1, useNativeDriver: true, friction: 3 }),
        Animated.spring(anim, { toValue: 1, useNativeDriver: true, friction: 4 }),
      ]).start();
    }
  };

  const handleGamePress = (gameItem: GameItem) => {
    if (gameItem.isPlaceholder) return;

    if (studyFirstEnabled) {
      Alert.alert(
        "Mini-Games Locked",
        "Your parent requires you to finish your lessons before unlocking mini-games!",
      );
      return;
    }

    void recordRecentGame(gameItem.key);

    const animKey = gameItem.key as keyof typeof cardAnims;
    const anim = cardAnims[animKey];

    if (anim) {
      Animated.sequence([
        Animated.timing(anim, { toValue: 0.88, duration: 70, useNativeDriver: true }),
        Animated.spring(anim, { toValue: 1, friction: 3, useNativeDriver: true }),
      ]).start(() => {
        setSelectedGame(gameItem.key);
        setSelectedTutorialGame(gameItem);
      });
    } else {
      setSelectedGame(gameItem.key);
      setSelectedTutorialGame(gameItem);
    }
  };

  const closeTutorialWithAnimation = (onComplete?: () => void) => {
    Animated.timing(tutorialAnim, {
      toValue: 0,
      duration: 120,
      useNativeDriver: true,
    }).start(() => {
      setSelectedTutorialGame(null);
      if (onComplete) onComplete();
    });
  };

  const handleTutorialContinue = () => {
    closeTutorialWithAnimation(() => {
      const gradeKey = `Grade ${selectedGrade}`;
      if (gradeLocks[gradeKey]) {
        setLockedModalInfo({ visible: true, gradeNum: selectedGrade });
      } else if (selectedGame === "memory") {
        setMemorySubjectPickerVisible(true);
      } else {
        setActiveGameRunning(true);
      }
    });
  };

  const handleTutorialClose = () => {
    closeTutorialWithAnimation();
  };

  const handleMemorySubjectSelect = (subj: Subject) => {
    setMemorySubject(subj);
    setMemorySubjectPickerVisible(false);
    setActiveGameRunning(true);
  };

  const handleFinishGame = async (earnedXp: number = 50) => {
    if (earnedXp > 0) {
      const isCodebreaker = selectedGame === "codebreaker";
      const isDailyChallenge = params.autoOpenGame === "quiz";

      void completeGame(earnedXp, isCodebreaker, isDailyChallenge);
      await syncXpToSupabase(earnedXp);
      void fetchLeaderboard();
    }
    setActiveGameRunning(false);
    setSelectedGame(null);
  };

  const handleCancel = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/home" as any);
    }
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
        (g) => !firstTwoKeys.includes(g.key) && g.key !== "quiz"
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

  const renderActiveGame = () => {
    const commonProps = {
      grade: selectedGrade,
      onClose: () => {
        setActiveGameRunning(false);
        setSelectedGame(null);
      },
      onFinish: handleFinishGame,
      onComplete: handleFinishGame,
      onSuccess: (earnedXp: number) => {
        if (earnedXp > 0) {
          addXp(earnedXp);
          void syncXpToSupabase(earnedXp);
        }
      },
    } as any;

    switch (selectedGame) {
      case "quiz": return <QuizGame {...commonProps} />;
      case "flashcards": return <FlashcardGame {...commonProps} />;
      case "scramble": return <WordScrambleGame {...commonProps} />;
      case "ninja": return <NumberNinjaGame {...commonProps} />;
      case "memory": return <MemoryMatchGame {...commonProps} subject={memorySubject} />;
      case "whack": return <WhackANumberGame {...commonProps} />;
      case "codebreaker": return <CodebreakerGame {...commonProps} />;
      default: return <QuizGame {...commonProps} />;
    }
  };

  return (
    <GradientSafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.topBar}>
        <Pressable onPress={handleCancel} style={styles.cancelButton}>
          <Text style={styles.cancelText}>Back</Text>
        </Pressable>
        <View style={styles.topBarRightContainer}>
          <Pressable onPress={toggleMute} style={styles.muteButton}>
            <Text style={styles.muteIconText}>{isMuted ? "🔇" : "🔊"}</Text>
          </Pressable>
          <View style={styles.levelIndicatorBadge}>
            <Text style={styles.levelIndicatorText}>🌟 Grade {selectedGrade}</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View
          style={{
            opacity: entrance,
            transform: [
              {
                translateY: entrance.interpolate({
                  inputRange: [0, 1],
                  outputRange: [16, 0],
                }),
              },
            ],
          }}
        >
          <View style={styles.headingRow}>
            <View>
              <Text style={styles.title}>🎮 Mini-Game Arcade</Text>
              <Text style={styles.subtitle}>Play, learn & level up your XP!</Text>
            </View>
            <Image
              source={require("../../assets/BiosphereQuestAssets/Stella (Biosphere Quest Mascot).png")}
              style={styles.mascotImage}
              resizeMode="contain"
            />
          </View>

          <Animated.View style={{ transform: [{ scale: cardAnims.quiz }] }}>
            <Pressable
              style={styles.featured}
              onPress={() => {
                handleGamePress({
                  key: "quiz",
                  title: "Math & Science Epic Quiz",
                  subtitle: "5 questions • Earn massive XP",
                  icon: require("../../assets/BiosphereQuestAssets/Brain Icon.png"),
                  difficulty: "Easy",
                  xpText: "+150 XP",
                  badge: "🚀 Epic",
                  tutorial: {
                    objective: "Answer multiple-choice questions correctly to score big XP points.",
                    steps: [
                      "Read each multiple-choice question carefully.",
                      "Select the best answer from the given options.",
                      "Complete all questions to claim your XP reward.",
                    ],
                  },
                });
              }}
            >
              <View style={styles.featureCopy}>
                <View style={styles.featuredTagContainer}>
                  <Text style={styles.featureTagText}>🚀 FEATURED ADVENTURE</Text>
                </View>
                <Text style={styles.featureTitle}>Math & Science Quiz</Text>
                <Text style={styles.featureDetails}>Interactive Trivia • Gr. 1-6</Text>
                <View style={styles.featureXpRow}>
                  <Text style={styles.featureXp}>⚡ +150 XP</Text>
                  <Text style={styles.featureMetaSeparator}>•</Text>
                  <Text style={styles.featureMeta}>5 questions</Text>
                </View>
              </View>
              <View style={styles.featureTrophyContainer}>
                <Text style={styles.trophyEmoji}>🏆</Text>
              </View>
            </Pressable>
          </Animated.View>

          <View style={styles.filterRow}>
            {["All", "Easy", "Medium", "Hard", "Impossible"].map((item: string) => {
              const anim = filterAnims[item as keyof typeof filterAnims];
              return (
                <Animated.View key={item} style={{ transform: [{ scale: anim }] }}>
                  <Pressable
                    onPress={() => handleFilterPress(item)}
                    style={[styles.filter, difficulty === item && styles.filterActive]}
                  >
                    <Text style={[styles.filterText, difficulty === item && styles.filterTextActive]}>
                      {item}
                    </Text>
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>

          <Animated.View style={[styles.grid, { transform: [{ scale: gridAnim }] }]}>
            {chunkedGames.map((row, rowIndex) => (
              <View key={`row-${rowIndex}`} style={styles.gridRow}>
                {row.map((item) => {
                  if (item.isPlaceholder) {
                    return <View key={item.key} style={[styles.cardWrapper, { flex: 1, opacity: 0 }]} pointerEvents="none" />;
                  }

                  const themeColor = getDifficultyColor(item.difficulty);
                  const anim = cardAnims[item.key as keyof typeof cardAnims] || new Animated.Value(1);

                  return (
                    <Animated.View
                      key={item.key}
                      style={[
                        styles.cardWrapper,
                        {
                          flex: 1,
                          transform: [{ scale: anim }],
                        },
                      ]}
                    >
                      <Pressable
                        style={[styles.gameCard, { borderColor: themeColor }]}
                        onPress={() => handleGamePress(item)}
                      >
                        <View style={styles.cardBadgeContainer}>
                          <Text style={styles.cardBadgeText}>{item.badge}</Text>
                        </View>
                        <View style={styles.cardTopArea}>
                          <Image source={item.icon} style={styles.gameIcon} resizeMode="contain" />
                        </View>
                        <View style={styles.cardTextContainer}>
                          <Text
                            style={[styles.cardTitle, { color: themeColor }]}
                            numberOfLines={1}
                            adjustsFontSizeToFit
                            minimumFontScale={0.8}
                          >
                            {item.title}
                          </Text>
                          <Text style={styles.cardSubtitle} numberOfLines={1}>{item.subtitle}</Text>
                        </View>
                        <View style={[styles.cardFooter, { borderTopColor: `${themeColor}40` }]}>
                          <Text style={styles.lightningIcon}>⚡</Text>
                          <Text style={[styles.cardXp, { color: themeColor }]} numberOfLines={1}>
                            {item.xpText}
                          </Text>
                        </View>
                      </Pressable>
                    </Animated.View>
                  );
                })}
              </View>
            ))}
          </Animated.View>

          <Text style={styles.leaderboardMainTitle}>🏆 Weekly Champions</Text>
          <Animated.View
            style={[styles.leaderboardCard, { transform: [{ scale: leaderboardPulse }] }]}
          >
            {!loadingLeaderboard ? (
              <>
                <View style={styles.podium}>
                  <PodiumPlace
                    rank="2"
                    name={podiumEntries[1].full_name}
                    xp={`${podiumEntries[1].weekly_xp} XP`}
                    color="#c9c9c9"
                    height={64}
                    initials={getInitials(podiumEntries[1].full_name)}
                    avatarBg="#3b82f6"
                  />
                  <PodiumPlace
                    rank="1"
                    name={podiumEntries[0].full_name}
                    xp={`${podiumEntries[0].weekly_xp} XP`}
                    color="#fff24c"
                    height={80}
                    initials={getInitials(podiumEntries[0].full_name)}
                    avatarBg="#3b82f6"
                  />
                  <PodiumPlace
                    rank="3"
                    name={podiumEntries[2].full_name}
                    xp={`${podiumEntries[2].weekly_xp} XP`}
                    color="#ed9538"
                    height={52}
                    initials={getInitials(podiumEntries[2].full_name)}
                    avatarBg="#3b82f6"
                  />
                </View>

                {leaderboardData.slice(3, 5).map((player, index) => (
                  <RankRow
                    key={player.id || index}
                    rank={`#${index + 4}`}
                    initials={getInitials(player.full_name)}
                    name={player.full_name}
                    xp={`${player.weekly_xp} XP`}
                    avatarBg="#e69b35"
                  />
                ))}
              </>
            ) : (
              <Text style={{ color: "#94a3b8", textAlign: "center", padding: 20 }}>
                Loading Champions...
              </Text>
            )}
          </Animated.View>
        </Animated.View>
      </ScrollView>

      {selectedTutorialGame && (
        <Animated.View
          style={[
            styles.absoluteOverlay,
            {
              opacity: tutorialAnim,
              transform: [
                {
                  scale: tutorialAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.85, 1],
                  }),
                },
              ],
            },
          ]}
          pointerEvents={selectedTutorialGame ? "auto" : "none"}
        >
          <TutorialModal
            game={selectedTutorialGame}
            onClose={handleTutorialClose}
            onContinue={handleTutorialContinue}
          />
        </Animated.View>
      )}

      {lockedModalInfo.visible && (
        <Animated.View
          style={[
            styles.absoluteOverlay,
            {
              opacity: lockedModalAnim,
              transform: [
                {
                  scale: lockedModalAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.85, 1],
                  }),
                },
              ],
            },
          ]}
          pointerEvents={lockedModalInfo.visible ? "auto" : "none"}
        >
          <View style={styles.modalBackdropCenter}>
            <View style={styles.lockedCard}>
              <View style={styles.lockedIconContainer}>
                <Text style={styles.lockedEmoji}>🔒</Text>
              </View>
              <Text style={styles.lockedTitle}>Grade {lockedModalInfo.gradeNum} Locked</Text>
              <Text style={styles.lockedDescription}>
                Your parent or guardian has locked content access for Grade {lockedModalInfo.gradeNum}. Please check in with them to unlock this level!
              </Text>
              <Pressable
                style={styles.lockedButton}
                onPress={() => {
                  Animated.timing(lockedModalAnim, {
                    toValue: 0,
                    duration: 120,
                    useNativeDriver: true,
                  }).start(() => {
                    setLockedModalInfo({ visible: false, gradeNum: 1 });
                  });
                }}
              >
                <Text style={styles.lockedButtonText}>Go Back</Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      )}

      <Modal visible={activeGameRunning} animationType="slide">
        <View style={{ flex: 1, backgroundColor: "#091426" }}>
          {renderActiveGame()}
        </View>
      </Modal>

      <Modal
        visible={memorySubjectPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setMemorySubjectPickerVisible(false);
          setSelectedGame(null);
        }}
      >
        <View style={styles.subjectBackdrop}>
          <Animated.View
            style={[
              styles.subjectDialog,
              {
                opacity: memorySubjectModalAnim,
                transform: [
                  { scale: memorySubjectModalAnim.interpolate({ inputRange: [0, 1], outputRange: [0.82, 1] }) },
                  { translateY: memorySubjectModalAnim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) },
                ],
              },
            ]}
          >
            <Text style={styles.subjectEyebrow}>✨ YOUR NEXT ADVENTURE</Text>
            <Text style={styles.subjectTitle}>Pick a subject</Text>
            <Text style={styles.subjectDescription}>Choose what you want to practice in Memory Match.</Text>
            <View style={styles.subjectChoices}>
              {([
                { value: "Science", icon: "🔬", color: "#32d583", copy: "Explore nature" },
                { value: "Math", icon: "📐", color: "#38bdf8", copy: "Solve & discover" },
              ] as const).map((choice) => (
                <Pressable
                  key={choice.value}
                  accessibilityRole="button"
                  onPress={() => handleMemorySubjectSelect(choice.value)}
                  style={({ pressed }) => [
                    styles.subjectChoice,
                    { borderColor: choice.color, shadowColor: choice.color },
                    pressed && styles.choicePressed,
                  ]}
                >
                  <Text style={styles.subjectChoiceIcon}>{choice.icon}</Text>
                  <Text style={[styles.subjectChoiceTitle, { color: choice.color }]}>{choice.value}</Text>
                  <Text style={styles.subjectChoiceCopy}>{choice.copy}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => handleMemorySubjectSelect("Both")}
              style={({ pressed }) => [styles.bothChoice, pressed && styles.choicePressed]}
            >
              <Text style={styles.bothChoiceIcon}>🌟</Text>
              <View style={styles.bothChoiceCopy}>
                <Text style={styles.bothChoiceTitle}>Both subjects</Text>
                <Text style={styles.bothChoiceSubtitle}>Mix science and math</Text>
              </View>
              <Text style={styles.choiceArrow}>→</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setMemorySubjectPickerVisible(false);
                setSelectedGame(null);
              }}
              style={styles.subjectCancel}
            >
              <Text style={styles.subjectCancelText}>Not now</Text>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>
    </GradientSafeAreaView>
  );
}

function PodiumPlace({
  rank,
  name,
  xp,
  color,
  height,
  initials,
  avatarBg,
}: {
  rank: string;
  name: string;
  xp: string;
  color: string;
  height: number;
  initials: string;
  avatarBg: string;
}) {
  return (
    <View style={styles.podiumPlace}>
      <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
      <View style={[styles.podiumBar, { backgroundColor: color, height }]}>
        <Text style={styles.rankNumber}>{rank}</Text>
        <Text style={styles.podiumName} numberOfLines={1}>{name}</Text>
        <Text style={styles.podiumXp}>{xp}</Text>
      </View>
    </View>
  );
}

function RankRow({ rank, initials, name, xp, avatarBg }: { rank: string; initials: string; name: string; xp: string; avatarBg: string }) {
  return (
    <View style={styles.ranking}>
      <View style={styles.rankLeft}>
        <Text style={styles.rankNumText}>{rank}</Text>
        <View style={[styles.rankAvatar, { backgroundColor: avatarBg }]}>
          <Text style={styles.rankAvatarText}>{initials}</Text>
        </View>
        <Text style={styles.rankNameText}>{name}</Text>
      </View>
      <Text style={styles.rankXp}>{xp}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#091426" },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: 2,
  },
  cancelButton: { paddingVertical: 4 },
  cancelText: { color: "#ffffff", fontSize: 14, fontWeight: "800" },
  topBarRightContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  muteButton: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderColor: "#30478a",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  muteIconText: {
    fontSize: 14,
  },
  levelIndicatorBadge: {
    backgroundColor: "rgba(241, 198, 91, 0.2)",
    borderColor: "#f1c65b",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  levelIndicatorText: { color: "#f1c65b", fontSize: 11, fontWeight: "900" },
  mascotImage: { width: 44, height: 44 },
  content: {
    padding: 12,
    paddingBottom: 40,
    maxWidth: 600,
    width: "100%",
    alignSelf: "center",
  },
  headingRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 2 },
  title: { color: "#fff", fontSize: 21, fontWeight: "900" },
  subtitle: { color: "#94a3b8", fontSize: 11, fontWeight: "700", marginTop: 1 },
  featured: {
    backgroundColor: "#1b1d4f",
    borderColor: "#f1c65b",
    borderWidth: 1.5,
    borderRadius: 18,
    padding: 12,
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  featureCopy: { flex: 1 },
  featuredTagContainer: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(241, 198, 91, 0.15)",
    borderColor: "#f1c65b",
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  featureTagText: { color: "#f1c65b", fontWeight: "900", fontSize: 9, letterSpacing: 0.5 },
  featureTitle: { color: "#fff", fontSize: 17, fontWeight: "900", marginTop: 6, textAlign: "left" },
  featureDetails: { color: "#cbd5e1", fontSize: 11, marginTop: 2, fontWeight: "600", textAlign: "left" },
  featureXpRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  featureXp: { color: "#f1c65b", fontSize: 11, fontWeight: "800" },
  featureMetaSeparator: { color: "#64748b", marginHorizontal: 6, fontSize: 11 },
  featureMeta: { color: "#94a3b8", fontSize: 11, fontWeight: "600" },
  featureTrophyContainer: { paddingLeft: 8, justifyContent: "center", alignItems: "center" },
  trophyEmoji: { fontSize: 36 },
  filterRow: { flexDirection: "row", gap: 5, marginTop: 10 },
  filter: { backgroundColor: "#162247", borderRadius: 12, paddingHorizontal: 9, paddingVertical: 6, borderWidth: 1, borderColor: "#293a73" },
  filterActive: { backgroundColor: "#4f46e5", borderColor: "#818cf8" },
  filterText: { color: "#94a3b8", fontSize: 10.5, fontWeight: "800" },
  filterTextActive: { color: "#ffffff" },
  grid: {
    flexDirection: "column",
    gap: 8,
    marginTop: 10,
  },
  gridRow: {
    flexDirection: "row",
    gap: 8,
    width: "100%",
  },
  cardWrapper: {},
  gameCard: {
    width: "100%",
    aspectRatio: 0.8,
    backgroundColor: "#131d3b",
    borderWidth: 1.2,
    borderRadius: 16,
    padding: 8,
    justifyContent: "space-between",
    position: "relative",
    overflow: "hidden",
  },
  cardBadgeContainer: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  cardBadgeText: { fontSize: 8, fontWeight: "800", color: "#cbd5e1" },
  cardTopArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 6,
  },
  gameIcon: {
    width: 38,
    height: 38,
    resizeMode: "contain",
  },
  cardTextContainer: {
    justifyContent: "flex-end",
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 10,
    fontWeight: "900",
    marginBottom: 1,
    textAlign: "left",
  },
  cardSubtitle: {
    color: "#94a3b8",
    fontSize: 8.5,
    fontWeight: "600",
    textAlign: "left",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    paddingTop: 4,
  },
  lightningIcon: { fontSize: 8 },
  cardXp: { fontSize: 9, fontWeight: "900" },
  leaderboardMainTitle: { color: "#fff", fontSize: 14, fontWeight: "900", textAlign: "center", marginTop: 16, marginBottom: 8 },
  leaderboardCard: {
    backgroundColor: "#14203f",
    borderColor: "#2e4585",
    borderWidth: 1.2,
    borderRadius: 16,
    padding: 10,
  },
  podium: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    marginBottom: 10,
    gap: 6,
  },
  podiumPlace: { alignItems: "center", width: "30%" },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 3,
  },
  avatarText: { color: "#fff", fontSize: 9, fontWeight: "900" },
  podiumBar: { width: "100%", alignItems: "center", justifyContent: "flex-end", borderRadius: 6, paddingBottom: 6 },
  rankNumber: { color: "#11152c", fontSize: 18, fontWeight: "900" },
  podiumName: { color: "#11152c", fontSize: 8, fontWeight: "900", textAlign: "center", paddingHorizontal: 2 },
  podiumXp: { color: "#11152c", fontSize: 8, fontWeight: "700" },
  ranking: {
    backgroundColor: "#1b2a54",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#2c4382",
  },
  rankLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  rankNumText: { color: "#94a3b8", fontWeight: "800", fontSize: 11, width: 18 },
  rankAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  rankAvatarText: { color: "#fff", fontSize: 9, fontWeight: "900" },
  rankNameText: { color: "#fff", fontWeight: "800", fontSize: 12 },
  rankXp: { color: "#f3ca45", fontWeight: "900", fontSize: 12 },
  absoluteOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  subjectBackdrop: {
    flex: 1,
    backgroundColor: "rgba(3, 10, 24, 0.82)",
    justifyContent: "center",
    alignItems: "center",
    padding: 14,
  },
  subjectDialog: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: "#18b9e8",
    backgroundColor: "#102638",
    padding: 16,
    shadowColor: "#17c8f0",
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 9,
  },
  subjectEyebrow: { color: "#4ade80", textAlign: "center", fontSize: 10, fontWeight: "900", letterSpacing: 1.2 },
  subjectTitle: { color: "#fff", textAlign: "center", fontSize: 22, fontWeight: "900", marginTop: 6 },
  subjectDescription: { color: "#b1c8d6", textAlign: "center", fontSize: 11, fontWeight: "600", marginTop: 5, marginBottom: 12 },
  subjectChoices: { flexDirection: "row", gap: 10 },
  subjectChoice: {
    flex: 1,
    minHeight: 86,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: "#142e40",
    padding: 9,
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 3,
  },
  subjectChoiceIcon: { fontSize: 24, marginBottom: 4 },
  subjectChoiceTitle: { fontSize: 13, fontWeight: "900" },
  subjectChoiceCopy: { color: "#b1c8d6", fontSize: 9, fontWeight: "700", marginTop: 3, textAlign: "center" },
  bothChoice: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingHorizontal: 11,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#a855f7",
    backgroundColor: "#292441",
  },
  bothChoiceIcon: { fontSize: 21, marginRight: 10 },
  bothChoiceCopy: { flex: 1 },
  bothChoiceTitle: { color: "#e9d5ff", fontSize: 12, fontWeight: "900" },
  bothChoiceSubtitle: { color: "#b9a0d1", fontSize: 9, marginTop: 1 },
  choiceArrow: { color: "#fff", fontSize: 19, fontWeight: "900" },
  choicePressed: { transform: [{ scale: 0.97 }], opacity: 0.86 },
  subjectCancel: { alignItems: "center", paddingVertical: 7, marginTop: 1 },
  subjectCancelText: { color: "#98afbd", fontSize: 11, fontWeight: "800" },
  modalBackdropCenter: {
    flex: 1,
    backgroundColor: "rgba(5, 11, 24, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  lockedCard: {
    backgroundColor: "#131d3b",
    borderColor: "#ef4444",
    borderWidth: 1.5,
    borderRadius: 22,
    padding: 24,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  lockedIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    borderColor: "#ef4444",
    borderWidth: 1.2,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  lockedEmoji: {
    fontSize: 28,
  },
  lockedTitle: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 8,
  },
  lockedDescription: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
  },
  lockedButton: {
    backgroundColor: "#4f46e5",
    borderColor: "#818cf8",
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: "100%",
    alignItems: "center",
  },
  lockedButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
});