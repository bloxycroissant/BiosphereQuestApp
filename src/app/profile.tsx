import { GradientSafeAreaView } from '@/components/gradient-safe-area';
import { achievements } from '@/constants/achievements';
import { useProgress } from '@/hooks/use-progress';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const logo = require('../../assets/BiosphereQuestAssets/Biosphere Quest Logo.png');
const astro = require('../../assets/BiosphereQuestAssets/Stella (Biosphere Quest Mascot).png');

type Section = 'badges' | 'schedule';
type ViewMode = 'profile' | 'editProfile' | 'addSchedule';

interface LocalSession {
  id: string;
  day: string;
  title: string;
  time: string;
  done: boolean;
}

interface AchievementType {
  id: number | string;
  unlocked: boolean;
  accent: string;
  icon: string;
  title: string;
  xp: number;
}

const STORAGE_KEY = '@biosphere_profile_data_v1';

export default function ProfileScreen() {
  const progress = useProgress();
  const [currentView, setCurrentView] = useState<ViewMode>('profile');
  const [section, setSection] = useState<Section>('badges');
  const levelUpAnim = useRef(new Animated.Value(-100)).current;

  const [prevLevel, setPrevLevel] = useState<number | null>(null);
  const [levelUpText, setLevelUpText] = useState('');

  const [streak, setStreak] = useState(progress.streak);
  const [lessons, setLessons] = useState(progress.lessons);
  const [xp, setXp] = useState(progress.xp);
  const [level, setLevel] = useState(progress.level);

  const nextLevelXp = progress.nextLevelXp || 100;

  const [name, setName] = useState('BloxyCroissant');
  const [username, setUsername] = useState('@bloxycroissant');
  const [email, setEmail] = useState('bloxycroissant@biospherequest.app');
  const [phone, setPhone] = useState('+1 (555) 012-3456');
  const [bio, setBio] = useState('I like Math and Science');
  const [school, setSchool] = useState('Biosphere Quest');
  const [gradeYear, setGradeYear] = useState('Grade 4');
  const [website, setWebsite] = useState('bloxycroissant.dev');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const [tempName, setTempName] = useState(name);
  const [tempUsername, setTempUsername] = useState(username);
  const [tempEmail, setTempEmail] = useState(email);
  const [tempPhone, setTempPhone] = useState(phone);
  const [tempBio, setTempBio] = useState(bio);
  const [tempSchool, setTempSchool] = useState(school);
  const [tempGradeYear, setTempGradeYear] = useState(gradeYear);
  const [tempWebsite, setTempWebsite] = useState(website);
  const [tempProfileImage, setTempProfileImage] = useState<string | null>(profileImage);

  const rawSessions = (progress as any).sessions || [
    { id: '1', day: 'Mon', title: 'Ecology Basics', time: '10:00 AM', done: true },
    { id: '2', day: 'Wed', title: 'Ecosystems & Biomes', time: '12:00 PM', done: false },
  ];

  const [sessions, setSessions] = useState<LocalSession[]>(
    rawSessions.map((s: any) => ({
      id: String(s.id),
      day: String(s.day || 'Mon'),
      title: String(s.title || ''),
      time: String(s.time || ''),
      done: Boolean(s.done),
    }))
  );

  const [newTitle, setNewTitle] = useState('');
  const [newDay, setNewDay] = useState('Mon');
  const [newTime, setNewTime] = useState('9:00 AM');

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

  const persistData = async (updatedFields: object) => {
    try {
      const currentData = {
        name,
        username,
        email,
        phone,
        bio,
        school,
        gradeYear,
        website,
        profileImage,
        sessions,
        streak,
        lessons,
        xp,
        level,
        lastActiveDate: new Date().toDateString(),
        ...updatedFields,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(currentData));
    } catch (e) {
      console.error('Failed to save profile data', e);
    }
  };

  const loadSavedData = async () => {
    try {
      const savedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.name) setName(parsed.name);
        if (parsed.username) setUsername(parsed.username);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.phone) setPhone(parsed.phone);
        if (parsed.bio) setBio(parsed.bio);
        if (parsed.school) setSchool(parsed.school);
        if (parsed.gradeYear) setGradeYear(parsed.gradeYear);
        if (parsed.website) setWebsite(parsed.website);
        if (parsed.profileImage !== undefined) setProfileImage(parsed.profileImage);
        if (parsed.sessions) setSessions(parsed.sessions);
        if (parsed.streak !== undefined) setStreak(parsed.streak);
        if (parsed.lessons !== undefined) setLessons(parsed.lessons);
        if (parsed.xp !== undefined) setXp(parsed.xp);

        const newLvl = parsed.level !== undefined ? parsed.level : 1;
        setLevel((currentLvl) => {
          if (prevLevel !== null && newLvl > currentLvl) {
            triggerLevelUpAnimation(currentLvl, newLvl);
          }
          setPrevLevel(newLvl);
          return newLvl;
        });
      }
    } catch (e) {
      console.error('Failed to load profile data', e);
    }
  };

  useEffect(() => {
    loadSavedData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSavedData();
    }, [])
  );

  const handleResetProgress = () => {
    Alert.alert(
      'Reset Progress',
      'Are you sure you want to reset your stats, study time, and streak? (Your +50 account bonus will be kept)',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              const baselineXp = 50;
              const baselineLevel = 1;

              setStreak(0);
              setLessons(0);
              setXp(baselineXp);
              setLevel(baselineLevel);

              persistData({ streak: 0, lessons: 0, xp: baselineXp, level: baselineLevel, studyMinutes: 0 });
            } catch (e) {
              console.error('Failed to reset progress', e);
            }
          },
        },
      ]
    );
  };

  const openEditProfile = () => {
    setTempName(name);
    setTempUsername(username);
    setTempEmail(email);
    setTempPhone(phone);
    setTempBio(bio);
    setTempSchool(school);
    setTempGradeYear(gradeYear);
    setTempWebsite(website);
    setTempProfileImage(profileImage);
    setCurrentView('editProfile');
  };

  const saveProfile = () => {
    if (!tempName.trim() || !tempEmail.trim()) {
      Alert.alert('Incomplete Form', 'Please fill out at least your Full Name and Email before saving.');
      return;
    }
    setName(tempName);
    setUsername(tempUsername);
    setEmail(tempEmail);
    setPhone(tempPhone);
    setBio(tempBio);
    setSchool(tempSchool);
    setGradeYear(tempGradeYear);
    setWebsite(tempWebsite);
    setProfileImage(tempProfileImage);
    setCurrentView('profile');

    persistData({
      name: tempName,
      username: tempUsername,
      email: tempEmail,
      phone: tempPhone,
      bio: tempBio,
      school: tempSchool,
      gradeYear: tempGradeYear,
      website: tempWebsite,
      profileImage: tempProfileImage,
    });
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert('Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setTempProfileImage(result.assets[0].uri);
    }
  };

  const toggleSessionCheck = (id: string) => {
    const updatedSessions = sessions.map((s) => (s.id === id ? { ...s, done: !s.done } : s));
    setSessions(updatedSessions);
    const newlyCompleted = updatedSessions.find((s) => s.id === id)?.done;

    if (newlyCompleted) {
      const newXp = xp + 15;
      const newLessons = lessons + 1;
      setXp(newXp);
      setLessons(newLessons);
      persistData({ sessions: updatedSessions, xp: newXp, lessons: newLessons });
    } else {
      persistData({ sessions: updatedSessions });
    }
  };

  const addSession = () => {
    if (!newTitle.trim()) {
      Alert.alert('Incomplete Form', 'Please enter a session title/topic.');
      return;
    }
    const newSessionItem: LocalSession = {
      id: Date.now().toString(),
      day: newDay,
      title: newTitle,
      time: newTime,
      done: false,
    };
    const updatedSessions = [...sessions, newSessionItem];
    setSessions(updatedSessions);
    setNewTitle('');
    setCurrentView('profile');
    setSection('schedule');
    persistData({ sessions: updatedSessions });
  };

  const percent = `${Math.min(100, Math.round((xp / nextLevelXp) * 100))}%`;

  if (currentView === 'editProfile') {
    return (
      <GradientSafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.editHeaderRow}>
            <Pressable onPress={() => setCurrentView('profile')}>
              <Text style={styles.cancelText}>← Cancel</Text>
            </Pressable>
            <Text style={styles.editHeaderTitle}>Edit Profile</Text>
            <Pressable onPress={saveProfile} style={styles.saveBtn}>
              <Text style={styles.saveBtnText}>Save</Text>
            </Pressable>
          </View>

          <View style={styles.editAvatarContainer}>
            <Pressable onPress={pickImage} style={styles.avatarWrapper}>
              <View style={styles.avatarLarge}>
                {tempProfileImage ? (
                  <Image source={{ uri: tempProfileImage }} style={styles.avatarImageFilled} resizeMode="cover" />
                ) : (
                  <Text style={styles.avatarLargeText}>
                    {tempName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .substring(0, 2)
                      .toUpperCase() || 'BC'}
                  </Text>
                )}
              </View>
              <View style={styles.cameraBadge}>
                <Text style={{ fontSize: 14 }}>📷</Text>
              </View>
            </Pressable>
            <Text style={styles.changePhotoText} onPress={pickImage}>
              Change photo
            </Text>
          </View>

          <Text style={styles.groupLabel}>PERSONAL INFO</Text>
          <View style={styles.formGroupCard}>
            <FormInput icon="👤" label="Full Name" value={tempName} onChangeText={setTempName} />
            <FormInput icon="@" label="Username" value={tempUsername} onChangeText={setTempUsername} />
            <FormInput icon="✉️" label="Email" value={tempEmail} onChangeText={setTempEmail} />
            <FormInput icon="📞" label="Phone" value={tempPhone} onChangeText={setTempPhone} borderless />
          </View>

          <Text style={styles.groupLabel}>ABOUT ME</Text>
          <View style={styles.formGroupCard}>
            <View style={styles.inputContainerSingle}>
              <Text style={styles.inputLabel}>Bio</Text>
              <TextInput
                style={styles.textArea}
                value={tempBio}
                onChangeText={setTempBio}
                multiline
                maxLength={250}
                placeholder="Write your bio..."
                placeholderTextColor="#68779a"
              />
              <Text style={styles.charCounter}>{tempBio.length} / 250</Text>
            </View>
          </View>

          <Text style={styles.groupLabel}>ACADEMIC INFO</Text>
          <View style={styles.formGroupCard}>
            <FormInput icon="🏫" label="School" value={tempSchool} onChangeText={setTempSchool} />
            <FormInput icon="🎓" label="Grade / Year" value={tempGradeYear} onChangeText={setTempGradeYear} borderless />
          </View>

          <Text style={styles.groupLabel}>LINKS</Text>
          <View style={styles.formGroupCard}>
            <FormInput icon="🌐" label="Website" value={tempWebsite} onChangeText={setTempWebsite} borderless />
          </View>

          <Pressable style={[styles.actionButtonCard, { marginTop: 14 }]} onPress={() => router.push('/forgot-password' as any)}>
            <Text style={styles.actionButtonText}>Change Password</Text>
            <Text style={styles.actionButtonArrow}>→</Text>
          </Pressable>

          <Text style={[styles.groupLabel, { color: '#ff3e58' }]}>DANGER ZONE</Text>
          <Pressable
            style={styles.dangerZoneCard}
            onPress={() => {
              Alert.alert('Delete Account', 'Are you sure you want to delete your account?', [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Delete', 
                  style: 'destructive',
                  onPress: () => {
                    AsyncStorage.removeItem(STORAGE_KEY);
                    router.replace('/login' as any);
                  }
                },
              ]);
            }}
          >
            <Text style={styles.dangerZoneText}>Delete Account</Text>
            <Text style={styles.dangerZoneArrow}>→</Text>
          </Pressable>
        </ScrollView>
      </GradientSafeAreaView>
    );
  }

  if (currentView === 'addSchedule') {
    return (
      <GradientSafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.editHeaderRow}>
            <Pressable onPress={() => setCurrentView('profile')}>
              <Text style={styles.cancelText}>← Cancel</Text>
            </Pressable>
            <Text style={styles.editHeaderTitle}>Add Study Session</Text>
            <Pressable onPress={addSession} style={styles.saveBtn}>
              <Text style={styles.saveBtnText}>Save</Text>
            </Pressable>
          </View>

          <Text style={styles.groupLabel}>SESSION DETAILS</Text>
          <View style={styles.formGroupCard}>
            <View style={styles.inputContainerSingle}>
              <Text style={styles.inputLabel}>Session Title / Topic</Text>
              <TextInput
                style={styles.textInputPlain}
                value={newTitle}
                onChangeText={setNewTitle}
                placeholder="e.g. Biosphere Lab Quiz Review"
                placeholderTextColor="#68779a"
              />
            </View>
            <View style={styles.inputContainerSingle}>
              <Text style={styles.inputLabel}>Day (Mon, Tue, Wed, etc.)</Text>
              <TextInput
                style={styles.textInputPlain}
                value={newDay}
                onChangeText={setNewDay}
                placeholder="Mon"
                placeholderTextColor="#68779a"
              />
            </View>
            <View style={[styles.inputContainerSingle, { borderBottomWidth: 0 }]}>
              <Text style={styles.inputLabel}>Time</Text>
              <TextInput
                style={styles.textInputPlain}
                value={newTime}
                onChangeText={setNewTime}
                placeholder="10:00 AM"
                placeholderTextColor="#68779a"
              />
            </View>
          </View>
        </ScrollView>
      </GradientSafeAreaView>
    );
  }

  return (
    <GradientSafeAreaView style={styles.safeArea} edges={['top']}>
      <Animated.View style={[styles.levelUpBanner, { transform: [{ translateY: levelUpAnim }] }]}>
        <Text style={styles.levelUpText}>{levelUpText}</Text>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.heading}>
            <Image source={logo} style={styles.logo} resizeMode="contain" />
            <Text style={styles.title}>Profile</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <Pressable onPress={handleResetProgress} style={styles.resetBtn}>
              <Text style={styles.resetBtnText}>Reset Data</Text>
            </Pressable>
            <Pressable onPress={() => router.replace('/login' as any)} style={styles.logout}>
              <Text style={styles.logoutText}>Logout</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.identityRow}>
          <View style={styles.avatar}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.avatarImageFilled} resizeMode="cover" />
            ) : (
              <Text style={styles.avatarText}>
                {name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase() || 'BC'}
              </Text>
            )}
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.email}>{email}</Text>
          </View>
          <Image source={astro} style={styles.mascot} resizeMode="contain" />
        </View>

        <View style={styles.subHeaderRow}>
          <Text style={styles.scholar}>{gradeYear} Scholar</Text>
          <Pressable style={styles.editProfileBtn} onPress={openEditProfile}>
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </Pressable>
        </View>

        <View style={styles.xpCard}>
          <View style={styles.xpHeader}>
            <Text style={styles.xpTitle}>Level {String(level).padStart(2, '0')}</Text>
            <Text style={styles.xpValue}>Level {level + 1}</Text>
          </View>
          <View style={styles.xpTrack}>
            <View style={[styles.xpFill, { width: percent as any }]} />
          </View>
          <Text style={styles.xpHint}>{xp} XP</Text>
          <Text style={styles.xpNext}>{nextLevelXp} XP to next</Text>
        </View>

        <View style={styles.stats}>
          <Stat icon="🔥" value={`${streak} days`} label="Streak" />
          <Stat icon="⚡" value={String(xp)} label="Total XP" />
          <Stat icon="📚" value={String(lessons)} label="Lessons" />
          <Stat icon="🏅" value={String(level)} label="Level" />
        </View>

        <View style={styles.switcher}>
          <Pressable
            onPress={() => setSection('badges')}
            style={[styles.switch, section === 'badges' && styles.switchActive]}
          >
            <Text style={styles.switchText}>Badges</Text>
          </Pressable>
          <Pressable
            onPress={() => setSection('schedule')}
            style={[styles.switch, section === 'schedule' && styles.switchActive]}
          >
            <Text style={styles.switchText}>Schedule</Text>
          </Pressable>
        </View>

        {section === 'badges' ? (
          <Badges />
        ) : (
          <SchedulePreview
            sessions={sessions}
            onToggleCheck={toggleSessionCheck}
            onAddPress={() => setCurrentView('addSchedule')}
          />
        )}
      </ScrollView>
    </GradientSafeAreaView>
  );
}

