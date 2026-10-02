import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function LessonScreen() {
  const [activeTab, setActiveTab] = useState('Courses');

  return (
    <View style={styles.container}>
      {/* Top Navigation / Back Link */}
      <View style={styles.topBar}>
        <TouchableOpacity>
          <Text style={styles.backText}>‹ Back to courses</Text>
        </TouchableOpacity>
      </View>

      {/* Notebook Spread Container */}
      <View style={styles.notebookWrapper}>
        <View style={styles.notebookSpread}>
          
          {/* Left Page */}
          <View style={styles.page}>
            <View style={styles.ruledLine} />
            <View style={styles.ruledLine} />
            <View style={styles.ruledLine} />
            <Text style={styles.pageTextContent}>
              Positive and negative numbers represent quantities on opposite sides of zero.
            </Text>
          </View>

          {/* Book Center Binding Shadow */}
          <View style={styles.bindingShadow} />

          {/* Right Page */}
          <View style={styles.page}>
            <View style={styles.ruledLine} />
            <View style={styles.ruledLine} />
            <View style={styles.ruledLine} />
            <Text style={styles.pageTextContent}>
              Order -3, 2, -1, and 0 from least to greatest.
            </Text>
          </View>

        </View>
      </View>

      {/* Card Details & Action Area */}
      <View style={styles.contentContainer}>
        <View style={styles.headerCard}>
          <Text style={styles.headerIcon}>📐</Text>
          <Text style={styles.headerTitle}>Integers and Rational Numbers</Text>
          <Text style={styles.headerMission}>Hard mission</Text>
        </View>
      </View>

      {/* Complete Lesson Action Button */}
      <View style={styles.actionButtonWrapper}>
        <TouchableOpacity style={styles.completeButton}>
          <Text style={styles.completeButtonText}>
            Complete lesson • +40 XP →
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNavBar}>
        {['Home', 'Courses', 'Games', 'Profile'].map((tab) => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity 
              key={tab} 
              style={styles.navItem} 
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.navText, isActive && styles.navTextActive]}>
                {tab}
              </Text>
              {isActive && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingTop: 45,
    justifyContent: 'space-between',
  },
  topBar: {
    paddingHorizontal: 20,
    marginBottom: 5,
  },
  backText: {
    color: '#c084fc',
    fontSize: 16,
    fontWeight: '600',
  },
  notebookWrapper: {
    alignItems: 'center',
    marginVertical: 10,
  },
  notebookSpread: {
    width: '90%',
    height: 180,
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  page: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 12,
    justifyContent: 'flex-start',
  },
  ruledLine: {
    height: 1,
    backgroundColor: '#e2e8f0',
    width: '100%',
    marginVertical: 10,
  },
  pageTextContent: {
    fontSize: 11,
    color: '#1e293b',
    fontWeight: '500',
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    lineHeight: 16,
  },
  bindingShadow: {
    width: 12,
    backgroundColor: '#cbd5e1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  headerCard: {
    backgroundColor: '#1e1b4b',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#3730a3',
    padding: 16,
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 4,
  },
  headerMission: {
    fontSize: 12,
    fontWeight: '700',
    color: '#34d399',
    textTransform: 'lowercase',
  },
  actionButtonWrapper: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  completeButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  completeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  bottomNavBar: {
    flexDirection: 'row',
    backgroundColor: '#090d16',
    height: 65,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  navText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  navTextActive: {
    color: '#ffffff',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 4,
    width: 36,
    height: 4,
    backgroundColor: '#0d9488',
    borderRadius: 2,
  },
});