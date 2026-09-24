import { Image } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Modal, Pressable, ScrollView, StyleSheet, Text, View, Dimensions, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GradientSafeAreaView } from '@/components/gradient-safe-area';
import { useProgress } from '@/hooks/use-progress';
import { useAudioPlayer } from 'expo-audio';
import { CodebreakerGame } from './components/minigames/CodebreakerGame';
import { FlashcardGame } from './components/minigames/FlashcardGame';
import { MemoryMatchGame } from './components/minigames/MemoryMatchGame';
import { NumberNinjaGame } from './components/minigames/NumberNinjaGame';
import { QuizGame } from './components/minigames/QuizGame';
import { WhackANumberGame } from './components/minigames/WhackANumberGame';
import { WordScrambleGame } from './components/minigames/WordScrambleGame';
import TutorialModal from './components/TutorialModal';
import GradeSelectModal from './components/GradeSelectModal';
import { generateQuizQuestion, QuizQuestion, GradeLevel } from './data/questionGenerators';

const PARENT_CONTROLS_KEY = '@biosphere_parent_controls_v1';
const gameThemeMusic = require('../../assets/BiosphereQuestBackgroundMusic/The Game Show Theme Music - (192 Kbps).mp3');

const gameCatalog = [
  {
    key: 'flashcards',
    title: 'Flashcards',
    subtitle: 'Formulas & definitions',
    icon: require('../../assets/BiosphereQuestAssets/Flashcards Icon.png'),
    difficulty: 'Easy',
    xpText: '+80 XP',
    badge: '🧠 Smart',
    tutorial: {
      objective: 'Review essential formulas and terms to strengthen your core knowledge.',
      steps: [
        'Read the prompt or question carefully.',
        'Tap the card to flip and reveal the answer.',
        'Swipe or select your confidence level to proceed.'
      ],
    },
  },
  {
    key: 'scramble',
    title: 'Word Scramble',
    subtitle: 'Science terminology',
    icon: require('../../assets/BiosphereQuestAssets/Word Scramble.png'),
    difficulty: 'Medium',
    xpText: '+90 XP',
    badge: '🔤 Fun',
    tutorial: {
      objective: 'Unscramble the letters to correctly spell key science and math terms.',
      steps: [
        'Look at the scrambled letters on screen.',
        'Tap letters in the correct order to spell the word.',
        'Submit your answer before the timer runs out!'
      ],
    },
  },
  {
    key: 'memory',
    title: 'Memory Match',
    subtitle: 'Flip & pair icons',
    icon: require('../../assets/BiosphereQuestAssets/Brain Icon.png'),
    difficulty: 'Medium',
    xpText: 'Up to +240 XP',
    badge: '⭐ Match',
    tutorial: {
      objective: 'Flip and match pairs of science icons to test your memory skills.',
      steps: [
        'Tap a card to flip it over.',
        'Find its matching pair among the hidden cards.',
        'Clear all pairs as fast as possible to earn bonus XP.'
      ],
    },
  },
  {
    key: 'ninja',
    title: 'Number Ninja',
    subtitle: 'Rapid arithmetic',
    icon: require('../../assets/BiosphereQuestAssets/Ninja Icon.png'),
    difficulty: 'Hard',
    xpText: '+50 XP/ ans',
    badge: '⚡ Swift',
    tutorial: {
      objective: 'Solve rapid-fire arithmetic problems quickly before time runs out.',
      steps: [
        'Read the math equation quickly.',
        'Type or select the correct numerical result.',
        'Keep your streak alive for maximum XP gains.'
      ],
    },
  },
  {
    key: 'whack',
    title: 'Whack-a-Number',
    subtitle: 'Pop correct target',
    icon: require('../../assets/BiosphereQuestAssets/Hammer Icon.png'),
    difficulty: 'Hard',
    xpText: 'Up to +120 XP',
    badge: '🎯 Action',
    tutorial: {
      objective: 'Tap the correct popping numbers matching the prompt as fast as you can.',
      steps: [
        'Read the target instruction at the top.',
        'Tap the matching numbers as they pop up.',
        'Avoid tapping incorrect targets!'
      ],
    },
  },
  {
    key: 'codebreaker',
    title: 'Codebreaker',
    subtitle: 'Defuse the vault',
    icon: require('../../assets/BiosphereQuestAssets/Bomb Icon.png'),
    difficulty: 'Impossible',
    xpText: 'Up to +500 XP',
    badge: '🔥 Expert',
    tutorial: {
      objective: 'Solve the secure combinations to defuse the vault before time expires.',
      steps: [
        'Analyze clues and patterns provided on screen.',
        'Input the correct digit combination.',
        'Defuse the vault successfully before time runs out.'
      ],
    },
  },
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'Easy':
      return '#39d4ff';
    case 'Medium':
      return '#4ade80';
    case 'Hard':
      return '#facc15';
    case 'Impossible':
      return '#ef4444';
    default:
      return '#4ade80';
  }
};

