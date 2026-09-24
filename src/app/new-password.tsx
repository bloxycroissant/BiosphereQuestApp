import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
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

export default function NewPasswordScreen() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleResetPassword = () => {
    if (!password.trim() || !confirmPassword.trim()) {
      Alert.alert("Incomplete Form", "Please fill out all fields before resetting your password.");
      return;
    }

    if (password.length < 8) {
      Alert.alert("Invalid Password", "Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Passwords Don't Match", "Please make sure both passwords match.");
      return;
    }

    Alert.alert("Success", "Password updated successfully!", [
      { 
        text: "OK", 
        onPress: () => router.replace('/login') 
      }
    ]);
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
          <Text style={styles.pageTitle}>Set New Password</Text>
          <Text style={styles.pageSubtitle}>Please create a new password for your account</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.inputLabel}>Enter New Password</Text>
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons name="lock-outline" size={20} color="#8a9bbd" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="••••••••••"
              placeholderTextColor="#5a6b94"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)}>
              <MaterialCommunityIcons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color="#8a9bbd"
              />
            </Pressable>
          </View>

          <Text style={[styles.inputLabel, { marginTop: 14 }]}>Confirm New Password</Text>
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons name="lock-outline" size={20} color="#8a9bbd" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="••••••••••"
              placeholderTextColor="#5a6b94"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <MaterialCommunityIcons
                name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color="#8a9bbd"
              />
            </Pressable>
          </View>

          <View style={styles.requirementsBox}>
            <Text style={styles.reqTitle}>Password must contain:</Text>
            <Text style={styles.reqItem}>• At least 8 characters</Text>
            <Text style={styles.reqItem}>• At least 1 number or special character</Text>
          </View>
        </View>

        <Pressable style={styles.primaryButton} onPress={handleResetPassword}>
          <Text style={styles.primaryButtonText}>Reset Password</Text>
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
  logoContainer: { alignItems: 'center', marginBottom: 20 },
  logo: { width: 80, height: 80, marginBottom: 10 },
  brandTitle: { fontSize: 28, fontWeight: '800', marginBottom: 10, letterSpacing: 0.5, textAlign: 'center' },
  pageTitle: { color: '#ffffff', fontSize: 22, fontWeight: '700', marginBottom: 6 },
  pageSubtitle: { color: '#8a9bbd', fontSize: 14, textAlign: 'center' },
  formContainer: { marginBottom: 24 },
  inputLabel: { color: '#8a9bbd', fontSize: 14, fontWeight: '600', marginBottom: 6 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0d1930', borderColor: '#23385e', borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, height: 56 },
  inputIcon: { marginRight: 12 },
  textInput: { flex: 1, color: '#ffffff', fontSize: 16, padding: 0 },
  requirementsBox: { marginTop: 14, backgroundColor: '#0d1930', borderColor: '#1b2c4f', borderWidth: 1, padding: 14, borderRadius: 10 },
  reqTitle: { color: '#ffffff', fontSize: 13, fontWeight: '700', marginBottom: 6 },
  reqItem: { color: '#8a9bbd', fontSize: 13, lineHeight: 18 },
  primaryButton: { backgroundColor: '#6366f1', borderRadius: 12, height: 56, justifyContent: 'center', alignItems: 'center', shadowColor: '#6366f1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 5 },
  primaryButtonText: { color: '#ffffff', fontSize: 17, fontWeight: '700' },
});
