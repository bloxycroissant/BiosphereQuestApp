import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle, TextStyle, ScrollView } from 'react-native';
import { generateQuizQuestions, GradeLevel, QuizQuestion } from '../../data/questionGenerators';
import { MinigameMotion } from './MinigameMotion';

interface Props {
  grade: GradeLevel;
  onSuccess: (xp: number) => void;
  onClose: () => void;
}

const QUESTION_COUNT = 5;
const QUESTION_SECONDS = 15;

export const QuizGame: React.FC<Props> = ({ grade, onSuccess, onClose }) => {
  const [questions] = useState<QuizQuestion[]>(() => generateQuizQuestions(grade, QUESTION_COUNT));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(QUESTION_SECONDS);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (isFinished || selectedOption !== null) return;
    const timer = setTimeout(() => {
      const nextTime = Math.max(0, timeLeft - 1);
      setTimeLeft(nextTime);
      if (nextTime === 0) setSelectedOption('');
    }, 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, selectedOption, isFinished]);

  const chooseAnswer = (option: string) => {
    if (selectedOption !== null) return;
    setSelectedOption(option);
    if (option === questions[currentIndex]?.answer) setScore((current) => current + 1);
  };

  const nextQuestion = () => {
    if (currentIndex + 1 === questions.length) {
      setIsFinished(true);
      onSuccess(150);
      return;
    }
    setCurrentIndex((index) => index + 1);
    setSelectedOption(null);
    setTimeLeft(QUESTION_SECONDS);
  };

  if (isFinished) {
    return (
      <MinigameMotion style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.eyebrow}>DAILY CHALLENGE COMPLETE</Text>
          <Text style={styles.title}>🌟 Great work!</Text>
          <Text style={styles.copy}>You answered {score} of {questions.length} questions correctly.</Text>
          <Text style={styles.reward}>+150 XP</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={onClose}>
            <Text style={styles.buttonText}>Back to Games</Text>
          </TouchableOpacity>
        </View>
      </MinigameMotion>
    );
  }

  const question = questions[currentIndex];
  const answered = selectedOption !== null;
  const progress = (currentIndex + 1) / questions.length;

  return (
    <MinigameMotion key={`question-${currentIndex}`} style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onClose}><Text style={styles.backText}>‹ Games</Text></TouchableOpacity>
        <Text style={styles.progressText}>Question {currentIndex + 1} of {questions.length}</Text>
        <Text style={[styles.timer, timeLeft <= 5 && styles.timerWarning]}>00:{String(timeLeft).padStart(2, '0')}</Text>
      </View>
      <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progress * 100}%` }]} /></View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.eyebrow}>GRADE {grade} • MATH & SCIENCE</Text>
          <Text style={styles.title}>Daily Quiz</Text>
          <Text style={styles.question}>{question.question}</Text>
          <View style={styles.options}>
            {question.options.map((option, index) => {
              const correct = answered && option === question.answer;
              const incorrect = answered && option === selectedOption && option !== question.answer;
              return (
                <TouchableOpacity
                  key={`${index}-${option}`}
                  style={[styles.option, correct && styles.correctOption, incorrect && styles.incorrectOption]}
                  onPress={() => chooseAnswer(option)}
                  disabled={answered}
                  activeOpacity={0.8}
                >
                  <Text style={styles.optionLetter}>{String.fromCharCode(65 + index)}</Text>
                  <Text style={styles.optionText}>{option}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {answered && (
            <View style={styles.feedback}>
              <Text style={styles.feedbackText}>
                {selectedOption === '' ? `Time's up! Answer: ${question.answer}` :
                  selectedOption === question.answer ? 'Correct! Nice work.' : `Not quite. The answer is ${question.answer}.`}
              </Text>
              <TouchableOpacity style={styles.primaryButton} onPress={nextQuestion}>
                <Text style={styles.buttonText}>{currentIndex + 1 === questions.length ? 'Finish Quiz' : 'Next Question'} →</Text>
              </TouchableOpacity>
            </View>
          )}
          <Text style={styles.rewardHint}>Complete all 5 questions to earn +150 XP</Text>
        </View>
      </ScrollView>
    </MinigameMotion>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#091426' } as ViewStyle,
  topBar: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' } as ViewStyle,
  backText: { color: '#38bdf8', fontSize: 15, fontWeight: '800' } as TextStyle,
  progressText: { color: '#e2e8f0', fontSize: 13, fontWeight: '800' } as TextStyle,
  timer: { color: '#4ade80', fontSize: 14, fontWeight: '900', minWidth: 52, textAlign: 'right' } as TextStyle,
  timerWarning: { color: '#fb7185' } as TextStyle,
  progressTrack: { height: 7, backgroundColor: '#1e293b', marginHorizontal: 18, borderRadius: 8, overflow: 'hidden' } as ViewStyle,
  progressFill: { height: '100%', backgroundColor: '#38bdf8', borderRadius: 8 } as ViewStyle,
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 18 } as ViewStyle,
  card: { backgroundColor: '#131b2e', borderRadius: 22, borderWidth: 1, borderColor: '#263a57', padding: 22, alignItems: 'stretch' } as ViewStyle,
  eyebrow: { color: '#4ade80', fontSize: 11, fontWeight: '900', letterSpacing: 1.1, textAlign: 'center', marginBottom: 8 } as TextStyle,
  title: { color: '#fff', fontSize: 23, fontWeight: '900', textAlign: 'center', marginBottom: 20 } as TextStyle,
  question: { backgroundColor: '#1e293b', borderRadius: 16, padding: 20, color: '#fff', fontSize: 18, fontWeight: '800', textAlign: 'center', overflow: 'hidden', marginBottom: 18 } as TextStyle,
  options: { gap: 10 } as ViewStyle,
  option: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 14, borderWidth: 1, borderColor: '#334155', backgroundColor: '#172235' } as ViewStyle,
  correctOption: { borderColor: '#22c55e', backgroundColor: '#123328' } as ViewStyle,
  incorrectOption: { borderColor: '#f87171', backgroundColor: '#3b2028' } as ViewStyle,
  optionLetter: { color: '#38bdf8', fontWeight: '900', width: 22, textAlign: 'center' } as TextStyle,
  optionText: { color: '#f8fafc', fontSize: 15, fontWeight: '700', flex: 1 } as TextStyle,
  feedback: { marginTop: 16, padding: 14, backgroundColor: '#1e293b', borderRadius: 14 } as ViewStyle,
  feedbackText: { color: '#e2e8f0', fontWeight: '700', marginBottom: 12, textAlign: 'center' } as TextStyle,
  primaryButton: { backgroundColor: '#16a34a', padding: 14, borderRadius: 12, alignItems: 'center' } as ViewStyle,
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '900' } as TextStyle,
  rewardHint: { color: '#94a3b8', fontSize: 11, fontWeight: '700', textAlign: 'center', marginTop: 18 } as TextStyle,
  copy: { color: '#cbd5e1', fontSize: 15, textAlign: 'center', marginBottom: 20 } as TextStyle,
  reward: { color: '#facc15', fontSize: 26, textAlign: 'center', fontWeight: '900', marginBottom: 24 } as TextStyle,
});
