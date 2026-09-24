import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Pressable, Animated } from 'react-native';
import { useProgress } from '@/hooks/use-progress';
import { router } from 'expo-router';

interface ParentalLockGuardProps {
  children: React.ReactNode;
  feature: 'minigame' | 'arcade' | 'flashcard';
}

export function ParentalLockGuard({ children, feature }: ParentalLockGuardProps) {
  const { isBedtimeActive, arcadeMinigamesEnabled, flashcardsEnabled, studyFirstLock, lessons } = useProgress();

  if (isBedtimeActive) {
    return (
      <LockScreenView
        title="🌙 Bedtime Downtime Active"
        subtitle="It's past your scheduled bedtime. The app is locked for the night to protect your sleep schedule! Ask a parent for the PIN if needed."
      />
    );
  }

  if (feature === 'arcade' && !arcadeMinigamesEnabled) {
    return (
      <LockScreenView
        title="🔒 Minigames Disabled"
        subtitle="Arcade minigames have been temporarily disabled by parental controls."
      />
    );
  }

  if (feature === 'flashcard' && !flashcardsEnabled) {
    return (
      <LockScreenView
        title="🔒 Flashcards Disabled"
        subtitle="Flashcard modules have been disabled by parental controls."
      />
    );
  }

  if (studyFirstLock && lessons === 0 && feature === 'arcade') {
    return (
      <LockScreenView
        title="📚 Study Session Required"
        subtitle="You must complete at least one daily lesson or quiz review before opening free-play arcade minigames!"
        actionLabel="Go to Lessons"
        onAction={() => router.push('/home' as any)}
      />
    );
  }

  return <>{children}</>;
}

function LockScreenView({ title, subtitle, actionLabel, onAction }: { title: string; subtitle: string; actionLabel?: string; onAction?: () => void }) {
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [scaleAnim, fadeAnim]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <Text style={styles.icon}>🛡️</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        {actionLabel && onAction && (
          <Pressable style={styles.btn} onPress={onAction}>
            <Text style={styles.btnText}>{actionLabel}</Text>
          </Pressable>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#091426', justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: { 
    backgroundColor: '#131e38', 
    borderColor: '#625cff', 
    borderWidth: 2, 
    borderRadius: 20, 
    padding: 24, 
    width: '100%', 
    maxWidth: 360, 
    alignItems: 'center',
    shadowColor: '#625cff',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
  },
  icon: { fontSize: 42, marginBottom: 12 },
  title: { color: '#fff', fontSize: 18, fontWeight: '900', textAlign: 'center', marginBottom: 8 },
  subtitle: { color: '#bdc8dd', fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  btn: { backgroundColor: '#625cff', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, width: '100%', alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 14 },
});