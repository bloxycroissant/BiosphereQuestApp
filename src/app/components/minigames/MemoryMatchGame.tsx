import { LinearGradient } from 'expo-linear-gradient'; // Replace with 'react-native-linear-gradient' if not using Expo
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { generateMemoryPairs, GradeLevel, MemoryMatchCard, Subject } from '../../data/questionGenerators';
import { MinigameMotion } from './MinigameMotion';

interface Props {
  grade: GradeLevel;
  subject: Subject;
  onSuccess: (xp: number) => void;
  onClose: () => void;
}

const ROUND_SECONDS = 90;

export const MemoryMatchGame: React.FC<Props> = ({ grade, subject, onSuccess, onClose }) => {
  const seenBoards = useRef(new Set<string>());
  const [cards, setCards] = useState<MemoryMatchCard[]>(() => generateMemoryPairs(grade, new Set(), subject));
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [completedBoards, setCompletedBoards] = useState(0);
  const [roundExpired, setRoundExpired] = useState(false);
  const [tileScales] = useState(() => Array.from({ length: 16 }, () => new Animated.Value(1)));
  const mismatchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    seenBoards.current.add(boardKey(cards));
  }, [cards]);

  const startNextBoard = useCallback(() => {
    if (mismatchTimeout.current) {
      clearTimeout(mismatchTimeout.current);
      mismatchTimeout.current = null;
    }
    const nextCards = generateMemoryPairs(grade, seenBoards.current, subject);
    seenBoards.current.add(boardKey(nextCards));
    setCards(nextCards);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setTimeLeft(ROUND_SECONDS);
    setRoundExpired(false);
  }, [grade, subject]);

  useEffect(() => {
    if (roundExpired) return;
    const timer = setTimeout(() => {
      if (timeLeft <= 1) {
        setTimeLeft(0);
        setRoundExpired(true);
      }
      else setTimeLeft(timeLeft - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, roundExpired]);

  useEffect(() => () => {
    if (mismatchTimeout.current) clearTimeout(mismatchTimeout.current);
  }, []);

  const finishRound = () => {
    const xp = Math.min(200, 40 + Math.round((timeLeft / ROUND_SECONDS) * 140) + (grade - 1) * 4);
    onSuccess(xp);
    setCompletedBoards((count) => count + 1);
    startNextBoard();
  };

  const reveal = (index: number) => {
    if (roundExpired || flipped.length === 2 || flipped.includes(index) || matched.includes(cards[index].pairId)) return;
    Animated.sequence([
      Animated.timing(tileScales[index], { toValue: 0.88, duration: 80, useNativeDriver: true }),
      Animated.spring(tileScales[index], { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
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
      setFlipped([]);
      mismatchTimeout.current = null;
    }, 850);
  };

  return (
    <LinearGradient colors={['#0a0b18', '#2b2b5c']} style={styles.background}>
      <MinigameMotion key={boardKey(cards)} style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose}><Text style={styles.backText}>‹ Games</Text></TouchableOpacity>
          <Text style={styles.grade}>Grade {grade} • {subject} • Boards: {completedBoards}</Text>
          <Text style={[styles.timer, timeLeft <= 15 && styles.warning]}>⏱ {timeLeft}s</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>Find the matching pairs</Text>
          <Text style={styles.subtitle}>
            {subject === 'Both'
              ? 'Match each Math or Science term with its meaning.'
              : `Match each ${subject} term with its meaning.`}{' '}
            Find all {cards.length / 2} pairs before the 90-second timer runs out.
          </Text>
          <Text style={styles.moves}>Moves: {moves} • Flip two cards to check a pair</Text>
          <View style={styles.grid}>
            {cards.map((card, index) => {
              const visible = flipped.includes(index) || matched.includes(card.pairId);
              return (
                <Animated.View key={card.id} style={[styles.cardSlot, { transform: [{ scale: tileScales[index] }] }]}>
                  <TouchableOpacity
                    style={[styles.tile, visible && styles.tileRevealed, matched.includes(card.pairId) && styles.tileMatched]}
                    onPress={() => reveal(index)}
                    activeOpacity={0.8}
                    disabled={roundExpired}
                    accessibilityRole="button"
                    accessibilityLabel={visible ? card.content : `Face-down card ${index + 1}`}
                  >
                    <Text style={[styles.tileText, !visible && styles.hiddenText]} numberOfLines={2}>
                      {visible ? card.content : '?'}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
          <Text style={styles.progress}>{matched.length} / {cards.length / 2} pairs found • Faster clears earn more XP (up to 200)</Text>
          {roundExpired && (
            <View style={styles.expiredCard}>
              <Text style={styles.expiredTitle}>Time is up!</Text>
              <Text style={styles.expiredCopy}>You found {matched.length} of {cards.length / 2} pairs. Start another board when you’re ready.</Text>
              <TouchableOpacity style={styles.retryButton} onPress={startNextBoard} activeOpacity={0.85}>
                <Text style={styles.retryButtonText}>Try another board</Text>
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
  container: { flex: 1, backgroundColor: 'transparent' } as ViewStyle,
  topBar: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' } as ViewStyle,
  backText: { color: '#38bdf8', fontSize: 14, fontWeight: '800' } as TextStyle,
  grade: { color: '#e2e8f0', fontSize: 12, fontWeight: '800' } as TextStyle,
  timer: { color: '#4ade80', fontSize: 13, fontWeight: '900' } as TextStyle,
  warning: { color: '#fb7185' } as TextStyle,
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 14, paddingBottom: 18 } as ViewStyle,
  title: { color: '#fff', fontSize: 22, fontWeight: '900', textAlign: 'center', marginBottom: 8 } as TextStyle,
  subtitle: { color: '#cbd5e1', fontSize: 12, fontWeight: '700', lineHeight: 18, textAlign: 'center', marginBottom: 8, maxWidth: 380 } as TextStyle,
  moves: { color: '#94a3b8', fontSize: 11, fontWeight: '700', textAlign: 'center', marginBottom: 16 } as TextStyle,
  grid: { width: '100%', maxWidth: 420, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 } as ViewStyle,
  cardSlot: { width: '22%', height: 82 } as ViewStyle,
  tile: { flex: 1, width: '100%', padding: 5, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderWidth: 1.5, borderColor: '#38bdf8' } as ViewStyle,
  tileRevealed: { backgroundColor: 'rgba(255, 255, 255, 0.15)', borderColor: '#818cf8' } as ViewStyle,
  tileMatched: { backgroundColor: 'rgba(34, 197, 94, 0.25)', borderColor: '#22c55e' } as ViewStyle,
  tileText: { color: '#f8fafc', fontSize: 11, fontWeight: '800', textAlign: 'center' } as TextStyle,
  hiddenText: { color: '#7dd3fc', fontSize: 24, lineHeight: 30 } as TextStyle,
  progress: { color: '#cbd5e1', fontSize: 11, fontWeight: '700', textAlign: 'center', marginTop: 18 } as TextStyle,
  expiredCard: { width: '100%', maxWidth: 380, alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderColor: '#fb7185', borderWidth: 1, borderRadius: 16, padding: 16, marginTop: 16 } as ViewStyle,
  expiredTitle: { color: '#fff', fontSize: 18, fontWeight: '900', textAlign: 'center' } as TextStyle,
  expiredCopy: { color: '#cbd5e1', fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 6 } as TextStyle,
  retryButton: { backgroundColor: '#117a61', borderRadius: 12, paddingHorizontal: 18, paddingVertical: 11, marginTop: 12 } as ViewStyle,
  retryButtonText: { color: '#fff', fontSize: 13, fontWeight: '900' } as TextStyle,
});

const boardKey = (cards: MemoryMatchCard[]): string =>
  cards.filter((card) => card.id.startsWith('term-'))
    .map((card) => {
      const match = cards.find((candidate) => candidate.pairId === card.pairId && candidate.id.startsWith('match-'));
      return `${card.content}=${match?.content ?? ''}`;
    })
    .sort()
    .join('|');