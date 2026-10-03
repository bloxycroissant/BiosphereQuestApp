import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle, TextStyle } from 'react-native';
import { generateNinjaProblem, GradeLevel, NinjaProblem } from '../../data/questionGenerators';
import { MinigameMotion } from './MinigameMotion';

interface Props {
  grade: GradeLevel;
  onSuccess: (xp: number) => void;
  onClose: () => void;
}

const QUESTION_SECONDS = 15;

export const NumberNinjaGame: React.FC<Props> = ({ grade, onSuccess, onClose }) => {
  const seenQuestions = useRef(new Set<string>());
  const [question, setQuestion] = useState<NinjaProblem>(() => generateNinjaProblem(grade));
  const [questionNumber, setQuestionNumber] = useState(1);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(QUESTION_SECONDS);

  useEffect(() => {
    seenQuestions.current.add(question.prompt);
  }, [question.prompt]);

  useEffect(() => {
    if (selected !== null) return;
    const timer = setTimeout(() => {
      const nextTime = Math.max(0, timeLeft - 1);
      setTimeLeft(nextTime);
      if (nextTime === 0) setSelected(-1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, selected]);

  const answer = (value: number) => {
    if (selected !== null) return;
    setSelected(value);
    if (value === question.correctAnswer) {
      setScore((current) => current + 1);
      onSuccess(50);
    }
  };

  const next = () => {
    const nextQuestion = generateNinjaProblem(grade, seenQuestions.current);
    seenQuestions.current.add(nextQuestion.prompt);
    setQuestion(nextQuestion);
    setQuestionNumber((number) => number + 1);
    setSelected(null);
    setTimeLeft(QUESTION_SECONDS);
  };

  return (
    <MinigameMotion key={`challenge-${questionNumber}`} style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onClose}><Text style={styles.backText}>‹ Games</Text></TouchableOpacity>
        <Text style={styles.progress}>Grade {grade} • Challenge {questionNumber}</Text>
        <Text style={[styles.timer, timeLeft <= 5 && styles.warning]}>⏱ {timeLeft}s</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>⚡ +50 XP PER CORRECT ANSWER</Text>
        <Text style={styles.title}>Number Ninja</Text>
        <Text style={styles.prompt}>{question.prompt}</Text>
        <View style={styles.options}>
          {question.options.map((option) => {
            const correct = selected !== null && option === question.correctAnswer;
            const incorrect = selected === option && selected !== question.correctAnswer;
            return (
              <TouchableOpacity
                key={option}
                style={[styles.option, correct && styles.correctOption, incorrect && styles.incorrectOption]}
                onPress={() => answer(option)}
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
              {selected === -1 ? `Time's up! The answer was ${question.correctAnswer}.` :
                selected === question.correctAnswer ? 'Bullseye! +50 XP' : `The answer was ${question.correctAnswer}.`}
            </Text>
            <TouchableOpacity style={styles.primaryButton} onPress={next}>
              <Text style={styles.buttonText}>Next Challenge →</Text>
            </TouchableOpacity>
          </View>
        )}
        <Text style={styles.score}>Score: {score}</Text>
      </View>
    </MinigameMotion>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#091426' } as ViewStyle,
  topBar: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' } as ViewStyle,
  backText: { color: '#38bdf8', fontSize: 14, fontWeight: '800' } as TextStyle,
  progress: { color: '#cbd5e1', fontSize: 12, fontWeight: '800' } as TextStyle,
  timer: { color: '#facc15', fontSize: 13, fontWeight: '900' } as TextStyle,
  warning: { color: '#fb7185' } as TextStyle,
  content: { flex: 1, justifyContent: 'center', padding: 20 } as ViewStyle,
  eyebrow: { color: '#facc15', fontSize: 11, textAlign: 'center', fontWeight: '900', letterSpacing: 1, marginBottom: 8 } as TextStyle,
  title: { color: '#fff', fontSize: 24, textAlign: 'center', fontWeight: '900', marginBottom: 20 } as TextStyle,
  prompt: { color: '#fef3c7', fontSize: 24, fontWeight: '900', textAlign: 'center', backgroundColor: '#2b2a22', borderRadius: 18, padding: 26, marginBottom: 20, overflow: 'hidden' } as TextStyle,
  options: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 } as ViewStyle,
  option: { width: '47%', backgroundColor: '#172235', borderWidth: 1.5, borderColor: '#475569', borderRadius: 14, padding: 18, alignItems: 'center' } as ViewStyle,
  correctOption: { borderColor: '#22c55e', backgroundColor: '#123328' } as ViewStyle,
  incorrectOption: { borderColor: '#fb7185', backgroundColor: '#3b2028' } as ViewStyle,
  optionText: { color: '#fff', fontSize: 22, fontWeight: '900' } as TextStyle,
  feedback: { marginTop: 18, backgroundColor: '#1e293b', padding: 14, borderRadius: 14 } as ViewStyle,
  feedbackText: { color: '#e2e8f0', fontSize: 14, fontWeight: '800', textAlign: 'center', marginBottom: 12 } as TextStyle,
  primaryButton: { backgroundColor: '#16a34a', padding: 14, borderRadius: 12, alignItems: 'center' } as ViewStyle,
  buttonText: { color: '#fff', fontSize: 14, fontWeight: '900' } as TextStyle,
  score: { color: '#94a3b8', fontWeight: '800', textAlign: 'center', marginTop: 20 } as TextStyle,
  subtitle: { color: '#cbd5e1', marginBottom: 14, fontSize: 15, fontWeight: '700' } as TextStyle,
  reward: { color: '#facc15', fontSize: 26, fontWeight: '900', marginBottom: 22 } as TextStyle,
});
