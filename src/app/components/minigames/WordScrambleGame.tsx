import { useAudioPlayer } from "expo-audio";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import {
  generateWordScramble,
  GradeLevel,
  ScrambleChallenge,
} from "../../data/questionGenerators";
import { MinigameMotion } from "./MinigameMotion";

interface Props {
  grade: GradeLevel;
  onSuccess: (xp: number) => void;
  onClose: () => void;
}

type Difficulty = "Easy" | "Medium" | "Hard" | "Expert" | "Impossible";

const ROUND_SECONDS = 90;

const getDifficulty = (solvedCount: number): Difficulty => {
  if (solvedCount <= 0) return "Easy";
  if (solvedCount <= 2) return "Medium";
  if (solvedCount <= 5) return "Hard";
  if (solvedCount <= 8) return "Expert";
  return "Impossible";
};

const getXPForDifficulty = (diff: Difficulty): number => {
  switch (diff) {
    case "Easy":
      return 30;
    case "Medium":
      return 50;
    case "Hard":
      return 80;
    case "Expert":
      return 120;
    case "Impossible":
      return 180;
  }
};

const WORD_BANK: { word: string; clue: string; minGrade: number }[] = [
  {
    word: "PLANT",
    clue: "A living organism that absorbs water and sunlight",
    minGrade: 1,
  },
  { word: "SOLAR", clue: "Relating to or determined by the sun", minGrade: 1 },
  { word: "EARTH", clue: "The third planet from the sun", minGrade: 1 },
  {
    word: "ANGLE",
    clue: "The space between two intersecting lines",
    minGrade: 2,
  },
  { word: "FORCE", clue: "A push or pull upon an object", minGrade: 2 },
  {
    word: "ORBIT",
    clue: "The curved path of a celestial object around a star",
    minGrade: 2,
  },
  { word: "DIGIT", clue: "Any of the numerals from 0 to 9", minGrade: 1 },
  {
    word: "PRISM",
    clue: "A solid geometric figure with two parallel bases",
    minGrade: 3,
  },
  {
    word: "CELLS",
    clue: "The smallest structural and functional unit of organisms",
    minGrade: 3,
  },
  {
    word: "FOSSIL",
    clue: "The remains or impression of a prehistoric organism",
    minGrade: 3,
  },
  {
    word: "GRAVITY",
    clue: "The force that attracts a body toward the center of the earth",
    minGrade: 4,
  },
  {
    word: "FRACTION",
    clue: "A numerical quantity that is not a whole number",
    minGrade: 4,
  },
  {
    word: "ECOSYSTEM",
    clue: "A biological community of interacting organisms",
    minGrade: 4,
  },
  {
    word: "EQUATION",
    clue: "A statement that the values of two expressions are equal",
    minGrade: 5,
  },
  { word: "MOLECULE", clue: "A group of atoms bonded together", minGrade: 5 },
  {
    word: "PERIMETER",
    clue: "The continuous line forming the boundary of a closed geometric figure",
    minGrade: 5,
  },
  {
    word: "PHOTOSYNTHESIS",
    clue: "Process used by plants to convert light into energy",
    minGrade: 6,
  },
  {
    word: "HYPOTHESIS",
    clue: "A proposed explanation made on the basis of limited evidence",
    minGrade: 6,
  },
];

const shuffleString = (str: string): string[] => {
  const arr = str.split("");
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join("") === str ? shuffleString(str) : arr;
};

const getUniqueWordScramble = (
  grade: GradeLevel,
  seenSet: Set<string>,
): ScrambleChallenge => {
  const candidate = generateWordScramble(grade, seenSet);
  if (candidate && !seenSet.has(candidate.targetWord)) {
    return candidate;
  }

  const filtered = WORD_BANK.filter(
    (item) => item.minGrade <= grade && !seenSet.has(item.word),
  );

  if (filtered.length > 0) {
    const picked = filtered[Math.floor(Math.random() * filtered.length)];
    return {
      targetWord: picked.word,
      clue: picked.clue,
      jumbledLetters: shuffleString(picked.word),
    };
  }

  seenSet.clear();
  const fallback = WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
  return {
    targetWord: fallback.word,
    clue: fallback.clue,
    jumbledLetters: shuffleString(fallback.word),
  };
};

