import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  ImageSourcePropType,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Modal,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GradientSafeAreaView } from '@/components/gradient-safe-area';
import { useProgress } from '@/hooks/use-progress';

const logo = require('../../assets/BiosphereQuestAssets/Biosphere Quest Logo.png');
const target = require('../../assets/BiosphereQuestAssets/target.png');
const astro = require('../../assets/BiosphereQuestAssets/Astro (Biosphere Quest Mascot).png');

const STORAGE_KEY = '@biosphere_profile_data_v1';
const PARENT_CONTROLS_KEY = '@biosphere_parent_controls_v1';

export default function HomeScreen() {
  const progress = useProgress();
  const appear = useRef(new Animated.Value(0)).current;
  const levelUpAnim = useRef(new Animated.Value(-100)).current;

  const [streak, setStreak] = useState(progress.streak);
  const [level, setLevel] = useState(progress.level);
  const [lessons, setLessons] = useState(progress.lessons);
  const [xp, setXp] = useState(progress.xp);
  const [studyMinutes, setStudyMinutes] = useState(progress.studyMinutes || 0);
  const [prevLevel, setPrevLevel] = useState<number | null>(null);
  const [levelUpText, setLevelUpText] = useState('');
  const [greeting, setGreeting] = useState('Good morning');

  // Parent Controls State
  const [isLocked, setIsLocked] = useState(false);
  const [lockMessage, setLockMessage] = useState('');
  const [gradeLocks, setGradeLocks] = useState<{ [key: string]: boolean }>({});

  const nextLevelXp = progress.nextLevelXp || 100;
  const width = `${Math.min(100, Math.round((xp / nextLevelXp) * 100))}%` as any;

  // Check Parent Controls on Mount
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
          setLockMessage(`🌙 Bedtime Lock Active!\nYour parent set bedtime for ${controls.bedtimeHour}. Time to rest!`);
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

  // Foolproof navigation wrapper to prevent "Unmatched Route" crashes completely
  const navigateToRoute = (path: string) => {
    try {
      router.push(path as any);
    } catch (err) {
      console.warn("Standard router push failed, trying absolute path...", err);
      try {
        router.replace(path as any);
      } catch (innerErr) {
        Alert.alert("Route Notice", `Could not find route path: ${path}. Please ensure the file exists in src/app/`);
      }
    }
  };

  const handleGradePress = (gradeCategory: string) => {
    if (gradeLocks[gradeCategory]) {
      Alert.alert(
        "Content Locked", 
        `Your parent has locked access for ${gradeCategory}. Returning to login.`,
        [{ text: "OK", onPress: () => router.replace('/') }]
      );
      return;
    }
    navigateToRoute('/explore');
  };

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting('Good morning');
    } else if (hour >= 12 && hour < 17) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
  }, []);

  const triggerLevelUpAnimation = (oldLvl: number, newLvl: number) => {
    const formattedOld = String(oldLvl).padStart(2, '0');
    const formattedNew = String(newLvl).padStart(2, '0');
    setLevelUpText(`Congratulations! You leveled up from ${formattedOld} to ${formattedNew}!`);

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
      }).start();
    }, 3500);
  };

  const loadSharedProgress = async () => {
    try {
      const savedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        const newLvl = parsed.level !== undefined ? parsed.level : progress.level;

        setLevel((currentLvl) => {
          if (prevLevel !== null && newLvl > currentLvl) {
            triggerLevelUpAnimation(currentLvl, newLvl);
          }
          setPrevLevel(newLvl);
          return newLvl;
        });

        if (parsed.streak !== undefined) setStreak(parsed.streak);
        if (parsed.lessons !== undefined) setLessons(parsed.lessons);
        if (parsed.xp !== undefined) setXp(parsed.xp);
        if (parsed.studyMinutes !== undefined) {
          setStudyMinutes(parsed.studyMinutes);
        } else {
          setStudyMinutes(0);
        }
      } else {
        setLevel((currentLvl) => {
          if (prevLevel !== null && progress.level > currentLvl) {
            triggerLevelUpAnimation(currentLvl, progress.level);
          }
          setPrevLevel(progress.level);
          return progress.level;
        });
        setStreak(progress.streak);
        setLessons(progress.lessons);
        setXp(progress.xp);
        setStudyMinutes(progress.studyMinutes || 0);
      }
    } catch (e) {
      console.error('Failed to load shared progress on home', e);
    }
  };

  useEffect(() => {
    loadSharedProgress();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSharedProgress();
    }, [])
  );

  useEffect(() => {
    Animated.spring(appear, {
      toValue: 1,
      useNativeDriver: true,
      tension: 45,
      friction: 8,
    }).start();
  }, [appear]);

  return (
    <GradientSafeAreaView style={styles.safeArea} edges={['top']}>
      <Animated.View style={[styles.levelUpBanner, { transform: [{ translateY: levelUpAnim }] }]}>
        <Text style={styles.levelUpText}>{levelUpText}</Text>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.greeting}>
            <Image source={logo} style={styles.avatar} contentFit="contain" />
            <View>
              <Text style={styles.small}>{greeting},</Text>
              <Text style={styles.name}>BloxyCroissant</Text>
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
            <Pressable onPress={() => handleGradePress('Grade 3')} style={styles.course}>
              <Text style={styles.courseIcon}>📚</Text>
              <Text style={styles.courseTitle}>Fractions</Text>
              <Text style={styles.courseSub}>Grade 3</Text>
            </Pressable>

            <Pressable onPress={() => handleGradePress('Grade 1')} style={styles.course}>
              <Text style={styles.courseIcon}>🔢</Text>
              <Text style={styles.courseTitle}>Counting Numbers</Text>
              <Text style={styles.courseSub}>Grade 1</Text>
            </Pressable>
          </View>

          <View style={styles.challenge}>
            <View>
              <Text style={styles.challengeTag}>DAILY CHALLENGE</Text>
              <Text style={styles.challengeTitle}>Science & Math Quiz</Text>
              <Text style={styles.challengeSub}>5 questions • +150 XP • ~3 min</Text>
            </View>
            <Image source={target} style={styles.target} contentFit="contain" />
          </View>

          <Text style={styles.section}>Study time</Text>
          <View style={styles.study}>
            <Text style={styles.studyValue}>
              {Math.floor(studyMinutes / 60)}h {studyMinutes % 60}m
            </Text>
            <Text style={styles.studyCopy}>Keep learning to grow your weekly progress.</Text>
          </View>

          <Text style={styles.section}>Browse by Grade</Text>
          <GradeCard
            title="Elementary"
            grades="Grade 1-3"
            icon={astro}
            colors={['#875b20', '#172849']}
            tags={['1 + 1 Basic Math', 'Science']}
            onPress={() => handleGradePress('Elementary')}
          />
          <GradeCard
            title="Intermediate"
            grades="Grade 4-6"
            icon={astro}
            colors={['#27749b', '#172849']}
            tags={['Earth Science', 'Pre-Algebra']}
            onPress={() => handleGradePress('Intermediate')}
          />
        </Animated.View>
      </ScrollView>

      {/* Bedtime Lock Overlay Modal -> Automatically redirects back to welcome/login page when clicked/tapped */}
      <Modal visible={isLocked} animationType="fade" transparent={true}>
        <Pressable 
          style={styles.lockOverlay} 
          onPress={() => {
            setIsLocked(false);
            router.replace('/');
          }}
        >
          <View style={styles.lockContentContainer}>
            <Text style={styles.lockEmoji}>🛡️</Text>
            <Text style={styles.lockTitle}>Locked by Parent</Text>
            <Text style={styles.lockDesc}>{lockMessage}</Text>
            <Text style={styles.lockActionHint}>Tap anywhere to return to the welcome screen</Text>
          </View>
        </Pressable>
      </Modal>
    </GradientSafeAreaView>
  );
}

