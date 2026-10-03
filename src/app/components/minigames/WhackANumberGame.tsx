import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle, TextStyle } from 'react-native';
import { generateWhackChallenge, GradeLevel, WhackChallenge } from '../../data/questionGenerators';
import { MinigameMotion } from './MinigameMotion';

interface Props {
  grade: GradeLevel;
  onSuccess: (xp: number) => void;
  onClose: () => void;
}

const ROUND_SECONDS = 45;
const TARGET_QUOTA = 10;

export const WhackANumberGame: React.FC<Props> = ({ grade, onSuccess, onClose }) => {
  const seenChallenges = useRef(new Set<string>());
  const [challenge, setChallenge] = useState<WhackChallenge>(() => generateWhackChallenge(grade));
  const [whacked, setWhacked] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [feedback, setFeedback] = useState('');
  const [completedQuotas, setCompletedQuotas] = useState(0);

  useEffect(() => {
    seenChallenges.current.add(challengeKey(challenge));
  }, [challenge]);

  const startNextBoard = useCallback(() => {
    const nextChallenge = generateWhackChallenge(grade, seenChallenges.current);
    seenChallenges.current.add(challengeKey(nextChallenge));
    setChallenge(nextChallenge);
    setWhacked([]);
    setTimeLeft(ROUND_SECONDS);
    setFeedback('');
  }, [grade]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (timeLeft <= 1) startNextBoard();
      else setTimeLeft(timeLeft - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, startNextBoard]);

  const whack = (index: number) => {
    if (whacked.includes(index)) return;
    const isTarget = challenge.gridNumbers[index] % challenge.targetMultiple === 0;
    const nextScore = isTarget ? score + 1 : score - 1;
    setScore(nextScore);
    setWhacked((current) => [...current, index]);
    setFeedback(isTarget ? 'Nice hit! +1' : 'Wrong number! -1 point');

    if (nextScore >= TARGET_QUOTA) {
      onSuccess(100);
      setCompletedQuotas((count) => count + 1);
      setScore(0);
      startNextBoard();
      return;
    }

    const targetsOnBoard = challenge.gridNumbers
      .map((number, tileIndex) => number % challenge.targetMultiple === 0 ? tileIndex : -1)
      .filter((tileIndex) => tileIndex !== -1);
    const alreadyHit = [...whacked, index];
    if (targetsOnBoard.every((tileIndex) => alreadyHit.includes(tileIndex))) {
      startNextBoard();
    }
  };

  return (
    <MinigameMotion key={challengeKey(challenge)} style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onClose}><Text style={styles.backText}>‹ Games</Text></TouchableOpacity>
        <Text style={styles.grade}>Grade {grade} • Quotas: {completedQuotas}</Text>
        <Text style={[styles.timer, timeLeft <= 10 && styles.warning]}>⏱ {timeLeft}s</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>HIT {TARGET_QUOTA} TARGETS TO WIN +100 XP</Text>
        <Text style={styles.title}>Whack-a-Number</Text>
        <Text style={styles.rule}>{challenge.ruleText}</Text>
        <Text style={styles.score}>Progress: {score} / {TARGET_QUOTA}</Text>
        <View style={styles.grid}>
          {challenge.gridNumbers.map((number, index) => {
            const isTarget = number % challenge.targetMultiple === 0;
            const selected = whacked.includes(index);
            return (
              <TouchableOpacity
                key={`${index}-${number}`}
                style={[styles.hole, selected && (isTarget ? styles.hitHole : styles.missHole)]}
                onPress={() => whack(index)}
                disabled={selected}
                activeOpacity={0.75}
              >
                <Text style={[styles.number, selected && styles.numberSelected]}>{selected ? '✓' : number}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={styles.feedback}>{feedback || 'Tap each target number. Wrong taps subtract one point.'}</Text>
      </View>
    </MinigameMotion>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#091426' } as ViewStyle,
  topBar: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' } as ViewStyle,
  backText: { color: '#38bdf8', fontSize: 14, fontWeight: '800' } as TextStyle,
  grade: { color: '#e2e8f0', fontSize: 11, fontWeight: '800' } as TextStyle,
  timer: { color: '#4ade80', fontSize: 13, fontWeight: '900' } as TextStyle,
  warning: { color: '#fb7185' } as TextStyle,
  content: { flex: 1, justifyContent: 'center', padding: 20 } as ViewStyle,
  eyebrow: { color: '#86efac', fontSize: 11, textAlign: 'center', fontWeight: '900', letterSpacing: 0.8, marginBottom: 8 } as TextStyle,
  title: { color: '#fff', fontSize: 23, textAlign: 'center', fontWeight: '900', marginBottom: 16 } as TextStyle,
  rule: { color: '#dbeafe', textAlign: 'center', fontSize: 17, fontWeight: '900', backgroundColor: '#13283a', padding: 16, borderRadius: 14, marginBottom: 10 } as TextStyle,
  score: { color: '#facc15', textAlign: 'center', fontWeight: '900', marginBottom: 16 } as TextStyle,
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 } as ViewStyle,
  hole: { width: '28%', aspectRatio: 1, borderRadius: 24, backgroundColor: '#173254', borderWidth: 2, borderColor: '#38bdf8', alignItems: 'center', justifyContent: 'center' } as ViewStyle,
  hitHole: { backgroundColor: '#123328', borderColor: '#22c55e' } as ViewStyle,
  missHole: { backgroundColor: '#3b2028', borderColor: '#fb7185' } as ViewStyle,
  number: { color: '#fff', fontSize: 24, fontWeight: '900' } as TextStyle,
  numberSelected: { color: '#cbd5e1', fontSize: 19 } as TextStyle,
  feedback: { color: '#cbd5e1', fontSize: 12, fontWeight: '700', textAlign: 'center', marginTop: 18, minHeight: 18 } as TextStyle,
});

const challengeKey = (challenge: WhackChallenge): string =>
  `${challenge.targetMultiple}|${[...challenge.gridNumbers].sort((a, b) => a - b).join(',')}`;
