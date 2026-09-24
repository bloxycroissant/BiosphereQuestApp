import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ProgressContextType {
  leaderboardXp: number;
  totalXp: number;
  addXp: (amount: number) => Promise<void>;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

const TOTAL_XP_KEY = '@biosphere_quest_user_xp';
const WEEKLY_XP_KEY = '@biosphere_quest_weekly_xp';

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [totalXp, setTotalXp] = useState<number>(0);
  const [leaderboardXp, setLeaderboardXp] = useState<number>(0);

  // Load saved XP on app start
  useEffect(() => {
    async function loadProgress() {
      try {
        const savedTotal = await AsyncStorage.getItem(TOTAL_XP_KEY);
        const savedWeekly = await AsyncStorage.getItem(WEEKLY_XP_KEY);

        if (savedTotal !== null) setTotalXp(JSON.parse(savedTotal));
        if (savedWeekly !== null) setLeaderboardXp(JSON.parse(savedWeekly));
      } catch (error) {
        console.error('Failed to load progress:', error);
      }
    }
    loadProgress();
  }, []);

  // Add XP and save to persistent storage for both lifetime & leaderboard totals
  const addXp = async (amount: number) => {
    try {
      const newTotalXp = totalXp + amount;
      const newWeeklyXp = leaderboardXp + amount;

      setTotalXp(newTotalXp);
      setLeaderboardXp(newWeeklyXp);

      await AsyncStorage.setItem(TOTAL_XP_KEY, JSON.stringify(newTotalXp));
      await AsyncStorage.setItem(WEEKLY_XP_KEY, JSON.stringify(newWeeklyXp));
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  };

  return (
    <ProgressContext.Provider value={{ totalXp, leaderboardXp, addXp }}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}