function GradeCard({
  title,
  grades,
  icon,
  colors,
  tags,
  onPress,
}: {
  title: string;
  grades: string;
  icon: ImageSourcePropType;
  colors: [string, string];
  tags: string[];
  onPress: () => void;
}) {
  return (
    <View style={[styles.gradeCard, { borderColor: colors[0], backgroundColor: colors[1] }]}>
      <View style={styles.gradeHeader}>
        <Image source={icon} style={styles.gradeIcon} contentFit="contain" />
        <View style={styles.gradeCopy}>
          <Text style={styles.gradeTitle}>{title}</Text>
          <Text style={styles.gradeLabel}>{grades}</Text>
        </View>
        <Pressable onPress={onPress} style={[styles.viewButton, { borderColor: colors[0] }]}>
          <Text style={styles.viewText}>View</Text>
        </Pressable>
      </View>
      <View style={styles.tags}>
        {tags.map((tag) => (
          <Text key={tag} style={[styles.tag, { borderColor: colors[0] }]}>
            {tag}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#091426' },
  levelUpBanner: {
    position: 'absolute',
    top: 15,
    left: 18,
    right: 18,
    zIndex: 999,
    backgroundColor: '#4642ae',
    borderColor: '#ffdf4e',
    borderWidth: 2,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  levelUpText: { color: '#fff', fontWeight: '900', fontSize: 13, textAlign: 'center' },
  content: { padding: 18, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatar: { width: 44, height: 44 },
  small: { color: '#d6dced', fontSize: 12 },
  name: { color: '#fff', fontWeight: '900', fontSize: 18 },
  bell: {
    color: '#d0c6ff',
    fontSize: 20,
    borderColor: '#725df2',
    borderWidth: 1,
    borderRadius: 20,
    padding: 7,
  },
  progress: {
    backgroundColor: '#202866',
    borderColor: '#625cff',
    borderWidth: 1,
    borderRadius: 13,
    padding: 10,
    marginTop: 18,
  },
  labels: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { color: '#fff', fontSize: 11, fontWeight: '800' },
  levelRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  xp: { color: '#edaa39', fontWeight: '900' },
  track: { backgroundColor: '#000', height: 7, borderRadius: 5, marginTop: 5 },
  fill: { height: '100%', backgroundColor: '#df6ce8', borderRadius: 5 },
  section: { color: '#fff', fontSize: 17, fontWeight: '900', marginTop: 20, marginBottom: 9 },
  cards: { flexDirection: 'row', gap: 10 },
  course: {
    flex: 1,
    minHeight: 102,
    backgroundColor: '#172849',
    borderColor: '#4568cf',
    borderWidth: 1,
    borderRadius: 15,
    padding: 11,
  },
  courseIcon: { color: '#f1bd48', fontSize: 27, fontWeight: '900' },
  courseTitle: { color: '#fff', fontWeight: '900', marginTop: 4 },
  courseSub: { color: '#bac7e0', fontSize: 10 },
  challenge: {
    backgroundColor: '#4642ae',
    borderColor: '#c2cf34',
    borderWidth: 1,
    borderRadius: 17,
    padding: 12,
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  challengeTag: { color: '#ffdf4e', fontWeight: '900', fontSize: 10 },
  challengeTitle: { color: '#fff', fontWeight: '900', fontSize: 17 },
  challengeSub: { color: '#fff', fontSize: 10 },
  target: { width: 55, height: 55 },
  study: {
    backgroundColor: '#172849',
    borderColor: '#4568cf',
    borderWidth: 1,
    borderRadius: 13,
    padding: 14,
  },
  studyValue: { color: '#7ce1ff', fontWeight: '900', fontSize: 22 },
  studyCopy: { color: '#c0cbe0', fontSize: 11, marginTop: 4 },
  gradeCard: { borderWidth: 1, borderRadius: 18, padding: 10, marginTop: 9 },
  gradeHeader: { flexDirection: 'row', alignItems: 'center' },
  gradeIcon: { width: 44, height: 44 },
  gradeCopy: { flex: 1, marginLeft: 7 },
  gradeTitle: { color: '#fff', fontSize: 19, fontWeight: '900' },
  gradeLabel: { color: '#fff', fontSize: 12, fontWeight: '800' },
  viewButton: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 5 },
  viewText: { color: '#fff', fontWeight: '900', fontSize: 11 },
  tags: { flexDirection: 'row', gap: 7, marginTop: 7 },
  tag: {
    color: '#fff',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontSize: 9,
    fontWeight: '800',
  },
  lockOverlay: {
    flex: 1,
    backgroundColor: 'rgba(9, 11, 32, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  lockContentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    width: '100%',
  },
  lockEmoji: { fontSize: 50, marginBottom: 12 },
  lockTitle: { color: '#fff', fontSize: 22, fontWeight: '900', marginBottom: 8, textAlign: 'center' },
  lockDesc: { color: '#94a3b8', fontSize: 14, fontWeight: '600', textAlign: 'center', lineHeight: 20, marginBottom: 16 },
  lockActionHint: { color: '#818cf8', fontSize: 12, fontWeight: '800', textAlign: 'center', textDecorationLine: 'underline' },
});