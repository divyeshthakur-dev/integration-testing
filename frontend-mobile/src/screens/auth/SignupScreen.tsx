import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { User as UserIcon, Mail, Lock, UserPlus, AlertCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { AuthStackParamList } from '../../navigation/types';
import { Colors } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/layout';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import authApi from '../../api/auth';

type Props = NativeStackScreenProps<AuthStackParamList, 'Signup'>;

export function SignupScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs: typeof errors = {};
    if (!name.trim()) errs.name = 'Full name is required';

    if (!email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Enter a valid email address';
    }

    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSignup = async () => {
    setServerError('');
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await authApi.signup({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      if (response.success && response.data?.totpSetup) {
        const { secret, qrCodeDataUrl } = response.data.totpSetup;
        navigation.navigate('TotpSetup', {
          name: name.trim(),
          email: email.trim(),
          password,
          secret,
          qrCodeDataUrl,
        });
      } else {
        setServerError(response.message || 'Signup failed. Please try again.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Unable to register. Please try again.';
      setServerError(msg);
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
              <UserPlus size={26} color={Colors.white} />
            </LinearGradient>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join ShopX and get started with secure 2FA</Text>
          </View>

          {/* Error Banner */}
          {!!serverError && (
            <View style={styles.errorBanner}>
              <AlertCircle size={18} color={Colors.errorLight} />
              <Text style={styles.errorBannerText}>{serverError}</Text>
            </View>
          )}

          {/* Form Card */}
          <Card style={styles.formCard}>
            <Input
              label="Full Name"
              placeholder="John Doe"
              value={name}
              onChangeText={(text) => {
                setName(text);
                setErrors((e) => ({ ...e, name: undefined }));
                setServerError('');
              }}
              autoCapitalize="words"
              icon={<UserIcon size={18} color={Colors.textMuted} />}
              error={errors.name}
            />

            <Input
              label="Email Address"
              placeholder="you@example.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setErrors((e) => ({ ...e, email: undefined }));
                setServerError('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              icon={<Mail size={18} color={Colors.textMuted} />}
              error={errors.email}
            />

            <Input
              label="Password"
              placeholder="Minimum 6 characters"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrors((e) => ({ ...e, password: undefined }));
                setServerError('');
              }}
              isPassword
              autoCapitalize="none"
              icon={<Lock size={18} color={Colors.textMuted} />}
              error={errors.password}
            />

            <Input
              label="Confirm Password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setErrors((e) => ({ ...e, confirmPassword: undefined }));
                setServerError('');
              }}
              isPassword
              autoCapitalize="none"
              icon={<Lock size={18} color={Colors.textMuted} />}
              error={errors.confirmPassword}
            />

            <Button
              title="Continue to 2FA Setup"
              onPress={handleSignup}
              loading={loading}
              style={{ marginTop: Spacing.sm }}
            />
          </Card>

          {/* Switch to Login */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.linkText}>Sign In</Text>
            </TouchableOpacity>
          </View>
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
    justifyContent: 'center',
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
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
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
  formCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  linkText: {
    color: Colors.primaryLight,
    fontSize: 14,
    fontWeight: '700',
  },
});