function FormInput({
  icon,
  label,
  value,
  onChangeText,
  borderless,
}: {
  icon: string;
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  borderless?: boolean;
}) {
  return (
    <View style={[styles.inputRow, borderless && { borderBottomWidth: 0 }]}>
      <Text style={styles.inputIconSymbol}>{icon}</Text>
      <View style={styles.inputFieldCopy}>
        <Text style={styles.inputLabel}>{label}</Text>
        <TextInput
          style={styles.textInputPlain}
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor="#68779a"
        />
      </View>
    </View>
  );
}

function Badges() {
  return (
    <View>
      <Text style={styles.section}>Badges</Text>
      <View style={styles.badges}>
        {achievements?.map((achievement: AchievementType) => (
          <View
            key={achievement.id}
            style={[
              styles.badge,
              { borderColor: achievement.unlocked ? achievement.accent : '#35466e' },
            ]}
          >
            <Text style={styles.badgeIcon}>
              {achievement.unlocked ? achievement.icon : '🔒'}
            </Text>
            <Text style={styles.badgeTitle}>{achievement.title}</Text>
            <Text style={styles.badgeXp}>+{achievement.xp} XP</Text>
          </View>
        ))}
      </View>

      <Pressable
        onPress={() => router.push({ pathname: '/about-us' } as any)}
        style={styles.aboutCard}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.aboutTitle}>About Us</Text>
          <Text style={{ color: '#8ae2c5', fontSize: 11, marginTop: 2 }}>Biosphere Quest</Text>
        </View>
        <View style={styles.viewBadge}>
          <Text style={styles.viewBadgeText}>View</Text>
        </View>
      </Pressable>
    </View>
  );
}

