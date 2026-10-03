import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View, ViewStyle, TextStyle } from 'react-native';
import { generateWordScramble, GradeLevel, ScrambleChallenge } from '../../data/questionGenerators';
import { MinigameMotion } from './MinigameMotion';

interface Props {
  grade: GradeLevel;
  onSuccess: (xp: number) => void;
  onClose: () => void;
}

const ROUND_SECONDS = 30;

export const WordScrambleGame: React.FC<Props> = ({ grade, onSuccess, onClose }) => {
  const seenChallenges = useRef(new Set<string>());
  const [challenge, setChallenge] = useState<ScrambleChallenge>(() => generateWordScramble(grade));
  const [pickedTiles, setPickedTiles] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [message, setMessage] = useState('');
  const [finished, setFinished] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);
  const [timerProgress] = useState(() => new Animated.Value(1));
  const [resultEntrance] = useState(() => new Animated.Value(0));
  const [tileScales, setTileScales] = useState(() => challenge.jumbledLetters.map(() => new Animated.Value(1)));
  const answer = pickedTiles.map((index) => challenge.jumbledLetters[index]).join('');

  useEffect(() => {
    seenChallenges.current.add(challenge.clue);
  }, [challenge.clue]);

  useEffect(() => {
    if (finished) return;
    const timer = setInterval(() => {
      setTimeLeft((seconds) => {
        if (seconds <= 1) {
          clearInterval(timer);
          setFinished(true);
          setMessage(`Time is up! The word was ${challenge.targetWord}.`);
          return 0;
        }
        return seconds - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [finished, challenge.targetWord]);

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
    setPickedTiles((picked) => wasSelected ? picked.filter((tile) => tile !== index) : [...picked, index]);
    setMessage('');
  };

  const checkAnswer = () => {
    if (answer.length !== challenge.targetWord.length) {
      setMessage('Use every letter tile to make the word.');
      return;
    }
    if (answer === challenge.targetWord) {
      const xp = 20 + Math.round((timeLeft / ROUND_SECONDS) * 100);
      setEarnedXp(xp);
      setFinished(true);
      setMessage('That is correct!');
      onSuccess(xp);
    } else {
      setMessage('Not quite. Rearrange the tiles and try again.');
    }
  };

  const startAgain = () => {
    const nextChallenge = generateWordScramble(grade, seenChallenges.current);
    seenChallenges.current.add(nextChallenge.clue);
    setChallenge(nextChallenge);
    setTileScales(nextChallenge.jumbledLetters.map(() => new Animated.Value(1)));
    setPickedTiles([]);
    setTimeLeft(ROUND_SECONDS);
    timerProgress.setValue(1);
    setMessage('');
    setFinished(false);
    setEarnedXp(0);
  };

  if (finished) {
    return (
      <MinigameMotion key={challenge.clue} style={styles.container}>
        <Animated.View style={[styles.resultCard, {
          opacity: resultEntrance,
          transform: [{ translateY: resultEntrance.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }, { scale: resultEntrance.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) }],
        }]}>
          <Text style={styles.title}>{earnedXp > 0 ? '🧩 Word solved!' : '⏰ Round over'}</Text>
          <Text style={styles.subtitle}>{message}</Text>
          {earnedXp > 0 && <Text style={styles.reward}>+{earnedXp} XP</Text>}
          <TouchableOpacity style={styles.primaryButton} onPress={startAgain}>
            <Text style={styles.buttonText}>Play Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={onClose}>
            <Text style={styles.backText}>Back to Games</Text>
          </TouchableOpacity>
        </Animated.View>
      </MinigameMotion>
    );
  }

  return (
    <MinigameMotion key={challenge.clue} style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onClose}><Text style={styles.backText}>‹ Games</Text></TouchableOpacity>
        <Text style={styles.grade}>Grade {grade} • Word Scramble</Text>
        <Text style={[styles.timer, timeLeft <= 8 && styles.warning]}>⏱ {timeLeft}s</Text>
      </View>
      <View style={styles.timerTrack}>
        <Animated.View style={[styles.timerFill, {
          width: timerProgress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
          backgroundColor: timerProgress.interpolate({ inputRange: [0, 0.25, 1], outputRange: ['#fb7185', '#facc15', '#4ade80'] }),
        }]} />
      </View>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>🌱 SCIENCE & MATH WORDS</Text>
        <Text style={styles.title}>Unscramble the word</Text>
        <Text style={styles.clue}>{challenge.clue}</Text>
        <View style={styles.answerRow}>
          {challenge.targetWord.split('').map((_, index) => {
            const tileIndex = pickedTiles[index];
            return (
              <TouchableOpacity
                key={`slot-${index}`}
                style={[styles.answerSlot, tileIndex !== undefined && styles.filledSlot]}
                onPress={() => tileIndex !== undefined && toggleTile(tileIndex)}
              >
                <Text style={styles.answerLetter}>{tileIndex === undefined ? '·' : challenge.jumbledLetters[tileIndex]}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.tiles}>
          {challenge.jumbledLetters.map((letter, index) => {
            const selected = pickedTiles.includes(index);
            return (
              <Animated.View key={`${letter}-${index}`} style={{ transform: [{ scale: tileScales[index] }] }}>
                <TouchableOpacity
                  style={[styles.tile, selected && styles.tileUsed]}
                  onPress={() => toggleTile(index)}
                  disabled={selected}
                >
                  <Text style={styles.tileText}>{selected ? ' ' : letter}</Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
        {!!message && <Text style={styles.feedback}>{message}</Text>}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => { setPickedTiles([]); setMessage(''); }}>
            <Text style={styles.buttonText}>Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryButton} onPress={checkAnswer}>
            <Text style={styles.buttonText}>Check Word ✓</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.rewardHint}>Solve quickly to earn up to +120 XP</Text>
      </View>
    </MinigameMotion>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#091426' } as ViewStyle,
  topBar: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' } as ViewStyle,
  timerTrack: { height: 6, backgroundColor: '#1e293b', marginHorizontal: 16, borderRadius: 8, overflow: 'hidden' } as ViewStyle,
  timerFill: { height: '100%', borderRadius: 8 } as ViewStyle,
  backText: { color: '#38bdf8', fontSize: 14, fontWeight: '800' } as TextStyle,
  grade: { color: '#e2e8f0', fontSize: 11, fontWeight: '800' } as TextStyle,
  timer: { color: '#4ade80', fontSize: 13, fontWeight: '900' } as TextStyle,
  warning: { color: '#fb7185' } as TextStyle,
  content: { flex: 1, justifyContent: 'center', padding: 20 } as ViewStyle,
  eyebrow: { color: '#4ade80', fontSize: 11, textAlign: 'center', fontWeight: '900', letterSpacing: 1, marginBottom: 8 } as TextStyle,
  title: { color: '#fff', fontSize: 23, textAlign: 'center', fontWeight: '900', marginBottom: 16 } as TextStyle,
  clue: { color: '#dbeafe', textAlign: 'center', fontSize: 15, fontWeight: '700', backgroundColor: '#13283a', borderRadius: 14, padding: 16, marginBottom: 20 } as TextStyle,
  answerRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginBottom: 20 } as ViewStyle,
  answerSlot: { width: 34, height: 42, borderBottomWidth: 3, borderBottomColor: '#38bdf8', alignItems: 'center', justifyContent: 'center', backgroundColor: '#14243a', borderRadius: 7 } as ViewStyle,
  filledSlot: { backgroundColor: '#18374a' } as ViewStyle,
  answerLetter: { color: '#fff', fontSize: 21, fontWeight: '900' } as TextStyle,
  tiles: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 9, marginBottom: 14 } as ViewStyle,
  tile: { width: 48, height: 52, borderRadius: 12, backgroundColor: '#166534', borderWidth: 1, borderColor: '#4ade80', alignItems: 'center', justifyContent: 'center' } as ViewStyle,
  tileUsed: { backgroundColor: '#1e293b', borderColor: '#334155' } as ViewStyle,
  tileText: { color: '#f0fdf4', fontSize: 21, fontWeight: '900' } as TextStyle,
  feedback: { color: '#facc15', fontWeight: '700', textAlign: 'center', marginBottom: 12 } as TextStyle,
  actions: { flexDirection: 'row', gap: 10, marginTop: 4 } as ViewStyle,
  primaryButton: { flex: 1, backgroundColor: '#16a34a', padding: 14, borderRadius: 12, alignItems: 'center' } as ViewStyle,
  secondaryButton: { backgroundColor: '#334155', paddingHorizontal: 22, justifyContent: 'center', borderRadius: 12, alignItems: 'center' } as ViewStyle,
  buttonText: { color: '#fff', fontSize: 14, fontWeight: '900' } as TextStyle,
  rewardHint: { color: '#94a3b8', fontSize: 11, fontWeight: '700', textAlign: 'center', marginTop: 18 } as TextStyle,
  resultCard: { margin: 22, padding: 24, borderRadius: 22, backgroundColor: '#131b2e', alignItems: 'center', borderWidth: 1, borderColor: '#263a57' } as ViewStyle,
  subtitle: { color: '#cbd5e1', textAlign: 'center', lineHeight: 22, marginBottom: 14 } as TextStyle,
  reward: { color: '#facc15', fontSize: 24, fontWeight: '900', marginBottom: 18 } as TextStyle,
  backButton: { padding: 14, marginTop: 4 } as ViewStyle,
});
