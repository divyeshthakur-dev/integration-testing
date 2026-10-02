import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ArrowLeft,
  Check,
  Package,
  MapPin,
  CreditCard,
  ShoppingBag,
} from 'lucide-react-native';

import { RootStackParamList } from '../../navigation/types';
import { Order } from '../../types';
import { Colors } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/layout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { formatPrice } from '../../utils/formatters';
import ordersApi from '../../api/orders';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderDetail'>;

const DELIVERY_STEPS = ['Order Placed', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];
const STEP_INDEX: Record<string, number> = {
  pending: 0,
  confirmed: 1,
  processing: 2,
  shipped: 3,
  delivered: 4,
};

export function OrderDetailScreen({ route, navigation }: Props) {
  const { orderId } = route.params;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await ordersApi.getOrderById(orderId);
        if (res.success && res.data) {
          setOrder(res.data);
        }
      } catch (e) {
        console.warn('Failed to load order details', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.centerArea}>
        <ActivityIndicator size="large" color={Colors.primaryLight} />
        <Text style={styles.loadingText}>Fetching order details...</Text>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.centerArea}>
        <Text style={styles.errorTitle}>Order Not Found</Text>
        <Button title="Back to Orders" onPress={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  const currentStep = STEP_INDEX[order.status] ?? 1;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>
          Order #{order._id.slice(-8).toUpperCase()}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Delivery Progress Bar */}
        <Card style={styles.card}>
          <Text style={styles.cardSectionLabel}>Delivery Status</Text>
          <View style={styles.stepperContainer}>
            {DELIVERY_STEPS.map((step, index) => {
              const isCompleted = index <= currentStep;
              const isCurrent = index === currentStep;
              return (
                <View key={step} style={styles.stepItem}>
                  <View
                    style={[
                      styles.stepDot,
                      isCompleted ? styles.stepDotCompleted : styles.stepDotIncomplete,
                      isCurrent && styles.stepDotCurrent,
                    ]}
                  >
                    {isCompleted ? (
                      <Check size={12} color={Colors.white} />
                    ) : (
                      <Text style={styles.stepNum}>{index + 1}</Text>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.stepLabel,
                      isCompleted ? styles.stepLabelActive : styles.stepLabelInactive,
                    ]}
                  >
                    {step}
                  </Text>
                </View>
              );
            })}
          </View>
        </Card>

        {/* Purchased Items */}
        <Card style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Package size={18} color={Colors.primaryLight} />
            <Text style={styles.cardSectionLabel}>Items ({order.orderItems.length})</Text>
          </View>

          {order.orderItems.map((item, idx) => (
            <View key={idx} style={styles.orderItemRow}>
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.itemImage} resizeMode="cover" />
              ) : (
                <View style={styles.itemImagePlaceholder}>
                  <Text>📦</Text>
                </View>
              )}
              <View style={styles.itemCol}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.itemQtyPrice}>
                  Qty: {item.quantity} × {formatPrice(item.price)}
                </Text>
              </View>
              <Text style={styles.itemSubtotal}>
                {formatPrice(item.price * item.quantity)}
              </Text>
            </View>
          ))}
        </Card>

        {/* Shipping Address */}
        <Card style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <MapPin size={18} color={Colors.secondaryLight} />
            <Text style={styles.cardSectionLabel}>Shipping Address</Text>
          </View>
          <Text style={styles.addressLine}>{order.shippingAddress.fullName}</Text>
          <Text style={styles.addressLine}>{order.shippingAddress.address}</Text>
          <Text style={styles.addressLine}>
            {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
          </Text>
          <Text style={styles.phoneLine}>📱 {order.shippingAddress.phone}</Text>
        </Card>

        {/* Payment Summary */}
        <Card style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <CreditCard size={18} color={Colors.primaryLight} />
            <Text style={styles.cardSectionLabel}>Payment Details</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Payment Method</Text>
            <Text style={styles.metaValue}>{order.paymentMethod}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Payment Status</Text>
            <View
              style={[
                styles.paymentStatusBadge,
                order.isPaid ? styles.paidBadge : styles.pendingBadge,
              ]}
            >
              <Text style={order.isPaid ? styles.paidText : styles.pendingText}>
                {order.isPaid ? '✓ Paid' : 'Pending'}
              </Text>
            </View>
          </View>
          {order.paymentResult?.id && (
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Transaction ID</Text>
              <Text style={[styles.metaValue, styles.mono]}>
                {order.paymentResult.id.slice(-12)}
              </Text>
            </View>
          )}
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Items Subtotal</Text>
            <Text style={styles.metaValue}>{formatPrice(order.itemsPrice)}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Shipping</Text>
            <Text style={styles.metaValue}>
              {order.shippingPrice === 0 ? 'FREE' : formatPrice(order.shippingPrice)}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>GST (18%)</Text>
            <Text style={styles.metaValue}>{formatPrice(order.taxPrice)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Grand Total</Text>
            <Text style={styles.totalValue}>{formatPrice(order.totalPrice)}</Text>
          </View>
        </Card>

        {/* Action Button */}
        <Button
          title="Continue Shopping"
          icon={<ShoppingBag size={18} color={Colors.white} />}
          onPress={() => (navigation as any).navigate('MainTabs', { screen: 'Shop' })}
          style={{ marginTop: Spacing.xs, marginBottom: Spacing.lg }}
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
  centerArea: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    color: Colors.textMuted,
    fontSize: 14,
    marginTop: Spacing.sm,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  card: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  cardSectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stepperContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepDotCompleted: {
    backgroundColor: Colors.success,
  },
  stepDotIncomplete: {
    backgroundColor: Colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stepDotCurrent: {
    borderWidth: 2,
    borderColor: Colors.successLight,
  },
  stepNum: {
    fontSize: 11,
    color: Colors.textFaint,
    fontWeight: '700',
  },
  stepLabel: {
    fontSize: 10,
    textAlign: 'center',
  },
  stepLabelActive: {
    color: Colors.successLight,
    fontWeight: '700',
  },
  stepLabelInactive: {
    color: Colors.textFaint,
  },
  orderItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  itemImage: {
    width: 48,
    height: 48,
    borderRadius: Radius.sm,
  },
  itemImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemCol: {
    flex: 1,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  itemQtyPrice: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  itemSubtotal: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  addressLine: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  phoneLine: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  metaLabel: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  metaValue: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: '600',
  },
  mono: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
  paymentStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  paidBadge: {
    backgroundColor: Colors.successBg,
  },
  paidText: {
    color: Colors.successLight,
    fontSize: 11,
    fontWeight: '700',
  },
  pendingBadge: {
    backgroundColor: Colors.warningBg,
  },
  pendingText: {
    color: Colors.warningLight,
    fontSize: 11,
    fontWeight: '700',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.primaryLight,
  },
});
