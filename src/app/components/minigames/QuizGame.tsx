import { useAudioPlayer } from "expo-audio";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useRef, useState } from "react";
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

const ROUND_TIME_SECONDS = 30; // 30-second countdown timer per round
const TARGET_QUOTA = 5; // 5 total questions per round target

const getDifficulty = (completedQuotas: number): Difficulty => {
  if (completedQuotas <= 0) return "Easy";
  if (completedQuotas === 1) return "Medium";
  if (completedQuotas === 2) return "Hard";
  if (completedQuotas === 3) return "Expert";
  return "Impossible";
};

// Exact XP calculation: 30 XP per correct answer only
const getXPForScore = (score: number): number => {
  return score * 30;
};

interface QuizQuestion {
  questionText: string;
  optionsList: string[];
  correctAnswer: string;
}

// Procedural generator to guarantee virtually infinite, non-repeating MATATAG-aligned questions
const generateInfiniteCurricularQuestion = (
  grade: GradeLevel,
  seenSet: React.MutableRefObject<string[]>,
): QuizQuestion => {
  let questionText = "";
  let correctAnswer = "";
  let optionsList: string[] = [];

  let attempts = 0;
  while (attempts < 20) {
    if (grade === 1) {
      const a = Math.floor(Math.random() * 20) + 1;
      const b = Math.floor(Math.random() * 10) + 1;
      const type = Math.floor(Math.random() * 3);
      if (type === 0) {
        const sum = a + b;
        questionText = `MATATAG Grade 1: What is the sum of ${a} and ${b}?`;
        correctAnswer = sum.toString();
      } else if (type === 1) {
        const max = Math.max(a, b);
        const min = Math.min(a, b);
        const diff = max - min;
        questionText = `MATATAG Grade 1: What is ${max} minus ${min}?`;
        correctAnswer = diff.toString();
      } else {
        const nextNum = a + 1;
        questionText = `MATATAG Grade 1: What number comes right after ${a}?`;
        correctAnswer = nextNum.toString();
      }
    } else if (grade === 2) {
      const a = Math.floor(Math.random() * 50) + 10;
      const b = Math.floor(Math.random() * 30) + 5;
      const type = Math.floor(Math.random() * 3);
      if (type === 0) {
        const sum = a + b;
        questionText = `MATATAG Grade 2: What is the sum of ${a} and ${b}?`;
        correctAnswer = sum.toString();
      } else if (type === 1) {
        const factor1 = Math.floor(Math.random() * 9) + 2;
        const factor2 = Math.floor(Math.random() * 9) + 2;
        const prod = factor1 * factor2;
        questionText = `MATATAG Grade 2: Find the product of ${factor1} multiplied by ${factor2} (${factor1} x ${factor2}):`;
        correctAnswer = prod.toString();
      } else {
        const max = Math.max(a, b);
        const min = Math.min(a, b);
        const diff = max - min;
        questionText = `MATATAG Grade 2: Subtract ${min} from ${max} (${max} - ${min}):`;
        correctAnswer = diff.toString();
      }
    } else if (grade === 3) {
      const a = Math.floor(Math.random() * 100) + 50;
      const b = Math.floor(Math.random() * 50) + 10;
      const type = Math.floor(Math.random() * 3);
      if (type === 0) {
        const factor1 = Math.floor(Math.random() * 10) + 3;
        const factor2 = Math.floor(Math.random() * 10) + 3;
        const prod = factor1 * factor2;
        questionText = `MATATAG Grade 3: What is the product of ${factor1} and ${factor2}?`;
        correctAnswer = prod.toString();
      } else if (type === 1) {
        const sum = a + b;
        questionText = `MATATAG Grade 3: What is the total sum of ${a} and ${b}?`;
        correctAnswer = sum.toString();
      } else {
        const denom = Math.floor(Math.random() * 6) + 3;
        const numer = Math.floor(Math.random() * (denom - 1)) + 1;
        questionText = `MATATAG Grade 3: Which of the following fractions is equivalent to ${numer}/${denom} parts?`;
        correctAnswer = `${numer}/${denom}`;
      }
    } else if (grade === 4) {
      const base = Math.floor(Math.random() * 20) + 5;
      const multiplier = Math.floor(Math.random() * 10) + 2;
      const type = Math.floor(Math.random() * 3);
      if (type === 0) {
        const product = base * multiplier;
        questionText = `MATATAG Grade 4: What is the Least Common Multiple/Product correlation for factors ${base} and ${multiplier}?`;
        correctAnswer = product.toString();
      } else if (type === 1) {
        const length = Math.floor(Math.random() * 15) + 5;
        const width = Math.floor(Math.random() * 10) + 3;
        const area = length * width;
        questionText = `MATATAG Grade 4: What is the area of a rectangle with a length of ${length} cm and width of ${width} cm?`;
        correctAnswer = `${area} sq cm`;
      } else {
        const dec1 = (Math.random() * 5).toFixed(2);
        const dec2 = (Math.random() * 5).toFixed(2);
        const sumDec = (parseFloat(dec1) + parseFloat(dec2)).toFixed(2);
        questionText = `MATATAG Grade 4: Add the decimals: ${dec1} + ${dec2} =`;
        correctAnswer = sumDec;
      }
    } else if (grade === 5) {
      const side = Math.floor(Math.random() * 8) + 3;
      const type = Math.floor(Math.random() * 3);
      if (type === 0) {
        const volume = side * side * side;
        questionText = `MATATAG Grade 5: Find the volume of a cube with a side length of ${side} cm (V = s x s x s):`;
        correctAnswer = `${volume} cubic cm`;
      } else if (type === 1) {
        const principal = (Math.floor(Math.random() * 50) + 10) * 100;
        const interest = principal * 0.05;
        questionText = `MATATAG Grade 5: How much is the simple interest for 1 year on P${principal} at a 5% interest rate?`;
        correctAnswer = `P${interest}`;
      } else {
        const num = Math.floor(Math.random() * 4) + 1;
        const den = 4;
        const pct =
          num === 1 ? "25%" : num === 2 ? "50%" : num === 3 ? "75%" : "100%";
        questionText = `MATATAG Grade 5: What is the percentage equivalent of ${num}/${den}?`;
        correctAnswer = pct;
      }
    } else {
      const xVal = Math.floor(Math.random() * 10) + 2;
      const coeff = Math.floor(Math.random() * 5) + 2;
      const constant = Math.floor(Math.random() * 20) + 5;
      const targetVal = coeff * xVal + constant;
      const type = Math.floor(Math.random() * 2);
      if (type === 0) {
        questionText = `MATATAG Grade 6: Solve for x in the algebraic equation: ${coeff}x + ${constant} = ${targetVal}`;
        correctAnswer = `x = ${xVal}`;
      } else {
        const radius = Math.floor(Math.random() * 7) + 3;
        const area = Math.round((22 / 7) * radius * radius);
        questionText = `MATATAG Grade 6: Find the area of a circle with a radius of ${radius} cm (Use π = 22/7):`;
        correctAnswer = `${area} sq cm`;
      }
    }

    if (!seenSet.current.includes(questionText)) {
      seenSet.current.push(questionText);
      break;
    }
    attempts++;
  }

  const wrongOptionsSet = new Set<string>();
  const correctNum = parseFloat(correctAnswer.replace(/[^0-9.-]+/g, "")) || 10;
  while (wrongOptionsSet.size < 3) {
    const offset =
      (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 5) + 1);
    let fakeVal: string | number = correctNum + offset;
    if (correctAnswer.includes("x =")) {
      fakeVal = `x = ${Math.max(1, Math.round(correctNum + offset))}`;
    } else if (correctAnswer.includes("sq cm")) {
      fakeVal = `${Math.max(1, Math.round(correctNum + offset * 3))} sq cm`;
    } else if (correctAnswer.includes("cubic cm")) {
      fakeVal = `${Math.max(1, Math.round(correctNum + offset * 5))} cubic cm`;
    } else if (correctAnswer.includes("P")) {
      fakeVal = `P${Math.max(10, Math.round(correctNum + offset * 10))}`;
    } else if (correctAnswer.includes("/")) {
      fakeVal = `${Math.max(1, Math.abs(Math.round(correctNum + offset)))}/4`;
    } else if (correctAnswer.includes(".")) {
      fakeVal = Math.max(
        0.1,
        parseFloat((correctNum + offset * 0.1).toFixed(2)),
      ).toString();
    } else {
      fakeVal = Math.max(0, Math.round(correctNum + offset)).toString();
    }

    if (fakeVal !== correctAnswer) {
      wrongOptionsSet.add(fakeVal.toString());
    }
  }

  optionsList = [correctAnswer, ...Array.from(wrongOptionsSet)].sort(
    () => Math.random() - 0.5,
  );

  return {
    questionText,
    optionsList,
    correctAnswer,
  };
};