export const WordScrambleGame: React.FC<Props> = ({
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
        if (typeof clickPlayer.seekTo === "function")
          await clickPlayer.seekTo(0);
        await clickPlayer.play();
      } else if (type === "correct" && correctPlayer) {
        if (typeof correctPlayer.seekTo === "function")
          await correctPlayer.seekTo(0);
        await correctPlayer.play();
      } else if (type === "wrong" && wrongPlayer) {
        if (typeof wrongPlayer.seekTo === "function")
          await wrongPlayer.seekTo(0);
        await wrongPlayer.play();
      }
    } catch (e) {
      console.log("SFX Play Error:", e);
    }
  };

  const seenChallenges = useRef(new Set<string>());
  const antiCheatTimestamp = useRef<number>(Date.now());

  const [challenge, setChallenge] = useState<ScrambleChallenge>(() => {
    const initial = getUniqueWordScramble(grade, seenChallenges.current);
    seenChallenges.current.add(initial.targetWord);
    return initial;
  });

  const [pickedTiles, setPickedTiles] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [message, setMessage] = useState("");
  const [finished, setFinished] = useState(false);
  const [solvedCount, setSolvedCount] = useState(0);
  const [totalXp, setTotalXp] = useState(0);

  const [timerProgress] = useState(() => new Animated.Value(1));
  const [resultEntrance] = useState(() => new Animated.Value(0));
  const [tileScales, setTileScales] = useState(() =>
    challenge.jumbledLetters.map(() => new Animated.Value(1)),
  );

  const currentDifficulty = getDifficulty(solvedCount);
  const currentXP = getXPForDifficulty(currentDifficulty);
  const answer = pickedTiles
    .map((index) => challenge.jumbledLetters[index])
    .join("");

  const loadNextWord = useCallback(() => {
    antiCheatTimestamp.current = Date.now();
    if (seenChallenges.current.size > 80) {
      seenChallenges.current.clear();
    }
    const nextChallenge = getUniqueWordScramble(grade, seenChallenges.current);
    seenChallenges.current.add(nextChallenge.targetWord);

    setChallenge(nextChallenge);
    setTileScales(
      nextChallenge.jumbledLetters.map(() => new Animated.Value(1)),
    );
    setPickedTiles([]);
    setMessage("");
  }, [grade]);

  useEffect(() => {
    if (finished) return;
    const timer = setInterval(() => {
      setTimeLeft((seconds) => {
        if (seconds <= 1) {
          clearInterval(timer);
          setFinished(true);
          return 0;
        }
        return seconds - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [finished]);

  useEffect(() => {
    Animated.timing(timerProgress, {
      toValue: timeLeft / ROUND_SECONDS,
      duration: 950,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  }, [timeLeft, timerProgress]);

  useEffect(() => {
    if (finished) {
      resultEntrance.setValue(0);
      Animated.spring(resultEntrance, {
        toValue: 1,
        friction: 7,
        tension: 60,
        useNativeDriver: true,
      }).start();
    }
  }, [finished, resultEntrance]);

  const animateTile = (index: number, selected: boolean) => {
    playSound("click");
    if (!tileScales[index]) return;
    Animated.sequence([
      Animated.timing(tileScales[index], {
        toValue: selected ? 0.9 : 1.08,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.spring(tileScales[index], {
        toValue: 1,
        friction: 5,
        tension: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const toggleTile = (index: number) => {
    if (finished) return;
    const wasSelected = pickedTiles.includes(index);
    animateTile(index, !wasSelected);
    setPickedTiles((picked) =>
      wasSelected
        ? picked.filter((tile) => tile !== index)
        : [...picked, index],
    );
    setMessage("");
  };

  const checkAnswer = () => {
    playSound("click");
    if (finished) return;

    if (Date.now() - antiCheatTimestamp.current < 250) {
      setMessage("Anti-cheat: Action too fast.");
      return;
    }
    antiCheatTimestamp.current = Date.now();

    if (answer.length !== challenge.targetWord.length) {
      setMessage("Use every letter tile to make the word.");
      return;
    }

    if (answer === challenge.targetWord) {
      playSound("correct");
      onSuccess(currentXP);
      setTotalXp((prev) => prev + currentXP);
      setSolvedCount((count) => count + 1);
      setMessage(`Correct! +${currentXP} XP`);

      setTimeout(() => {
        loadNextWord();
      }, 600);
    } else {
      playSound("wrong");
      setMessage("Not quite. Rearrange the tiles and try again.");
    }
  };

  const restartGame = () => {
    playSound("click");
    antiCheatTimestamp.current = Date.now();
    seenChallenges.current.clear();
    const initial = getUniqueWordScramble(grade, seenChallenges.current);
    seenChallenges.current.add(initial.targetWord);

    setChallenge(initial);
    setTileScales(initial.jumbledLetters.map(() => new Animated.Value(1)));
    setPickedTiles([]);
    setTimeLeft(ROUND_SECONDS);
    timerProgress.setValue(1);
    setMessage("");
    setFinished(false);
    setSolvedCount(0);
    setTotalXp(0);
  };

  return (
    <LinearGradient colors={["#0a0b18", "#2b2b5c"]} style={styles.background}>
      <MinigameMotion
        key={`${challenge.targetWord}-${solvedCount}`}
        style={styles.container}
      >
        {finished ? (
          <Animated.View
            style={[
              styles.resultCard,
              {
                opacity: resultEntrance,
                transform: [
                  {
                    translateY: resultEntrance.interpolate({
                      inputRange: [0, 1],
                      outputRange: [18, 0],
                    }),
                  },
                  {
                    scale: resultEntrance.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.96, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.title}>⏰ Round Over!</Text>
            <Text style={styles.subtitle}>
              You unscrambled {solvedCount} word{solvedCount === 1 ? "" : "s"}{" "}
              before time ran out!
            </Text>
            {totalXp > 0 && <Text style={styles.reward}>+{totalXp} XP</Text>}
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={restartGame}
            >
              <Text style={styles.buttonText}>Play Again ↻</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                playSound("click");
                onClose();
              }}
            >
              <Text style={styles.backText}>Return to Games</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <>
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
                Grade {grade} • {currentDifficulty.toUpperCase()} • Solved:{" "}
                {solvedCount}
              </Text>
              <Text style={[styles.timer, timeLeft <= 15 && styles.warning]}>
                ⏱ {timeLeft}s
              </Text>
            </View>
            <View style={styles.timerTrack}>
              <Animated.View
                style={[
                  styles.timerFill,
                  {
                    width: timerProgress.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0%", "100%"],
                    }),
                    backgroundColor: timerProgress.interpolate({
                      inputRange: [0, 0.25, 1],
                      outputRange: ["#fb7185", "#facc15", "#4ade80"],
                    }),
                  },
                ]}
              />
            </View>
            <View style={styles.content}>
              <Text style={styles.eyebrow}>
                LEVEL {solvedCount + 1} • {currentDifficulty.toUpperCase()} (+
                {currentXP} XP)
              </Text>
              <Text style={styles.title}>Unscramble the word</Text>
              <Text style={styles.clue}>{challenge.clue}</Text>
              <View style={styles.answerRow}>
                {challenge.targetWord.split("").map((_, index) => {
                  const tileIndex = pickedTiles[index];
                  return (
                    <TouchableOpacity
                      key={`slot-${index}`}
                      style={[
                        styles.answerSlot,
                        tileIndex !== undefined && styles.filledSlot,
                      ]}
                      onPress={() =>
                        tileIndex !== undefined && toggleTile(tileIndex)
                      }
                    >
                      <Text style={styles.answerLetter}>
                        {tileIndex === undefined
                          ? "·"
                          : challenge.jumbledLetters[tileIndex]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <View style={styles.tiles}>
                {challenge.jumbledLetters.map((letter, index) => {
                  const selected = pickedTiles.includes(index);
                  const scaleAnim = tileScales[index] || 1;
                  return (
                    <Animated.View
                      key={`${letter}-${index}`}
                      style={{ transform: [{ scale: scaleAnim }] }}
                    >
                      <TouchableOpacity
                        style={[styles.tile, selected && styles.tileUsed]}
                        onPress={() => toggleTile(index)}
                        disabled={selected}
                      >
                        <Text style={styles.tileText}>
                          {selected ? " " : letter}
                        </Text>
                      </TouchableOpacity>
                    </Animated.View>
                  );
                })}
              </View>
              {!!message && <Text style={styles.feedback}>{message}</Text>}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => {
                    playSound("click");
                    setPickedTiles([]);
                    setMessage("");
                  }}
                >
                  <Text style={styles.buttonText}>Clear</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={checkAnswer}
                >
                  <Text style={styles.buttonText}>Check Word ✓</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.rewardHint}>
                Solve words quickly to earn +{currentXP} XP per word
              </Text>
            </View>
          </>
        )}
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
    justifyContent: "space-between",
    alignItems: "center",
  } as ViewStyle,
  timerTrack: {
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginHorizontal: 16,
    borderRadius: 8,
    overflow: "hidden",
  } as ViewStyle,
  timerFill: { height: "100%", borderRadius: 8 } as ViewStyle,
  backText: { color: "#38bdf8", fontSize: 14, fontWeight: "800" } as TextStyle,
  grade: { color: "#e2e8f0", fontSize: 11, fontWeight: "800" } as TextStyle,
  timer: { color: "#4ade80", fontSize: 13, fontWeight: "900" } as TextStyle,
  warning: { color: "#fb7185" } as TextStyle,
  content: { flex: 1, justifyContent: "center", padding: 20 } as ViewStyle,
  eyebrow: {
    color: "#4ade80",
    fontSize: 11,
    textAlign: "center",
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 8,
  } as TextStyle,
  title: {
    color: "#fff",
    fontSize: 23,
    textAlign: "center",
    fontWeight: "900",
    marginBottom: 16,
  } as TextStyle,
  clue: {
    color: "#dbeafe",
    textAlign: "center",
    fontSize: 15,
    fontWeight: "700",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  } as TextStyle,
  answerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 6,
    marginBottom: 20,
  } as ViewStyle,
  answerSlot: {
    width: 34,
    height: 42,
    borderBottomWidth: 3,
    borderBottomColor: "#38bdf8",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 7,
  } as ViewStyle,
  filledSlot: { backgroundColor: "rgba(56, 189, 248, 0.25)" } as ViewStyle,
  answerLetter: { color: "#fff", fontSize: 21, fontWeight: "900" } as TextStyle,
  tiles: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 9,
    marginBottom: 14,
  } as ViewStyle,
  tile: {
    width: 48,
    height: 52,
    borderRadius: 12,
    backgroundColor: "#166534",
    borderWidth: 1,
    borderColor: "#4ade80",
    alignItems: "center",
    justifyContent: "center",
  } as ViewStyle,
  tileUsed: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderColor: "rgba(255, 255, 255, 0.2)",
  } as ViewStyle,
  tileText: { color: "#f0fdf4", fontSize: 21, fontWeight: "900" } as TextStyle,
  feedback: {
    color: "#facc15",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  } as TextStyle,
  actions: { flexDirection: "row", gap: 10, marginTop: 4 } as ViewStyle,
  primaryButton: {
    flex: 1,
    backgroundColor: "#16a34a",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  } as ViewStyle,
  secondaryButton: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 22,
    justifyContent: "center",
    borderRadius: 12,
    alignItems: "center",
  } as ViewStyle,
  buttonText: { color: "#fff", fontSize: 14, fontWeight: "900" } as TextStyle,
  rewardHint: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 18,
  } as TextStyle,
  resultCard: {
    margin: 22,
    padding: 24,
    borderRadius: 22,
    backgroundColor: "rgba(19, 27, 46, 0.9)",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  } as ViewStyle,
  subtitle: {
    color: "#cbd5e1",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 14,
  } as TextStyle,
  reward: {
    color: "#facc15",
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 18,
  } as TextStyle,
  backButton: { padding: 14, marginTop: 4 } as ViewStyle,
});
