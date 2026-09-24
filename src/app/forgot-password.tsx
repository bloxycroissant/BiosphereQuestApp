import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, Alert } from 'react-native';
import { GradientSafeAreaView as SafeAreaView } from '@/components/gradient-safe-area';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';

const logo = require('../../assets/BiosphereQuestAssets/Biosphere Quest Logo.png');

function GradientText({ style, children }: { style: any; children: string }) {
  return (
    <MaskedView maskElement={<Text style={[style, { backgroundColor: 'transparent' }]}>{children}</Text>}>
      <LinearGradient colors={['#a78bfa', '#e879f9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
        <Text style={[style, { opacity: 0 }]}>{children}</Text>
      </LinearGradient>
    </MaskedView>
  );
}

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');

  const handleSendCode = () => {
    if (!email.trim()) {
      Alert.alert('Email Required', 'Please enter your email address to receive a recovery code.');
      return;
    }
    // Proceed after the form has been filled out
    router.push('/verify-code');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.cancelButton}>
          <MaterialCommunityIcons name="arrow-left" size={20} color="#ffffff" />
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.logoContainer}>
          <Image source={logo} style={styles.logo} contentFit="contain" />
          <GradientText style={styles.brandTitle}>Biosphere Quest</GradientText>
          <Text style={styles.pageTitle}>Forgot Password</Text>
          <Text style={styles.pageSubtitle}>Enter your email to receive a recovery code</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.inputLabel}>Enter your email address</Text>
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons name="email-outline" size={20} color="#8a9bbd" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Enter your email address"
              placeholderTextColor="#5a6b94"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
        </View>

        <Pressable style={styles.primaryButton} onPress={handleSendCode}>
          <Text style={styles.primaryButtonText}>Send Recovery Code</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#070f1e' },
  headerRow: { paddingHorizontal: 20, paddingTop: 10 },
  cancelButton: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' },
  cancelText: { color: '#ffffff', fontSize: 16, fontWeight: '700', marginLeft: 6 },
  content: { flexGrow: 1, justifyContent: 'center', padding: 20, paddingBottom: 40 },
  logoContainer: { alignItems: 'center', marginBottom: 24 },
  logo: { width: 80, height: 80, marginBottom: 14 },
  brandTitle: { fontSize: 28, fontWeight: '800', marginBottom: 14, letterSpacing: 0.5, textAlign: 'center' },
  pageTitle: { color: '#ffffff', fontSize: 24, fontWeight: '700', marginBottom: 8 },
  pageSubtitle: { color: '#8a9bbd', fontSize: 15, textAlign: 'center' },
  formContainer: { marginBottom: 30 },
  inputLabel: { color: '#8a9bbd', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0d1930', borderColor: '#23385e', borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, height: 56 },
  inputIcon: { marginRight: 12 },
  textInput: { flex: 1, color: '#ffffff', fontSize: 16, padding: 0 },
  primaryButton: { backgroundColor: '#6366f1', borderRadius: 12, height: 56, justifyContent: 'center', alignItems: 'center', shadowColor: '#6366f1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 5 },
  primaryButtonText: { color: '#ffffff', fontSize: 17, fontWeight: '700' },
});
