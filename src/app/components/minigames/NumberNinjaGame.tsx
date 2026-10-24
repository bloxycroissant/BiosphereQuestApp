import { useAudioPlayer } from "expo-audio";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import {
  generateNinjaProblem,
  GradeLevel,
  NinjaProblem,
} from "../../data/questionGenerators";
import { MinigameMotion } from "./MinigameMotion";

interface Props {
  grade: GradeLevel;
  onSuccess: (xp: number) => void;
  onClose: () => void;
}

type Difficulty = "Easy" | "Medium" | "Hard" | "Expert" | "Impossible";

const TOTAL_GAME_SECONDS = 90;

const getDifficulty = (questionNumber: number): Difficulty => {
  if (questionNumber <= 3) return "Easy";
  if (questionNumber <= 7) return "Medium";
  if (questionNumber <= 11) return "Hard";
  if (questionNumber <= 15) return "Expert";
  return "Impossible";
};

const getXPForDifficulty = (diff: Difficulty): number => {
  switch (diff) {
    case "Easy":
      return 30;
    case "Medium":
      return 50;
    case "Hard":
      return 75;
    case "Expert":
      return 100;
    case "Impossible":
      return 150;
  }
};

export const NumberNinjaGame: React.FC<Props> = ({
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

  const seenQuestions = useRef(new Set<string>());
  const antiCheatTimestamp = useRef<number>(Date.now());

  const [question, setQuestion] = useState<NinjaProblem>(() => {
    const initial = generateNinjaProblem(grade, seenQuestions.current);
    if (initial?.prompt) seenQuestions.current.add(initial.prompt);
    return initial;
  });

  const [questionNumber, setQuestionNumber] = useState(1);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(TOTAL_GAME_SECONDS);
  const [roundExpired, setRoundExpired] = useState(false);

  const currentDifficulty = getDifficulty(questionNumber);
  const currentXP = getXPForDifficulty(currentDifficulty);

  useEffect(() => {
    if (roundExpired) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setRoundExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [roundExpired]);

  const answer = (value: number) => {
    if (selected !== null || roundExpired) return;

    if (Date.now() - antiCheatTimestamp.current < 200) return;
    antiCheatTimestamp.current = Date.now();

    setSelected(value);
    if (value === question.correctAnswer) {
      playSound("correct");
      setScore((current) => current + 1);
      onSuccess(currentXP);
    } else {
      playSound("wrong");
    }
  };

  const next = () => {
    playSound("click");
    if (roundExpired) return;
    antiCheatTimestamp.current = Date.now();

    if (seenQuestions.current.size > 150) {
      seenQuestions.current.clear();
    }

    let nextQuestion = generateNinjaProblem(grade, seenQuestions.current);

    if (
      !nextQuestion ||
      (nextQuestion.prompt && seenQuestions.current.has(nextQuestion.prompt))
    ) {
      seenQuestions.current.clear();
      nextQuestion = generateNinjaProblem(grade, seenQuestions.current);
    }

    if (nextQuestion?.prompt) {
      seenQuestions.current.add(nextQuestion.prompt);
    }

    setQuestion(nextQuestion);
    setQuestionNumber((number) => number + 1);
    setSelected(null);
  };

  const restartGame = () => {
    playSound("click");
    antiCheatTimestamp.current = Date.now();
    seenQuestions.current.clear();
    const nextQuestion = generateNinjaProblem(grade, seenQuestions.current);
    if (nextQuestion?.prompt) seenQuestions.current.add(nextQuestion.prompt);

    setQuestion(nextQuestion);
    setQuestionNumber(1);
    setScore(0);
    setSelected(null);
    setTimeLeft(TOTAL_GAME_SECONDS);
    setRoundExpired(false);
  };

  return (
    <LinearGradient colors={["#0a0b18", "#2b2b5c"]} style={styles.background}>
      <MinigameMotion
        key={`challenge-${questionNumber}`}
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
          <Text style={styles.progress}>
            Grade {grade} • #{questionNumber} [{currentDifficulty.toUpperCase()}
            ]
          </Text>
          <Text style={[styles.timer, timeLeft <= 15 && styles.warning]}>
            ⏱ {timeLeft}s
          </Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.eyebrow}>
            ⚡ +{currentXP} XP PER CORRECT ANSWER
          </Text>
          <Text style={styles.title}>Number Ninja</Text>
          <Text style={styles.prompt}>{question.prompt}</Text>

          <View style={styles.options}>
            {question.options.map((option) => {
              const correct =
                selected !== null && option === question.correctAnswer;
              const incorrect =
                selected === option && selected !== question.correctAnswer;
              return (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.option,
                    correct && styles.correctOption,
                    incorrect && styles.incorrectOption,
                  ]}
                  onPress={() => answer(option)}
                  disabled={selected !== null || roundExpired}
                >
                  <Text style={styles.optionText}>{option}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {selected !== null && !roundExpired && (
            <View style={styles.feedback}>
              <Text style={styles.feedbackText}>
                {selected === question.correctAnswer
                  ? `Bullseye! +${currentXP} XP`
                  : `The answer was ${question.correctAnswer}.`}
              </Text>
              <TouchableOpacity style={styles.primaryButton} onPress={next}>
                <Text style={styles.buttonText}>Next Challenge →</Text>
              </TouchableOpacity>
            </View>
          )}

          {roundExpired && (
            <View style={styles.feedback}>
              <Text style={styles.feedbackText}>
                Time's Up! You scored {score} point{score === 1 ? "" : "s"}.
              </Text>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={restartGame}
              >
                <Text style={styles.buttonText}>Play Again ↻</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.score}>Score: {score}</Text>
        </View>
      </MinigameMotion>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1 } as ViewStyle,
  container: { flex: 1, backgroundColor: "transparent" } as ViewStyle,
  topBar: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  } as ViewStyle,
  backText: { color: "#38bdf8", fontSize: 14, fontWeight: "800" } as TextStyle,
  progress: { color: "#cbd5e1", fontSize: 12, fontWeight: "800" } as TextStyle,
  timer: { color: "#facc15", fontSize: 13, fontWeight: "900" } as TextStyle,
  warning: { color: "#fb7185" } as TextStyle,
  content: { flex: 1, justifyContent: "center", padding: 20 } as ViewStyle,
  eyebrow: {
    color: "#facc15",
    fontSize: 11,
    textAlign: "center",
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 8,
  } as TextStyle,
  title: {
    color: "#fff",
    fontSize: 24,
    textAlign: "center",
    fontWeight: "900",
    marginBottom: 20,
  } as TextStyle,
  prompt: {
    color: "#fef3c7",
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 18,
    padding: 26,
    marginBottom: 20,
    overflow: "hidden",
  } as TextStyle,
  options: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  } as ViewStyle,
  option: {
    width: "47%",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 14,
    padding: 18,
    alignItems: "center",
  } as ViewStyle,
  correctOption: {
    borderColor: "#22c55e",
    backgroundColor: "rgba(34, 197, 94, 0.25)",
  } as ViewStyle,
  incorrectOption: {
    borderColor: "#fb7185",
    backgroundColor: "rgba(251, 113, 133, 0.25)",
  } as ViewStyle,
  optionText: { color: "#fff", fontSize: 22, fontWeight: "900" } as TextStyle,
  feedback: {
    marginTop: 18,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    padding: 14,
    borderRadius: 14,
  } as ViewStyle,
  feedbackText: {
    color: "#e2e8f0",
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 12,
  } as TextStyle,
  primaryButton: {
    backgroundColor: "#16a34a",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  } as ViewStyle,
  buttonText: { color: "#fff", fontSize: 14, fontWeight: "900" } as TextStyle,
  score: {
    color: "#94a3b8",
    fontWeight: "800",
    textAlign: "center",
    marginTop: 20,
  } as TextStyle,
  subtitle: {
    color: "#cbd5e1",
    marginBottom: 14,
    fontSize: 15,
    fontWeight: "700",
  } as TextStyle,
  reward: {
    color: "#facc15",
    fontSize: 26,
    fontWeight: "900",
    marginBottom: 22,
  } as TextStyle,
});
