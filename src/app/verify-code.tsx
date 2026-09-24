import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
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

export default function VerifyCodeScreen() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const handleTextChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyCode = () => {
    const fullCode = code.join('');
    if (fullCode.length < 6) {
      Alert.alert('Invalid Code', 'Please enter the complete 6-digit verification code.');
      return;
    }
    router.push('/new-password');
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
          <Text style={styles.pageTitle}>Enter Verification Code</Text>
          <Text style={styles.pageSubtitle}>We sent a 6-digit code to your email.</Text>
        </View>

        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              style={styles.codeInputBox}
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              onChangeText={(text) => handleTextChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              placeholderTextColor="#5a6b94"
            />
          ))}
        </View>

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive code? </Text>
          <Text style={styles.resendAction}>Resend (30s)</Text>
        </View>

        <Pressable style={styles.primaryButton} onPress={handleVerifyCode}>
          <Text style={styles.primaryButtonText}>Verify Code</Text>
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
  codeContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, paddingHorizontal: 10 },
  codeInputBox: { width: 45, height: 55, backgroundColor: '#0d1930', borderColor: '#23385e', borderWidth: 1, borderRadius: 12, color: '#ffffff', fontSize: 22, fontWeight: '700', textAlign: 'center' },
  resendContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 30 },
  resendText: { color: '#8a9bbd', fontSize: 14 },
  resendAction: { color: '#a78bfa', fontSize: 14, fontWeight: '700' },
  primaryButton: { backgroundColor: '#6366f1', borderRadius: 12, height: 56, justifyContent: 'center', alignItems: 'center', shadowColor: '#6366f1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 5 },
  primaryButtonText: { color: '#ffffff', fontSize: 17, fontWeight: '700' },
});
