import { useAudioPlayer } from "expo-audio";

import { LinearGradient } from "expo-linear-gradient";

import React, { useCallback, useRef, useState } from "react";

import {
  Animated,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

import { GradeLevel, WhackChallenge } from "../../data/questionGenerators";

import { MinigameMotion } from "./MinigameMotion";

interface Props {
  grade: GradeLevel;

  onSuccess: (xp: number) => void;

  onClose: () => void;
}

type Difficulty = "Easy" | "Medium" | "Hard" | "Expert" | "Impossible";

const MAX_LIVES = 5;

const TARGET_QUOTA = 5; // Updated to 5 total questions per round as per XP scaling guidelines

const getDifficulty = (completedQuotas: number): Difficulty => {
  if (completedQuotas <= 0) return "Easy";

  if (completedQuotas === 1) return "Medium";

  if (completedQuotas === 2) return "Hard";

  if (completedQuotas === 3) return "Expert";

  return "Impossible";
};

// Exact XP calculation: 30 XP per correct answer (+30 XP per score increment)

const getXPForScore = (score: number): number => {
  return score * 30;
};

// MATATAG Curriculum-aligned robust challenge bank guaranteeing non-repetitive, rich questions for Grades 1 to 6

const MATATAG_CURRICULUM_BANK: Record<
  GradeLevel,
  {
    ruleText: string;
    targetMultiple: number;
    correctPool: number[];
    wrongPool: number[];
  }[]
> = {
  1: [
    {
      ruleText: "MATATAG Grade 1: Whack numbers that count by 2s up to 20!",

      targetMultiple: 2,

      correctPool: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],

      wrongPool: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19],
    },

    {
      ruleText:
        "MATATAG Grade 1: Whack numbers that are multiples of 5 (Counting by 5s)!",

      targetMultiple: 5,

      correctPool: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50],

      wrongPool: [1, 2, 3, 4, 6, 7, 8, 9, 11, 12],
    },

    {
      ruleText:
        "MATATAG Grade 1: Whack numbers ending in zero (Decades up to 50)!",

      targetMultiple: 10,

      correctPool: [10, 20, 30, 40, 50],

      wrongPool: [11, 12, 21, 23, 31, 34, 41, 46],
    },
  ],

  2: [
    {
      ruleText:
        "MATATAG Grade 2: Whack numbers that are multiples of 3 (Multiplication Tables)!",

      targetMultiple: 3,

      correctPool: [3, 6, 9, 12, 15, 18, 21, 24, 27, 30],

      wrongPool: [1, 2, 4, 5, 7, 8, 10, 11, 13, 14],
    },

    {
      ruleText:
        "MATATAG Grade 2: Whack numbers that are multiples of 4 (Basic Multiplication)!",

      targetMultiple: 4,

      correctPool: [4, 8, 12, 16, 20, 24, 28, 32, 36, 40],

      wrongPool: [1, 2, 3, 5, 6, 7, 9, 10, 11, 13],
    },

    {
      ruleText:
        "MATATAG Grade 2: Whack even numbers between 1 and 20 (Patterns)!",

      targetMultiple: 2,

      correctPool: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],

      wrongPool: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19],
    },
  ],

  3: [
    {
      ruleText:
        "MATATAG Grade 3: Whack numbers that are multiples of 6 (Intermediate Tables)!",

      targetMultiple: 6,

      correctPool: [6, 12, 18, 24, 30, 36, 42, 48, 54, 60],

      wrongPool: [5, 7, 11, 13, 17, 19, 23, 25, 29, 31],
    },

    {
      ruleText:
        "MATATAG Grade 3: Whack numbers that are multiples of 7 (Multiplication Mastery)!",

      targetMultiple: 7,

      correctPool: [7, 14, 21, 28, 35, 42, 49, 56, 63, 70],

      wrongPool: [6, 8, 13, 15, 20, 22, 27, 29, 34, 36],
    },

    {
      ruleText:
        "MATATAG Grade 3: Whack numbers that are multiples of 8 (Advanced Tables)!",

      targetMultiple: 8,

      correctPool: [8, 16, 24, 32, 40, 48, 56, 64, 72, 80],

      wrongPool: [7, 9, 15, 17, 23, 25, 31, 33, 39, 41],
    },
  ],

  4: [
    {
      ruleText:
        "MATATAG Grade 4: Whack numbers that are multiples of 9 (Fractions & Multiples)!",

      targetMultiple: 9,

      correctPool: [9, 18, 27, 36, 45, 54, 63, 72, 81, 90],

      wrongPool: [8, 10, 17, 19, 26, 28, 35, 37, 44, 46],
    },

    {
      ruleText:
        "MATATAG Grade 4: Whack numbers that are multiples of 11 (Patterns & Factors)!",

      targetMultiple: 11,

      correctPool: [11, 22, 33, 44, 55, 66, 77, 88, 99],

      wrongPool: [10, 12, 21, 23, 32, 34, 43, 45, 54, 56],
    },

    {
      ruleText:
        "MATATAG Grade 4: Whack numbers that are multiples of 12 (Grade 4 Mastery)!",

      targetMultiple: 12,

      correctPool: [12, 24, 36, 48, 60, 72, 84, 96],

      wrongPool: [10, 11, 13, 23, 25, 35, 37, 47, 49, 59],
    },
  ],

  5: [
    {
      ruleText:
        "MATATAG Grade 5: Whack numbers divisible by 3 (Divisibility Rules & Decimals)!",

      targetMultiple: 3,

      correctPool: [15, 21, 24, 27, 33, 39, 42, 51, 57, 63],

      wrongPool: [14, 16, 20, 22, 25, 28, 32, 34, 40, 44],
    },

    {
      ruleText:
        "MATATAG Grade 5: Whack numbers divisible by 4 (Number Theory & Fractions)!",

      targetMultiple: 4,

      correctPool: [16, 24, 28, 32, 36, 44, 48, 52, 60, 64],

      wrongPool: [15, 17, 23, 25, 29, 31, 35, 37, 43, 45],
    },

    {
      ruleText:
        "MATATAG Grade 5: Whack numbers divisible by 5 (Advanced Number Sense)!",

      targetMultiple: 5,

      correctPool: [25, 35, 45, 55, 65, 75, 85, 95, 105],

      wrongPool: [24, 26, 34, 36, 44, 46, 54, 56, 64, 66],
    },
  ],

  6: [
    {
      ruleText:
        "MATATAG Grade 6: Whack numbers divisible by 6 (Prime & Composite Numbers)!",

      targetMultiple: 6,

      correctPool: [18, 24, 36, 42, 48, 54, 66, 72, 78, 84],

      wrongPool: [17, 19, 23, 25, 35, 37, 43, 47, 53, 55],
    },

    {
      ruleText:
        "MATATAG Grade 6: Whack numbers divisible by 8 (Mathematical Reasoning)!",

      targetMultiple: 8,

      correctPool: [24, 32, 40, 48, 56, 72, 80, 88, 96],

      wrongPool: [23, 25, 31, 33, 39, 41, 47, 49, 55, 57],
    },

    {
      ruleText:
        "MATATAG Grade 6: Whack numbers divisible by 9 (Algebraic Readiness)!",

      targetMultiple: 9,

      correctPool: [27, 36, 45, 54, 63, 72, 81, 90, 99],

      wrongPool: [26, 28, 35, 37, 44, 46, 53, 55, 62, 64],
    },
  ],
};

