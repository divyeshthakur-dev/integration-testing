import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Clipboard from 'expo-clipboard';
import { Key, Copy, Check, ShieldAlert } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { AuthStackParamList } from '../../navigation/types';
import { Colors } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/layout';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';

type Props = NativeStackScreenProps<AuthStackParamList, 'RecoveryCodes'>;

export function RecoveryCodesScreen({ route }: Props) {
  const { recoveryCodes } = route.params;
  const [copied, setCopied] = useState(false);

  const handleCopyAll = async () => {
    const text = recoveryCodes.join('\n');
    await Clipboard.setStringAsync(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={[Colors.warning, Colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconCircle}
          >
            <Key size={26} color={Colors.white} />
          </LinearGradient>
          <Text style={styles.title}>Save Recovery Codes</Text>
          <Text style={styles.subtitle}>
            Store these emergency backup codes in a safe place. Each code can be used once if you lose access to your authenticator app.
          </Text>
        </View>

        {/* Warning Banner */}
        <View style={styles.warningBanner}>
          <ShieldAlert size={18} color={Colors.warningLight} />
          <Text style={styles.warningText}>
            You won't be able to view these recovery codes again after leaving this screen!
          </Text>
        </View>

        {/* Codes Grid Card */}
        <Card style={styles.codesCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.sectionLabel}>Your 10 Backup Codes</Text>
            <TouchableOpacity onPress={handleCopyAll} style={styles.copyButton}>
              {copied ? (
                <Check size={16} color={Colors.successLight} />
              ) : (
                <Copy size={16} color={Colors.primaryLight} />
              )}
              <Text style={[styles.copyButtonText, copied && { color: Colors.successLight }]}>
                {copied ? 'Copied All!' : 'Copy All'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.grid}>
            {recoveryCodes.map((code, index) => (
              <View key={index} style={styles.codeBadge}>
                <Text style={styles.codeIndex}>{index + 1}.</Text>
                <Text style={styles.codeText}>{code}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Continue Button */}
        <Button
          title="I Have Saved My Codes"
          onPress={() => {
            // User is already logged in via AuthContext in TotpSetupScreen,
            // so RootNavigator will automatically transition to MainTabs!
          }}
          style={{ marginTop: Spacing.sm }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
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
    shadowColor: Colors.warning,
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
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 320,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warningBg,
    borderColor: Colors.warningBorder,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  warningText: {
    color: Colors.warningLight,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    lineHeight: 17,
  },
  codesCard: {
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'space-between',
  },
  codeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingVertical: 10,
    paddingHorizontal: 12,
    width: '48%',
  },
  codeIndex: {
    fontSize: 12,
    color: Colors.textFaint,
    fontWeight: '600',
    marginRight: 6,
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: Colors.secondaryLight,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
