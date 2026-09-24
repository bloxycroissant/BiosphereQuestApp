import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated, ViewStyle, TextStyle } from 'react-native';
import { generateFlashcard, Flashcard, GradeLevel } from '../../data/questionGenerators';

interface Props {
  grade: GradeLevel;
  onSuccess: (xp: number) => void;
  onClose: () => void;
}

type Step = 'subject' | 'playing';
type Subject = 'Math' | 'Science' | 'Both';

export const FlashcardGame: React.FC<Props> = ({ grade, onSuccess, onClose }) => {
  const [step, setStep] = useState<Step>('subject');
  const [subject, setSubject] = useState<Subject | null>(null);

  const [card, setCard] = useState<Flashcard | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  
  const flipAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(20);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
    ]).start();
  }, [step]);

  const handleSelectSubject = (selectedSubject: Subject) => {
    setSubject(selectedSubject);
    setStep('playing');
    loadCard();
  };

  const loadCard = () => {
    setCard(generateFlashcard(grade));
    setIsFlipped(false);
    flipAnim.setValue(0);
  };

  const toggleFlip = () => {
    Animated.spring(flipAnim, {
      toValue: isFlipped ? 0 : 180,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  const frontInterpolate = flipAnim.interpolate({ inputRange: [0, 180], outputRange: ['0deg', '180deg'] });
  const backInterpolate = flipAnim.interpolate({ inputRange: [0, 180], outputRange: ['180deg', '360deg'] });

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity 
          onPress={() => step === 'playing' ? setStep('subject') : onClose()} 
          style={styles.backButton} 
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>
            {step === 'playing' ? '← Back to Subjects' : '← Back to Games'}
          </Text>
        </TouchableOpacity>
      </View>

      {step === 'subject' && (
        <Animated.View style={[styles.contentCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }], justifyContent: 'center' }]}>
          <Text style={styles.header}>🎯 Choose Your Subject</Text>
          <Text style={styles.subtext}>Grade {grade} Flashcards</Text>

          <View style={styles.subjectContainer}>
            <TouchableOpacity style={[styles.subjectBtn, styles.mathBtn]} onPress={() => handleSelectSubject('Math')} activeOpacity={0.8}>
              <Text style={styles.subjectIcon}>📐</Text>
              <Text style={styles.subjectBtnText}>Math</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.subjectBtn, styles.scienceBtn]} onPress={() => handleSelectSubject('Science')} activeOpacity={0.8}>
              <Text style={styles.subjectIcon}>🔬</Text>
              <Text style={styles.subjectBtnText}>Science</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[styles.subjectBtn, styles.bothBtn]} onPress={() => handleSelectSubject('Both')} activeOpacity={0.8}>
            <Text style={styles.subjectIcon}>🌟</Text>
            <Text style={styles.subjectBtnText}>Both (Mixed Deck)</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {step === 'playing' && card && (
        <Animated.View style={[styles.contentCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.header}>🃏 Flashcard — Grade {grade} ({subject})</Text>

          <TouchableOpacity activeOpacity={1} onPress={toggleFlip} style={styles.cardWrapper}>
            <Animated.View style={[styles.card, styles.cardFront, { transform: [{ rotateY: frontInterpolate }] }]}>
              <Text style={styles.icon}>💡</Text>
              <Text style={styles.promptText}>{card.front}</Text>
              <Text style={styles.hintText}>Tap to flip 🔄</Text>
            </Animated.View>

            <Animated.View style={[styles.card, styles.cardBack, { transform: [{ rotateY: backInterpolate }] }]}>
              <Text style={styles.answerText}>{card.back}</Text>
              <Text style={styles.expText}>{card.explanation}</Text>
            </Animated.View>
          </TouchableOpacity>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.reviewBtn} onPress={loadCard} activeOpacity={0.8}>
              <Text style={styles.btnText}>Next Card 🔄</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.gotItBtn} onPress={() => onSuccess(80)} activeOpacity={0.8}>
              <Text style={styles.btnText}>Complete Deck (+80 XP)</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#091426' } as ViewStyle,
  topBar: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 } as ViewStyle,
  backButton: { paddingVertical: 6, alignSelf: 'flex-start' } as ViewStyle,
  backButtonText: { color: '#38bdf8', fontSize: 15, fontWeight: '800' } as TextStyle,
  contentCard: { flex: 1, backgroundColor: '#131b2e', margin: 16, padding: 20, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: '#1e293b' } as ViewStyle,
  header: { color: '#FFF', fontSize: 18, fontWeight: '900', marginBottom: 6, textAlign: 'center' } as TextStyle,
  subtext: { color: '#94a3b8', fontSize: 13, marginBottom: 24, textAlign: 'center' } as TextStyle,
  subjectContainer: { flexDirection: 'row', gap: 12, width: '100%', marginBottom: 12 },
  subjectBtn: { flex: 1, backgroundColor: '#1e293b', paddingVertical: 24, borderRadius: 16, alignItems: 'center', borderWidth: 1.5, borderColor: '#334155' },
  mathBtn: { borderColor: '#38bdf8' },
  scienceBtn: { borderColor: '#4ade80' },
  bothBtn: { width: '100%', borderColor: '#c084fc', flexDirection: 'row', justifyContent: 'center', gap: 8, paddingVertical: 18 },
  subjectIcon: { fontSize: 28, marginBottom: 8 },
  subjectBtnText: { color: '#FFF', fontSize: 16, fontWeight: '900' },
  cardWrapper: { width: '100%', height: 240, marginVertical: 10 } as ViewStyle,
  card: { width: '100%', height: '100%', borderRadius: 16, padding: 20, justifyContent: 'center', alignItems: 'center', position: 'absolute', backfaceVisibility: 'hidden' } as ViewStyle,
  cardFront: { backgroundColor: '#1e293b', borderWidth: 2, borderColor: '#38bdf8' } as ViewStyle,
  cardBack: { backgroundColor: '#1e1b4b', borderWidth: 2, borderColor: '#818cf8' } as ViewStyle,
  icon: { fontSize: 32, marginBottom: 8 } as TextStyle,
  promptText: { color: '#FFF', fontSize: 16, fontWeight: '800', textAlign: 'center' } as TextStyle,
  hintText: { color: '#94a3b8', fontSize: 11, marginTop: 12 } as TextStyle,
  answerText: { color: '#38bdf8', fontSize: 22, fontWeight: '900', textAlign: 'center' } as TextStyle,
  expText: { color: '#e2e8f0', fontSize: 13, textAlign: 'center', marginTop: 8 } as TextStyle,
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 'auto', marginBottom: 10, width: '100%' } as ViewStyle,
  reviewBtn: { flex: 1, backgroundColor: '#334155', padding: 14, borderRadius: 12, alignItems: 'center' } as ViewStyle,
  gotItBtn: { flex: 1, backgroundColor: '#16a34a', padding: 14, borderRadius: 12, alignItems: 'center' } as ViewStyle,
  btnText: { color: '#FFF', fontWeight: '800', fontSize: 12 } as TextStyle,
});