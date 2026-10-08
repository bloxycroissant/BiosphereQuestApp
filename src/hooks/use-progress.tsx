import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { supabase } from "../lib/supabase";

const STORAGE_KEY = "@biosphere_profile_data_v1";
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export type StudySession = {
  id: number | string;
  day: string;
  title: string;
  time: string;
  done: boolean;
};

type Progress = {
  xp: number;
  level: number;
  nextLevelXp: number;
  lessons: number;
  studyMinutes: number;
  streak: number;
  gamesPassed: number;
  leaderboardXp: number;
  sessions: StudySession[];
  studyFirstLock: boolean;
  bedtimeLockEnabled: boolean;
  bedtimeHour: number;
  arcadeMinigamesEnabled: boolean;
  flashcardsEnabled: boolean;
  lastResetDate: number;
  lastActiveDate: string | null;
  perfectLessons: number;
  codebreakerPassed: number;
  speedMathPassed: number;
  speedSciencePassed: number;
  dailyChallengesPassed: number;
  badgeUnlockDates: Record<string, string>;
  completedLessons: string[];
  recentGames: string[];
  lastLesson: {
    grade: number;
    subjectTitle: string;
    lessonTitle: string;
    icon: string;
    difficulty: string;
  } | null;
};

type ProgressContextValue = Progress & {
  addXp: (amount: number) => Promise<void>;
  completeLesson: (
    minutes?: number,
    xpReward?: number,
    perfect?: boolean,
    speedMath?: boolean,
    speedScience?: boolean,
  ) => Promise<void>;
  completeGame: (
    amount?: number,
    isCodebreaker?: boolean,
    isDailyChallenge?: boolean,
  ) => Promise<void>;
  addSession: (session: Omit<StudySession, "id" | "done">) => Promise<void>;
  updateSession: (
    id: number | string,
    changes: Partial<StudySession>,
  ) => Promise<void>;
  resetProgress: () => Promise<void>;
  isBedtimeActive: boolean;
  refreshProgress: () => Promise<void>;
  markLessonCompleted: (lessonKey: string) => Promise<void>;
  setLastLessonBookmark: (lessonData: any) => Promise<void>;
  recordRecentGame: (gameKey: string) => Promise<void>;
};

const ProgressContext = createContext<ProgressContextValue | null>(null);

const initialProgress: Progress = {
  xp: 50,
  level: 1,
  nextLevelXp: 100,
  lessons: 0,
  studyMinutes: 0,
  streak: 0,
  gamesPassed: 0,
  leaderboardXp: 0,
  sessions: [
    {
      id: "1",
      day: "Mon",
      title: "Ecology Basics",
      time: "10:00 AM",
      done: true,
    },
    {
      id: "2",
      day: "Wed",
      title: "Ecosystems & Biomes",
      time: "12:00 PM",
      done: false,
    },
  ],
  studyFirstLock: true,
  bedtimeLockEnabled: true,
  bedtimeHour: 20,
  arcadeMinigamesEnabled: true,
  flashcardsEnabled: true,
  lastResetDate: Date.now(),
  lastActiveDate: null,
  perfectLessons: 0,
  codebreakerPassed: 0,
  speedMathPassed: 0,
  speedSciencePassed: 0,
  dailyChallengesPassed: 0,
  badgeUnlockDates: {},
  completedLessons: [],
  recentGames: [],
  lastLesson: null,
};

export const normalizeXpValue = (value: unknown): number => {
  if (typeof value === "number")
    return Number.isFinite(value) && value >= 0 ? value : 0;
  if (typeof value !== "string") return 0;
  const segments = value.trim().split("[object Object]");
  if (segments.length === 1) {
    const numericValue = Number(segments[0]);
    return Number.isFinite(numericValue) && numericValue >= 0
      ? numericValue
      : 0;
  }
  return segments.reduce((total, segment) => {
    const numericValue = Number(segment);
    return Number.isFinite(numericValue) && numericValue >= 0
      ? total + numericValue
      : total;
  }, 0);
};