const generateCurricularWhackChallenge = (
  grade: GradeLevel,
  seenSet: React.MutableRefObject<string[]>,
): WhackChallenge & { questionData?: QuizQuestion } => {
  const questionObj = generateInfiniteCurricularQuestion(grade, seenSet);

  return {
    ruleText: questionObj.questionText,
    targetMultiple: 1,
    gridNumbers: [0, 1, 2, 3] as any,
    questionData: questionObj,
  };
};

export const QuizGame: React.FC<Props> = ({ grade, onSuccess, onClose }) => {
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

  const seenChallenges = useRef<string[]>([]);
  const antiCheatClickLimit = useRef<{ count: number; time: number }>({
    count: 0,
    time: 0,
  });

  const [challenge, setChallenge] = useState<
    WhackChallenge & { questionData?: QuizQuestion }
  >(() => {
    return generateCurricularWhackChallenge(grade, seenChallenges);
  });

  const [whacked, setWhacked] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME_SECONDS);
  const [feedback, setFeedback] = useState("");
  const [completedQuotas, setCompletedQuotas] = useState(0);

  const [tileScales] = useState(() =>
    Array.from({ length: 4 }, () => new Animated.Value(1)),
  );

  const currentDifficulty = getDifficulty(completedQuotas);
  const earnedXP = getXPForScore(score);
  const isGameOver = timeLeft <= 0 || score >= TARGET_QUOTA;

  // Timer countdown effect
  useEffect(() => {
    if (isGameOver) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameOver]);

  const startNextBoard = useCallback(
    (resetEntireGame = false) => {
      playSound("click");
      antiCheatClickLimit.current = { count: 0, time: Date.now() };

      let nextChallenge = generateCurricularWhackChallenge(
        grade,
        seenChallenges,
      );

      tileScales.forEach((anim) => anim.setValue(1));
      setChallenge(nextChallenge);
      setWhacked([]);
      setFeedback("");

      if (resetEntireGame) {
        setTimeLeft(ROUND_TIME_SECONDS);
        setCompletedQuotas(0);
        setScore(0);
        seenChallenges.current = [];
      }
    },
    [grade, tileScales],
  );

  const triggerButtonPress = (index: number) => {
    const scaleAnim = tileScales[index] || new Animated.Value(1);

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const whack = (index: number) => {
    if (whacked.includes(index) || isGameOver || !challenge.questionData)
      return;

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

    triggerButtonPress(index);

    const selectedOption = challenge.questionData.optionsList[index];
    const isTarget = selectedOption === challenge.questionData.correctAnswer;

    if (isTarget) {
      playSound("correct");
      const nextScore = score + 1;
      setScore(nextScore);
      const calculatedXp = getXPForScore(nextScore);
      setFeedback(`✨ CORRECT! +30 XP (Total: +${calculatedXp}XP)`);
      setWhacked((current) => [...current, index]);

      if (nextScore >= TARGET_QUOTA) {
        onSuccess(calculatedXp);
        setCompletedQuotas((count) => count + 1);
      } else {
        setTimeout(() => {
          startNextBoard(false);
        }, 1200);
      }
    } else {
      playSound("wrong");
      // Score and XP remain unchanged on incorrect answer (+0 XP added)
      const currentXp = getXPForScore(score);
      setFeedback(
        `❌ INCORRECT! Correct answer: ${challenge.questionData.correctAnswer} (+0 XP)`,
      );
      setWhacked((current) => [...current, index]);

      setTimeout(() => {
        startNextBoard(false);
      }, 1600);
    }
  };

  return (
    <LinearGradient colors={["#0a0b18", "#2b2b5c"]} style={styles.background}>
      <MinigameMotion
        key={`${challenge.ruleText}-${completedQuotas}`}
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

          <Text style={styles.timerText}>⏳ {timeLeft}s</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.eyebrow}>
            SCORE: {score}/5 ({earnedXP > 0 ? `+${earnedXP}XP` : "+00XP"}) • +30
            XP PER CORRECT ANSWER
          </Text>

          <Text style={styles.title}>MATATAG Quiz Challenge 🧠</Text>

          <Text style={styles.rule}>{challenge.ruleText}</Text>

          <Text style={styles.score}>
            Progress: {score} / {TARGET_QUOTA} • Reward: +{earnedXP} XP
          </Text>

          <View style={styles.grid}>
            {challenge.questionData?.optionsList.map((optionText, index) => {
              const isTarget =
                optionText === challenge.questionData?.correctAnswer;
              const selected = whacked.includes(index);
              const scaleAnim = tileScales[index] || 1;

              return (
                <Animated.View
                  key={`${index}-${optionText}`}
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
                    <Text
                      style={[
                        styles.number,
                        selected &&
                          (isTarget ? styles.hitText : styles.missText),
                      ]}
                      numberOfLines={2}
                    >
                      {optionText}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>

          <Text style={styles.feedback}>
            {feedback ||
              "Select the correct answer based on the official MATATAG curriculum book!"}
          </Text>

          {isGameOver && (
            <View style={styles.expiredCard}>
              <Text style={styles.expiredTitle}>
                {score >= TARGET_QUOTA ? "Round Complete! 🎉" : "Time's Up! ⏱️"}
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
  timerText: { color: "#facc15", fontSize: 13, fontWeight: "900" } as TextStyle,
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
    fontSize: 15,
    fontWeight: "800",
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
  holeWrapper: { width: "47%", aspectRatio: 2 } as ViewStyle,
  hole: {
    flex: 1,
    width: "100%",
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 2,
    borderColor: "#38bdf8",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    overflow: "hidden",
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
  number: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
  } as TextStyle,
  hitText: { color: "#4ade80", fontSize: 15 } as TextStyle,
  missText: { color: "#fb7185", fontSize: 15 } as TextStyle,
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
