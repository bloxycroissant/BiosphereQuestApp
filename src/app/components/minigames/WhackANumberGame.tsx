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
import {
  generateWhackChallenge,
  GradeLevel,
  WhackChallenge,
} from "../../data/questionGenerators";
import { MinigameMotion } from "./MinigameMotion";

interface Props {
  grade: GradeLevel;
  onSuccess: (xp: number) => void;
  onClose: () => void;
}

type Difficulty = "Easy" | "Medium" | "Hard" | "Expert" | "Impossible";

const MAX_LIVES = 5;
const TARGET_QUOTA = 10;

const getDifficulty = (completedQuotas: number): Difficulty => {
  if (completedQuotas <= 0) return "Easy";
  if (completedQuotas === 1) return "Medium";
  if (completedQuotas === 2) return "Hard";
  if (completedQuotas === 3) return "Expert";
  return "Impossible";
};

const getXPForDifficulty = (diff: Difficulty): number => {
  switch (diff) {
    case "Easy":
      return 50;
    case "Medium":
      return 80;
    case "Hard":
      return 120;
    case "Expert":
      return 160;
    case "Impossible":
      return 220;
  }
};

export const WhackANumberGame: React.FC<Props> = ({
  grade,
  onSuccess,
  onClose,
}) => {
  let clickPlayer: any = null;
  let correctPlayer: any = null;
  let wrongPlayer: any = null;
  try {
    clickPlayer = useAudioPlayer(
      require("../../../assets/BiosphereQuestSoundEffectsandMusic/BiosphereQuestSFX/Button_Click_SFX.mp3"),
    );
    correctPlayer = useAudioPlayer(
      require("../../../assets/BiosphereQuestSoundEffectsandMusic/BiosphereQuestSFX/Correct_Answer_SFX.mp3"),
    );
    wrongPlayer = useAudioPlayer(
      require("../../../assets/BiosphereQuestSoundEffectsandMusic/BiosphereQuestSFX/Wrong_Answer_SFX.mp3"),
    );
  } catch {}

  const playSound = async (type: "click" | "correct" | "wrong") => {
    try {
      if (type === "click" && clickPlayer) {
        await clickPlayer.seekTo(0);
        clickPlayer.play();
      } else if (type === "correct" && correctPlayer) {
        await correctPlayer.seekTo(0);
        correctPlayer.play();
      } else if (type === "wrong" && wrongPlayer) {
        await wrongPlayer.seekTo(0);
        wrongPlayer.play();
      }
    } catch (error) {
      console.log("Audio play error:", error);
    }
  };

  const seenChallenges = useRef(new Set<string>());
  const antiCheatClickLimit = useRef<{ count: number; time: number }>({
    count: 0,
    time: Date.now(),
  });

  const [challenge, setChallenge] = useState<WhackChallenge>(() => {
    const initial = generateWhackChallenge(grade, seenChallenges.current);
    if (initial) seenChallenges.current.add(challengeKey(initial));
    return initial;
  });

  const [whacked, setWhacked] = useState<number[]>([]);
  const [activeHammerIndex, setActiveHammerIndex] = useState<number | null>(
    null,
  );
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [feedback, setFeedback] = useState("");
  const [completedQuotas, setCompletedQuotas] = useState(0);

  const tileScales = useRef<Animated.Value[]>(
    Array.from({ length: 9 }, () => new Animated.Value(1)),
  ).current;

  const hammerAnim = useRef(new Animated.Value(0)).current;

  const currentDifficulty = getDifficulty(completedQuotas);
  const currentXP = getXPForDifficulty(currentDifficulty);
  const isGameOver = lives <= 0;

  const startNextBoard = useCallback(
    (resetEntireGame = false) => {
      playSound("click");
      antiCheatClickLimit.current = { count: 0, time: Date.now() };
      if (seenChallenges.current.size > 80) {
        seenChallenges.current.clear();
      }
      let nextChallenge = generateWhackChallenge(grade, seenChallenges.current);
      let key = nextChallenge ? challengeKey(nextChallenge) : "";

      if (!nextChallenge || (key && seenChallenges.current.has(key))) {
        seenChallenges.current.clear();
        nextChallenge = generateWhackChallenge(grade, seenChallenges.current);
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
      setFeedback("🔨 💥 HAMMER SMASH! +1 Target");

      if (nextScore >= TARGET_QUOTA) {
        onSuccess(currentXP);
        setCompletedQuotas((count) => count + 1);
        setScore(0);
        startNextBoard(false);
        return;
      }
    } else {
      playSound("wrong");
      const remainingLives = lives - 1;
      setLives(remainingLives);
      setFeedback("🔨 💔 OUCH! Wrong Target! Lost 1 Life!");

      if (remainingLives <= 0) {
        setWhacked((current) => [...current, index]);
        return;
      }
    }

    setWhacked((current) => [...current, index]);

    const targetsOnBoard = challenge.gridNumbers
      .map((number, tileIndex) =>
        number % challenge.targetMultiple === 0 ? tileIndex : -1,
      )
      .filter((tileIndex) => tileIndex !== -1);
    const alreadyHit = [...whacked, index];

    if (targetsOnBoard.every((tileIndex) => alreadyHit.includes(tileIndex))) {
      startNextBoard(false);
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
            HIT {TARGET_QUOTA} TARGETS FOR +{currentXP} XP
          </Text>
          <Text style={styles.title}>Whack-a-Number 🔨</Text>
          <Text style={styles.rule}>{challenge.ruleText}</Text>
          <Text style={styles.score}>
            Progress: {score} / {TARGET_QUOTA} • Quotas Cleared:{" "}
            {completedQuotas}
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
              "Tap each target number! Avoid wrong numbers to protect your lives."}
          </Text>

          {isGameOver && (
            <View style={styles.expiredCard}>
              <Text style={styles.expiredTitle}>Game Over! 💔</Text>
              <Text style={styles.expiredCopy}>
                You ran out of lives! You cleared {completedQuotas} quota board
                {completedQuotas === 1 ? "" : "s"}.
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