const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function ProgressProvider({ children }: PropsWithChildren) {
  const [progress, setProgress] = useState<Progress>(initialProgress);

  useEffect(() => {
    loadProgress();
  }, []);

  useEffect(() => {
    const newDates = { ...(progress.badgeUnlockDates || {}) };
    let changed = false;
    const today = getLocalDateString();

    const check = (id: string, condition: boolean) => {
      if (condition && !newDates[id]) {
        newDates[id] = today;
        changed = true;
      }
    };

    check("first_steps", progress.xp >= 150);
    check("cadet", progress.xp >= 500);
    check("streak", progress.streak >= 3);
    check("time", progress.studyMinutes >= 60);
    check("daily", progress.dailyChallengesPassed >= 3);
    check("perfect", progress.perfectLessons > 0);
    check("minigame", progress.codebreakerPassed > 0);
    check("speed_math", progress.speedMathPassed > 0);
    check("speed_sci", progress.speedSciencePassed > 0);
    check("elite", progress.xp >= 1000);
    check("gold", progress.xp >= 2500);
    check("master", progress.xp >= 5000);

    if (changed) {
      setProgress((prev) => {
        const updated = { ...prev, badgeUnlockDates: newDates };
        saveAndSync(updated);
        return updated;
      });
    }
  }, [
    progress.xp,
    progress.streak,
    progress.studyMinutes,
    progress.dailyChallengesPassed,
    progress.perfectLessons,
    progress.codebreakerPassed,
    progress.speedMathPassed,
    progress.speedSciencePassed,
  ]);

  const saveAndSync = async (updatedFields: Partial<Progress>) => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : {};
      const merged = { ...parsed, ...updatedFields };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(merged));

      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user)
          supabase.auth.updateUser({ data: { biosphere_progress: merged } });
      });
    } catch (e) {
      console.error("Failed to save global progress", e);
    }
  };

  const evaluateStreak = (
    currentStreak: number,
    lastActive: string | null,
  ): { streak: number; lastActiveDate: string } => {
    const todayStr = getLocalDateString();
    if (lastActive === todayStr)
      return {
        streak: currentStreak === 0 ? 1 : currentStreak,
        lastActiveDate: todayStr,
      };
    if (!lastActive) return { streak: 1, lastActiveDate: todayStr };

    const lastDate = new Date(lastActive);
    const currentDate = new Date(todayStr);
    const diffDays = Math.round(
      (currentDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24),
    );

    if (diffDays === 1)
      return { streak: currentStreak + 1, lastActiveDate: todayStr };
    return { streak: 1, lastActiveDate: todayStr };
  };

  const loadProgress = async () => {
    try {
      const now = Date.now();
      const savedLocal = await AsyncStorage.getItem(STORAGE_KEY);
      let localData = savedLocal ? JSON.parse(savedLocal) : null;

      let cloudData = null;
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user && user.user_metadata?.biosphere_progress) {
        cloudData = user.user_metadata.biosphere_progress;
      }

      let activeData = initialProgress;
      if (cloudData && localData) {
        activeData =
          (cloudData.xp || 0) > (localData.xp || 0) ? cloudData : localData;
      } else if (cloudData) {
        activeData = cloudData;
      } else if (localData) {
        activeData = localData;
      }

      const storedResetDate = activeData.lastResetDate || now;
      if (now - storedResetDate >= THIRTY_DAYS_MS) {
        const resetState = { ...initialProgress, lastResetDate: now };
        setProgress(resetState);
        await saveAndSync(resetState);
        return;
      }

      let evaluatedStreak = activeData.streak || 0;
      if (activeData.lastActiveDate) {
        const diffDays = Math.round(
          (new Date(getLocalDateString()).getTime() -
            new Date(activeData.lastActiveDate).getTime()) /
            (1000 * 3600 * 24),
        );
        if (diffDays > 1) evaluatedStreak = 0;
      }

      const xp = normalizeXpValue(activeData.xp ?? initialProgress.xp);
      const level = Number.isFinite(activeData.level)
        ? activeData.level
        : Math.floor(xp / 100) + 1;
      const nextLevelXp = Number.isFinite(activeData.nextLevelXp)
        ? activeData.nextLevelXp
        : level * 100;

      const mergedState = {
        ...activeData,
        xp,
        level,
        nextLevelXp,
        streak: evaluatedStreak,
        perfectLessons: activeData.perfectLessons || 0,
        codebreakerPassed: activeData.codebreakerPassed || 0,
        speedMathPassed: activeData.speedMathPassed || 0,
        speedSciencePassed: activeData.speedSciencePassed || 0,
        dailyChallengesPassed: activeData.dailyChallengesPassed || 0,
        badgeUnlockDates: activeData.badgeUnlockDates || {},
        completedLessons: activeData.completedLessons || [],
        recentGames: activeData.recentGames || [],
        lastLesson: activeData.lastLesson || null,
      };

      setProgress((prev) => ({ ...prev, ...mergedState }));
      await saveAndSync(mergedState);
    } catch (e) {
      console.error("Failed to load global progress", e);
    }
  };

  const addXp = async (amount: number) => {
    if (!Number.isFinite(amount) || amount < 0) return;
    await new Promise<void>((resolve) => {
      setProgress((current) => {
        const xp = current.xp + amount;
        const level = Math.floor(xp / 100) + 1;
        const nextLevelXp = level * 100;
        const updated = { ...current, xp, level, nextLevelXp };
        saveAndSync({ xp, level, nextLevelXp });
        resolve();
        return updated;
      });
    });
  };

  const completeLesson = async (
    minutes: number = 15,
    xpReward: number = 40,
    perfect: boolean = false,
    speedMath: boolean = false,
    speedScience: boolean = false,
  ) => {
    if (
      !Number.isFinite(minutes) ||
      minutes < 0 ||
      !Number.isFinite(xpReward) ||
      xpReward < 0
    )
      return;
    await new Promise<void>((resolve) => {
      setProgress((current) => {
        const { streak, lastActiveDate } = evaluateStreak(
          current.streak,
          current.lastActiveDate,
        );
        const lessons = current.lessons + 1;
        const studyMinutes = current.studyMinutes + minutes;
        const perfectLessons = current.perfectLessons + (perfect ? 1 : 0);
        const speedMathPassed = current.speedMathPassed + (speedMath ? 1 : 0);
        const speedSciencePassed =
          current.speedSciencePassed + (speedScience ? 1 : 0);

        const updated = {
          ...current,
          streak,
          lastActiveDate,
          lessons,
          studyMinutes,
          perfectLessons,
          speedMathPassed,
          speedSciencePassed,
        };
        saveAndSync({
          streak,
          lastActiveDate,
          lessons,
          studyMinutes,
          perfectLessons,
          speedMathPassed,
          speedSciencePassed,
        });
        resolve();
        return updated;
      });
    });
    await addXp(xpReward);
  };

  const completeGame = async (
    amount: number = 25,
    isCodebreaker: boolean = false,
    isDailyChallenge: boolean = false,
  ) => {
    await new Promise<void>((resolve) => {
      setProgress((current) => {
        const { streak, lastActiveDate } = evaluateStreak(
          current.streak,
          current.lastActiveDate,
        );
        const gamesPassed = current.gamesPassed + 1;
        const leaderboardXp = current.leaderboardXp + amount;
        const codebreakerPassed =
          current.codebreakerPassed + (isCodebreaker ? 1 : 0);
        const dailyChallengesPassed =
          current.dailyChallengesPassed + (isDailyChallenge ? 1 : 0);

        const updated = {
          ...current,
          streak,
          lastActiveDate,
          gamesPassed,
          leaderboardXp,
          codebreakerPassed,
          dailyChallengesPassed,
        };
        saveAndSync({
          streak,
          lastActiveDate,
          gamesPassed,
          leaderboardXp,
          codebreakerPassed,
          dailyChallengesPassed,
        });
        resolve();
        return updated;
      });
    });
    await addXp(amount);
  };
  const markLessonCompleted = async (lessonKey: string) => {
    await new Promise<void>((resolve) => {
      setProgress((current) => {
        if (current.completedLessons.includes(lessonKey)) {
          resolve();
          return current;
        }
        const completedLessons = [...current.completedLessons, lessonKey];
        const updated = { ...current, completedLessons };
        saveAndSync({ completedLessons });
        resolve();
        return updated;
      });
    });
  };

  const setLastLessonBookmark = async (lessonData: any) => {
    await new Promise<void>((resolve) => {
      setProgress((current) => {
        const updated = { ...current, lastLesson: lessonData };
        saveAndSync({ lastLesson: lessonData });
        resolve();
        return updated;
      });
    });
  };

  const recordRecentGame = async (gameKey: string) => {
    await new Promise<void>((resolve) => {
      setProgress((current) => {
        const recentGames = [
          gameKey,
          ...current.recentGames.filter((k) => k !== gameKey),
        ].slice(0, 6);
        const updated = { ...current, recentGames };
        saveAndSync({ recentGames });
        resolve();
        return updated;
      });
    });
  };

  const addSession = async (session: Omit<StudySession, "id" | "done">) => {
    await new Promise<void>((resolve) => {
      setProgress((current) => {
        const sessions = [
          ...current.sessions,
          { ...session, id: Date.now(), done: false },
        ];
        saveAndSync({ sessions });
        resolve();
        return { ...current, sessions };
      });
    });
  };

  const updateSession = async (
    id: number | string,
    changes: Partial<StudySession>,
  ) => {
    await new Promise<void>((resolve) => {
      setProgress((current) => {
        const sessions = current.sessions.map((session) =>
          session.id === id ? { ...session, ...changes } : session,
        );
        saveAndSync({ sessions });
        resolve();
        return { ...current, sessions };
      });
    });
  };

  const resetProgress = async () => {
    const resetState = { ...initialProgress, lastResetDate: Date.now() };
    setProgress(resetState);
    await saveAndSync(resetState);
  };

  const isBedtimeActive = useMemo(() => {
    if (!progress.bedtimeLockEnabled) return false;
    return new Date().getHours() >= progress.bedtimeHour;
  }, [progress.bedtimeLockEnabled, progress.bedtimeHour]);

  const value = useMemo(
    () => ({
      ...progress,
      addXp,
      completeLesson,
      completeGame,
      addSession,
      updateSession,
      resetProgress,
      isBedtimeActive,
      refreshProgress: loadProgress,
      markLessonCompleted,
      setLastLessonBookmark,
      recordRecentGame,
    }),
    [progress, isBedtimeActive],
  );

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const value = useContext(ProgressContext);
  if (!value)
    throw new Error("useProgress must be used inside ProgressProvider");
  return value;
}
