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
import {
  generateMemoryPairs,
  GradeLevel,
  MemoryMatchCard,
  Subject,
} from "../../data/questionGenerators";
import { MinigameMotion } from "./MinigameMotion";

interface Props {
  grade: GradeLevel;
  subject: Subject;
  onSuccess: (xp: number) => void;
  onClose: () => void;
}

type Difficulty = "Easy" | "Medium" | "Hard" | "Expert" | "Impossible";

const ROUND_SECONDS = 90;

const getDifficulty = (completedBoards: number): Difficulty => {
  if (completedBoards <= 0) return "Easy";
  if (completedBoards === 1) return "Medium";
  if (completedBoards === 2) return "Hard";
  if (completedBoards === 3) return "Expert";
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
      return 170;
    case "Impossible":
      return 250;
  }
};

export const MemoryMatchGame: React.FC<Props> = ({
  grade,
  subject,
  onSuccess,
  onClose,
}) => {
  const pageTurnPlayer = useAudioPlayer(
    require("../../../../assets/BiosphereQuestSoundEffectsandMusic/PageTurn.mp3"),
  );

  const playPageTurn = async () => {
    try {
      if (pageTurnPlayer) {
        if (typeof pageTurnPlayer.seekTo === "function") {
          await pageTurnPlayer.seekTo(0);
        }
        await pageTurnPlayer.play();
      }
    } catch (e) {
      console.log("SFX Play Error:", e);
    }
  };

  const seenBoards = useRef(new Set<string>());
  const antiCheatClickLimit = useRef<{ count: number; time: number }>({
    count: 0,
    time: Date.now(),
  });

  const [cards, setCards] = useState<MemoryMatchCard[]>(() => {
    const initialCards = generateMemoryPairs(
      grade,
      seenBoards.current,
      subject,
    );
    const key = boardKey(initialCards);
    if (key) seenBoards.current.add(key);
    return initialCards;
  });

  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [completedBoards, setCompletedBoards] = useState(0);
  const [roundExpired, setRoundExpired] = useState(false);

  // Animated values for each card's 3D flip effect (0 = face down, 1 = flipped)
  const [tileFlips] = useState(() =>
    Array.from({ length: 16 }, () => new Animated.Value(0)),
  );
  const mismatchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentDifficulty = getDifficulty(completedBoards);
  const currentXP = getXPForDifficulty(currentDifficulty);

  const startNextBoard = useCallback(
    (isResetTimer = false) => {
      antiCheatClickLimit.current = { count: 0, time: Date.now() };
      if (mismatchTimeout.current) {
        clearTimeout(mismatchTimeout.current);
        mismatchTimeout.current = null;
      }

      // Reset all flip animated values back to 0
      tileFlips.forEach((val) => val.setValue(0));

      let nextCards = generateMemoryPairs(grade, seenBoards.current, subject);
      let key = boardKey(nextCards);

      if (
        !nextCards ||
        nextCards.length === 0 ||
        (key && seenBoards.current.has(key))
      ) {
        seenBoards.current.clear();
        nextCards = generateMemoryPairs(grade, seenBoards.current, subject);
        key = boardKey(nextCards);
      }

      if (key) {
        seenBoards.current.add(key);
      }

      setCards(nextCards);
      setFlipped([]);
      setMatched([]);
      setMoves(0);

      if (isResetTimer) {
        setTimeLeft(ROUND_SECONDS);
        setRoundExpired(false);
        setCompletedBoards(0);
      }
    },
    [grade, subject, tileFlips],
  );

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

  useEffect(
    () => () => {
      if (mismatchTimeout.current) clearTimeout(mismatchTimeout.current);
    },
    [],
  );

  const finishRound = () => {
    onSuccess(currentXP);
    setCompletedBoards((count) => count + 1);
    startNextBoard(false);
  };

  const reveal = (index: number) => {
    if (
      roundExpired ||
      flipped.length === 2 ||
      flipped.includes(index) ||
      matched.includes(cards[index].pairId)
    )
      return;

    const now = Date.now();
    if (now - antiCheatClickLimit.current.time < 1000) {
      antiCheatClickLimit.current.count += 1;
      if (antiCheatClickLimit.current.count > 10) return;
    } else {
      antiCheatClickLimit.current = { count: 1, time: now };
    }

    playPageTurn();

    // Trigger the same spring flip animation as FlashcardGame
    Animated.spring(tileFlips[index], {
      toValue: 1,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();

    const nextFlipped = [...flipped, index];
    setFlipped(nextFlipped);
    if (nextFlipped.length !== 2) return;

    setMoves((count) => count + 1);
    const [first, second] = nextFlipped.map((cardIndex) => cards[cardIndex]);
    if (first.pairId === second.pairId) {
      const nextMatched = [...matched, first.pairId];
      setMatched(nextMatched);
      setFlipped([]);
      if (nextMatched.length === cards.length / 2) finishRound();
      return;
    }

    mismatchTimeout.current = setTimeout(() => {
      // Flip back unmatched cards with spring animation
      nextFlipped.forEach((cardIndex) => {
        Animated.spring(tileFlips[cardIndex], {
          toValue: 0,
          friction: 8,
          tension: 10,
          useNativeDriver: true,
        }).start();
      });
      setFlipped([]);
      mismatchTimeout.current = null;
    }, 850);
  };

  return (
    <LinearGradient colors={["#0a0b18", "#2b2b5c"]} style={styles.background}>
      <MinigameMotion
        key={`${boardKey(cards)}-${completedBoards}`}
        style={styles.container}
      >
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.backText}>Return to Games</Text>
          </TouchableOpacity>
          <Text style={styles.grade}>
            Grade {grade} • {subject} • Boards: {completedBoards}
          </Text>
          <Text style={[styles.timer, timeLeft <= 15 && styles.warning]}>
            ⏱ {timeLeft}s
          </Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>Find the matching pairs</Text>
          <Text style={styles.subtitle}>
            {subject === "Both"
              ? "Match each Math or Science term with its meaning."
              : `Match each ${subject} term with its meaning.`}{" "}
            Current Level:{" "}
            <Text style={{ color: "#4ade80", fontWeight: "900" }}>
              {currentDifficulty.toUpperCase()}
            </Text>
          </Text>
          <Text style={styles.moves}>
            Moves: {moves} • Clear boards before time runs out!
          </Text>
          <View style={styles.grid}>
            {cards.map((card, index) => {
              const visible =
                flipped.includes(index) || matched.includes(card.pairId);

              const frontInterpolate = tileFlips[index].interpolate({
                inputRange: [0, 1],
                outputRange: ["0deg", "180deg"],
              });

              const backInterpolate = tileFlips[index].interpolate({
                inputRange: [0, 1],
                outputRange: ["180deg", "360deg"],
              });

              return (
                <View key={`${card.id}-${index}`} style={styles.cardSlot}>
                  <TouchableOpacity
                    style={styles.tileTouchArea}
                    onPress={() => reveal(index)}
                    activeOpacity={1}
                    disabled={roundExpired}
                    accessibilityRole="button"
                    accessibilityLabel={
                      visible ? card.content : `Face-down card ${index + 1}`
                    }
                  >
                    {/* Front Face (Hidden / Question Mark) */}
                    <Animated.View
                      style={[
                        styles.tileFace,
                        styles.tileFront,
                        {
                          transform: [
                            { perspective: 1000 },
                            { rotateY: frontInterpolate },
                          ],
                        },
                      ]}
                    >
                      <Text style={styles.hiddenText}>?</Text>
                    </Animated.View>

                    {/* Back Face (Revealed Content / Term or Meaning) */}
                    <Animated.View
                      style={[
                        styles.tileFace,
                        styles.tileBack,
                        visible && styles.tileRevealed,
                        matched.includes(card.pairId) && styles.tileMatched,
                        {
                          transform: [
                            { perspective: 1000 },
                            { rotateY: backInterpolate },
                          ],
                        },
                      ]}
                    >
                      <Text style={styles.tileText} numberOfLines={3}>
                        {card.content}
                      </Text>
                    </Animated.View>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
          <Text style={styles.progress}>
            {matched.length} / {cards.length / 2} pairs found • Complete board
            for +{currentXP} XP
          </Text>
          {roundExpired && (
            <View style={styles.expiredCard}>
              <Text style={styles.expiredTitle}>Time is up!</Text>
              <Text style={styles.expiredCopy}>
                You cleared {completedBoards} board
                {completedBoards === 1 ? "" : "s"} total before the timer ran
                out.
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
  grade: { color: "#e2e8f0", fontSize: 12, fontWeight: "800" } as TextStyle,
  timer: { color: "#4ade80", fontSize: 13, fontWeight: "900" } as TextStyle,
  warning: { color: "#fb7185" } as TextStyle,
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingBottom: 18,
  } as ViewStyle,
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 8,
  } as TextStyle,
  subtitle: {
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 18,
    textAlign: "center",
    marginBottom: 8,
    maxWidth: 380,
  } as TextStyle,
  moves: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
  } as TextStyle,
  grid: {
    width: "100%",
    maxWidth: 420,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  } as ViewStyle,
  cardSlot: { width: "22%", height: 82 } as ViewStyle,
  tileTouchArea: {
    width: "100%",
    height: "100%",
  } as ViewStyle,
  tileFace: {
    position: "absolute",
    width: "100%",
    height: "100%",
    padding: 5,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backfaceVisibility: "hidden",
  } as ViewStyle,
  tileFront: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1.5,
    borderColor: "#38bdf8",
  } as ViewStyle,
  tileBack: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderWidth: 1.5,
    borderColor: "#818cf8",
  } as ViewStyle,
  tileRevealed: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderColor: "#818cf8",
  } as ViewStyle,
  tileMatched: {
    backgroundColor: "rgba(34, 197, 94, 0.25)",
    borderColor: "#22c55e",
  } as ViewStyle,
  tileText: {
    color: "#f8fafc",
    fontSize: 10,
    fontWeight: "800",
    textAlign: "center",
  } as TextStyle,
  hiddenText: { color: "#7dd3fc", fontSize: 22, lineHeight: 28 } as TextStyle,
  progress: {
    color: "#cbd5e1",
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 18,
  } as TextStyle,
  expiredCard: {
    width: "100%",
    maxWidth: 380,
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

const boardKey = (cards: MemoryMatchCard[]): string =>
  cards
    .filter((card) => card.id.startsWith("term-"))
    .map((card) => {
      const match = cards.find(
        (candidate) =>
          candidate.pairId === card.pairId && candidate.id.startsWith("match-"),
      );
      return `${card.content}=${match?.content ?? ""}`;
    })
    .sort()
    .join("|");
