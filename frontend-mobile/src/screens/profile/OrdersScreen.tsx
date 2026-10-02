import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ArrowLeft, Package, ChevronRight, Clock, AlertCircle } from 'lucide-react-native';

import { RootStackParamList } from '../../navigation/types';
import { Order } from '../../types';
import { Colors } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/layout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { formatPrice } from '../../utils/formatters';
import ordersApi from '../../api/orders';

type Props = NativeStackScreenProps<RootStackParamList, 'Orders'>;

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string }
> = {
  pending: {
    label: '⏳ Pending',
    bg: Colors.warningBg,
    text: Colors.warningLight,
    border: Colors.warningBorder,
  },
  confirmed: {
    label: '✓ Confirmed',
    bg: Colors.primaryGlow,
    text: Colors.primaryLight,
    border: Colors.borderLight,
  },
  processing: {
    label: '⚙️ Processing',
    bg: Colors.secondaryGlow,
    text: Colors.secondaryLight,
    border: Colors.borderLight,
  },
  shipped: {
    label: '🚚 Shipped',
    bg: Colors.infoBg,
    text: Colors.infoLight,
    border: Colors.infoBorder,
  },
  delivered: {
    label: '✅ Delivered',
    bg: Colors.successBg,
    text: Colors.successLight,
    border: Colors.successBorder,
  },
  cancelled: {
    label: '✗ Cancelled',
    bg: Colors.errorBg,
    text: Colors.errorLight,
    border: Colors.errorBorder,
  },
};

export function OrdersScreen({ navigation }: Props) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadOrders = useCallback(async () => {
    setError('');
    try {
      const response = await ordersApi.getMyOrders();
      if (response.success && response.data) {
        setOrders(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load your orders.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>My Orders</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Loading State */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primaryLight} />
          <Text style={styles.loadingText}>Loading your orders...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <AlertCircle size={40} color={Colors.errorLight} style={{ marginBottom: 12 }} />
          <Text style={styles.errorText}>{error}</Text>
          <Button title="Try Again" onPress={loadOrders} style={{ minWidth: 150 }} />
        </View>
      ) : orders.length === 0 ? (
        /* Empty State */
        <View style={styles.centerContainer}>
          <View style={styles.emptyIconCircle}>
            <Package size={44} color={Colors.primaryLight} />
          </View>
          <Text style={styles.emptyTitle}>No Orders Yet</Text>
          <Text style={styles.emptySubtitle}>
            You haven't placed any orders yet. Discover our collection and place your first order!
          </Text>
          <Button
            title="Start Shopping"
            onPress={() => (navigation as any).navigate('MainTabs', { screen: 'Shop' })}
            style={{ minWidth: 180 }}
          />
        </View>
      ) : (
        /* Orders List */
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primaryLight}
              colors={[Colors.primary]}
            />
          }
          renderItem={({ item }) => {
            const statusConfig = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
            return (
              <TouchableOpacity
                onPress={() => navigation.navigate('OrderDetail', { orderId: item._id })}
                activeOpacity={0.8}
              >
                <Card style={styles.orderCard}>
                  {/* Order Card Header */}
                  <View style={styles.orderHeader}>
                    <View>
                      <Text style={styles.orderId}>
                        Order #{item._id.slice(-8).toUpperCase()}
                      </Text>
                      <View style={styles.dateRow}>
                        <Clock size={12} color={Colors.textMuted} />
                        <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
                      </View>
                    </View>

                    {/* Status Badge */}
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: statusConfig.bg, borderColor: statusConfig.border },
                      ]}
                    >
                      <Text style={[styles.statusText, { color: statusConfig.text }]}>
                        {statusConfig.label}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  {/* Items Preview */}
                  <View style={styles.itemsPreview}>
                    {item.orderItems.slice(0, 3).map((orderItem, idx) => (
                      <View key={idx} style={styles.itemRow}>
                        {orderItem.image ? (
                          <Image
                            source={{ uri: orderItem.image }}
                            style={styles.itemThumb}
                            resizeMode="cover"
                          />
                        ) : null}
                        <Text style={styles.itemTitle} numberOfLines={1}>
                          {orderItem.name}
                        </Text>
                        <Text style={styles.itemQty}>x{orderItem.quantity}</Text>
                      </View>
                    ))}
                    {item.orderItems.length > 3 && (
                      <Text style={styles.moreItemsText}>
                        +{item.orderItems.length - 3} more item(s)
                      </Text>
                    )}
                  </View>

                  <View style={styles.divider} />

                  {/* Order Footer */}
                  <View style={styles.orderFooter}>
                    <View>
                      <Text style={styles.totalLabel}>Total Amount</Text>
                      <Text style={styles.totalValue}>{formatPrice(item.totalPrice)}</Text>
                    </View>

                    <View style={styles.detailsActionRow}>
                      <View
                        style={[
                          styles.paidPill,
                          item.isPaid ? styles.paidPillYes : styles.paidPillNo,
                        ]}
                      >
                        <Text
                          style={[
                            styles.paidPillText,
                            { color: item.isPaid ? Colors.successLight : Colors.warningLight },
                          ]}
                        >
                          {item.isPaid ? '✓ Paid' : 'Pending'}
                        </Text>
                      </View>

                      <ChevronRight size={18} color={Colors.textMuted} />
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    padding: 6,
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    color: Colors.textMuted,
    fontSize: 14,
    marginTop: Spacing.sm,
  },
  errorText: {
    color: Colors.errorLight,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  emptyIconCircle: {
    width: 88,
    height: 88,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.lg,
    maxWidth: 290,
  },
  orderCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderId: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  orderDate: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  itemsPreview: {
    gap: 6,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  itemThumb: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
  },
  itemTitle: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  itemQty: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  moreItemsText: {
    fontSize: 11,
    color: Colors.textFaint,
    marginTop: 2,
    fontStyle: 'italic',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primaryLight,
  },
  detailsActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  paidPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  paidPillYes: {
    backgroundColor: Colors.successBg,
  },
  paidPillNo: {
    backgroundColor: Colors.warningBg,
  },
  paidPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
