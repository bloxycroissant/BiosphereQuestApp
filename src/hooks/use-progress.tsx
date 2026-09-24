import { useState, useEffect, createContext, useContext, useMemo, type PropsWithChildren } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@biosphere_profile_data_v1';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export type StudySession = { id: number | string; day: string; title: string; time: string; done: boolean };

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
  lastActiveDate: string | null; // Format: "YYYY-MM-DD"
};

type ProgressContextValue = Progress & { 
  addXp: (amount: number) => Promise<void>; 
  completeLesson: (minutes: number) => Promise<void>; 
  completeGame: (amount: number) => Promise<void>; 
  addSession: (session: Omit<StudySession, 'id' | 'done'>) => Promise<void>; 
  updateSession: (id: number | string, changes: Partial<StudySession>) => Promise<void>;
  resetProgress: () => Promise<void>;
  isBedtimeActive: boolean;
  refreshProgress: () => Promise<void>;
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
    { id: '1', day: 'Mon', title: 'Ecology Basics', time: '10:00 AM', done: true },
    { id: '2', day: 'Wed', title: 'Ecosystems & Biomes', time: '12:00 PM', done: false }
  ],
  studyFirstLock: true,
  bedtimeLockEnabled: true,
  bedtimeHour: 20,
  arcadeMinigamesEnabled: true,
  flashcardsEnabled: true,
  lastResetDate: Date.now(),
  lastActiveDate: null,
};

// Helper to get local date string "YYYY-MM-DD"
const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function ProgressProvider({ children }: PropsWithChildren) {
  const [progress, setProgress] = useState<Progress>(initialProgress);

  useEffect(() => {
    loadProgress();
  }, []);

  const saveAndSync = async (updatedFields: Partial<Progress>) => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : {};
      const merged = { ...parsed, ...updatedFields };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    } catch (e) {
      console.error('Failed to save global progress', e);
    }
  };

  const evaluateStreak = (currentStreak: number, lastActive: string | null): { streak: number; lastActiveDate: string } => {
    const todayStr = getLocalDateString();
    if (lastActive === todayStr) {
      // Already active today, streak doesn't change
      return { streak: currentStreak === 0 ? 1 : currentStreak, lastActiveDate: todayStr };
    }

    if (!lastActive) {
      // First time ever completing an activity
      return { streak: 1, lastActiveDate: todayStr };
    }

    const lastDate = new Date(lastActive);
    const currentDate = new Date(todayStr);
    const diffTime = currentDate.getTime() - lastDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

    if (diffDays === 1) {
      // Consecutive day! Increment streak
      return { streak: currentStreak + 1, lastActiveDate: todayStr };
    } else {
      // Missed a day or more, reset streak to 1 for today
      return { streak: 1, lastActiveDate: todayStr };
    }
  };

  const loadProgress = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      const now = Date.now();

      if (saved) {
        const data = JSON.parse(saved);
        const storedResetDate = data.lastResetDate || now;

        // Check if 30-day automatic reset cycle has elapsed
        if (now - storedResetDate >= THIRTY_DAYS_MS) {
          const resetState = { ...initialProgress, lastResetDate: now };
          setProgress(resetState);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(resetState));
          return;
        }

        // Check if streak broke because of inactivity (more than 1 full calendar day missed)
        let evaluatedStreak = data.streak || 0;
        if (data.lastActiveDate) {
          const todayStr = getLocalDateString();
          const lastDate = new Date(data.lastActiveDate);
          const currentDate = new Date(todayStr);
          const diffDays = Math.round((currentDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
          
          if (diffDays > 1) {
            evaluatedStreak = 0; // Streak broken!
          }
        }

        const mergedState = { ...data, streak: evaluatedStreak };
        setProgress((prev) => ({ ...prev, ...mergedState }));
      } else {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(initialProgress));
      }
    } catch (e) {
      console.error('Failed to load global progress & controls', e);
    }
  };

  const addXp = async (amount: number) => {
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

  const recordActivity = async () => {
    await new Promise<void>((resolve) => {
      setProgress((current) => {
        const { streak, lastActiveDate } = evaluateStreak(current.streak, current.lastActiveDate);
        const updated = { ...current, streak, lastActiveDate };
        saveAndSync({ streak, lastActiveDate });
        resolve();
        return updated;
      });
    });
  };

  const completeLesson = async (minutes: number = 15) => {
    await recordActivity();
    await addXp(40);
    await new Promise<void>((resolve) => {
      setProgress((current) => {
        const lessons = current.lessons + 1;
        const studyMinutes = current.studyMinutes + minutes;
        const updated = { ...current, lessons, studyMinutes };
        saveAndSync({ lessons, studyMinutes });
        resolve();
        return updated;
      });
    });
  };

  const completeGame = async (amount: number = 25) => {
    await recordActivity();
    await addXp(amount);
    await new Promise<void>((resolve) => {
      setProgress((current) => {
        const gamesPassed = current.gamesPassed + 1;
        const leaderboardXp = current.leaderboardXp + amount;
        const updated = { ...current, gamesPassed, leaderboardXp };
        saveAndSync({ gamesPassed, leaderboardXp });
        resolve();
        return updated;
      });
    });
  };

  const addSession = async (session: Omit<StudySession, 'id' | 'done'>) => {
    await new Promise<void>((resolve) => {
      setProgress((current) => {
        const sessions = [...current.sessions, { ...session, id: Date.now(), done: false }];
        const updated = { ...current, sessions };
        saveAndSync({ sessions });
        resolve();
        return updated;
      });
    });
  };

  const updateSession = async (id: number | string, changes: Partial<StudySession>) => {
    await new Promise<void>((resolve) => {
      setProgress((current) => {
        const sessions = current.sessions.map((session) => 
          session.id === id ? { ...session, ...changes } : session
        );
        const updated = { ...current, sessions };
        saveAndSync({ sessions });
        resolve();
        return updated;
      });
    });
  };

  const resetProgress = async () => {
    const now = Date.now();
    const resetState = {
      ...initialProgress,
      lastResetDate: now,
    };
    setProgress(resetState);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(resetState));
  };

  const isBedtimeActive = useMemo(() => {
    if (!progress.bedtimeLockEnabled) return false;
    const currentHour = new Date().getHours();
    return currentHour >= progress.bedtimeHour;
  }, [progress.bedtimeLockEnabled, progress.bedtimeHour]);

  const value = useMemo(() => ({ 
    ...progress, 
    addXp, 
    completeLesson, 
    completeGame, 
    addSession, 
    updateSession, 
    resetProgress,
    isBedtimeActive,
    refreshProgress: loadProgress 
  }), [progress, isBedtimeActive]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() { 
  const value = useContext(ProgressContext); 
  if (!value) throw new Error('useProgress must be used inside ProgressProvider'); 
  return value; 
}