import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface GradeSelectProps {
  visible: boolean;
  gameName?: string;
  gameTitle?: string;
  onClose: () => void;
  onSelectGrade: (grade: number) => void;
}

export default function GradeSelectModal({ visible, gameName, gameTitle, onClose, onSelectGrade }: GradeSelectProps) {
  const displayTitle = gameTitle || gameName || 'Game';

  const handleGradePress = (grade: number) => {
    onSelectGrade(grade); // Pass selected grade to parent
    onClose(); // Automatically close the modal immediately
  };

  return (
    <Modal 
      visible={visible} 
      transparent={true} 
      animationType="fade" 
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Select Grade Level</Text>
          <Text style={styles.subtitle} numberOfLines={1}>{displayTitle}</Text>

          {/* Renders the Grade 1 to 6 choices in a 2-column grid */}
          <View style={styles.gridContainer}>
            {[1, 2, 3, 4, 5, 6].map((grade) => (
              <TouchableOpacity 
                key={grade} 
                style={styles.gradeButton}
                onPress={() => handleGradePress(grade)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={`Grade ${grade}`}
              >
                <Text style={styles.gradeText}>Grade {grade}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={onClose} 
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Cancel grade selection"
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0, 0, 0, 0.75)', 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 20,
  } as ViewStyle,
  modalContent: { 
    backgroundColor: '#131b2e', 
    width: '100%', 
    maxWidth: 360,
    padding: 22, 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: '#1e293b', 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  } as ViewStyle,
  title: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: '900', 
    marginBottom: 4,
    textAlign: 'center',
  } as TextStyle,
  subtitle: { 
    color: '#38bdf8', 
    fontSize: 13, 
    marginBottom: 20,
    textAlign: 'center',
  } as TextStyle,
  gridContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  } as ViewStyle,
  gradeButton: { 
    backgroundColor: '#1e293b', 
    paddingVertical: 12, 
    width: '48%', 
    borderRadius: 10, 
    alignItems: 'center', 
    marginBottom: 10, 
    borderWidth: 1, 
    borderColor: '#334155' 
  } as ViewStyle,
  gradeText: { 
    color: '#f8fafc', 
    fontSize: 15, 
    fontWeight: '700' 
  } as TextStyle,
  cancelButton: { 
    marginTop: 6, 
    padding: 8,
    width: '100%',
    alignItems: 'center',
  } as ViewStyle,
  cancelText: { 
    color: '#ef4444', 
    fontSize: 14, 
    fontWeight: '600' 
  } as TextStyle
});