function SchedulePreview({
  sessions,
  onToggleCheck,
  onAddPress,
}: {
  sessions: LocalSession[];
  onToggleCheck: (id: string) => void;
  onAddPress: () => void;
}) {
  return (
    <View>
      <View style={styles.scheduleHeading}>
        <Text style={styles.section}>This week</Text>
        <Text style={styles.addLink} onPress={onAddPress}>
          + Add Session
        </Text>
      </View>

      {sessions.map((session) => (
        <View key={session.id} style={[styles.session, session.done && styles.sessionDone]}>
          <View style={styles.dayCircle}>
            <Text style={styles.dayText}>{session.day.slice(0, 3)}</Text>
          </View>
          <View style={styles.sessionCopy}>
            <Text style={styles.sessionTitle}>{session.title}</Text>
            <Text style={styles.sessionMeta}>{session.time}</Text>
          </View>
          <Pressable onPress={() => onToggleCheck(session.id)}>
            <Text style={[styles.check, session.done ? { color: '#43db7d' } : { color: '#68779a' }]}>
              {session.done ? '✓' : '○'}
            </Text>
          </Pressable>
        </View>
      ))}

      <Pressable onPress={onAddPress} style={styles.openSchedule}>
        <Text style={styles.openScheduleText}>+ Add New Schedule Session</Text>
      </Pressable>
    </View>
  );
}

