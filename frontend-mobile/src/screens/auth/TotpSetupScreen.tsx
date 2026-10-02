import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Clipboard from 'expo-clipboard';
import { ShieldCheck, Copy, Check, KeyRound, AlertCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { AuthStackParamList } from '../../navigation/types';
import { Colors } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/layout';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { useAuth } from '../../hooks/useAuth';
import authApi from '../../api/auth';

type Props = NativeStackScreenProps<AuthStackParamList, 'TotpSetup'>;

export function TotpSetupScreen({ route, navigation }: Props) {
  const { name, email, password, secret, qrCodeDataUrl } = route.params;
  const { login } = useAuth();

  const [totpCode, setTotpCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCopyKey = async () => {
    await Clipboard.setStringAsync(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = async () => {
    const sanitizedCode = totpCode.replace(/\s+/g, '');
    if (!sanitizedCode || sanitizedCode.length < 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authApi.verifyTotp({
        name,
        email,
        password,
        secret,
        token: sanitizedCode,
      });

      if (response.success && response.data) {
        const { _id, token, recoveryCodes } = response.data;
        // Log user in
        await login({
          _id,
          name,
          email,
          token,
          totpVerified: true,
        });

        // Navigate to Recovery Codes screen
        navigation.navigate('RecoveryCodes', {
          recoveryCodes: recoveryCodes || [],
        });
      } else {
        setError(response.message || 'Verification failed. Please check the code.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Verification failed. Try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconCircle}
            >
              <ShieldCheck size={28} color={Colors.white} />
            </LinearGradient>
            <Text style={styles.title}>Set Up 2-Factor Auth</Text>
            <Text style={styles.subtitle}>
              Protect your account using Google Authenticator, Authy, or 1Password.
            </Text>
          </View>

          {/* Error Banner */}
          {!!error && (
            <View style={styles.errorBanner}>
              <AlertCircle size={18} color={Colors.errorLight} />
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          )}

          {/* QR Code Card */}
          <Card style={styles.qrCard}>
            <Text style={styles.sectionLabel}>Scan QR Code</Text>
            {qrCodeDataUrl ? (
              <View style={styles.qrContainer}>
                <Image
                  source={{ uri: qrCodeDataUrl }}
                  style={styles.qrImage}
                  resizeMode="contain"
                />
              </View>
            ) : null}

            {/* Mobile Key Copy Option */}
            <View style={styles.divider} />
            <Text style={styles.sectionLabel}>Or Enter Secret Key Manually</Text>
            <View style={styles.secretBox}>
              <Text style={styles.secretText} numberOfLines={1}>
                {secret}
              </Text>
              <TouchableOpacity onPress={handleCopyKey} style={styles.copyButton}>
                {copied ? (
                  <Check size={16} color={Colors.successLight} />
                ) : (
                  <Copy size={16} color={Colors.primaryLight} />
                )}
                <Text style={[styles.copyButtonText, copied && { color: Colors.successLight }]}>
                  {copied ? 'Copied!' : 'Copy'}
                </Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* Verification Code Input */}
          <Card style={styles.verifyCard}>
            <Input
              label="6-Digit Authenticator Code"
              placeholder="123456"
              value={totpCode}
              onChangeText={(text) => {
                setTotpCode(text);
                setError('');
              }}
              keyboardType="number-pad"
              maxLength={6}
              icon={<KeyRound size={18} color={Colors.textMuted} />}
              style={styles.codeText}
            />

            <Button
              title="Verify & Create Account"
              onPress={handleVerify}
              loading={loading}
              style={{ marginTop: Spacing.xs }}
            />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 320,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.errorBg,
    borderColor: Colors.errorBorder,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  errorBannerText: {
    color: Colors.errorLight,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  qrCard: {
    alignItems: 'center',
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  qrContainer: {
    backgroundColor: Colors.white,
    padding: 12,
    borderRadius: Radius.md,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: Spacing.sm,
  },
  qrImage: {
    width: 170,
    height: 170,
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  secretBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    borderColor: Colors.borderLight,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    width: '100%',
    justifyContent: 'space-between',
  },
  secretText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: Colors.secondaryLight,
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
    marginRight: Spacing.sm,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceHighlight,
    borderColor: Colors.border,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    gap: 4,
  },
  copyButtonText: {
    fontSize: 12,
    color: Colors.primaryLight,
    fontWeight: '700',
  },
  verifyCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  codeText: {
    textAlign: 'center',
    letterSpacing: 8,
    fontSize: 20,
    fontWeight: '700',
  },
});
