import { GradientSafeAreaView } from "@/components/gradient-safe-area";
import { normalizeXpValue, useProgress } from "@/hooks/use-progress";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  UIManager,
  View,
  useWindowDimensions,
} from "react-native";
import { supabase } from "../lib/supabase";

type Section = "badges" | "schedule";
type ViewMode = "profile" | "editProfile" | "addSchedule";

interface LocalSession {
  id: string;
  day: string;
  title: string;
  time: string;
  duration: string;
  category: string;
  description: string;
  reminder: string;
  done: boolean;
}

const STORAGE_KEY = "@biosphere_profile_data_v1";
const COMPLETED_LESSONS_KEY = "@biosphere_completed_lessons_v1";

export default function ProfileScreen(): React.JSX.Element {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (
    Platform.OS === "android" &&
    UIManager.setLayoutAnimationEnabledExperimental
  ) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  const logo = require("../../assets/BiosphereQuestAssets/Biosphere Quest Logo.png");

  const progress = useProgress();
  const [currentView, setCurrentView] = useState<ViewMode>("profile");
  const [section, setSection] = useState<Section>("badges");

  const levelUpAnim = useRef(new Animated.Value(-120)).current;
  const [showLevelUp, setShowLevelUp] = useState<boolean>(false);
  const [levelUpText, setLevelUpText] = useState<string>("");
  const [prevLevel, setPrevLevel] = useState<number | null>(null);

  const editProfileScale = useRef(new Animated.Value(1)).current;
  const saveProfileScale = useRef(new Animated.Value(1)).current;
  const addScheduleScale = useRef(new Animated.Value(1)).current;
  const viewTransitionAnim = useRef(new Animated.Value(1)).current;

  const tabSlideAnim = useRef(new Animated.Value(0)).current;
  const tabOpacityAnim = useRef(new Animated.Value(1)).current;

  const addFormAnim = useRef(new Animated.Value(40)).current;
  const addFormOpacity = useRef(new Animated.Value(0)).current;

  const [streak, setStreak] = useState(0);
  const [lessons, setLessons] = useState(0);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(0);
  const [nextLevelXp, setNextLevelXp] = useState(100);
  const [lastResetDate, setLastResetDate] = useState(Date.now());
  const [cloudBadges, setCloudBadges] = useState<Record<string, string>>({});

  const [name, setName] = useState("");
  const [gradeYear, setGradeYear] = useState("");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("Ready to learn Science and Math!");
  const [school, setSchool] = useState("");
  const [website, setWebsite] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const [tempName, setTempName] = useState(name);
  const [tempUsername, setTempUsername] = useState(username);
  const [tempEmail, setTempEmail] = useState(email);
  const [tempPhone, setTempPhone] = useState(phone);
  const [tempBio, setTempBio] = useState(bio);
  const [tempSchool, setTempSchool] = useState(school);
  const [tempGradeYear, setTempGradeYear] = useState(gradeYear);
  const [tempWebsite, setTempWebsite] = useState(website);
  const [tempProfileImage, setTempProfileImage] = useState(profileImage);

  const rawSessions: Array<{ id: string | number; [key: string]: any }> = ((
    progress as any
  )?.sessions ?? [
    {
      id: "1",
      day: "Mon",
      title: "Ecology Basics",
      time: "10:00 AM",
      duration: "45 mins",
      done: false,
    },
    {
      id: "2",
      day: "Wed",
      title: "Ecosystems & Biomes",
      time: "12:00 PM",
      duration: "1 hr",
      done: false,
    },
  ]) as Array<{ id: string | number; [key: string]: any }>;

  const [sessions, setSessions] = useState<LocalSession[]>(
    rawSessions.map((s) => ({
      id: String(s.id),
      day: String(s.day || "Mon"),
      title: String(s.title || ""),
      time: String(s.time || ""),
      duration: String(s.duration || "30 mins"),
      category: String(s.category || "Science"),
      description: String(s.description || ""),
      reminder: String(s.reminder || "10 mins before"),
      done: Boolean(s.done),
    })),
  );

  const [newTitle, setNewTitle] = useState("");
  const [newDay, setNewDay] = useState("Mon");
  const [newTime, setNewTime] = useState("9:00 AM");
  const [newHours, setNewHours] = useState("");
  const [newMinutes, setNewMinutes] = useState("30");
  const [newCategory, setNewCategory] = useState("Science");
  const [newDescription, setNewDescription] = useState("");
  const [newReminder, setNewReminder] = useState("10 mins before");

  // --- FULL CLOUD BACKUP & RESTORE FOR REGISTERED USERS ---
  const syncFullProfileToCloud = async (): Promise<void> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const savedProfileRaw = await AsyncStorage.getItem(STORAGE_KEY);
      const completedLessonsRaw = await AsyncStorage.getItem(
        COMPLETED_LESSONS_KEY,
      );

      const localProfile = savedProfileRaw ? JSON.parse(savedProfileRaw) : {};
      const localCompleted: string[] = completedLessonsRaw
        ? JSON.parse(completedLessonsRaw)
        : [];
      const localBadges = progress.badgeUnlockDates || {};

      // Fetch existing cloud row so we merge local + cloud safely
      const { data: cloudRow } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      const localXpVal = normalizeXpValue(localProfile.xp ?? xp);
      const mergedXp = Math.max(localXpVal, cloudRow?.total_xp || 0);
      const mergedLevel = Math.floor(mergedXp / 100) + 1;
      const mergedNextLevelXp = mergedLevel * 100;

      const mergedStudyMinutes = Math.max(
        localProfile.studyMinutes || 0,
        cloudRow?.study_minutes || 0,
      );
      const mergedStreak = Math.max(
        localProfile.streak ?? streak,
        cloudRow?.streak || 0,
      );

      const cloudLessons: string[] = Array.isArray(cloudRow?.completed_lessons)
        ? cloudRow.completed_lessons
        : [];
      const mergedCompletedLessons = Array.from(
        new Set([...cloudLessons, ...localCompleted]),
      );

      const mergedLessonsCount = Math.max(
        localProfile.lessons ?? lessons,
        cloudRow?.lessons_count || 0,
        mergedCompletedLessons.length,
      );

      const mergedBadges: Record<string, string> = {
        ...(cloudRow?.badges || {}),
        ...localBadges,
      };
      setCloudBadges(mergedBadges);

      const cloudDetails = cloudRow?.profile_data || {};
      const mergedBio =
        localProfile.bio ||
        cloudDetails.bio ||
        "Ready to learn Science and Math!";
      const mergedSchool = localProfile.school || cloudDetails.school || "";
      const mergedPhone = localProfile.phone || cloudDetails.phone || "";
      const mergedWebsite = localProfile.website || cloudDetails.website || "";
      const mergedSessions =
        Array.isArray(localProfile.sessions) && localProfile.sessions.length > 0
          ? localProfile.sessions
          : Array.isArray(cloudDetails.sessions) &&
              cloudDetails.sessions.length > 0
            ? cloudDetails.sessions
            : sessions;

      const resolvedName =
        localProfile.name ||
        user.user_metadata?.full_name ||
        cloudRow?.full_name ||
        "Explorer";
      const resolvedUsername =
        localProfile.username ||
        user.user_metadata?.username ||
        cloudRow?.username ||
        resolvedName;
      const resolvedGradeYear =
        localProfile.gradeYear || cloudRow?.grade_year || "Grade 1";

      // Update local state & AsyncStorage if cloud had higher/restored values
      setName(resolvedName);
      setUsername(resolvedUsername);
      setGradeYear(resolvedGradeYear);
      setXp(mergedXp);
      setLevel(mergedLevel);
      setNextLevelXp(mergedNextLevelXp);
      setStreak(mergedStreak);
      setLessons(mergedLessonsCount);
      setBio(mergedBio);
      setSchool(mergedSchool);
      setPhone(mergedPhone);
      setWebsite(mergedWebsite);
      setSessions(mergedSessions);

      const updatedLocalProfile = {
        ...localProfile,
        name: resolvedName,
        username: resolvedUsername,
        email: user.email || localProfile.email || "",
        gradeYear: resolvedGradeYear,
        xp: mergedXp,
        level: mergedLevel,
        nextLevelXp: mergedNextLevelXp,
        streak: mergedStreak,
        lessons: mergedLessonsCount,
        studyMinutes: mergedStudyMinutes,
        bio: mergedBio,
        school: mergedSchool,
        phone: mergedPhone,
        website: mergedWebsite,
        sessions: mergedSessions,
      };

      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedLocalProfile),
      );
      if (mergedCompletedLessons.length > 0) {
        await AsyncStorage.setItem(
          COMPLETED_LESSONS_KEY,
          JSON.stringify(mergedCompletedLessons),
        );
      }

      // Push merged snapshot up to Supabase
      await supabase.from("profiles").upsert({
        id: user.id,
        full_name: resolvedUsername || resolvedName,
        username: resolvedUsername,
        grade_year: resolvedGradeYear,
        total_xp: mergedXp,
        weekly_xp:
          cloudRow && (cloudRow.total_xp > 0 || cloudRow.weekly_xp > 0)
            ? cloudRow.weekly_xp
            : mergedXp,
        streak: mergedStreak,
        lessons_count: mergedLessonsCount,
        study_minutes: mergedStudyMinutes,
        completed_lessons: mergedCompletedLessons,
        badges: mergedBadges,
        profile_data: {
          bio: mergedBio,
          school: mergedSchool,
          phone: mergedPhone,
          website: mergedWebsite,
          sessions: mergedSessions,
          profileImage: localProfile.profileImage ?? profileImage,
        },
        is_bot: false,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Failed to sync full profile to Supabase:", err);
    }
  };

  const checkAuthStatus = async (): Promise<void> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setIsLoggedIn(true);
        const activeEmail = user.email || "";
        setEmail(activeEmail);
        setTempEmail(activeEmail);

        const savedData = await AsyncStorage.getItem(STORAGE_KEY);
        const parsed = savedData ? JSON.parse(savedData) : {};

        if (
          user.user_metadata?.full_name &&
          (!parsed.name || parsed.name === "Explorer")
        ) {
          parsed.name = user.user_metadata.full_name;
          setName(user.user_metadata.full_name);
        }
        if (
          user.user_metadata?.username &&
          (!parsed.username || parsed.username === "Explorer")
        ) {
          parsed.username = user.user_metadata.username;
          setUsername(user.user_metadata.username);
        }

        parsed.email = activeEmail;
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));

        // Sync all lessons, badges, XP, study time, and profile info with Supabase
        await syncFullProfileToCloud();
      } else {
        setIsLoggedIn(false);
        setEmail("");
        setTempEmail("");
      }
    } catch (e) {
      console.error("Auth check error in profile", e);
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
    void checkAuthStatus();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setIsLoggedIn(true);
        const sessionEmail = session.user.email || "";
        setEmail(sessionEmail);
        setTempEmail(sessionEmail);
        void syncFullProfileToCloud();
      } else {
        setIsLoggedIn(false);
        setEmail("");
        setTempEmail("");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadSavedData().then(() => checkAuthStatus());
    }, []),
  );

  const animateViewChange = (nextView: ViewMode): void => {
    if (nextView === "addSchedule") {
      addFormAnim.setValue(40);
      addFormOpacity.setValue(0);
      Animated.parallel([
        Animated.spring(addFormAnim, {
          toValue: 0,
          tension: 70,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(addFormOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }

    Animated.sequence([
      Animated.timing(viewTransitionAnim, {
        toValue: 0.94,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(viewTransitionAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    setCurrentView(nextView);
  };

  const handleTabSwitch = (newSection: Section): void => {
    if (newSection === section) return;

    const slideDirection = newSection === "schedule" ? 30 : -30;
    tabSlideAnim.setValue(slideDirection);
    tabOpacityAnim.setValue(0);

    setSection(newSection);

    Animated.parallel([
      Animated.spring(tabSlideAnim, {
        toValue: 0,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(tabOpacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const triggerLevelUpAnimation = (oldLvl: number, newLvl: number): void => {
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

  const persistData = async (updatedFields: object): Promise<void> => {
    try {
      const savedRaw = await AsyncStorage.getItem(STORAGE_KEY);
      const existing = savedRaw ? JSON.parse(savedRaw) : {};

      const currentData = {
        ...existing,
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
        nextLevelXp,
        lastResetDate,
        lastActiveDate: new Date().toDateString(),
        ...updatedFields,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(currentData));
    } catch (e) {
      console.error("Failed to save profile data", e);
    }
  };

  const loadSavedData = async (): Promise<void> => {
    try {
      const savedData = await AsyncStorage.getItem(STORAGE_KEY);
      let parsed = savedData ? JSON.parse(savedData) : {};

      const guestName = await AsyncStorage.getItem("explorerName");
      const guestUsername = await AsyncStorage.getItem("explorerUsername");
      const guestGrade = await AsyncStorage.getItem("explorerGrade");

      if (parsed.name) {
        setName(parsed.name);
      } else if (guestName) {
        setName(guestName);
      } else {
        setName("Explorer");
      }

      if (parsed.username) {
        setUsername(parsed.username);
      } else if (guestUsername) {
        setUsername(guestUsername);
      } else {
        setUsername("Explorer");
      }

      if (parsed.gradeYear) {
        setGradeYear(parsed.gradeYear);
      } else if (guestGrade) {
        setGradeYear(`Grade ${guestGrade}`);
      } else {
        setGradeYear("Grade 1");
      }

      // NOTE: 30-day wipe removed so Total XP, Badges, Level, and Courses never reset!
      if (parsed.email) {
        setEmail(parsed.email);
        setTempEmail(parsed.email);
      }
      if (parsed.phone) setPhone(parsed.phone);
      if (parsed.bio) setBio(parsed.bio);
      if (parsed.school) setSchool(parsed.school);
      if (parsed.website) setWebsite(parsed.website);
      if (parsed.profileImage !== undefined)
        setProfileImage(parsed.profileImage);
      if (parsed.sessions) setSessions(parsed.sessions);

      if (parsed.streak !== undefined) setStreak(parsed.streak);
      if (parsed.lessons !== undefined) setLessons(parsed.lessons);

      const restoredXp = normalizeXpValue(parsed.xp ?? 0);
      setXp(restoredXp);

      if (Number.isFinite(parsed.nextLevelXp)) {
        setNextLevelXp(parsed.nextLevelXp);
      } else {
        setNextLevelXp((Math.floor(restoredXp / 100) + 1) * 100);
      }

      if (parsed.lastResetDate) setLastResetDate(parsed.lastResetDate);

      const newLvl = Number.isFinite(parsed.level)
        ? parsed.level
        : Math.floor(restoredXp / 100) + 1;

      if (prevLevel !== null && newLvl > prevLevel) {
        triggerLevelUpAnimation(prevLevel, newLvl);
      }
      setLevel(newLvl);
      setPrevLevel(newLvl);
    } catch (e) {
      console.error("Failed to load profile data", e);
    }
  };

  useEffect(() => {
    void loadSavedData();
  }, []);

  const handleEditProfilePress = async (): Promise<void> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const activeEmail = user?.email || email;

    Animated.sequence([
      Animated.spring(editProfileScale, {
        toValue: 0.9,
        useNativeDriver: true,
      }),
      Animated.spring(editProfileScale, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTempName(name);
      setTempUsername(username);
      setTempEmail(activeEmail);
      setTempPhone(phone);
      setTempBio(bio);
      setTempSchool(school);
      setTempGradeYear(gradeYear);
      setTempWebsite(website);
      setTempProfileImage(profileImage);
      animateViewChange("editProfile");
    });
  };

  const saveProfile = (): void => {
    Animated.sequence([
      Animated.spring(saveProfileScale, {
        toValue: 0.88,
        useNativeDriver: true,
      }),
      Animated.spring(saveProfileScale, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start(async () => {
      if (!tempName.trim()) {
        Alert.alert(
          "Incomplete Form",
          "Please enter your Full Name before saving.",
        );
        return;
      }

      const updatedName = tempName.trim();
      const updatedUsername = tempUsername.trim() || updatedName;

      setName(updatedName);
      setUsername(updatedUsername);
      setEmail(tempEmail);
      setPhone(tempPhone);
      setBio(tempBio);
      setSchool(tempSchool);
      setGradeYear(tempGradeYear);
      setWebsite(tempWebsite);
      setProfileImage(tempProfileImage);
      animateViewChange("profile");

      await persistData({
        name: updatedName,
        username: updatedUsername,
        email: tempEmail,
        phone: tempPhone,
        bio: tempBio,
        school: tempSchool,
        gradeYear: tempGradeYear,
        website: tempWebsite,
        profileImage: tempProfileImage,
      });

      await AsyncStorage.setItem("explorerName", updatedName);
      await AsyncStorage.setItem("explorerUsername", updatedUsername);

      const gradeMatch = tempGradeYear.match(/\d+/);
      if (gradeMatch) {
        await AsyncStorage.setItem("explorerGrade", gradeMatch[0]);
      }

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          await supabase.auth.updateUser({
            data: {
              full_name: updatedName,
              username: updatedUsername,
            },
          });
        }
        await syncFullProfileToCloud();
      } catch (e) {
        console.error("Supabase user sync error:", e);
      }
    });
  };

  const pickImage = async (): Promise<void> => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission to access camera roll is required!");
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

  const completeAndDeleteSession = (id: string): void => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const updatedSessions = sessions.filter((s) => s.id !== id);
    setSessions(updatedSessions);

    const newLessons = lessons + 1;
    const newXp = xp + 25;
    setLessons(newLessons);
    setXp(newXp);
    progress.addXp(25);
    void persistData({
      sessions: updatedSessions,
      lessons: newLessons,
      xp: newXp,
    });

    // Sync +25 XP to the weekly leaderboard and update cloud profile
    void (async () => {
      try {
        await supabase.rpc("sync_user_xp", {
          p_name: username || name || "Explorer",
          p_total_xp: xp,
          p_earned_xp: 25,
        });
        await syncFullProfileToCloud();
      } catch (e) {
        console.error("Failed to sync session XP to Supabase:", e);
      }
    })();
  };

  const addSession = (): void => {
    Animated.sequence([
      Animated.spring(addScheduleScale, {
        toValue: 0.92,
        useNativeDriver: true,
      }),
      Animated.spring(addScheduleScale, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start(async () => {
      if (!newTitle.trim()) {
        Alert.alert("Incomplete Form", "Please enter a session title/topic.");
        return;
      }

      let durationStr = "";
      const hrs = parseInt(newHours, 10);
      const mins = parseInt(newMinutes, 10);
      if (!isNaN(hrs) && hrs > 0)
        durationStr += `${hrs} hr${hrs > 1 ? "s" : ""} `;
      if (!isNaN(mins) && mins > 0) durationStr += `${mins} mins`;
      if (!durationStr.trim()) durationStr = "30 mins";

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      const newSessionItem: LocalSession = {
        id: Date.now().toString(),
        day: newDay.trim() || "Mon",
        title: newTitle.trim(),
        time: newTime.trim() || "9:00 AM",
        duration: durationStr.trim(),
        category: newCategory.trim() || "Science",
        description: newDescription.trim(),
        reminder: newReminder.trim() || "10 mins before",
        done: false,
      };

      const updatedSessions = [...sessions, newSessionItem];
      setSessions(updatedSessions);
      setNewTitle("");
      setNewHours("");
      setNewMinutes("30");
      setNewDescription("");
      animateViewChange("profile");
      setSection("schedule");
      await persistData({ sessions: updatedSessions });
      await syncFullProfileToCloud();
    });
  };

  const percent = `${Math.min(100, Math.round((xp / nextLevelXp) * 100))}%`;

  if (currentView === "editProfile") {
    return (
      <GradientSafeAreaView style={styles.safeArea} edges={["top"]}>
        <Animated.View
          style={{ flex: 1, transform: [{ scale: viewTransitionAnim }] }}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.editHeaderRow}>
              <Pressable onPress={() => animateViewChange("profile")}>
                <Text style={styles.cancelText}> Cancel</Text>
              </Pressable>
              <Text style={styles.editHeaderTitle}>Edit Profile</Text>
              <Animated.View
                style={{ transform: [{ scale: saveProfileScale }] }}
              >
                <Pressable onPress={saveProfile} style={styles.saveBtn}>
                  <Text style={styles.saveBtnText}>Save</Text>
                </Pressable>
              </Animated.View>
            </View>

            <View style={styles.editAvatarContainer}>
              <Pressable onPress={pickImage} style={styles.avatarWrapper}>
                <View style={styles.avatarLarge}>
                  {tempProfileImage ? (
                    <Image
                      source={{ uri: tempProfileImage }}
                      style={styles.avatarImageFilled}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text style={styles.avatarLargeText}>
                      {tempName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase() || "EX"}
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
              <FormInput
                icon="👤"
                label="Full Name"
                value={tempName}
                onChangeText={setTempName}
              />
              <FormInput
                icon="@"
                label="Username"
                value={tempUsername}
                onChangeText={setTempUsername}
              />
              <FormInput
                icon="✉"
                label="Email"
                value={tempEmail || email || "No email connected"}
                editable={false}
              />
              <FormInput
                icon="📞"
                label="Phone"
                value={tempPhone}
                onChangeText={setTempPhone}
                borderless
              />
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
              <FormInput
                icon="🏫"
                label="School"
                value={tempSchool}
                onChangeText={setTempSchool}
              />
              <FormInput
                icon="🎓"
                label="Grade / Year"
                value={tempGradeYear}
                onChangeText={setTempGradeYear}
                borderless
              />
            </View>

            <Text style={styles.groupLabel}>LINKS</Text>
            <View style={styles.formGroupCard}>
              <FormInput
                icon="🌐"
                label="Website"
                value={tempWebsite}
                onChangeText={setTempWebsite}
                borderless
              />
            </View>
          </ScrollView>
        </Animated.View>
      </GradientSafeAreaView>
    );
  }

  if (currentView === "addSchedule") {
    return (
      <GradientSafeAreaView style={styles.safeArea} edges={["top"]}>
        <Animated.View
          style={{
            flex: 1,
            transform: [{ translateY: addFormAnim }],
            opacity: addFormOpacity,
          }}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.editHeaderRow}>
              <Pressable onPress={() => animateViewChange("profile")}>
                <Text style={styles.cancelText}> Cancel</Text>
              </Pressable>
              <View style={styles.addHeaderTitleRow}>
                <View style={styles.miniCalendarBadge}>
                  <Text style={styles.miniCalendarMonth}>JUL</Text>
                  <Text style={styles.miniCalendarDay}>17</Text>
                </View>
                <Text style={styles.editHeaderTitle}>Add Study Session</Text>
              </View>
              <Animated.View
                style={{ transform: [{ scale: addScheduleScale }] }}
              >
                <Pressable onPress={addSession} style={styles.saveBtn}>
                  <Text style={styles.saveBtnText}>Save</Text>
                </Pressable>
              </Animated.View>
            </View>

            <Text style={styles.groupLabel}>CORE INFORMATION</Text>
            <View style={styles.formGroupCard}>
              <View style={styles.inputContainerUniform}>
                <Text style={styles.inputLabel}>Session Title / Topic *</Text>
                <TextInput
                  style={styles.textInputPlain}
                  value={newTitle}
                  onChangeText={setNewTitle}
                  placeholder="e.g. Biosphere Lab Quiz Review"
                  placeholderTextColor="#68779a"
                />
              </View>
              <View style={styles.inputContainerUniform}>
                <Text style={styles.inputLabel}>Category / Subject</Text>
                <View style={styles.chipRow}>
                  {["Science", "Math", "Ecology", "Biology", "General"].map(
                    (cat) => (
                      <Pressable
                        key={cat}
                        onPress={() => setNewCategory(cat)}
                        style={[
                          styles.categoryChip,
                          newCategory === cat && styles.categoryChipActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.categoryChipText,
                            newCategory === cat &&
                              styles.categoryChipTextActive,
                          ]}
                        >
                          {cat}
                        </Text>
                      </Pressable>
                    ),
                  )}
                </View>
              </View>
            </View>

            <Text style={styles.groupLabel}>TIMING & SCHEDULE</Text>
            <View style={styles.formGroupCard}>
              <View style={styles.inputContainerUniform}>
                <Text style={styles.inputLabel}>Day of the Week</Text>
                <TextInput
                  style={styles.textInputPlain}
                  value={newDay}
                  onChangeText={setNewDay}
                  placeholder="Monday"
                  placeholderTextColor="#68779a"
                />
              </View>
              <View style={styles.inputContainerUniform}>
                <Text style={styles.inputLabel}>Start Time</Text>
                <TextInput
                  style={styles.textInputPlain}
                  value={newTime}
                  onChangeText={setNewTime}
                  placeholder="10:00 AM"
                  placeholderTextColor="#68779a"
                />
              </View>
              <View style={styles.inputContainerUniformRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Duration (Hours)</Text>
                  <TextInput
                    style={styles.textInputPlain}
                    value={newHours}
                    onChangeText={setNewHours}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#68779a"
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.inputLabel}>Duration (Minutes)</Text>
                  <TextInput
                    style={styles.textInputPlain}
                    value={newMinutes}
                    onChangeText={setNewMinutes}
                    keyboardType="numeric"
                    placeholder="30"
                    placeholderTextColor="#68779a"
                  />
                </View>
              </View>
            </View>

            <Text style={styles.groupLabel}>ADDITIONAL DETAILS</Text>
            <View style={styles.formGroupCard}>
              <View style={styles.inputContainerUniform}>
                <Text style={styles.inputLabel}>Description / Notes</Text>
                <TextInput
                  style={[
                    styles.textInputPlain,
                    { height: 60, textAlignVertical: "top", marginTop: 4 },
                  ]}
                  value={newDescription}
                  onChangeText={setNewDescription}
                  multiline
                  placeholder="Add specific goals, chapters, or items to bring..."
                  placeholderTextColor="#68779a"
                />
              </View>
              <View style={styles.inputContainerUniform}>
                <Text style={styles.inputLabel}>Reminder Notification</Text>
                <View style={styles.chipRow}>
                  {[
                    "None",
                    "5 mins before",
                    "10 mins before",
                    "30 mins before",
                  ].map((rem) => (
                    <Pressable
                      key={rem}
                      onPress={() => setNewReminder(rem)}
                      style={[
                        styles.categoryChip,
                        newReminder === rem && styles.categoryChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.categoryChipText,
                          newReminder === rem && styles.categoryChipTextActive,
                        ]}
                      >
                        {rem}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          </ScrollView>
        </Animated.View>
      </GradientSafeAreaView>
    );
  }

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

      <Animated.View
        style={{ flex: 1, transform: [{ scale: viewTransitionAnim }] }}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.heading}>
              <Image source={logo} style={styles.logo} resizeMode="contain" />
              <Text style={styles.title}>Profile</Text>
            </View>
            <View style={{ flexDirection: "row", gap: 6 }}>
              {!isLoggedIn && (
                <Pressable
                  onPress={() => router.push("/login" as any)}
                  style={styles.loginBtn}
                >
                  <Text style={styles.loginBtnText}>Login</Text>
                </Pressable>
              )}
              <Pressable
                onPress={() => router.push("/settings" as any)}
                style={styles.settingsBtn}
              >
                <Text style={styles.settingsBtnText}>⚙️ Settings</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.identityRow}>
            <View style={styles.avatar}>
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  style={styles.avatarImageFilled}
                  resizeMode="cover"
                />
              ) : (
                <Text style={styles.avatarText}>
                  {name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase() || "EX"}
                </Text>
              )}
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.name}>{username || name || "Explorer"}</Text>
              <Text
                style={{ color: "#8a9bbd", fontSize: 12, fontWeight: "600" }}
              >
                {name}
              </Text>
              {email ? <Text style={styles.email}>{email}</Text> : null}
            </View>
          </View>

          <View style={styles.subHeaderRow}>
            <Text style={styles.scholar}>{gradeYear} Scholar</Text>
            <Animated.View style={{ transform: [{ scale: editProfileScale }] }}>
              <Pressable
                style={styles.editProfileBtn}
                onPress={handleEditProfilePress}
              >
                <Text style={styles.editProfileText}>Edit Profile</Text>
              </Pressable>
            </Animated.View>
          </View>

          <View style={styles.xpCard}>
            <View style={styles.xpHeader}>
              <Text style={styles.xpTitle}>
                Level {String(level).padStart(2, "0")}
              </Text>
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
              onPress={() => handleTabSwitch("badges")}
              style={[
                styles.switch,
                section === "badges" && styles.switchActive,
              ]}
            >
              <Text
                style={[
                  styles.switchText,
                  section === "badges" && styles.switchTextActive,
                ]}
              >
                🏅 Badges
              </Text>
            </Pressable>
            <Pressable
              onPress={() => handleTabSwitch("schedule")}
              style={[
                styles.switch,
                section === "schedule" && styles.switchActive,
              ]}
            >
              <Text
                style={[
                  styles.switchText,
                  section === "schedule" && styles.switchTextActive,
                ]}
              >
                📅 Schedule
              </Text>
            </Pressable>
          </View>

          <Animated.View
            style={{
              transform: [{ translateX: tabSlideAnim }],
              opacity: tabOpacityAnim,
            }}
          >
            {section === "badges" ? (
              <Badges cloudBadges={cloudBadges} currentTotalXp={xp} />
            ) : (
              <SchedulePreview
                sessions={sessions}
                onCompleteDelete={completeAndDeleteSession}
                onAddPress={() => animateViewChange("addSchedule")}
              />
            )}
          </Animated.View>
        </ScrollView>
      </Animated.View>
    </GradientSafeAreaView>
  );
}

function FormInput({
  icon,
  label,
  value,
  onChangeText,
  borderless,
  editable = true,
}: {
  icon: string;
  label: string;
  value: string;
  onChangeText?: (v: string) => void;
  borderless?: boolean;
  editable?: boolean;
}): React.JSX.Element {
  return (
    <View style={[styles.inputRow, borderless && { borderBottomWidth: 0 }]}>
      <Text style={styles.inputIconSymbol}>{icon}</Text>
      <View style={styles.inputFieldCopy}>
        <Text style={styles.inputLabel}>
          {label} {!editable ? " " : ""}
        </Text>
        <TextInput
          style={[styles.textInputPlain, !editable && { color: "#7a8fb8" }]}
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          placeholderTextColor="#68779a"
        />
      </View>
    </View>
  );
}

function Badges({
  cloudBadges,
  currentTotalXp,
}: {
  cloudBadges?: Record<string, string>;
  currentTotalXp: number;
}): React.JSX.Element {
  const { width } = useWindowDimensions();
  const badgeWidth = Math.floor((width - 48) / 3);
  const progress = useProgress();

  const [selectedBadge, setSelectedBadge] = useState<any>(null);
  const badgeModalAnim = useRef(new Animated.Value(0)).current;

  const getUnlockDate = (id: string, xpThreshold?: number) => {
    const savedDate = progress.badgeUnlockDates?.[id] || cloudBadges?.[id];
    if (savedDate) return savedDate;
    if (xpThreshold && currentTotalXp >= xpThreshold) {
      return new Date().toISOString();
    }
    return undefined;
  };

  const dynamicAchievements = [
    {
      id: "first_steps",
      title: "First Steps",
      icon: "🌱",
      accent: "#4ade80",
      description: "Reach a total of 150 XP.",
      unlocked: !!getUnlockDate("first_steps", 150),
      date: getUnlockDate("first_steps", 150),
    },
    {
      id: "cadet",
      title: "Cadet Scholar",
      icon: "🎓",
      accent: "#60a5fa",
      description: "Reach a total of 500 XP.",
      unlocked: !!getUnlockDate("cadet", 500),
      date: getUnlockDate("cadet", 500),
    },
    {
      id: "streak",
      title: "Streak Master",
      icon: "🔥",
      accent: "#f97316",
      description: "Complete at least 1 lesson or game for 3 consecutive days.",
      unlocked: !!getUnlockDate("streak"),
      date: getUnlockDate("streak"),
    },
    {
      id: "time",
      title: "Time Explorer",
      icon: "⏱️",
      accent: "#a78bfa",
      description: "Reach a total of 1 hour of learning time.",
      unlocked: !!getUnlockDate("time"),
      date: getUnlockDate("time"),
    },
    {
      id: "daily",
      title: "Daily Challenger",
      icon: "📅",
      accent: "#f472b6",
      description:
        "Complete the daily challenge or featured adventure for a total of 3 days.",
      unlocked: !!getUnlockDate("daily"),
      date: getUnlockDate("daily"),
    },
    {
      id: "perfect",
      title: "Perfect Accuracy",
      icon: "🎯",
      accent: "#2dd4bf",
      description:
        "Successfully answer all questions in a lesson without making a single mistake.",
      unlocked: !!getUnlockDate("perfect"),
      date: getUnlockDate("perfect"),
    },
    {
      id: "minigame",
      title: "Mini Game Master",
      icon: "🎮",
      accent: "#fbbf24",
      description:
        "Successfully beat the impossible game category or the Codebreaker vault.",
      unlocked: !!getUnlockDate("minigame"),
      date: getUnlockDate("minigame"),
    },
    {
      id: "speed_math",
      title: "Speed Demon",
      icon: "⚡",
      accent: "#ef4444",
      description:
        "Successfully answer any math category subject questions within 45 seconds.",
      unlocked: !!getUnlockDate("speed_math"),
      date: getUnlockDate("speed_math"),
    },
    {
      id: "speed_sci",
      title: "Junior Scientist",
      icon: "🔬",
      accent: "#14b8a6",
      description:
        "Successfully answer any science category subject questions within 45 seconds.",
      unlocked: !!getUnlockDate("speed_sci"),
      date: getUnlockDate("speed_sci"),
    },
    {
      id: "elite",
      title: "Scholar Elite",
      icon: "💎",
      accent: "#6366f1",
      description: "Achieve a total of 1000 XP.",
      unlocked: !!getUnlockDate("elite", 1000),
      date: getUnlockDate("elite", 1000),
    },
    {
      id: "gold",
      title: "Gold Scholar",
      icon: "🏆",
      accent: "#eab308",
      description: "Achieve a total of 2500 XP.",
      unlocked: !!getUnlockDate("gold", 2500),
      date: getUnlockDate("gold", 2500),
    },
    {
      id: "master",
      title: "Master Explorer",
      icon: "🚀",
      accent: "#ec4899",
      description: "Achieve a total of 5000 XP.",
      unlocked: !!getUnlockDate("master", 5000),
      date: getUnlockDate("master", 5000),
    },
  ];

  const openBadgeModal = (badge: any) => {
    setSelectedBadge(badge);
    Animated.spring(badgeModalAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 65,
      friction: 7,
    }).start();
  };

  const closeBadgeModal = () => {
    Animated.timing(badgeModalAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setSelectedBadge(null);
    });
  };

  const formatUnlockDate = (dateStr: string) => {
    if (!dateStr) return "Not Yet Unlocked";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <View>
      <Text style={styles.section}>🏅 Badges & Achievements</Text>
      <View style={styles.badges}>
        {dynamicAchievements.map((achievement) => (
          <Pressable
            key={achievement.id}
            onPress={() => openBadgeModal(achievement)}
            style={[
              styles.badge,
              {
                width: badgeWidth,
                borderColor: achievement.unlocked
                  ? achievement.accent
                  : "#35466e",
              },
            ]}
          >
            <Text style={styles.badgeIcon}>
              {achievement.unlocked ? achievement.icon : "🔒"}
            </Text>
            <Text style={styles.badgeTitle} numberOfLines={2}>
              {achievement.title}
            </Text>
          </Pressable>
        ))}
      </View>

      <Modal
        visible={!!selectedBadge}
        transparent
        animationType="fade"
        onRequestClose={closeBadgeModal}
      >
        <View style={styles.badgeModalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={closeBadgeModal}
          />
          <Animated.View
            style={[
              styles.badgeModalCard,
              {
                transform: [{ scale: badgeModalAnim }],
                borderColor: selectedBadge?.unlocked
                  ? selectedBadge?.accent
                  : "#35466e",
              },
            ]}
          >
            <View
              style={[
                styles.badgeModalIconBubble,
                {
                  backgroundColor: selectedBadge?.unlocked
                    ? `${selectedBadge?.accent}25`
                    : "#1e2c56",
                },
              ]}
            >
              <Text style={styles.badgeModalIcon}>
                {selectedBadge?.unlocked ? selectedBadge?.icon : "🔒"}
              </Text>
            </View>
            <Text style={styles.badgeModalTitle}>{selectedBadge?.title}</Text>

            <View style={styles.badgeModalDivider} />

            <Text style={styles.badgeModalDescTitle}>HOW TO UNLOCK:</Text>
            <Text style={styles.badgeModalDesc}>
              {selectedBadge?.description}
            </Text>

            <View
              style={[
                styles.badgeModalDateBox,
                {
                  backgroundColor: selectedBadge?.unlocked
                    ? "#133334"
                    : "#202c44",
                },
              ]}
            >
              <Text
                style={[
                  styles.badgeModalDateText,
                  { color: selectedBadge?.unlocked ? "#34d399" : "#8b9ec7" },
                ]}
              >
                {selectedBadge?.unlocked
                  ? `Unlocked on ${formatUnlockDate(selectedBadge?.date)}`
                  : "Goal not yet reached"}
              </Text>
            </View>

            <Pressable
              style={styles.badgeModalCloseBtn}
              onPress={closeBadgeModal}
            >
              <Text style={styles.badgeModalCloseText}>Close</Text>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

function SchedulePreview({
  sessions,
  onCompleteDelete,
  onAddPress,
}: {
  sessions: LocalSession[];
  onCompleteDelete: (id: string) => void;
  onAddPress: () => void;
}): React.JSX.Element {
  return (
    <View>
      <View style={styles.scheduleHeading}>
        <Text style={styles.section}>📅 Study Schedule</Text>
        <Text style={styles.addLink} onPress={onAddPress}>
          + Add Session
        </Text>
      </View>

      {sessions.map((session) => (
        <View key={session.id} style={styles.session}>
          <View style={styles.dayCircle}>
            <Text style={styles.dayText}>{session.day.slice(0, 3)}</Text>
          </View>
          <View style={styles.sessionCopy}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <Text style={styles.sessionTitle}>{session.title}</Text>
              {session.category && (
                <Text style={styles.sessionCategoryTag}>
                  {session.category}
                </Text>
              )}
            </View>
            <Text style={styles.sessionMeta}>
              {session.time} • {session.duration}
            </Text>
            {session.description ? (
              <Text style={styles.sessionDescSnippet} numberOfLines={1}>
                {session.description}
              </Text>
            ) : null}
          </View>
          <Pressable
            onPress={() => onCompleteDelete(session.id)}
            style={styles.checkButton}
          >
            <Text style={styles.check}>○</Text>
          </Pressable>
        </View>
      ))}

      <Pressable onPress={onAddPress} style={styles.openSchedule}>
        <Text style={styles.openScheduleText}>+ Add New Schedule Session</Text>
      </Pressable>
    </View>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: string;
  value: string;
  label: string;
}): React.JSX.Element {
  return (
    <View style={styles.stat}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
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
  content: { padding: 18, paddingBottom: 40 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heading: { flexDirection: "row", alignItems: "center", gap: 8 },
  logo: { width: 44, height: 44 },
  title: { color: "#fff", fontSize: 22, fontWeight: "900" },
  loginBtn: {
    backgroundColor: "#202c52",
    borderColor: "#4d6199",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  loginBtnText: { color: "#ffffff", fontWeight: "900", fontSize: 12 },
  settingsBtn: {
    backgroundColor: "#172849",
    borderColor: "#4d6199",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  settingsBtnText: { color: "#dfe7ff", fontWeight: "800", fontSize: 12 },
  identityRow: { flexDirection: "row", alignItems: "center", marginTop: 16 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: "#7564f4",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarText: { color: "#fff", fontSize: 20, fontWeight: "900" },
  avatarImageFilled: { width: "100%", height: "100%" },
  userDetails: { flex: 1, marginLeft: 10 },
  name: { color: "#fff", fontSize: 18, fontWeight: "900" },
  email: { color: "#bdc8dd", fontSize: 10, marginTop: 2 },
  subHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  scholar: {
    color: "#ffd05a",
    backgroundColor: "#523a13",
    borderColor: "#875b20",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 10,
    fontWeight: "800",
  },
  editProfileBtn: {
    borderColor: "#4d5d80",
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  editProfileText: { color: "#ffffff", fontSize: 11, fontWeight: "800" },
  xpCard: {
    backgroundColor: "#202866",
    borderColor: "#625cff",
    borderWidth: 1,
    borderRadius: 12,
    padding: 9,
    marginTop: 14,
  },
  xpHeader: { flexDirection: "row", justifyContent: "space-between" },
  xpTitle: { color: "#fff", fontSize: 10, fontWeight: "900" },
  xpValue: { color: "#e875f0", fontSize: 10, fontWeight: "900" },
  xpTrack: {
    backgroundColor: "#090d18",
    height: 8,
    borderRadius: 6,
    marginTop: 7,
  },
  xpFill: { height: "100%", backgroundColor: "#e36ee9", borderRadius: 6 },
  xpHint: { color: "#fff", fontSize: 10, marginTop: 3 },
  xpNext: {
    color: "#ccd3e4",
    fontSize: 10,
    textAlign: "right",
    marginTop: -12,
  },
  stats: { flexDirection: "row", gap: 7, marginTop: 10 },
  stat: {
    flex: 1,
    backgroundColor: "#172849",
    borderColor: "#4568cf",
    borderWidth: 1,
    borderRadius: 10,
    padding: 8,
    alignItems: "center",
  },
  statIcon: { fontSize: 20 },
  statValue: { color: "#e875f0", fontSize: 15, fontWeight: "900" },
  statLabel: { color: "#fff", fontSize: 9, fontWeight: "800" },
  switcher: {
    flexDirection: "row",
    backgroundColor: "#172849",
    borderColor: "#625cff",
    borderWidth: 1,
    borderRadius: 12,
    padding: 3,
    marginTop: 18,
  },
  switch: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 10,
  },
  switchActive: { backgroundColor: "#625cff" },
  switchText: { color: "#9fb1d4", fontWeight: "800", fontSize: 13 },
  switchTextActive: { color: "#fff", fontWeight: "900" },
  section: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "900",
    marginTop: 18,
    marginBottom: 9,
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  badge: {
    minHeight: 105,
    backgroundColor: "#172849",
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeIcon: { fontSize: 32, marginBottom: 8, lineHeight: 36 },
  badgeTitle: {
    color: "#fff",
    fontSize: 11.5,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 12,
    height: 30,
  },
  badgeModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(4, 10, 28, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  badgeModalCard: {
    backgroundColor: "#131e38",
    borderWidth: 2,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    width: "100%",
    maxWidth: 320,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  badgeModalIconBubble: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  badgeModalIcon: {
    fontSize: 38,
  },
  badgeModalTitle: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 12,
  },
  badgeModalDivider: {
    width: "80%",
    height: 1,
    backgroundColor: "#2a3d6b",
    marginBottom: 16,
  },
  badgeModalDescTitle: {
    color: "#8a9bbd",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 8,
  },
  badgeModalDesc: {
    color: "#c7d0e8",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    fontWeight: "600",
    marginBottom: 20,
  },
  badgeModalDateBox: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 20,
    width: "100%",
  },
  badgeModalDateText: {
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
  },
  badgeModalCloseBtn: {
    backgroundColor: "#202c52",
    borderColor: "#4d6199",
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  badgeModalCloseText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
  scheduleHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  addLink: { color: "#ad80ff", fontSize: 11, fontWeight: "900" },
  session: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#253d78",
    borderColor: "#5665dc",
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginTop: 8,
  },
  dayCircle: {
    width: 38,
    height: 38,
    borderRadius: 20,
    backgroundColor: "#595bd6",
    alignItems: "center",
    justifyContent: "center",
  },
  dayText: { color: "#fff", fontSize: 11, fontWeight: "900" },
  sessionCopy: { flex: 1, marginLeft: 9 },
  sessionTitle: { color: "#fff", fontWeight: "900", fontSize: 12 },
  sessionCategoryTag: {
    color: "#ffd05a",
    fontSize: 9,
    fontWeight: "800",
    backgroundColor: "#382e14",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  sessionMeta: { color: "#d5def0", fontSize: 10, marginTop: 2 },
  sessionDescSnippet: {
    color: "#9fb1d4",
    fontSize: 9,
    marginTop: 2,
    fontStyle: "italic",
  },
  checkButton: { padding: 4 },
  check: {
    fontSize: 27,
    fontWeight: "900",
    color: "#68779a",
    paddingHorizontal: 4,
  },
  openSchedule: {
    backgroundColor: "#625cff",
    borderRadius: 9,
    alignItems: "center",
    padding: 10,
    marginTop: 12,
  },
  openScheduleText: { color: "#fff", fontWeight: "900" },

  editHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 4,
  },
  cancelText: { color: "#f091f8", fontSize: 15, fontWeight: "900" },
  addHeaderTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  miniCalendarBadge: {
    backgroundColor: "#d33b3b",
    borderRadius: 6,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  miniCalendarMonth: {
    backgroundColor: "#b52a2a",
    color: "#fff",
    fontSize: 7,
    fontWeight: "900",
    width: "100%",
    textAlign: "center",
  },
  miniCalendarDay: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "900",
  },
  editHeaderTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  saveBtn: {
    backgroundColor: "#a638ff",
    paddingHorizontal: 20,
    paddingVertical: 7,
    borderRadius: 20,
  },
  saveBtnText: { color: "#ffffff", fontWeight: "900", fontSize: 13 },
  editAvatarContainer: {
    alignItems: "center",
    marginBottom: 18,
    marginTop: 10,
  },
  avatarWrapper: {
    position: "relative",
    width: 92,
    height: 92,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLarge: {
    width: 92,
    height: 92,
    borderRadius: 22,
    backgroundColor: "#7564f4",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "#a664f4",
  },
  avatarLargeText: { color: "#fff", fontSize: 36, fontWeight: "900" },
  cameraBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: "#3b2066",
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2.5,
    borderColor: "#091426",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    zIndex: 20,
    overflow: "hidden",
  },
  changePhotoText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 10,
  },
  groupLabel: {
    color: "#8a9bbd",
    fontSize: 10,
    fontWeight: "900",
    marginTop: 12,
    marginBottom: 5,
    letterSpacing: 0.8,
  },
  formGroupCard: {
    backgroundColor: "#131e38",
    borderColor: "#374b7c",
    borderWidth: 1.5,
    borderRadius: 16,
    overflow: "hidden",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#20325c",
  },
  inputIconSymbol: { fontSize: 16, marginRight: 12 },
  inputFieldCopy: { flex: 1 },
  inputLabel: {
    color: "#7a8fb8",
    fontSize: 9,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  textInputPlain: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "900",
    paddingVertical: 2,
  },
  inputContainerSingle: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputContainerUniform: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#20325c",
  },
  inputContainerUniformRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textArea: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "900",
    height: 48,
    textAlignVertical: "top",
    marginTop: 2,
  },
  charCounter: {
    color: "#68779a",
    fontSize: 9,
    fontWeight: "800",
    textAlign: "right",
    marginTop: -4,
    marginBottom: 2,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
  },
  categoryChip: {
    backgroundColor: "#1b284d",
    borderColor: "#374b7c",
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  categoryChipActive: {
    backgroundColor: "#625cff",
    borderColor: "#8d89ff",
  },
  categoryChipText: {
    color: "#9fb1d4",
    fontSize: 10,
    fontWeight: "800",
  },
  categoryChipTextActive: {
    color: "#ffffff",
    fontWeight: "900",
  },
});
