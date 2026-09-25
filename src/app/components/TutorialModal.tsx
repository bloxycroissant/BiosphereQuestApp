import React from 'react';
import { Modal, StyleSheet, Text, View, TouchableOpacity, Image, ViewStyle, TextStyle, ImageStyle } from 'react-native';

interface Props {
  game: any | null;
  onClose: () => void;
  onContinue: () => void;
}

export default function TutorialModal({ game, onClose, onContinue }: Props) {
  if (!game) return null;

  // Supports both 'steps' and legacy 'howToPlay' property names
  const tutorialSteps = game.tutorial?.steps || game.tutorial?.howToPlay || [];

  // Safe image source validator for React Native assets
  const hasValidImageIcon = typeof game.icon === 'number' || (typeof game.icon === 'object' && game.icon !== null);

  return (
    <Modal animationType="slide" transparent visible={!!game} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {hasValidImageIcon ? (
            <Image source={game.icon} style={styles.iconImage} resizeMode="contain" />
          ) : (
            <Text style={styles.icon}>{game.icon || '🎮'}</Text>
          )}

          <Text style={styles.title}>{game.title} Tutorial</Text>
          <Text style={styles.reward}>{game.xpText}</Text>

          {game.tutorial?.objective ? (
            <View style={styles.section}>
              <Text style={styles.sectionHeader}>Objective:</Text>
              <Text style={styles.bodyText}>{game.tutorial.objective}</Text>
            </View>
          ) : null}

          {tutorialSteps.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionHeader}>How to Play:</Text>
              {tutorialSteps.map((step: string, idx: number) => (
                <Text key={idx} style={styles.bulletText}>
                  • {step}
                </Text>
              ))}
            </View>
          ) : null}

          {game.tutorial?.example ? (
            <View style={styles.exampleBox}>
              <Text style={styles.exampleTitle}>Example:</Text>
              <Text style={styles.exampleText}>{game.tutorial.example}</Text>
            </View>
          ) : null}

          <TouchableOpacity style={styles.primaryButton} onPress={onContinue} activeOpacity={0.8}>
            <Text style={styles.primaryButtonText}>Select Grade Level →</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.secondaryButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.75)', 
    justifyContent: 'center', 
    padding: 20 
  } as ViewStyle,
  container: { 
    backgroundColor: '#131b2e', 
    borderRadius: 20, 
    padding: 24, 
    borderWidth: 1, 
    borderColor: '#1e293b' 
  } as ViewStyle,
  icon: { 
    fontSize: 40, 
    textAlign: 'center', 
    marginBottom: 8 
  } as TextStyle,
  iconImage: { 
    width: 48, 
    height: 48, 
    alignSelf: 'center', 
    marginBottom: 8 
  } as ImageStyle,
  title: { 
    color: '#FFF', 
    fontSize: 22, 
    fontWeight: '900', 
    textAlign: 'center' 
  } as TextStyle,
  reward: { 
    color: '#38bdf8', 
    fontSize: 14, 
    fontWeight: '800', 
    textAlign: 'center', 
    marginBottom: 16 
  } as TextStyle,
  section: { 
    marginBottom: 12 
  } as ViewStyle,
  sectionHeader: { 
    color: '#94a3b8', 
    fontSize: 12, 
    fontWeight: '800', 
    textTransform: 'uppercase', 
    marginBottom: 4 
  } as TextStyle,
  bodyText: { 
    color: '#e2e8f0', 
    fontSize: 14 
  } as TextStyle,
  bulletText: { 
    color: '#cbd5e1', 
    fontSize: 14, 
    marginBottom: 2 
  } as TextStyle,
  exampleBox: { 
    backgroundColor: '#090d16', 
    padding: 12, 
    borderRadius: 10, 
    marginVertical: 12, 
    borderWidth: 1, 
    borderColor: '#1e293b' 
  } as ViewStyle,
  exampleTitle: { 
    color: '#facc15', 
    fontSize: 12, 
    fontWeight: '800' 
  } as TextStyle,
  exampleText: { 
    color: '#e2e8f0', 
    fontSize: 13, 
    marginTop: 2 
  } as TextStyle,
  primaryButton: { 
    backgroundColor: '#4f46e5', 
    padding: 14, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: 8 
  } as ViewStyle,
  primaryButtonText: { 
    color: '#FFF', 
    fontWeight: '900', 
    fontSize: 15 
  } as TextStyle,
  secondaryButton: { 
    padding: 12, 
    alignItems: 'center', 
    marginTop: 4 
  } as ViewStyle,
  secondaryButtonText: { 
    color: '#94a3b8', 
    fontWeight: '700' 
  } as TextStyle,
});