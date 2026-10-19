import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Flashcard, generateFlashcardDeck, GradeLevel } from '../../data/questionGenerators';
import { MinigameMotion } from './MinigameMotion';

interface Props {
  grade: GradeLevel;
  onSuccess: (xp: number) => void;
  onClose: () => void;
}

type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Expert' | 'Impossible';

const CARDS_PER_CYCLE = 6;

const getDifficulty = (completedCycles: number): Difficulty => {
  if (completedCycles <= 0) return 'Easy';
  if (completedCycles === 1) return 'Medium';
  if (completedCycles === 2) return 'Hard';
  if (completedCycles === 3) return 'Expert';
  return 'Impossible';
};

const getXPForDifficulty = (diff: Difficulty): number => {
  switch (diff) {
    case 'Easy': return 50;
    case 'Medium': return 80;
    case 'Hard': return 120;
    case 'Expert': return 160;
    case 'Impossible': return 220;
  }
};

export const FlashcardGame: React.FC<Props> = ({ grade, onSuccess, onClose }) => {
  const seenCards = useRef(new Set<string>());
  const antiCheatTimestamp = useRef<number>(Date.now());

  const [completedCycles, setCompletedCycles] = useState(0);
  const [deck, setDeck] = useState<Flashcard[]>(() => {
    const initialDeck = generateFlashcardDeck(grade);
    initialDeck.forEach((item) => seenCards.current.add(item.front));
    return initialDeck;
  });
  const [index, setIndex] = useState(0);
  const [masteredCards, setMasteredCards] = useState<string[]>([]);
  const [isFlipped, setIsFlipped] = useState(false);
  const flipValue = useRef(new Animated.Value(0)).current;

  const currentDifficulty = getDifficulty(completedCycles);
  const currentXP = getXPForDifficulty(currentDifficulty);
  const card = deck[index % deck.length];

  const flip = () => {
    const toValue = isFlipped ? 0 : 1;
    Animated.spring(flipValue, {
      toValue,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  const resetFlip = () => {
    setIsFlipped(false);
    flipValue.setValue(0);
  };

  const advance = (reviewAgain: boolean) => {
    if (Date.now() - antiCheatTimestamp.current < 150) return;
    antiCheatTimestamp.current = Date.now();

    if (reviewAgain && card) {
      setDeck((cards) => [...cards, card]);
      setMasteredCards((cards) => cards.filter((front) => front !== card.front));
    }

    if (!reviewAgain && card) {
      if (!masteredCards.includes(card.front)) {
        const nextMastered = [...masteredCards, card.front];
        setMasteredCards(nextMastered);

        if (nextMastered.length >= CARDS_PER_CYCLE) {
          onSuccess(currentXP);
          setCompletedCycles((c) => c + 1);

          let nextDeck = generateFlashcardDeck(grade, seenCards.current);
          if (!nextDeck || nextDeck.length === 0) {
            seenCards.current.clear();
            nextDeck = generateFlashcardDeck(grade, seenCards.current);
          }

          nextDeck.forEach((item) => seenCards.current.add(item.front));
          setDeck(nextDeck);
          setMasteredCards([]);
          setIndex(0);
          resetFlip();
          return;
        }
      }
    }

    setIndex((current) => current + 1);
    resetFlip();
  };

  if (!card) throw new Error(`Flashcard deck for grade ${grade} is empty.`);

  const frontInterpolate = flipValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  return (
    <LinearGradient colors={['#0a0b18', '#2b2b5c']} style={styles.background}>
      <MinigameMotion key={`${card.front}-${index}`} style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose}><Text style={styles.backText}>Games</Text></TouchableOpacity>
          <Text style={styles.progress}>Card {index + 1} • {masteredCards.length}/{CARDS_PER_CYCLE} mastered</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.eyebrow}>GRADE {grade} • {currentDifficulty.toUpperCase()} LEVEL</Text>
          <Text style={styles.title}>Flashcards</Text>
          
          <TouchableOpacity style={styles.cardArea} activeOpacity={1} onPress={flip}>
            <Animated.View style={[
              styles.flashcard, 
              styles.front, 
              { transform: [{ perspective: 1000 }, { rotateY: frontInterpolate }] }
            ]}>
              <Text style={styles.illustration}>🌱</Text>
              <Text style={styles.cardText}>{card.front}</Text>
              <Text style={styles.flipHint}>Tap card to reveal the answer ↻</Text>
            </Animated.View>

            <Animated.View style={[
              styles.flashcard, 
              styles.back, 
              { transform: [{ perspective: 1000 }, { rotateY: backInterpolate }] }
            ]}>
              <Text style={styles.answer}>{card.back}</Text>
              <Text style={styles.explanation}>{card.explanation}</Text>
            </Animated.View>
          </TouchableOpacity>

          <View style={styles.buttonWrapper}>
            {isFlipped ? (
              <View style={styles.actions}>
                <TouchableOpacity style={styles.secondaryButton} onPress={() => advance(true)}>
                  <Text style={styles.buttonText}>Review Again</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.primaryButton} onPress={() => advance(false)}>
                  <Text style={styles.buttonText}>Got it ✓</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.singlePrimaryButton} onPress={flip}>
                <Text style={styles.buttonText}>Flip Card</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.rewardHint}>Master the deck cycle to earn +{currentXP} XP</Text>
        </View>
      </MinigameMotion>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1 } as ViewStyle,
  container: { flex: 1, backgroundColor: 'transparent' } as ViewStyle,
  topBar: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' } as ViewStyle,
  backText: { color: '#38bdf8', fontSize: 15, fontWeight: '800' } as TextStyle,
  progress: { color: '#cbd5e1', fontSize: 12, fontWeight: '800' } as TextStyle,
  content: { flex: 1, justifyContent: 'center', padding: 20 } as ViewStyle,
  eyebrow: { color: '#4ade80', fontSize: 11, fontWeight: '900', letterSpacing: 1, textAlign: 'center', marginBottom: 8 } as TextStyle,
  title: { color: '#fff', fontSize: 24, fontWeight: '900', textAlign: 'center', marginBottom: 20 } as TextStyle,
  cardArea: { width: '100%', height: 280, marginBottom: 20 } as ViewStyle,
  flashcard: { position: 'absolute', width: '100%', height: '100%', borderRadius: 22, padding: 24, justifyContent: 'center', alignItems: 'center', backfaceVisibility: 'hidden' } as ViewStyle,
  front: { backgroundColor: 'rgba(255, 255, 255, 0.08)', borderWidth: 2, borderColor: '#38bdf8' } as ViewStyle,
  back: { backgroundColor: 'rgba(34, 197, 94, 0.15)', borderWidth: 2, borderColor: '#4ade80' } as ViewStyle,
  illustration: { fontSize: 44, marginBottom: 12 } as TextStyle,
  cardText: { color: '#fff', fontSize: 19, fontWeight: '800', textAlign: 'center', lineHeight: 26 } as TextStyle,
  flipHint: { color: '#94a3b8', fontSize: 12, fontWeight: '700', marginTop: 16, textAlign: 'center' } as TextStyle,
  answer: { color: '#86efac', fontSize: 22, fontWeight: '900', textAlign: 'center' } as TextStyle,
  explanation: { color: '#cbd5e1', fontSize: 14, textAlign: 'center', lineHeight: 21, marginTop: 12 } as TextStyle,
  buttonWrapper: { minHeight: 52, justifyContent: 'center' } as ViewStyle,
  actions: { flexDirection: 'row', gap: 12 } as ViewStyle,
  singlePrimaryButton: { width: '100%', height: 52, backgroundColor: '#16a34a', borderRadius: 14, justifyContent: 'center', alignItems: 'center' } as ViewStyle,
  primaryButton: { flex: 1, height: 52, backgroundColor: '#16a34a', borderRadius: 14, justifyContent: 'center', alignItems: 'center' } as ViewStyle,
  secondaryButton: { flex: 1, height: 52, backgroundColor: 'rgba(255, 255, 255, 0.15)', borderRadius: 14, justifyContent: 'center', alignItems: 'center' } as ViewStyle,
  buttonText: { color: '#fff', fontSize: 14, fontWeight: '900' } as TextStyle,
  rewardHint: { color: '#94a3b8', fontSize: 11, fontWeight: '700', textAlign: 'center', marginTop: 16 } as TextStyle,
});