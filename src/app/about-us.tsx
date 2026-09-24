import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View, Linking } from 'react-native';
import { GradientSafeAreaView as SafeAreaView } from '@/components/gradient-safe-area';

const logo = require('../../assets/BiosphereQuestAssets/Biosphere Quest Logo.png');
const stella = require('../../assets/BiosphereQuestAssets/Stella (Biosphere Quest Mascot).png');
const astro = require('../../assets/BiosphereQuestAssets/Astro (Biosphere Quest Mascot).png');

export default function AboutUsScreen() {
  const handleContactSupport = () => {
    Linking.openURL('mailto:support@biospherequest.app?subject=Support%20Inquiry');
  };

  const handleRateUs = () => {
    Linking.openURL('https://play.google.com/store/apps');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.cancelText}>← Cancel</Text>
          </Pressable>
          <Text style={styles.headerTitle}>About Us</Text>
          <View style={{ width: 50 }} />
        </View>

        <View style={styles.logoContainer}>
          <Image source={logo} style={styles.mainLogo} contentFit="contain" />
        </View>

        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionText} numberOfLines={4}>
            Biosphere Quest turns complex math and science education into an engaging galactic adventure, empowering students to explore ecosystems and master concepts...
          </Text>
        </View>

        <Text style={styles.sectionHeading}>Core Values</Text>
        <View style={styles.coreValuesGrid}>
          <View style={styles.valueCard}>
            <Text style={styles.valueIcon}>🧭</Text>
            <Text style={styles.valueTitle}>Discovery</Text>
            <Text style={styles.valueSubtitle}>Curiosity-driven</Text>
          </View>
          <View style={styles.valueCard}>
            <Text style={styles.valueIcon}>🛡️</Text>
            <Text style={styles.valueTitle}>Integrity</Text>
            <Text style={styles.valueSubtitle}>Curriculum-align</Text>
          </View>
          <View style={styles.valueCard}>
            <Text style={styles.valueIcon}>🎮</Text>
            <Text style={styles.valueTitle}>Engagement</Text>
            <Text style={styles.valueSubtitle}>Gamified quests</Text>
          </View>
          <View style={styles.valueCard}>
            <Text style={styles.valueIcon}>📱</Text>
            <Text style={styles.valueTitle}>Accesibility</Text>
            <Text style={styles.valueSubtitle}>Intuitive UI</Text>
          </View>
        </View>


        <Text style={styles.sectionHeading}>Meet the Team</Text>
        
        <View style={styles.teamRow}>
          <Image source={stella} style={styles.teamMascotLeft} contentFit="contain" />
          <View style={styles.teamInfoLeft}>
            <Text style={styles.teamName}>Christianne Denise S. Sabando</Text>
            <Text style={styles.teamRole}>Project Creator, UX/UI Designer, Lead Game Engine & Interactive Systems Developer</Text>
            <Text style={styles.teamRole}>UI & Authentication Developer</Text>
          </View>
        </View>

        <View style={styles.teamRowRight}>
          <View style={styles.teamInfoRight}>
            <Text style={styles.teamNameRight}>Clarkent A. Arias</Text>
            <Text style={styles.teamRoleRight}>UI & Authentication Developer</Text>
          </View>
          <Image source={astro} style={styles.teamMascotRight} contentFit="contain" />
        </View>

        <Pressable style={styles.actionButton} onPress={handleContactSupport}>
          <Text style={styles.actionButtonText}>Contact Support</Text>
        </Pressable>

        <Pressable style={styles.actionButton} onPress={handleRateUs}>
          <Text style={styles.actionButtonText}>Rate Us on App Store/Google Play</Text>
        </Pressable>

        <View style={styles.footerLinks}>
          <Text style={styles.footerLinkText}>Private Policy • Terms of Service</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#091426' },
  content: { padding: 18, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cancelText: { color: '#f091f8', fontSize: 15, fontWeight: '900' },
  headerTitle: { color: '#ffffff', fontSize: 22, fontWeight: '900', letterSpacing: 0.5 },

  logoContainer: { alignItems: 'center', marginVertical: 6 },
  mainLogo: { width: 100, height: 100 },

  descriptionCard: {
    backgroundColor: '#131e38',
    borderColor: '#374b7c',
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 14,
    marginTop: 4,
    marginBottom: 16,
  },
  descriptionText: {
    color: '#d5def0',
    fontSize: 11.5,
    lineHeight: 17,
    fontWeight: '700',
  },

  sectionHeading: { color: '#ffffff', fontSize: 18, fontWeight: '900', marginTop: 6, marginBottom: 10 },
  
  coreValuesGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, gap: 6 },
  valueCard: {
    flex: 1,
    backgroundColor: '#131e38',
    borderColor: '#374b7c',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  valueIcon: { fontSize: 20, marginBottom: 4 },
  valueTitle: { color: '#ffffff', fontSize: 11, fontWeight: '900', textAlign: 'center' },
  valueSubtitle: { color: '#8a9bbd', fontSize: 8.5, fontWeight: '800', textAlign: 'center', marginTop: 2 },

  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  teamMascotLeft: { width: 115, height: 115, marginRight: 10 },
  teamInfoLeft: { flex: 1, alignItems: 'flex-start' },
  
  teamRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  teamInfoRight: { flex: 1, alignItems: 'flex-end', paddingRight: 8 },
  teamMascotRight: { width: 115, height: 115 },

  teamName: { color: '#ffffff', fontSize: 14, fontWeight: '900', textAlign: 'left' },
  teamRole: { color: '#ffffff', fontSize: 10.5, fontWeight: '800', marginTop: 1, textAlign: 'left', opacity: 0.9 },

  teamNameRight: { color: '#ffffff', fontSize: 14, fontWeight: '900', textAlign: 'right' },
  teamRoleRight: { color: '#ffffff', fontSize: 10.5, fontWeight: '800', marginTop: 1, textAlign: 'right', opacity: 0.9 },

  actionButton: {
    backgroundColor: '#131e38',
    borderColor: '#374b7c',
    borderWidth: 1.5,
    borderRadius: 16,
    alignItems: 'center',
    paddingVertical: 14,
    marginBottom: 10,
  },
  actionButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '900' },

  footerLinks: { alignItems: 'center', marginTop: 10, marginBottom: 20 },
  footerLinkText: { color: '#ffffff', fontSize: 11, fontWeight: '800', opacity: 0.8 },
});
