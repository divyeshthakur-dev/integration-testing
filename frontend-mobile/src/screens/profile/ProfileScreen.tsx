import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  User,
  ShieldCheck,
  Package,
  ChevronRight,
  LogOut,
  Info,
  Server,
  Lock,
  Sparkles,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/types';
import { Colors } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/layout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import ordersApi from '../../api/orders';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function ProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user, token, logout } = useAuth();
  const [orderCount, setOrderCount] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await ordersApi.getMyOrders();
        if (res.success && res.data) {
          setOrderCount(res.data.length);
        }
      } catch {
        // silent
      }
    })();
  }, []);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of your account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Profile Header Card */}
        <View style={styles.profileHeader}>
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatarCircle}
          >
            <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
          </LinearGradient>

          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'N/A'}</Text>

          {/* Badges */}
          <View style={styles.badgesRow}>
            <View style={styles.badgeSuccess}>
              <ShieldCheck size={13} color={Colors.successLight} />
              <Text style={styles.badgeSuccessText}>2FA Active</Text>
            </View>
            <View style={styles.badgePrimary}>
              <Sparkles size={13} color={Colors.primaryLight} />
              <Text style={styles.badgePrimaryText}>Verified Account</Text>
            </View>
          </View>
        </View>

        {/* Orders Shortcut Card */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Orders')}
          activeOpacity={0.8}
        >
          <Card style={styles.shortcutCard}>
            <View style={styles.shortcutLeft}>
              <View style={styles.shortcutIconCircle}>
                <Package size={22} color={Colors.primaryLight} />
              </View>
              <View>
                <Text style={styles.shortcutTitle}>My Orders</Text>
                <Text style={styles.shortcutSubtitle}>
                  {orderCount !== null
                    ? `${orderCount} order${orderCount !== 1 ? 's' : ''} placed`
                    : 'Track, view, and manage past purchases'}
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color={Colors.textMuted} />
          </Card>
        </TouchableOpacity>

        {/* Security & 2FA Info Card */}
        <Card style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Lock size={18} color={Colors.primaryLight} />
            <Text style={styles.cardTitle}>Security & Credentials</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Authentication Mode</Text>
            <Text style={styles.infoValue}>JWT + TOTP 2FA</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Two-Factor Security</Text>
            <Text style={[styles.infoValue, { color: Colors.successLight }]}>Enabled</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Session Token</Text>
            <Text style={[styles.infoValue, styles.mono]} numberOfLines={1}>
              {token ? `${token.substring(0, 16)}...` : 'None'}
            </Text>
          </View>
        </Card>

        {/* App Architecture & Environment */}
        <Card style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Server size={18} color={Colors.secondaryLight} />
            <Text style={styles.cardTitle}>Architecture & Connectivity</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>App Client</Text>
            <Text style={styles.infoValue}>ShopX React Native (Expo SDK 57)</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Backend API</Text>
            <Text style={styles.infoValue}>Node.js + Express REST</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Database Engine</Text>
            <Text style={styles.infoValue}>MongoDB Atlas</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Secure Storage</Text>
            <Text style={styles.infoValue}>Hardware Keystore / Keychain</Text>
          </View>
        </Card>

        {/* Sign Out Button */}
        <Button
          title="Sign Out"
          variant="danger"
          icon={<LogOut size={18} color={Colors.errorLight} />}
          onPress={handleSignOut}
          style={styles.signOutBtn}
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
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  avatarCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.3,
  },
  userEmail: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 2,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  badgeSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.successBg,
    borderColor: Colors.successBorder,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    gap: 4,
  },
  badgeSuccessText: {
    color: Colors.successLight,
    fontSize: 11,
    fontWeight: '700',
  },
  badgePrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryGlow,
    borderColor: Colors.borderLight,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    gap: 4,
  },
  badgePrimaryText: {
    color: Colors.primaryLight,
    fontSize: 11,
    fontWeight: '700',
  },
  shortcutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  shortcutLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  shortcutIconCircle: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  shortcutSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  card: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoLabel: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  infoValue: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: '600',
    maxWidth: '65%',
    textAlign: 'right',
  },
  mono: {
    fontFamily: 'monospace',
    color: Colors.secondaryLight,
  },
  signOutBtn: {
    marginTop: Spacing.sm,
  },
});
