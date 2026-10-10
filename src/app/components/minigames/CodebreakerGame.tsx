import { LinearGradient } from 'expo-linear-gradient'; // Replace with 'react-native-linear-gradient' if not using Expo
import React, { useRef, useState } from 'react';
import { StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { CodebreakerChallenge, generateCodebreaker, GradeLevel, Subject } from '../../data/questionGenerators';
import { MinigameMotion } from './MinigameMotion';

interface Props {
  grade: GradeLevel;
  onSuccess: (xp: number) => void;
  onClose: () => void;
}

export const CodebreakerGame: React.FC<Props> = ({ grade, onSuccess, onClose }) => {
  const seenChallenges = useRef(new Set<string>());
  const [subject, setSubject] = useState<Subject | null>(null);
  const [challenge, setChallenge] = useState<CodebreakerChallenge | null>(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [correctCount, setCorrectCount] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);

  const startRound = (selectedSubject: Subject) => {
    const nextChallenge = generateCodebreaker(grade, selectedSubject, seenChallenges.current);
    seenChallenges.current.add(challengeKey(nextChallenge));
    setSubject(selectedSubject);
    setChallenge(nextChallenge);
    setQuestionNumber(1);
    setCorrectCount(0);
    setSelected(null);
  };

  const choose = (option: number) => {
    if (selected !== null || !challenge) return;
    setSelected(option);
    if (challenge.options[option] === challenge.missingAnswer) {
      setCorrectCount((count) => count + 1);
      onSuccess(50);
    }
  };

  const next = () => {
    const nextChallenge = generateCodebreaker(grade, subject ?? 'Math', seenChallenges.current);
    seenChallenges.current.add(challengeKey(nextChallenge));
    setChallenge(nextChallenge);
    setQuestionNumber((number) => number + 1);
    setSelected(null);
  };

  if (!subject || !challenge) {
    return (
      <LinearGradient colors={['#0a0b18', '#2b2b5c']} style={styles.background}>
        <MinigameMotion key={`${subject}-${questionNumber}`} style={styles.container}>
          <View style={styles.topBar}><TouchableOpacity onPress={onClose}><Text style={styles.backText}>‹ Games</Text></TouchableOpacity></View>
          <View style={styles.content}>
            <Text style={styles.eyebrow}>GRADE {grade} • ENDLESS PUZZLES</Text>
            <Text style={styles.title}>🔐 Codebreaker</Text>
            <Text style={styles.subtitle}>Choose a track to crack number patterns or nature sequences.</Text>
            <TouchableOpacity style={[styles.subjectButton, styles.math]} onPress={() => startRound('Math')}>
              <Text style={styles.subjectTitle}>🔢 Math Track</Text>
              <Text style={styles.subjectCopy}>Skip counting, addition, and multiplication patterns</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.subjectButton, styles.science]} onPress={() => startRound('Science')}>
              <Text style={styles.subjectTitle}>🌿 Science Track</Text>
              <Text style={styles.subjectCopy}>Life cycles and environmental sequences</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.subjectButton, styles.mixed]} onPress={() => startRound('Both')}>
              <Text style={styles.subjectTitle}>✨ Mixed Track</Text>
              <Text style={styles.subjectCopy}>A blend of Math and Science puzzles</Text>
            </TouchableOpacity>
          </View>
        </MinigameMotion>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0a0b18', '#2b2b5c']} style={styles.background}>
      <MinigameMotion key={`${subject}-${questionNumber}`} style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => { setSubject(null); setChallenge(null); }}><Text style={styles.backText}>‹ Tracks</Text></TouchableOpacity>
          <Text style={styles.progress}>Puzzle {questionNumber} • {subject} • ✓ {correctCount}</Text>
          <Text style={styles.xp}>+50 XP / correct</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.eyebrow}>GRADE {grade} • CODEBREAKER</Text>
          <Text style={styles.title}>Complete the sequence</Text>
          <Text style={styles.rule}>{challenge.ruleDescription}</Text>
          <View style={styles.sequence}>
            {challenge.sequence.map((item, index) => (
              <React.Fragment key={`${item}-${index}`}>
                {index > 0 && <Text style={styles.arrow}>→</Text>}
                <View style={[styles.sequenceItem, item === '?' && styles.missingItem]}>
                  <Text style={[styles.sequenceText, item === '?' && styles.missingText]}>{item === '?' ? '🔒' : item}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>
          <View style={styles.options}>
            {challenge.options.map((option, index) => {
              const correct = selected !== null && option === challenge.missingAnswer;
              const incorrect = selected === index && selected !== null && challenge.options[index] !== challenge.missingAnswer;
              return (
                <TouchableOpacity
                  key={`${option}-${index}`}
                  style={[styles.option, correct && styles.correctOption, incorrect && styles.incorrectOption]}
                  onPress={() => choose(index)}
                  disabled={selected !== null}
                >
                  <Text style={styles.optionText}>{option}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {selected !== null && (
            <View style={styles.feedback}>
              <Text style={styles.feedbackText}>
                {challenge.options[selected] === challenge.missingAnswer ? 'Correct pattern!' : `The missing item was ${challenge.missingAnswer}.`}
              </Text>
              <TouchableOpacity style={styles.primaryButton} onPress={next}>
                <Text style={styles.buttonText}>Next Puzzle →</Text>
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
  progress: { color: '#e2e8f0', fontSize: 12, fontWeight: '800' } as TextStyle,
  xp: { color: '#facc15', fontSize: 10, fontWeight: '900' } as TextStyle,
  content: { flex: 1, justifyContent: 'center', padding: 20 } as ViewStyle,
  eyebrow: { color: '#4ade80', fontSize: 11, textAlign: 'center', fontWeight: '900', letterSpacing: 1, marginBottom: 8 } as TextStyle,
  title: { color: '#fff', fontSize: 23, textAlign: 'center', fontWeight: '900', marginBottom: 16 } as TextStyle,
  subtitle: { color: '#cbd5e1', fontSize: 14, lineHeight: 22, textAlign: 'center', marginBottom: 18 } as TextStyle,
  rule: { color: '#cbd5e1', fontSize: 13, fontWeight: '700', textAlign: 'center', marginBottom: 20 } as TextStyle,
  sequence: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 7, paddingVertical: 22, paddingHorizontal: 12, backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: 18, marginBottom: 22 } as ViewStyle,
  sequenceItem: { minWidth: 58, minHeight: 58, paddingHorizontal: 8, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 14, borderWidth: 1, borderColor: '#38bdf8', alignItems: 'center', justifyContent: 'center' } as ViewStyle,
  missingItem: { backgroundColor: 'rgba(250, 204, 21, 0.2)', borderColor: '#facc15', borderStyle: 'dashed' } as ViewStyle,
  sequenceText: { color: '#e0f2fe', fontSize: 13, fontWeight: '900', textAlign: 'center' } as TextStyle,
  missingText: { fontSize: 21 } as TextStyle,
  arrow: { color: '#4ade80', fontSize: 18, fontWeight: '900' } as TextStyle,
  options: { gap: 10 } as ViewStyle,
  option: { backgroundColor: 'rgba(255, 255, 255, 0.06)', padding: 15, borderRadius: 13, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.15)', alignItems: 'center' } as ViewStyle,
  optionText: { color: '#fff', fontSize: 15, fontWeight: '900' } as TextStyle,
  correctOption: { backgroundColor: 'rgba(34, 197, 94, 0.25)', borderColor: '#22c55e' } as ViewStyle,
  incorrectOption: { backgroundColor: 'rgba(251, 113, 133, 0.25)', borderColor: '#fb7185' } as ViewStyle,
  feedback: { backgroundColor: 'rgba(255, 255, 255, 0.08)', padding: 14, borderRadius: 14, marginTop: 14 } as ViewStyle,
  feedbackText: { color: '#e2e8f0', textAlign: 'center', fontWeight: '800', marginBottom: 12 } as TextStyle,
  primaryButton: { backgroundColor: '#16a34a', padding: 14, borderRadius: 12, alignItems: 'center' } as ViewStyle,
  buttonText: { color: '#fff', fontSize: 14, fontWeight: '900' } as TextStyle,
  subjectButton: { padding: 18, borderRadius: 16, backgroundColor: 'rgba(255, 255, 255, 0.06)', borderWidth: 1.5, marginBottom: 12 } as ViewStyle,
  math: { borderColor: '#38bdf8' } as ViewStyle,
  science: { borderColor: '#4ade80' } as ViewStyle,
  mixed: { borderColor: '#c084fc' } as ViewStyle,
  subjectTitle: { color: '#fff', fontSize: 16, textAlign: 'center', fontWeight: '900', marginBottom: 5 } as TextStyle,
  subjectCopy: { color: '#94a3b8', fontSize: 12, textAlign: 'center', lineHeight: 17 } as TextStyle,
  backButton: { padding: 14, marginTop: 4 } as ViewStyle,
});

const challengeKey = (challenge: CodebreakerChallenge): string =>
  `${challenge.ruleDescription}|${challenge.sequence.join(',')}|${challenge.missingAnswer}`;