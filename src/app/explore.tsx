import { Image } from 'expo-image';
import { useState, useEffect, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, Animated, ImageSourcePropType, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GradientSafeAreaView as SafeAreaView } from '@/components/gradient-safe-area';
import { curriculum, type Lesson, type Subject } from '@/constants/curriculum';
import { useProgress } from '@/hooks/use-progress';
import { router, usePathname, Href } from 'expo-router';

const PARENT_CONTROLS_KEY = '@biosphere_parent_controls_v1';
const astro = require('../../assets/BiosphereQuestAssets/Astro (Biosphere Quest Mascot).png');
const homeIcon = require('../../assets/BiosphereQuestAssets/Home Icon.png');
const coursesIcon = require('../../assets/BiosphereQuestAssets/Courses Icon.png');
const gamesIcon = require('../../assets/BiosphereQuestAssets/Games Icon.png');
const profileIcon = require('../../assets/BiosphereQuestAssets/Profile Icon.png');

const tabs = [
  { label: 'Home', route: '/home', icon: homeIcon },
  { label: 'Courses', route: '/explore', icon: coursesIcon },
  { label: 'Games', route: '/games', icon: gamesIcon },
  { label: 'Profile', route: '/profile', icon: profileIcon },
] as const;

const subjectKnowledge: Record<string, string> = { 
  Math: 'Build number sense, solve problems, and connect math to real-life decisions.', 
  Matter: 'Explore materials, their properties, and how matter changes.', 
  'Living Things & Environment': 'Study life, habitats, adaptations, and healthy ecosystems.', 
  'Force, Motion, & Energy': 'Discover how forces change motion and how energy moves.', 
  'Earth & Space': 'Understand Earth systems, weather, rocks, and space patterns.' 
};

