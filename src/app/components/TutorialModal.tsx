import React from "react";
import {
  Image,
  ImageStyle,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

interface TutorialGameData {
  title?: string;
  icon?: any;
  xpText?: string;
  tutorial?: {
    objective?: string;
    steps?: string[];
    howToPlay?: string[];
    example?: string;
  };
}

interface Props {
  game: TutorialGameData | null;
  onClose: () => void;
  onContinue: () => void;
}

export default function TutorialModal({
  game,
  onClose,
  onContinue,
}: Props): React.JSX.Element | null {
  if (!game) return null;

  const tutorialSteps = game.tutorial?.steps || game.tutorial?.howToPlay || [];

  const hasValidImageIcon =
    typeof game.icon === "number" ||
    (typeof game.icon === "object" && game.icon !== null);

  return (
    <Modal
      animationType="fade"
      transparent
      visible={!!game}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Backdrop tap dismisses the modal */}
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={styles.container}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            bounces={false}
          >
            {hasValidImageIcon ? (
              <Image
                source={game.icon}
                style={styles.iconImage}
                resizeMode="contain"
              />
            ) : (
              <Text style={styles.icon}>{game.icon || "🎮"}</Text>
            )}

            <Text style={styles.title}>{game.title || "Game"} Tutorial</Text>
            {game.xpText ? (
              <Text style={styles.reward}>{game.xpText}</Text>
            ) : null}

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
          </ScrollView>

          <View style={styles.actionButtons}>
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
              ]}
              onPress={onContinue}
            >
              <Text style={styles.primaryButtonText}>Start Game 🚀</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && { opacity: 0.7 },
              ]}
              onPress={onClose}
              hitSlop={8}
            >
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(3, 7, 18, 0.82)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  } as ViewStyle,
  container: {
    backgroundColor: "#131b2e",
    borderRadius: 22,
    padding: 20,
    borderWidth: 1.5,
    borderColor: "#2a3b63",
    width: "100%",
    maxWidth: 380,
    maxHeight: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 10,
  } as ViewStyle,
  scrollContent: {
    paddingBottom: 10,
  } as ViewStyle,
  icon: {
    fontSize: 40,
    textAlign: "center",
    marginBottom: 8,
  } as TextStyle,
  iconImage: {
    width: 48,
    height: 48,
    alignSelf: "center",
    marginBottom: 8,
  } as ImageStyle,
  title: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "900",
    textAlign: "center",
  } as TextStyle,
  reward: {
    color: "#38bdf8",
    fontSize: 13,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 2,
    marginBottom: 16,
  } as TextStyle,
  section: {
    marginBottom: 12,
  } as ViewStyle,
  sectionHeader: {
    color: "#818cf8",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 4,
  } as TextStyle,
  bodyText: {
    color: "#e2e8f0",
    fontSize: 13.5,
    lineHeight: 20,
    fontWeight: "500",
  } as TextStyle,
  bulletText: {
    color: "#cbd5e1",
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 4,
    fontWeight: "500",
  } as TextStyle,
  exampleBox: {
    backgroundColor: "#0d1424",
    padding: 12,
    borderRadius: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#1e2c4f",
  } as ViewStyle,
  exampleTitle: {
    color: "#facc15",
    fontSize: 11,
    fontWeight: "900",
  } as TextStyle,
  exampleText: {
    color: "#e2e8f0",
    fontSize: 12.5,
    lineHeight: 18,
    marginTop: 3,
    fontWeight: "500",
  } as TextStyle,
  actionButtons: {
    marginTop: 8,
    gap: 4,
  } as ViewStyle,
  primaryButton: {
    backgroundColor: "#4f46e5",
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
  } as ViewStyle,
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 15,
  } as TextStyle,
  secondaryButton: {
    paddingVertical: 10,
    alignItems: "center",
  } as ViewStyle,
  secondaryButtonText: {
    color: "#94a3b8",
    fontWeight: "800",
    fontSize: 13,
  } as TextStyle,
});
