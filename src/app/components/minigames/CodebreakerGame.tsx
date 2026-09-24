import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated, ViewStyle, TextStyle } from 'react-native';
import { GradeLevel } from '../../data/questionGenerators';

interface Props {
  grade: GradeLevel;
  onSuccess: (xp: number) => void;
  onClose: () => void;
}

type Step = 'subject' | 'playing';
type Subject = 'Math' | 'Science' | 'Both';

export const CodebreakerGame: React.FC<Props> = ({ grade, onSuccess, onClose }) => {
  const [step, setStep] = useState<Step>('subject');
  const [subject, setSubject] = useState<Subject | null>(null);

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
  };

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
          <Text style={styles.subtext}>Grade {grade} Codebreaker</Text>

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

      {step === 'playing' && (
        <Animated.View style={[styles.contentCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.header}>🔐 Codebreaker — Grade {grade} ({subject})</Text>
          <Text style={styles.subtext}>Decrypt the secret code pattern!</Text>

          <View style={styles.codeBox}>
            <Text style={styles.codeText}>[ 3 ] - [ 6 ] - [ 9 ] - [ ? ]</Text>
          </View>

          <TouchableOpacity style={styles.finishBtn} onPress={() => onSuccess(300)} activeOpacity={0.8}>
            <Text style={styles.btnText}>Crack the Code! (+300 XP)</Text>
          </TouchableOpacity>
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
  header: { color: '#FFF', fontSize: 18, fontWeight: '900', marginBottom: 4, textAlign: 'center' } as TextStyle,
  subtext: { color: '#94a3b8', fontSize: 13, marginBottom: 20, textAlign: 'center' } as TextStyle,
  subjectContainer: { flexDirection: 'row', gap: 12, width: '100%', marginBottom: 12 },
  subjectBtn: { flex: 1, backgroundColor: '#1e293b', paddingVertical: 24, borderRadius: 16, alignItems: 'center', borderWidth: 1.5, borderColor: '#334155' },
  mathBtn: { borderColor: '#38bdf8' },
  scienceBtn: { borderColor: '#4ade80' },
  bothBtn: { width: '100%', borderColor: '#c084fc', flexDirection: 'row', justifyContent: 'center', gap: 8, paddingVertical: 18 },
  subjectIcon: { fontSize: 28, marginBottom: 8 },
  subjectBtnText: { color: '#FFF', fontSize: 16, fontWeight: '900' },
  codeBox: { backgroundColor: '#1e293b', padding: 24, borderRadius: 16, width: '100%', alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#818cf8' },
  codeText: { color: '#818cf8', fontSize: 24, fontWeight: '900', letterSpacing: 2 },
  finishBtn: { width: '100%', backgroundColor: '#16a34a', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 'auto' },
  btnText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
});
