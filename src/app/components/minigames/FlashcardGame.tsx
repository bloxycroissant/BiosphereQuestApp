import { LinearGradient } from 'expo-linear-gradient'; // Replace with 'react-native-linear-gradient' if not using Expo
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Flashcard, generateFlashcardDeck, GradeLevel } from '../../data/questionGenerators';
import { MinigameMotion } from './MinigameMotion';

interface Props {
  grade: GradeLevel;
  onSuccess: (xp: number) => void;
  onClose: () => void;
}

const CARDS_PER_CYCLE = 6;

export const FlashcardGame: React.FC<Props> = ({ grade, onSuccess, onClose }) => {
  const seenCards = useRef(new Set<string>());
  const [deck, setDeck] = useState<Flashcard[]>(() => generateFlashcardDeck(grade));
  const [index, setIndex] = useState(0);
  const [masteredCards, setMasteredCards] = useState<string[]>([]);
  const [isFlipped, setIsFlipped] = useState(false);
  const [flipValue] = useState(() => new Animated.Value(0));
  const card = deck[index];

  useEffect(() => {
    deck.forEach((item) => seenCards.current.add(item.front));
  }, [deck]);

  const flip = () => {
    const nextValue = isFlipped ? 0 : 1;
    Animated.spring(flipValue, { toValue: nextValue, useNativeDriver: true, friction: 8 }).start();
    setIsFlipped(!isFlipped);
  };

  const advance = (reviewAgain: boolean) => {
    if (reviewAgain && card) {
      setDeck((cards) => [...cards, card]);
      setMasteredCards((cards) => cards.filter((front) => front !== card.front));
    }
    if (!reviewAgain) {
      if (!masteredCards.includes(card.front)) {
        const nextMastered = [...masteredCards, card.front];
        setMasteredCards(nextMastered);
        if (nextMastered.length === CARDS_PER_CYCLE) {
          onSuccess(80);
          const nextDeck = generateFlashcardDeck(grade, seenCards.current);
          nextDeck.forEach((item) => seenCards.current.add(item.front));
          setDeck(nextDeck);
          setMasteredCards([]);
          setIndex(0);
          setIsFlipped(false);
          flipValue.setValue(0);
          return;
        }
      }
    }
    setIndex((current) => current + 1);
    setIsFlipped(false);
    flipValue.setValue(0);
  };

  if (!card) throw new Error(`Flashcard deck for grade ${grade} is empty.`);

  const frontRotation = flipValue.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const backRotation = flipValue.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });

  return (
    <LinearGradient colors={['#0a0b18', '#2b2b5c']} style={styles.background}>
      <MinigameMotion key={card.front} style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose}><Text style={styles.backText}>‹ Games</Text></TouchableOpacity>
          <Text style={styles.progress}>Card {index + 1} • {masteredCards.length}/{CARDS_PER_CYCLE} mastered</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.eyebrow}>GRADE {grade} • SCIENCE & MATH</Text>
          <Text style={styles.title}>Flashcards</Text>
          <TouchableOpacity style={styles.cardArea} activeOpacity={1} onPress={flip}>
            <Animated.View style={[styles.flashcard, styles.front, { transform: [{ perspective: 900 }, { rotateY: frontRotation }] }]}>
              <Text style={styles.illustration}>🌱</Text>
              <Text style={styles.cardText}>{card.front}</Text>
              <Text style={styles.flipHint}>Tap card to reveal the answer ↻</Text>
            </Animated.View>
            <Animated.View style={[styles.flashcard, styles.back, { transform: [{ perspective: 900 }, { rotateY: backRotation }] }]}>
              <Text style={styles.answer}>{card.back}</Text>
              <Text style={styles.explanation}>{card.explanation}</Text>
            </Animated.View>
          </TouchableOpacity>
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
            <TouchableOpacity style={styles.primaryButton} onPress={flip}>
              <Text style={styles.buttonText}>Flip Card</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.rewardHint}>Master the deck review cycle to earn +80 XP</Text>
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
  cardArea: { width: '100%', height: 300, marginBottom: 20 } as ViewStyle,
  flashcard: { position: 'absolute', width: '100%', height: '100%', borderRadius: 22, padding: 24, justifyContent: 'center', alignItems: 'center', backfaceVisibility: 'hidden' } as ViewStyle,
  front: { backgroundColor: 'rgba(255, 255, 255, 0.08)', borderWidth: 2, borderColor: '#38bdf8' } as ViewStyle,
  back: { backgroundColor: 'rgba(34, 197, 94, 0.15)', borderWidth: 2, borderColor: '#4ade80' } as ViewStyle,
  illustration: { fontSize: 48, marginBottom: 14 } as TextStyle,
  cardText: { color: '#fff', fontSize: 19, fontWeight: '800', textAlign: 'center', lineHeight: 27 } as TextStyle,
  flipHint: { color: '#94a3b8', fontSize: 12, fontWeight: '700', marginTop: 20, textAlign: 'center' } as TextStyle,
  answer: { color: '#86efac', fontSize: 22, fontWeight: '900', textAlign: 'center' } as TextStyle,
  explanation: { color: '#cbd5e1', fontSize: 14, textAlign: 'center', lineHeight: 21, marginTop: 14 } as TextStyle,
  actions: { flexDirection: 'row', gap: 12 } as ViewStyle,
  primaryButton: { flex: 1, backgroundColor: '#16a34a', padding: 15, borderRadius: 14, alignItems: 'center' } as ViewStyle,
  secondaryButton: { flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.15)', padding: 15, borderRadius: 14, alignItems: 'center' } as ViewStyle,
  buttonText: { color: '#fff', fontSize: 14, fontWeight: '900' } as TextStyle,
  rewardHint: { color: '#94a3b8', fontSize: 11, fontWeight: '700', textAlign: 'center', marginTop: 18 } as TextStyle,
});