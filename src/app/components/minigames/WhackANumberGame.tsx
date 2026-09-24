import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated, ViewStyle, TextStyle } from 'react-native';
import { GradeLevel } from '../../data/questionGenerators';
import GradeSelectModal from '../GradeSelectModal';

interface Props {
  grade: GradeLevel;
  onSuccess: (xp: number) => void;
  onClose: () => void;
}

export const WhackANumberGame: React.FC<Props> = ({ grade, onSuccess, onClose }) => {
  const [currentGrade, setCurrentGrade] = useState<GradeLevel>(grade);
  const [isGradeModalVisible, setIsGradeModalVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);
  const [usedIds, setUsedIds] = useState<string[]>([]);
  const [currentChallenge, setCurrentChallenge] = useState<any>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const starAnim = useRef(new Animated.Value(0)).current;

  const playSoundEffect = (type: 'tap' | 'success' | 'timeout') => {
    console.log(`[Whack-a-Number SFX]: ${type}`);
  };

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(starAnim, { toValue: 1, duration: 4500, useNativeDriver: true }),
        Animated.timing(starAnim, { toValue: 0, duration: 4500, useNativeDriver: true }),
      ])
    ).start();
    loadNextUniqueChallenge();
  }, [currentGrade]);

  useEffect(() => {
    if (timeLeft <= 0) {
      playSoundEffect('timeout');
      loadNextUniqueChallenge();
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const loadNextUniqueChallenge = () => {
    setTimeLeft(45);
    const pool = [
      { id: `wh1-${currentGrade}`, prompt: `Tap Even numbers up to ${currentGrade * 10}`, detail: `Grade ${currentGrade} Target Action` },
      { id: `wh2-${currentGrade}`, prompt: `Tap Multiples of ${currentGrade}`, detail: `Grade ${currentGrade} Target Action` },
      { id: `wh3-${currentGrade}`, prompt: `Tap Prime numbers range 1-${currentGrade * 5}`, detail: `Grade ${currentGrade} Target Action` },
    ];
    const available = pool.filter((item) => !usedIds.includes(item.id));
    const targetPool = available.length > 0 ? pool : pool;
    if (available.length === 0) setUsedIds([]);

    const randomItem = targetPool[Math.floor(Math.random() * targetPool.length)];
    if (randomItem) {
      setUsedIds((prev) => [...prev, randomItem.id]);
      setCurrentChallenge(randomItem);
    }
  };

  const handleNextPress = () => {
    playSoundEffect('tap');
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.9, duration: 80, useNativeDriver: true }),
      Animated.spring(buttonScale, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();
    onSuccess(25);
    loadNextUniqueChallenge();
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Animated.Text style={[styles.floatingStar, { top: '35%', left: '8%', transform: [{ translateY: starAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 20] }) }] }]}>✨</Animated.Text>

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => { playSoundEffect('tap'); onClose(); }} activeOpacity={0.7}>
          <Text style={styles.backButtonText}>← Quit Game</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.levelBadge} 
          onPress={() => setIsGradeModalVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.levelBadgeText}>🎓 Grade {currentGrade} ▼</Text>
        </TouchableOpacity>

        <View style={[styles.timerBadge, timeLeft <= 10 && styles.timerWarning]}>
          <Text style={styles.timerText}>⏳ {timeLeft}s</Text>
        </View>
      </View>

      <View style={styles.contentCard}>
        <Text style={styles.header}>🔨 Whack-a-Number</Text>
        <Text style={styles.subtext}>{currentChallenge?.detail || 'Tap matching targets fast!'}</Text>
        <View style={styles.displayBox}>
          <Text style={styles.displayText}>{currentChallenge?.prompt || 'Target'}</Text>
        </View>
        <Animated.View style={{ transform: [{ scale: buttonScale }], width: '100%', alignItems: 'center' }}>
          <TouchableOpacity style={styles.actionButton} onPress={handleNextPress} activeOpacity={0.8}>
            <Text style={styles.actionButtonText}>Next Target ➔</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      <GradeSelectModal
        visible={isGradeModalVisible}
        gameName="Whack-a-Number"
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
  floatingStar: { position: 'absolute', fontSize: 20, opacity: 0.6, zIndex: 1 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, zIndex: 10 } as ViewStyle,
  backButtonText: { color: '#38bdf8', fontSize: 14, fontWeight: '800' } as TextStyle,
  levelBadge: { backgroundColor: 'rgba(241, 198, 91, 0.15)', borderColor: '#f1c65b', borderWidth: 1, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  levelBadgeText: { color: '#f1c65b', fontSize: 11, fontWeight: '900' },
  timerBadge: { backgroundColor: '#1e293b', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, borderWidth: 1, borderColor: '#334155' },
  timerWarning: { borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.15)' },
  timerText: { color: '#facc15', fontWeight: '900', fontSize: 12 },
  contentCard: { flex: 1, backgroundColor: '#131b2e', margin: 16, padding: 20, borderRadius: 20, alignItems: 'center', borderWidth: 1.2, borderColor: '#30478a', justifyContent: 'center', zIndex: 10 } as ViewStyle,
  header: { color: '#FFF', fontSize: 20, fontWeight: '900', marginBottom: 4, textAlign: 'center' } as TextStyle,
  subtext: { color: '#94a3b8', fontSize: 12, marginBottom: 24, textAlign: 'center', fontWeight: '600' } as TextStyle,
  displayBox: { backgroundColor: '#1e293b', paddingVertical: 24, paddingHorizontal: 20, borderRadius: 16, borderWidth: 1.5, borderColor: '#334155', marginBottom: 30, width: '100%', alignItems: 'center' },
  displayText: { color: '#38bdf8', fontSize: 18, fontWeight: '900', textAlign: 'center' },
  actionButton: { backgroundColor: '#4f46e5', paddingVertical: 14, width: '100%', borderRadius: 14, borderWidth: 1, borderColor: '#818cf8', alignItems: 'center' },
  actionButtonText: { color: '#ffffff', fontWeight: '900', fontSize: 15 }
});