const generateCurricularWhackChallenge = (
  grade: GradeLevel,

  seenSet: Set<string>,
): WhackChallenge => {
  const gradePools =
    MATATAG_CURRICULUM_BANK[grade] || MATATAG_CURRICULUM_BANK[1];

  const candidateRule =
    gradePools[Math.floor(Math.random() * gradePools.length)];

  // Shuffle and pick exactly TARGET_QUOTA (5) correct answers

  const shuffledCorrect = [...candidateRule.correctPool].sort(
    () => Math.random() - 0.5,
  );

  const selectedCorrect = shuffledCorrect.slice(0, TARGET_QUOTA);

  // Shuffle and pick 4 wrong answers (total 9 tiles: 5 correct + 4 wrong = 9 grid slots)

  const shuffledWrong = [...candidateRule.wrongPool].sort(
    () => Math.random() - 0.5,
  );

  const selectedWrong = shuffledWrong.slice(0, 4);

  const combinedGrid = [...selectedCorrect, ...selectedWrong].sort(
    () => Math.random() - 0.5,
  );

  return {
    ruleText: candidateRule.ruleText,

    targetMultiple: candidateRule.targetMultiple,

    gridNumbers: combinedGrid,
  };
};

export const QuizGame: React.FC<Props> = ({
  grade,

  onSuccess,

  onClose,
}) => {
  const clickPlayer = useAudioPlayer(
    require("../../../../assets/BiosphereQuestSoundEffectsandMusic/BiosphereQuestSFX/Button_Click_SFX.mp3"),
  );

  const correctPlayer = useAudioPlayer(
    require("../../../../assets/BiosphereQuestSoundEffectsandMusic/BiosphereQuestSFX/Correct_Answer_SFX.mp3"),
  );

  const wrongPlayer = useAudioPlayer(
    require("../../../../assets/BiosphereQuestSoundEffectsandMusic/BiosphereQuestSFX/Wrong_Answer_SFX.mp3"),
  );

  const playSound = async (type: "click" | "correct" | "wrong") => {
    try {
      const player =
        type === "click"
          ? clickPlayer
          : type === "correct"
            ? correctPlayer
            : wrongPlayer;

      if (player) {
        if (typeof player.seekTo === "function") {
          await player.seekTo(0);
        }

        await player.play();
      }
    } catch (e) {
      console.log("SFX Play Error:", e);
    }
  };

  const seenChallenges = useRef(new Set<string>());

  const antiCheatClickLimit = useRef<{ count: number; time: number }>({
    count: 0,

    time: 0,
  });

  const [challenge, setChallenge] = useState<WhackChallenge>(() => {
    return generateCurricularWhackChallenge(grade, new Set<string>());
  });

  const [whacked, setWhacked] = useState<number[]>([]);

  const [activeHammerIndex, setActiveHammerIndex] = useState<number | null>(
    null,
  );

  const [score, setScore] = useState(0);

  const [lives, setLives] = useState(MAX_LIVES);

  const [feedback, setFeedback] = useState("");

  const [completedQuotas, setCompletedQuotas] = useState(0);

  const [tileScales] = useState(() =>
    Array.from({ length: 9 }, () => new Animated.Value(1)),
  );

  const [hammerAnim] = useState(() => new Animated.Value(0));

  const currentDifficulty = getDifficulty(completedQuotas);

  const earnedXP = getXPForScore(score);

  const isGameOver = lives <= 0 || score >= TARGET_QUOTA;

  const startNextBoard = useCallback(
    (resetEntireGame = false) => {
      playSound("click");

      antiCheatClickLimit.current = { count: 0, time: Date.now() };

      if (seenChallenges.current.size > 80) {
        seenChallenges.current.clear();
      }

      let nextChallenge = generateCurricularWhackChallenge(
        grade,
        seenChallenges.current,
      );

      let key = nextChallenge ? challengeKey(nextChallenge) : "";

      if (!nextChallenge || (key && seenChallenges.current.has(key))) {
        seenChallenges.current.clear();

        nextChallenge = generateCurricularWhackChallenge(
          grade,
          seenChallenges.current,
        );

        key = nextChallenge ? challengeKey(nextChallenge) : "";
      }

      if (key) {
        seenChallenges.current.add(key);
      }

      tileScales.forEach((anim) => anim.setValue(1));

      setChallenge(nextChallenge);

      setWhacked([]);

      setFeedback("");

      setActiveHammerIndex(null);

      if (resetEntireGame) {
        setLives(MAX_LIVES);

        setCompletedQuotas(0);

        setScore(0);
      }
    },

    [grade, tileScales],
  );

  const triggerHammerStrike = (index: number) => {
    setActiveHammerIndex(index);

    hammerAnim.setValue(0);

    const scaleAnim = tileScales[index] || new Animated.Value(1);

    Animated.parallel([
      Animated.sequence([
        Animated.timing(hammerAnim, {
          toValue: 1,

          duration: 120,

          useNativeDriver: true,
        }),

        Animated.timing(hammerAnim, {
          toValue: 0,

          duration: 150,

          useNativeDriver: true,
        }),
      ]),

      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.65,

          duration: 100,

          useNativeDriver: true,
        }),

        Animated.spring(scaleAnim, {
          toValue: 1,

          friction: 3,

          tension: 40,

          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setActiveHammerIndex(null);
    });
  };

  const whack = (index: number) => {
    if (whacked.includes(index) || isGameOver) return;

    // This handler runs only in response to a player tap.
    // eslint-disable-next-line react-hooks/purity
    const now = Date.now();

    if (now - antiCheatClickLimit.current.time < 1000) {
      antiCheatClickLimit.current.count += 1;

      if (antiCheatClickLimit.current.count > 15) {
        setFeedback("Anti-cheat: Tap frequency exceeded.");

        return;
      }
    } else {
      antiCheatClickLimit.current = { count: 1, time: now };
    }

    triggerHammerStrike(index);

    const isTarget =
      challenge.gridNumbers[index] % challenge.targetMultiple === 0;

    if (isTarget) {
      playSound("correct");

      const nextScore = score + 1;

      setScore(nextScore);

      const calculatedXp = getXPForScore(nextScore);

      setFeedback(`🔨 💥 CORRECT! +30 XP (Total: +${calculatedXp}XP)`);

      setWhacked((current) => [...current, index]);

      if (nextScore >= TARGET_QUOTA) {
        onSuccess(calculatedXp);

        setCompletedQuotas((count) => count + 1);
      }
    } else {
      playSound("wrong");

      const remainingLives = lives - 1;

      setLives(remainingLives);

      const calculatedXp = getXPForScore(score);

      setFeedback(`🔨 💔 INCORRECT! Lost 1 Life! (Total: +${calculatedXp}XP)`);

      if (remainingLives <= 0) {
        setWhacked((current) => [...current, index]);
      }
    }
  };

  const hammerRotation = hammerAnim.interpolate({
    inputRange: [0, 1],

    outputRange: ["0deg", "-45deg"],
  });

  const hammerTranslateY = hammerAnim.interpolate({
    inputRange: [0, 1],

    outputRange: [-20, 10],
  });

  const renderLives = () => {
    const hearts = [];

    for (let i = 0; i < MAX_LIVES; i++) {
      hearts.push(i < lives ? "❤️" : "🖤");
    }

    return hearts.join(" ");
  };

  return (
    <LinearGradient colors={["#0a0b18", "#2b2b5c"]} style={styles.background}>
      <MinigameMotion
        key={`${challengeKey(challenge)}-${completedQuotas}`}

        style={styles.container}
      >
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => {
              playSound("click");

              onClose();
            }}
          >
            <Text style={styles.backText}>Return to Games</Text>
          </TouchableOpacity>

          <Text style={styles.grade}>
            Grade {grade} • {currentDifficulty.toUpperCase()}
          </Text>

          <Text style={styles.lives}>{renderLives()}</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.eyebrow}>
            SCORE: {score}/5 ({earnedXP > 0 ? `+${earnedXP}XP` : "+00XP"}) • +30
            XP PER CORRECT ANSWER
          </Text>

          <Text style={styles.title}>Whack-a-Number 🔨</Text>

          <Text style={styles.rule}>{challenge.ruleText}</Text>

          <Text style={styles.score}>
            Progress: {score} / {TARGET_QUOTA} • Reward: +{earnedXP} XP
          </Text>

          <View style={styles.grid}>
            {challenge.gridNumbers.map((number, index) => {
              const isTarget = number % challenge.targetMultiple === 0;

              const selected = whacked.includes(index);

              const isBeingHit = activeHammerIndex === index;

              const scaleAnim = tileScales[index] || 1;

              return (
                <Animated.View
                  key={`${index}-${number}`}

                  style={[
                    styles.holeWrapper,

                    { transform: [{ scale: scaleAnim }] },
                  ]}
                >
                  <TouchableOpacity
                    style={[
                      styles.hole,

                      selected && (isTarget ? styles.hitHole : styles.missHole),
                    ]}

                    onPress={() => whack(index)}

                    disabled={selected || isGameOver}

                    activeOpacity={0.75}
                  >
                    {isBeingHit && (
                      <Animated.Text
                        style={[
                          styles.hammerIcon,

                          {
                            transform: [
                              { translateY: hammerTranslateY },

                              { rotate: hammerRotation },
                            ],
                          },
                        ]}
                      >
                        🔨
                      </Animated.Text>
                    )}

                    <Text
                      style={[
                        styles.number,

                        selected &&
                          (isTarget ? styles.hitText : styles.missText),
                      ]}
                    >
                      {selected ? (isTarget ? "💥 ✓" : "💔 ❌") : number}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>

          <Text style={styles.feedback}>
            {feedback ||
              "Tap the correct MATATAG curriculum numbers! Each correct answer earns +30 XP."}
          </Text>

          {isGameOver && (
            <View style={styles.expiredCard}>
              <Text style={styles.expiredTitle}>
                {score >= TARGET_QUOTA ? "Round Complete! 🎉" : "Game Over! 💔"}
              </Text>

              <Text style={styles.expiredCopy}>
                You got {score}/5 correct! Your reward output is +
                {earnedXP < 10 ? `0${earnedXP}` : earnedXP}XP.
              </Text>

              <TouchableOpacity
                style={styles.retryButton}

                onPress={() => startNextBoard(true)}

                activeOpacity={0.85}
              >
                <Text style={styles.retryButtonText}>Play Again ↻</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </MinigameMotion>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1 } as ViewStyle,

  container: { flex: 1, backgroundColor: "transparent" } as ViewStyle,

  topBar: {
    paddingHorizontal: 16,

    paddingTop: 18,

    paddingBottom: 12,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",
  } as ViewStyle,

  backText: { color: "#38bdf8", fontSize: 14, fontWeight: "800" } as TextStyle,

  grade: { color: "#e2e8f0", fontSize: 11, fontWeight: "800" } as TextStyle,

  lives: { fontSize: 13, letterSpacing: 1 } as TextStyle,

  content: { flex: 1, justifyContent: "center", padding: 20 } as ViewStyle,

  eyebrow: {
    color: "#86efac",

    fontSize: 11,

    textAlign: "center",

    fontWeight: "900",

    letterSpacing: 0.8,

    marginBottom: 8,
  } as TextStyle,

  title: {
    color: "#fff",

    fontSize: 23,

    textAlign: "center",

    fontWeight: "900",

    marginBottom: 16,
  } as TextStyle,

  rule: {
    color: "#dbeafe",

    textAlign: "center",

    fontSize: 17,

    fontWeight: "900",

    backgroundColor: "rgba(255, 255, 255, 0.08)",

    padding: 16,

    borderRadius: 14,

    marginBottom: 10,
  } as TextStyle,

  score: {
    color: "#facc15",

    textAlign: "center",

    fontWeight: "900",

    marginBottom: 16,
  } as TextStyle,

  grid: {
    flexDirection: "row",

    flexWrap: "wrap",

    justifyContent: "center",

    gap: 12,
  } as ViewStyle,

  holeWrapper: { width: "28%", aspectRatio: 1 } as ViewStyle,

  hole: {
    flex: 1,

    width: "100%",

    borderRadius: 24,

    backgroundColor: "rgba(255, 255, 255, 0.1)",

    borderWidth: 2,

    borderColor: "#38bdf8",

    alignItems: "center",

    justifyContent: "center",

    overflow: "visible",
  } as ViewStyle,

  hitHole: {
    backgroundColor: "rgba(34, 197, 94, 0.35)",

    borderColor: "#22c55e",

    borderStyle: "dashed",
  } as ViewStyle,

  missHole: {
    backgroundColor: "rgba(251, 113, 133, 0.35)",

    borderColor: "#fb7185",

    borderStyle: "dashed",
  } as ViewStyle,

  number: { color: "#fff", fontSize: 24, fontWeight: "900" } as TextStyle,

  hitText: { color: "#4ade80", fontSize: 18 } as TextStyle,

  missText: { color: "#fb7185", fontSize: 18 } as TextStyle,

  hammerIcon: {
    position: "absolute",

    top: -35,

    fontSize: 36,

    zIndex: 10,
  } as TextStyle,

  feedback: {
    color: "#cbd5e1",

    fontSize: 12,

    fontWeight: "700",

    textAlign: "center",

    marginTop: 18,

    minHeight: 18,
  } as TextStyle,

  expiredCard: {
    width: "100%",

    alignItems: "center",

    backgroundColor: "rgba(255, 255, 255, 0.08)",

    borderColor: "#fb7185",

    borderWidth: 1,

    borderRadius: 16,

    padding: 16,

    marginTop: 16,
  } as ViewStyle,

  expiredTitle: {
    color: "#fff",

    fontSize: 18,

    fontWeight: "900",

    textAlign: "center",
  } as TextStyle,

  expiredCopy: {
    color: "#cbd5e1",

    fontSize: 12,

    lineHeight: 18,

    textAlign: "center",

    marginTop: 6,
  } as TextStyle,

  retryButton: {
    backgroundColor: "#117a61",

    borderRadius: 12,

    paddingHorizontal: 18,

    paddingVertical: 11,

    marginTop: 12,
  } as ViewStyle,

  retryButtonText: {
    color: "#fff",

    fontSize: 13,

    fontWeight: "900",
  } as TextStyle,
});

const challengeKey = (challenge: WhackChallenge): string =>
  `${challenge.targetMultiple}|${[...challenge.gridNumbers]

    .sort((a, b) => a - b)

    .join(",")}`;