export default function ExploreScreen() {
  const { completeLesson } = useProgress();
  const [grade, setGrade] = useState(1);
  const [selected, setSelected] = useState<{ subject: Subject; lesson: Lesson } | null>(null);
  const [gradeLocks, setGradeLocks] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetchParentControls();
  }, []);

  const fetchParentControls = async () => {
    try {
      const data = await AsyncStorage.getItem(PARENT_CONTROLS_KEY);
      if (data) {
        const controls = JSON.parse(data);
        if (controls.gradeLocks) {
          setGradeLocks(controls.gradeLocks);
        }
      }
    } catch (e) {
      console.error("Error reading parent controls in explore", e);
    }
  };

  const handleGradeSelection = (item: number) => {
    const gradeKey = `Grade ${item}`;
    if (gradeLocks[gradeKey]) {
      Alert.alert(
        "Grade Locked",
        `Grade ${item} curriculum access has been locked by your parent or guardian.`
      );
      return;
    }
    setGrade(item);
  };

  if (selected) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content}>
          <Pressable onPress={() => setSelected(null)}>
            <Text style={styles.back}>‹ Back to courses</Text>
          </Pressable>
          <View style={[styles.lessonHero, { borderColor: selected.subject.color }]}>
            <Text style={styles.bigIcon}>{selected.subject.icon}</Text>
            <Text style={styles.detailTitle}>{selected.lesson.title}</Text>
            <Text style={styles.pill}>{selected.lesson.difficulty} mission</Text>
          </View>
          <Info title="SUBJECT KNOWLEDGE" text={subjectKnowledge[selected.subject.title]} />
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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.back}>‹ Cancel</Text>
          </Pressable>
          <View style={styles.headerTitle}>
            <Image source={astro} style={styles.headerMascot} />
            <Text style={styles.title}> My Courses</Text>
          </View>
        </View>
        <View style={styles.search}>
          <Text style={styles.searchText}>⌕ Search courses...</Text>
        </View>
        <View style={styles.gradeTabs}>
          {[1, 2, 3, 4, 5, 6].map((item) => {
            const isLocked = gradeLocks[`Grade ${item}`];
            return (
              <Pressable 
                key={item} 
                onPress={() => handleGradeSelection(item)} 
                style={[
                  styles.gradeTab, 
                  grade === item && styles.activeTab,
                  isLocked && styles.lockedTabBg
                ]}
              >
                <Text style={styles.tabText}>
                  Grade {item} {isLocked ? "🔒" : ""}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.section}>Grade {grade} · Math and Science curriculum</Text>
        {curriculum[grade].map((subject) => (
          <SubjectCard 
            key={subject.title} 
            subject={subject} 
            onLesson={(lesson) => setSelected({ subject, lesson })} 
          />
        ))}
      </ScrollView>
      <BottomNavigation />
    </SafeAreaView>
  );
}

function SubjectCard({ subject, onLesson }: { subject: Subject; onLesson: (lesson: Lesson) => void }) { 
  return (
    <View style={[styles.subject, { borderColor: subject.color }]}>
      <View style={styles.subjectHeader}>
        <Text style={styles.subjectIcon}>{subject.icon}</Text>
        <View style={styles.subjectCopy}>
          <Text style={styles.subjectTitle}>{subject.title}</Text>
          <Text style={styles.subjectSub}>{subject.lessons.length} lessons · Grade-ready missions</Text>
        </View>
      </View>
      <Text style={styles.knowledge}>{subjectKnowledge[subject.title]}</Text>
      {subject.lessons.map((lesson, index) => (
        <Pressable key={lesson.title} onPress={() => onLesson(lesson)} style={styles.lesson}>
          <View style={styles.lessonNumber}>
            <Text style={styles.lessonNumberText}>{index + 1}</Text>
          </View>
          <View style={styles.lessonCopy}>
            <Text style={styles.lessonTitle}>{lesson.title}</Text>
            <Text style={styles.lessonDifficulty}>{lesson.difficulty} challenge</Text>
          </View>
          <Text style={styles.lessonArrow}>›</Text>
        </Pressable>
      ))}
    </View>
  ); 
}

function Info({ title, text }: { title: string; text: string }) { 
  return (
    <View style={styles.info}>
      <Text style={styles.detailLabel}>{title}</Text>
      <Text style={styles.detailBody}>{text}</Text>
    </View>
  ); 
}

function BottomNavigation() {
  const pathname = usePathname();
  return (
    <View style={navStyles.navigation}>
      {tabs.map((tab) => {
        const active = pathname === tab.route || (tab.route === '/explore' && pathname.includes('explore'));
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
}) {
  const motion = useRef(new Animated.Value(active ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(motion, { toValue: active ? 1 : 0, useNativeDriver: true, tension: 70, friction: 8 }).start();
  }, [active, motion]);

  const iconScale = motion.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1.04] });
  const iconLift = motion.interpolate({ inputRange: [0, 1], outputRange: [2, -1] });

  return (
    <Pressable onPress={onPress} style={navStyles.tab}>
      <Animated.View style={[navStyles.activeBackground, { opacity: motion }]} />
      <Animated.View style={{ transform: [{ scale: iconScale }, { translateY: iconLift }] }}>
        <Image source={icon} style={navStyles.icon} contentFit="contain" />
      </Animated.View>
      <Text style={navStyles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({ 
  safeArea: { flex: 1, backgroundColor: '#091426' }, 
  content: { padding: 18, paddingBottom: 95 }, 
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, 
  back: { color: '#e582ff', fontWeight: '800', fontSize: 14 }, 
  headerTitle: { flexDirection: 'row', alignItems: 'center', gap: 7 }, 
  headerMascot: { width: 40, height: 40 }, 
  title: { color: '#fff', fontWeight: '900', fontSize: 21 }, 
  search: { marginTop: 14, backgroundColor: '#30358d', borderColor: '#5c60ee', borderWidth: 1, borderRadius: 20, padding: 10 }, 
  searchText: { color: '#cbc9f3', fontSize: 12 }, 
  gradeTabs: { flexDirection: 'row', gap: 5, marginVertical: 12, flexWrap: 'wrap' }, 
  gradeTab: { backgroundColor: '#252a69', borderRadius: 14, paddingHorizontal: 11, paddingVertical: 7 }, 
  activeTab: { backgroundColor: '#6358ff' }, 
  lockedTabBg: { backgroundColor: '#5c2222', borderColor: '#ef4444', borderWidth: 1 },
  tabText: { color: '#fff', fontSize: 11, fontWeight: '800' }, 
  section: { color: '#fff', fontWeight: '900', fontSize: 16, marginBottom: 9 }, 
  subject: { backgroundColor: '#132844', borderWidth: 1, borderRadius: 17, padding: 10, marginBottom: 12 }, 
  subjectHeader: { flexDirection: 'row', alignItems: 'center', gap: 9 }, 
  subjectIcon: { fontSize: 25 }, 
  subjectCopy: { flex: 1 }, 
  subjectTitle: { color: '#fff', fontWeight: '900', fontSize: 14 }, 
  subjectSub: { color: '#bcc8df', fontSize: 10, marginTop: 2 }, 
  knowledge: { color: '#d7e1f2', fontSize: 10, lineHeight: 15, marginTop: 8 }, 
  lesson: { backgroundColor: '#243d75', borderRadius: 11, padding: 8, flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 7 }, 
  lessonNumber: { width: 27, height: 27, borderRadius: 15, backgroundColor: '#2b77ca', alignItems: 'center', justifyContent: 'center' }, 
  lessonNumberText: { color: '#fff', fontWeight: '900' }, 
  lessonCopy: { flex: 1 }, 
  lessonTitle: { color: '#fff', fontWeight: '800', fontSize: 12 }, 
  lessonDifficulty: { color: '#b9c9e5', fontSize: 9, marginTop: 2 }, 
  lessonArrow: { color: '#fff', fontSize: 24 }, 
  lessonHero: { alignItems: 'center', backgroundColor: '#182e5d', borderWidth: 1, borderRadius: 15, padding: 16 }, 
  bigIcon: { fontSize: 40 }, 
  detailTitle: { color: '#fff', fontSize: 21, fontWeight: '900', textAlign: 'center', marginTop: 7 }, 
  pill: { color: '#9af2bc', fontWeight: '900', marginTop: 5 }, 
  info: { backgroundColor: '#30358d', borderColor: '#5d62ef', borderWidth: 1, borderRadius: 14, padding: 14, marginTop: 12 }, 
  detailLabel: { color: '#f3ca45', fontSize: 10, fontWeight: '900', letterSpacing: 1 }, 
  detailBody: { color: '#fff', fontSize: 15, lineHeight: 23, marginTop: 8 }, 
  startButton: { backgroundColor: '#6258ff', borderRadius: 10, alignItems: 'center', padding: 13, marginTop: 16 }, 
  startText: { color: '#fff', fontWeight: '900' }
});

const navStyles = StyleSheet.create({
  navigation: {
    backgroundColor: '#050505',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 6,
    paddingBottom: 8,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: '#17264a',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 6,
    borderRadius: 24,
    position: 'relative',
  },
  activeBackground: { ...StyleSheet.absoluteFill, backgroundColor: '#003d3d', borderRadius: 24 },
  icon: { width: 28, height: 28 },
  label: { color: '#a9dcff', fontSize: 12, fontWeight: '700', marginTop: 3 },
});