function Stat({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
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
  heading: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logo: { width: 44, height: 44 },
  title: { color: '#fff', fontSize: 22, fontWeight: '900' },
  logout: {
    borderColor: '#f02748',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  logoutText: { color: '#ff3e58', fontWeight: '900', fontSize: 11 },
  resetBtn: {
    borderColor: '#5269a0',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#131e38',
  },
  resetBtnText: { color: '#8ae2c5', fontWeight: '900', fontSize: 11 },
  identityRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#7564f4',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: '900' },
  avatarImageFilled: { width: '100%', height: '100%' },
  userDetails: { flex: 1, marginLeft: 10 },
  name: { color: '#fff', fontSize: 18, fontWeight: '900' },
  email: { color: '#bdc8dd', fontSize: 10, marginTop: 2 },
  mascot: { width: 68, height: 68 },
  subHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  scholar: {
    color: '#ffd05a',
    backgroundColor: '#523a13',
    borderColor: '#875b20',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 10,
    fontWeight: '800',
  },
  editProfileBtn: {
    borderColor: '#4d5d80',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  editProfileText: { color: '#ffffff', fontSize: 11, fontWeight: '800' },
  xpCard: {
    backgroundColor: '#202866',
    borderColor: '#625cff',
    borderWidth: 1,
    borderRadius: 12,
    padding: 9,
    marginTop: 14,
  },
  xpHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  xpTitle: { color: '#fff', fontSize: 10, fontWeight: '900' },
  xpValue: { color: '#e875f0', fontSize: 10, fontWeight: '900' },
  xpTrack: { backgroundColor: '#090d18', height: 8, borderRadius: 6, marginTop: 7 },
  xpFill: { height: '100%', backgroundColor: '#e36ee9', borderRadius: 6 },
  xpHint: { color: '#fff', fontSize: 10, marginTop: 3 },
  xpNext: { color: '#ccd3e4', fontSize: 10, textAlign: 'right', marginTop: -12 },
  stats: { flexDirection: 'row', gap: 7, marginTop: 10 },
  stat: {
    flex: 1,
    backgroundColor: '#172849',
    borderColor: '#4568cf',
    borderWidth: 1,
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
  },
  statIcon: { fontSize: 20 },
  statValue: { color: '#e875f0', fontSize: 15, fontWeight: '900' },
  statLabel: { color: '#fff', fontSize: 9, fontWeight: '800' },
  switcher: {
    flexDirection: 'row',
    backgroundColor: '#172849',
    borderColor: '#625cff',
    borderWidth: 1,
    borderRadius: 12,
    padding: 2,
    marginTop: 18,
  },
  switch: { flex: 1, alignItems: 'center', paddingVertical: 7, borderRadius: 10 },
  switchActive: { backgroundColor: '#625cff' },
  switchText: { color: '#fff', fontWeight: '900', fontSize: 13 },
  section: { color: '#fff', fontSize: 17, fontWeight: '900', marginTop: 18, marginBottom: 9 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: {
    width: '31.8%',
    minHeight: 105,
    backgroundColor: '#172849',
    borderWidth: 1,
    borderRadius: 11,
    padding: 8,
    alignItems: 'center',
  },
  badgeIcon: { fontSize: 25 },
  badgeTitle: { color: '#fff', fontSize: 10, fontWeight: '900', textAlign: 'center', marginTop: 3 },
  badgeXp: { color: '#f3c84f', fontSize: 9, marginTop: 4 },
  scheduleHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  addLink: { color: '#ad80ff', fontSize: 11, fontWeight: '900' },
  session: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#253d78',
    borderColor: '#5665dc',
    borderWidth: 1,
    borderRadius: 12,
    padding: 8,
    marginTop: 8,
  },
  sessionDone: { backgroundColor: '#205d51', borderColor: '#46d483' },
  dayCircle: {
    width: 38,
    height: 38,
    borderRadius: 20,
    backgroundColor: '#595bd6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: { color: '#fff', fontSize: 11, fontWeight: '900' },
  sessionCopy: { flex: 1, marginLeft: 9 },
  sessionTitle: { color: '#fff', fontWeight: '900', fontSize: 12 },
  sessionMeta: { color: '#d5def0', fontSize: 10, marginTop: 3 },
  check: { fontSize: 27, fontWeight: '900', paddingHorizontal: 6 },
  openSchedule: {
    backgroundColor: '#625cff',
    borderRadius: 9,
    alignItems: 'center',
    padding: 10,
    marginTop: 12,
  },
  openScheduleText: { color: '#fff', fontWeight: '900' },
  aboutCard: {
    backgroundColor: '#0f4838',
    borderColor: '#1f9f79',
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aboutTitle: { color: '#ffffff', fontSize: 20, fontWeight: '900' },
  viewBadge: {
    backgroundColor: '#1b8061',
    borderColor: '#2ee6a8',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 5,
  },
  viewBadgeText: { color: '#ffffff', fontSize: 12, fontWeight: '900' },
  editHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 4,
  },
  cancelText: { color: '#f091f8', fontSize: 15, fontWeight: '900' },
  editHeaderTitle: { color: '#ffffff', fontSize: 22, fontWeight: '900', letterSpacing: 0.5 },
  saveBtn: { backgroundColor: '#a638ff', paddingHorizontal: 20, paddingVertical: 7, borderRadius: 20 },
  saveBtnText: { color: '#ffffff', fontWeight: '900', fontSize: 13 },
  editAvatarContainer: { alignItems: 'center', marginBottom: 18, marginTop: 10 },
  avatarWrapper: { position: 'relative', width: 92, height: 92, alignItems: 'center', justifyContent: 'center' },
  avatarLarge: {
    width: 92,
    height: 92,
    borderRadius: 22,
    backgroundColor: '#7564f4',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#a664f4',
  },
  avatarLargeText: { color: '#fff', fontSize: 36, fontWeight: '900' },
  cameraBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#3b2066',
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#091426',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    zIndex: 20,
    overflow: 'hidden',
  },
  changePhotoText: { color: '#ffffff', fontSize: 12, fontWeight: '800', marginTop: 10 },
  groupLabel: {
    color: '#8a9bbd',
    fontSize: 10,
    fontWeight: '900',
    marginTop: 12,
    marginBottom: 5,
    letterSpacing: 0.8,
  },
  formGroupCard: {
    backgroundColor: '#131e38',
    borderColor: '#374b7c',
    borderWidth: 1.5,
    borderRadius: 16,
    overflow: 'hidden',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#20325c',
  },
  inputIconSymbol: { fontSize: 16, marginRight: 12 },
  inputFieldCopy: { flex: 1 },
  inputLabel: {
    color: '#7a8fb8',
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textInputPlain: { color: '#ffffff', fontSize: 13, fontWeight: '900', paddingVertical: 1 },
  inputContainerSingle: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#20325c',
  },
  textArea: { color: '#ffffff', fontSize: 13, fontWeight: '900', height: 48, textAlignVertical: 'top', marginTop: 2 },
  charCounter: { color: '#68779a', fontSize: 9, fontWeight: '800', textAlign: 'right', marginTop: -4, marginBottom: 2 },
  actionButtonCard: {
    backgroundColor: '#202c52',
    borderColor: '#4d6199',
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '900' },
  actionButtonArrow: { color: '#ffffff', fontSize: 16, fontWeight: '900' },
  dangerZoneCard: {
    backgroundColor: '#381622',
    borderColor: '#a32b3d',
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dangerZoneText: { color: '#ff3e58', fontSize: 14, fontWeight: '900' },
  dangerZoneArrow: { color: '#ff3e58', fontSize: 16, fontWeight: '900' },
});