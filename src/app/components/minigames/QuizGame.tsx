import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated, ViewStyle, TextStyle, ScrollView } from 'react-native';
import { generateQuizQuestion, QuizQuestion, GradeLevel } from '../../data/questionGenerators';
import GradeSelectModal from '../GradeSelectModal';

interface Props {
  grade: GradeLevel;
  onSuccess: (xp: number) => void;
  onClose: () => void;
}

export const QuizGame: React.FC<Props> = ({ grade, onSuccess, onClose }) => {
  const [currentGrade, setCurrentGrade] = useState<GradeLevel>(grade);
  const [isGradeModalVisible, setIsGradeModalVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const optionScale = useRef(new Animated.Value(1)).current;
  
  const starAnim1 = useRef(new Animated.Value(0)).current;
  const starAnim2 = useRef(new Animated.Value(0)).current;
  const popStarScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let initialPool: QuizQuestion[] = [];
    const safeGrade = (Math.max(1, Math.min(6, currentGrade))) as GradeLevel;
    
    for (let i = 0; i < 5; i++) {
      initialPool.push(generateQuizQuestion(safeGrade));
    }
    setQuestions(initialPool);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsFinished(false);

    Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(starAnim1, { toValue: 1, duration: 3000, useNativeDriver: true }),
        Animated.timing(starAnim1, { toValue: 0, duration: 3000, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(starAnim2, { toValue: 1, duration: 4500, useNativeDriver: true }),
        Animated.timing(starAnim2, { toValue: 0, duration: 4500, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(popStarScale, { toValue: 1.3, duration: 1500, useNativeDriver: true }),
        Animated.timing(popStarScale, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, [currentGrade]);

  const handleSelectOption = (option: string) => {
    if (selectedOption !== null || questions.length === 0) return;

    setSelectedOption(option);
    const currentQ = questions[currentIndex];
    const isCorrect = option === currentQ.answer;

    if (isCorrect) {
      setScore((prev) => prev + 30);
    }

    Animated.sequence([
      Animated.timing(optionScale, { toValue: 0.94, duration: 80, useNativeDriver: true }),
      Animated.spring(optionScale, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
      onSuccess(150);
    }
  };

  if (questions.length === 0 || !questions[currentIndex]) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#38bdf8', fontWeight: '900', fontSize: 16 }}>Loading Challenge...</Text>
      </View>
    );
  }

  const currentQ = questions[currentIndex];

  if (isFinished) {
    return (
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <View style={styles.contentCard}>
          <Text style={styles.header}>🏆 Daily Challenge Completed!</Text>
          <Text style={styles.subtext}>Come back in 24 hours for a brand new set of questions!</Text>
          
          <View style={styles.displayBox}>
            <Text style={styles.scoreText}>+150 XP Claimed! ⚡</Text>
            <Text style={styles.detailText}>Grade {currentGrade} Mastery Updated.</Text>
          </View>

          <TouchableOpacity style={styles.actionButton} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.actionButtonText}>Return to Dashboard ➔</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Animated.Text style={[styles.popStar, { top: '10%', left: '8%', transform: [{ translateY: starAnim1.interpolate({ inputRange: [0, 1], outputRange: [0, -18] }) }, { scale: popStarScale }] }]}>🌟</Animated.Text>
      <Animated.Text style={[styles.popStar, { top: '28%', right: '10%', transform: [{ translateY: starAnim2.interpolate({ inputRange: [0, 1], outputRange: [0, 22] }) }] }]}>✨</Animated.Text>
      <Animated.Text style={[styles.popStar, { bottom: '15%', left: '12%', transform: [{ scale: popStarScale }] }]}>⭐</Animated.Text>

      <View style={styles.topBar}>
        <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
          <Text style={styles.backButtonText}>← Quit Quiz</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.levelBadge} 
          onPress={() => setIsGradeModalVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.levelBadgeText}>🎓 Grade {currentGrade} • Q {currentIndex + 1}/5 ▼</Text>
        </TouchableOpacity>

        <View style={styles.xpBadge}>
          <Text style={styles.xpBadgeText}>⚡ +150 XP</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.contentCard}>
          <Text style={styles.header}>Math & Science Daily Quiz</Text>
          <Text style={styles.subtext}>Curriculum Mode (24hr Lock Enabled)</Text>

          <View style={styles.questionBox}>
            <Text style={styles.questionText}>{currentQ.question}</Text>
          </View>

          <View style={styles.optionsContainer}>
            {currentQ.options.map((option, index) => {
              let dynOptionStyle = styles.optionButton;
              let dynTextStyle = styles.optionText;

              if (selectedOption !== null) {
                if (option === currentQ.answer) {
                  dynOptionStyle = [styles.optionButton, styles.correctOption] as any;
                  dynTextStyle = [styles.optionText, styles.correctText] as any;
                } else if (option === selectedOption) {
                  dynOptionStyle = [styles.optionButton, styles.wrongOption] as any;
                  dynTextStyle = [styles.optionText, styles.wrongText] as any;
                }
              }

              return (
                <Animated.View key={index} style={{ transform: [{ scale: optionScale }], width: '100%' }}>
                  <TouchableOpacity
                    style={dynOptionStyle}
                    onPress={() => handleSelectOption(option)}
                    activeOpacity={0.8}
                    disabled={selectedOption !== null}
                  >
                    <Text style={dynTextStyle}>{option}</Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>

          {selectedOption !== null && (
            <View style={styles.explanationBox}>
              <Text style={styles.explanationTitle}>
                {selectedOption === currentQ.answer ? '🟢 Correct Answer!' : '🔴 Incorrect Answer!'}
              </Text>
              <Text style={styles.explanationText}>The correct answer is: {currentQ.answer}</Text>

              <TouchableOpacity style={styles.nextButton} onPress={handleNextQuestion} activeOpacity={0.8}>
                <Text style={styles.nextButtonText}>
                  {currentIndex < questions.length - 1 ? 'Next Question ➔' : 'Complete Daily Challenge ➔'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      <GradeSelectModal
        visible={isGradeModalVisible}
        gameName="Math & Science Quiz"
        onClose={() => setIsGradeModalVisible(false)}
        onSelectGrade={(selectedGrade: number) => {
          setIsGradeModalVisible(false);
          setCurrentGrade(selectedGrade as GradeLevel);
        }}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#091426', position: 'relative' } as ViewStyle,
  popStar: { position: 'absolute', fontSize: 22, opacity: 0.7, zIndex: 1 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, zIndex: 10 } as ViewStyle,
  backButtonText: { color: '#38bdf8', fontSize: 14, fontWeight: '800' } as TextStyle,
  levelBadge: { backgroundColor: 'rgba(241, 198, 91, 0.15)', borderColor: '#f1c65b', borderWidth: 1, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6 },
  levelBadgeText: { color: '#f1c65b', fontSize: 11, fontWeight: '900' },
  xpBadge: { backgroundColor: 'rgba(56, 189, 248, 0.15)', borderColor: '#38bdf8', borderWidth: 1, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  xpBadgeText: { color: '#38bdf8', fontSize: 11, fontWeight: '900' },
  scrollContent: { flexGrow: 1, paddingBottom: 24 },
  contentCard: { backgroundColor: '#131b2e', margin: 16, padding: 18, borderRadius: 20, alignItems: 'center', borderWidth: 1.2, borderColor: '#30478a', zIndex: 10 } as ViewStyle,
  header: { color: '#FFF', fontSize: 20, fontWeight: '900', marginBottom: 2, textAlign: 'center' } as TextStyle,
  subtext: { color: '#94a3b8', fontSize: 11, marginBottom: 16, textAlign: 'center', fontWeight: '600' } as TextStyle,
  questionBox: { backgroundColor: '#1e293b', paddingVertical: 18, paddingHorizontal: 16, borderRadius: 16, borderWidth: 1.5, borderColor: '#334155', marginBottom: 16, width: '100%', alignItems: 'center' },
  questionText: { color: '#38bdf8', fontSize: 16, fontWeight: '900', textAlign: 'center' },
  optionsContainer: { width: '100%', gap: 10, marginBottom: 12 },
  optionButton: { backgroundColor: '#1e293b', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 14, borderWidth: 1.5, borderColor: '#334155', width: '100%', alignItems: 'center' },
  optionText: { color: '#ffffff', fontWeight: '800', fontSize: 14 },
  correctOption: { backgroundColor: 'rgba(34, 197, 94, 0.2)', borderColor: '#22c55e' },
  correctText: { color: '#4ade80' },
  wrongOption: { backgroundColor: 'rgba(239, 68, 68, 0.2)', borderColor: '#ef4444' },
  wrongText: { color: '#f87171' },
  explanationBox: { backgroundColor: '#1e293b', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#475569', width: '100%', marginTop: 4 },
  explanationTitle: { fontSize: 14, fontWeight: '900', marginBottom: 4, color: '#f8fafc' },
  explanationText: { color: '#94a3b8', fontSize: 12, fontWeight: '600', marginBottom: 12 },
  nextButton: { backgroundColor: '#4f46e5', paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  nextButtonText: { color: '#ffffff', fontWeight: '900', fontSize: 13 },
  displayBox: { backgroundColor: '#1e293b', paddingVertical: 24, paddingHorizontal: 20, borderRadius: 16, borderWidth: 1.5, borderColor: '#334155', marginBottom: 30, width: '100%', alignItems: 'center' },
  scoreText: { color: '#facc15', fontSize: 22, fontWeight: '900', textAlign: 'center', marginBottom: 6 },
  detailText: { color: '#94a3b8', fontSize: 13, fontWeight: '700', textAlign: 'center' },
  actionButton: { backgroundColor: '#4f46e5', paddingVertical: 14, width: '100%', borderRadius: 14, borderWidth: 1, borderColor: '#818cf8', alignItems: 'center' },
  actionButtonText: { color: '#ffffff', fontWeight: '900', fontSize: 15 }
});