export default function GamesScreen({ navigation }: { navigation?: any }) {
  const { leaderboardXp, addXp } = useProgress();
  const [difficulty, setDifficulty] = useState<string>('All');
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [activeGameRunning, setActiveGameRunning] = useState<boolean>(false);
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>(1);
  const [showGradeModal, setShowGradeModal] = useState<boolean>(false);
  const [selectedTutorialGame, setSelectedTutorialGame] = useState<any | null>(null);

  // Background Music & Mute States using expo-audio
  const musicPlayer = useAudioPlayer(gameThemeMusic);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // New State for custom Grade Locked Pop-up Screen
  const [lockedModalInfo, setLockedModalInfo] = useState<{ visible: boolean; gradeNum: number }>({
    visible: false,
    gradeNum: 1,
  });

  // Parental Control States
  const [studyFirstEnabled, setStudyFirstEnabled] = useState(false);
  const [gradeLocks, setGradeLocks] = useState<{ [key: string]: boolean }>({});

  // Compact 3-column portrait card dimensions
  const screenWidth = Dimensions.get('window').width;
  const horizontalPadding = 12 * 2;
  const gap = 8;
  const cardWidth = Math.floor((screenWidth - horizontalPadding - (gap * 2)) / 3);
  const cardHeight = Math.floor(cardWidth * 1.25);

  const filterAnims = useRef({
    All: new Animated.Value(1),
    Easy: new Animated.Value(1),
    Medium: new Animated.Value(1),
    Hard: new Animated.Value(1),
    Impossible: new Animated.Value(1),
  }).current;

  const cardAnims = useRef({
    quiz: new Animated.Value(1),
    flashcards: new Animated.Value(1),
    scramble: new Animated.Value(1),
    memory: new Animated.Value(1),
    ninja: new Animated.Value(1),
    whack: new Animated.Value(1),
    codebreaker: new Animated.Value(1),
  }).current;

  const tutorialAnim = useRef(new Animated.Value(0)).current;
  const gradeModalAnim = useRef(new Animated.Value(0)).current;
  const lockedModalAnim = useRef(new Animated.Value(0)).current;
  const gridAnim = useRef(new Animated.Value(1)).current;
  const entrance = useRef(new Animated.Value(0)).current;
  const leaderboardPulse = useRef(new Animated.Value(1)).current;

  // Load parent controls rules
  useEffect(() => {
    fetchParentControls();
  }, []);

  // Handle music playback using regular useEffect with unmount cleanup
  useEffect(() => {
    if (musicPlayer) {
      try {
        musicPlayer.loop = true;
        musicPlayer.volume = isMuted ? 0 : 0.4;
        musicPlayer.play();
      } catch (e) {
        console.log('Error playing background music', e);
      }
    }

    return () => {
      if (musicPlayer) {
        try {
          musicPlayer.pause();
          musicPlayer.seekTo(0);
        } catch (e) {
          console.log('Error pausing background music on unmount', e);
        }
      }
    };
  }, [musicPlayer, isMuted]);

  const toggleMute = () => {
    if (!musicPlayer) return;
    try {
      if (isMuted) {
        musicPlayer.volume = 0.4;
        setIsMuted(false);
      } else {
        musicPlayer.volume = 0;
        setIsMuted(true);
      }
    } catch (error) {
      console.log('Failed to toggle audio mute', error);
    }
  };

  const fetchParentControls = async () => {
    try {
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
      console.error("Error reading parent controls in games", e);
    }
  };

  const getOrderedGames = () => {
    if (difficulty !== 'All') {
      return gameCatalog.filter(item => item.difficulty === difficulty);
    }
    return [
      gameCatalog.find(i => i.key === 'flashcards')!,
      gameCatalog.find(i => i.key === 'scramble')!,
      gameCatalog.find(i => i.key === 'memory')!,
      gameCatalog.find(i => i.key === 'ninja')!,
      gameCatalog.find(i => i.key === 'whack')!,
      gameCatalog.find(i => i.key === 'codebreaker')!,
    ].filter(Boolean);
  };

  const visibleGames = getOrderedGames();

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
    if (showGradeModal) {
      gradeModalAnim.setValue(0);
      Animated.spring(gradeModalAnim, {
        toValue: 1,
        tension: 65,
        friction: 6,
        useNativeDriver: true,
      }).start();
    }
  }, [showGradeModal, gradeModalAnim]);

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

  const handleGamePress = (gameItem: any) => {
    if (studyFirstEnabled) {
      Alert.alert(
        "Mini-Games Locked", 
        "Your parent requires you to finish your lessons before unlocking mini-games!"
      );
      return;
    }

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
      setShowGradeModal(true);
    });
  };

  const handleTutorialClose = () => {
    closeTutorialWithAnimation();
  };

  const handleSelectGrade = (grade: GradeLevel | string | number) => {
    const numericGrade = typeof grade === 'string' 
      ? parseInt(grade.replace(/[^0-9]/g, ''), 10) || 1 
      : Number(grade);

    const gradeKey = `Grade ${numericGrade}`;
    if (gradeLocks[gradeKey]) {
      setShowGradeModal(false);
      setLockedModalInfo({ visible: true, gradeNum: numericGrade });
      return;
    }

    Animated.timing(gradeModalAnim, {
      toValue: 0,
      duration: 120,
      useNativeDriver: true,
    }).start(() => {
      setSelectedGrade(numericGrade as GradeLevel);
      setShowGradeModal(false);
      setActiveGameRunning(true);
    });
  };

  const handleFinishGame = (earnedXp: number = 50) => {
    if (earnedXp > 0) {
      addXp(earnedXp);
    }
    setActiveGameRunning(false);
    setSelectedGame(null);
  };

  const handleCancel = () => {
    if (navigation && navigation.goBack) {
      navigation.goBack();
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
      onSuccess: handleFinishGame,
    } as any;

    switch (selectedGame) {
      case 'quiz':
        return <QuizGame {...commonProps} />;
      case 'flashcards':
        return <FlashcardGame {...commonProps} />;
      case 'scramble':
        return <WordScrambleGame {...commonProps} />;
      case 'ninja':
        return <NumberNinjaGame {...commonProps} />;
      case 'memory':
        return <MemoryMatchGame {...commonProps} />;
      case 'whack':
        return <WhackANumberGame {...commonProps} />;
      case 'codebreaker':
        return <CodebreakerGame {...commonProps} />;
      default:
        return <QuizGame {...commonProps} />;
    }
  };

  return (
    <GradientSafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.topBar}>
        <Pressable onPress={handleCancel} style={styles.cancelButton}>
          <Text style={styles.cancelText}>← Back</Text>
        </Pressable>
        <View style={styles.topBarRightContainer}>
          {/* Mute / Unmute Button */}
          <Pressable onPress={toggleMute} style={styles.muteButton}>
            <Text style={styles.muteIconText}>{isMuted ? '🔇' : '🔊'}</Text>
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
          {/* Header Row */}
          <View style={styles.headingRow}>
            <View>
              <Text style={styles.title}>🎮 Mini-Game Arcade</Text>
              <Text style={styles.subtitle}>Play, learn & level up your XP!</Text>
            </View>
            <Image
              source={require('../../assets/BiosphereQuestAssets/Stella (Biosphere Quest Mascot).png')}
              style={styles.mascotImage}
              resizeMode="contain"
            />
          </View>

          {/* Featured Card */}
          <Animated.View style={{ transform: [{ scale: cardAnims.quiz }] }}>
            <Pressable 
              style={styles.featured} 
              onPress={() => {
                handleGamePress({
                  key: 'quiz',
                  title: 'Math & Science Epic Quiz',
                  subtitle: '5 questions • Earn massive XP',
                  icon: require('../../assets/BiosphereQuestAssets/Brain Icon.png'),
                  difficulty: 'Easy',
                  xpText: '+150 XP',
                  tutorial: {
                    objective: 'Answer multiple-choice questions correctly to score big XP points.',
                    steps: [
                      'Read each multiple-choice question carefully.',
                      'Select the best answer from the given options.',
                      'Complete all questions to claim your XP reward.',
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

          {/* Filter Pills */}
          <View style={styles.filterRow}>
            {['All', 'Easy', 'Medium', 'Hard', 'Impossible'].map((item: string) => {
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

          {/* Game Grid */}
          <Animated.View style={[styles.grid, { transform: [{ scale: gridAnim }] }]}>
            {visibleGames.map((item) => {
              const themeColor = getDifficultyColor(item.difficulty);
              const anim = cardAnims[item.key as keyof typeof cardAnims] || new Animated.Value(1);
              return (
                <Animated.View key={item.key} style={{ transform: [{ scale: anim }] }}>
                  <Pressable
                    style={[styles.gameCard, { width: cardWidth, height: cardHeight }]}
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
                    <View style={styles.cardFooter}>
                      <Text style={styles.lightningIcon}>⚡</Text>
                      <Text style={[styles.cardXp, { color: themeColor }]} numberOfLines={1}>
                        {item.xpText}
                      </Text>
                    </View>
                  </Pressable>
                </Animated.View>
              );
            })}
          </Animated.View>

          {/* Leaderboard Section */}
          <Text style={styles.leaderboardMainTitle}>🏆 Weekly Champions</Text>
          <Animated.View
            style={[styles.leaderboardCard, { transform: [{ scale: leaderboardPulse }] }]}
          >
            <View style={styles.podium}>
              <PodiumPlace rank="2" name="Priya S." xp="0 XP" color="#c9c9c9" height={64} initials="PS" avatarBg="#3b82f6" />
              <PodiumPlace rank="1" name="Jordan K." xp="0 XP" color="#fff24c" height={80} initials="JK" avatarBg="#3b82f6" />
              <PodiumPlace rank="3" name="Croissant" xp="0 XP" color="#ed9538" height={52} initials="BC" avatarBg="#3b82f6" />
            </View>

            <RankRow rank="#4" initials="MR" name="Marco Rossi" xp="0 XP" avatarBg="#e69b35" />
            <RankRow rank="#5" initials="MS" name="Maricris Santos" xp="0 XP" avatarBg="#e69b35" />
          </Animated.View>
        </Animated.View>
      </ScrollView>

      {/* Tutorial Modal Popup with Animation */}
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
          pointerEvents={selectedTutorialGame ? 'auto' : 'none'}
        >
          <TutorialModal
            game={selectedTutorialGame}
            onClose={handleTutorialClose}
            onContinue={handleTutorialContinue}
          />
        </Animated.View>
      )}

      {/* Grade Select Modal Popup with Animation */}
      {showGradeModal && (
        <Animated.View
          style={[
            styles.absoluteOverlay,
            {
              opacity: gradeModalAnim,
              transform: [
                {
                  scale: gradeModalAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.85, 1],
                  }),
                },
              ],
            },
          ]}
          pointerEvents={showGradeModal ? 'auto' : 'none'}
        >
          <GradeSelectModal
            visible={showGradeModal}
            gameTitle={selectedTutorialGame?.title || 'Game'}
            onSelectGrade={handleSelectGrade}
            onClose={() => {
              Animated.timing(gradeModalAnim, {
                toValue: 0,
                duration: 120,
                useNativeDriver: true,
              }).start(() => setShowGradeModal(false));
            }}
          />
        </Animated.View>
      )}

      {/* Custom Grade Locked Pop-up Screen Modal */}
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
          pointerEvents={lockedModalInfo.visible ? 'auto' : 'none'}
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
                    setShowGradeModal(true);
                  });
                }}
              >
                <Text style={styles.lockedButtonText}>Choose Another Grade</Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      )}

      <Modal visible={activeGameRunning} animationType="slide">
        <View style={{ flex: 1, backgroundColor: '#091426' }}>
          {renderActiveGame()}
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
  safeArea: { flex: 1, backgroundColor: '#091426' },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: 2,
  },
  cancelButton: { paddingVertical: 4 },
  cancelText: { color: '#ffffff', fontSize: 14, fontWeight: '800' },
  topBarRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  muteButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: '#30478a',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  muteIconText: {
    fontSize: 14,
  },
  levelIndicatorBadge: {
    backgroundColor: 'rgba(241, 198, 91, 0.2)',
    borderColor: '#f1c65b',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  levelIndicatorText: { color: '#f1c65b', fontSize: 11, fontWeight: '900' },
  mascotImage: { width: 44, height: 44 },
  content: { padding: 12, paddingBottom: 40 },
  headingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
  title: { color: '#fff', fontSize: 21, fontWeight: '900' },
  subtitle: { color: '#94a3b8', fontSize: 11, fontWeight: '700', marginTop: 1 },
  featured: {
    backgroundColor: '#1b1d4f',
    borderColor: '#f1c65b',
    borderWidth: 1.5,
    borderRadius: 18,
    padding: 12,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  featureCopy: { flex: 1 },
  featuredTagContainer: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(241, 198, 91, 0.15)',
    borderColor: '#f1c65b',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  featureTagText: { color: '#f1c65b', fontWeight: '900', fontSize: 9, letterSpacing: 0.5 },
  featureTitle: { color: '#fff', fontSize: 17, fontWeight: '900', marginTop: 6, textAlign: 'left' },
  featureDetails: { color: '#cbd5e1', fontSize: 11, marginTop: 2, fontWeight: '600', textAlign: 'left' },
  featureXpRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  featureXp: { color: '#f1c65b', fontSize: 11, fontWeight: '800' },
  featureMetaSeparator: { color: '#64748b', marginHorizontal: 6, fontSize: 11 },
  featureMeta: { color: '#94a3b8', fontSize: 11, fontWeight: '600' },
  featureTrophyContainer: { paddingLeft: 8, justifyContent: 'center', alignItems: 'center' },
  trophyEmoji: { fontSize: 36 },
  filterRow: { flexDirection: 'row', gap: 5, marginTop: 10 },
  filter: { backgroundColor: '#162247', borderRadius: 12, paddingHorizontal: 9, paddingVertical: 6, borderWidth: 1, borderColor: '#293a73' },
  filterActive: { backgroundColor: '#4f46e5', borderColor: '#818cf8' },
  filterText: { color: '#94a3b8', fontSize: 10.5, fontWeight: '800' },
  filterTextActive: { color: '#ffffff' },
  grid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'flex-start', 
    gap: 8, 
    marginTop: 10, 
  },
  gameCard: {
    backgroundColor: '#131d3b',
    borderColor: '#30478a',
    borderWidth: 1.2,
    borderRadius: 16,
    padding: 8,
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  cardBadgeContainer: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  cardBadgeText: { fontSize: 8, fontWeight: '800', color: '#cbd5e1' },
  cardTopArea: { 
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  gameIcon: { 
    width: 38, 
    height: 38,
    resizeMode: 'contain',
  },
  cardTextContainer: { 
    justifyContent: 'flex-end', 
    marginBottom: 4, 
  },
  cardTitle: { 
    fontSize: 10, 
    fontWeight: '900', 
    marginBottom: 1, 
    textAlign: 'left',
  },
  cardSubtitle: { 
    color: '#94a3b8', 
    fontSize: 8.5, 
    fontWeight: '600', 
    textAlign: 'left',
  },
  cardFooter: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    borderTopWidth: 1,
    borderTopColor: 'rgba(48, 71, 138, 0.4)',
    paddingTop: 4,
  },
  lightningIcon: { fontSize: 8 },
  cardXp: { fontSize: 9, fontWeight: '900' },
  leaderboardMainTitle: { color: '#fff', fontSize: 14, fontWeight: '900', textAlign: 'center', marginTop: 16, marginBottom: 8 },
  leaderboardCard: {
    backgroundColor: '#14203f',
    borderColor: '#2e4585',
    borderWidth: 1.2,
    borderRadius: 16,
    padding: 10,
  },
  podium: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginBottom: 10,
    gap: 6,
  },
  podiumPlace: { alignItems: 'center', width: '30%' },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },
  avatarText: { color: '#fff', fontSize: 9, fontWeight: '900' },
  podiumBar: { width: '100%', alignItems: 'center', justifyContent: 'flex-end', borderRadius: 6, paddingBottom: 6 },
  rankNumber: { color: '#11152c', fontSize: 18, fontWeight: '900' },
  podiumName: { color: '#11152c', fontSize: 8, fontWeight: '900', textAlign: 'center', paddingHorizontal: 2 },
  podiumXp: { color: '#11152c', fontSize: 8, fontWeight: '700' },
  ranking: {
    backgroundColor: '#1b2a54',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#2c4382',
  },
  rankLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rankNumText: { color: '#94a3b8', fontWeight: '800', fontSize: 11, width: 18 },
  rankAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankAvatarText: { color: '#fff', fontSize: 9, fontWeight: '900' },
  rankNameText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  rankXp: { color: '#f3ca45', fontWeight: '900', fontSize: 12 },
  absoluteOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  modalBackdropCenter: {
    flex: 1,
    backgroundColor: 'rgba(5, 11, 24, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  lockedCard: {
    backgroundColor: '#131d3b',
    borderColor: '#ef4444',
    borderWidth: 1.5,
    borderRadius: 22,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  lockedIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: '#ef4444',
    borderWidth: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  lockedEmoji: {
    fontSize: 28,
  },
  lockedTitle: {
    color: '#fff',
    fontSize: 19,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
  },
  lockedDescription: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  lockedButton: {
    backgroundColor: '#4f46e5',
    borderColor: '#818cf8',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: '100%',
    alignItems: 'center',
  },
  lockedButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
});