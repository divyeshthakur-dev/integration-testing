import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from '../common/Card';
import { Colors } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/layout';
import { formatPrice } from '../../utils/formatters';

export interface OrderSummaryCardProps {
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
}

export function OrderSummaryCard({
  itemsPrice,
  shippingPrice,
  taxPrice,
  totalPrice,
}: OrderSummaryCardProps) {
  const isFreeShipping = shippingPrice === 0;

  return (
    <Card style={styles.card}>
      <Text style={styles.title}>Order Summary</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Items Total</Text>
        <Text style={styles.value}>{formatPrice(itemsPrice)}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Shipping</Text>
        <Text style={[styles.value, isFreeShipping && styles.freeShipping]}>
          {isFreeShipping ? 'FREE' : formatPrice(shippingPrice)}
        </Text>
      </View>

      {itemsPrice > 0 && itemsPrice <= 1000 && (
        <Text style={styles.shippingNotice}>
          💡 Add {formatPrice(1001 - itemsPrice)} more for Free Shipping!
        </Text>
      )}

      <View style={styles.row}>
        <Text style={styles.label}>Estimated Tax (18% GST)</Text>
        <Text style={styles.value}>{formatPrice(taxPrice)}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>{formatPrice(totalPrice)}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.md,
    marginTop: Spacing.xs,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  label: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  value: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600',
  },
  freeShipping: {
    color: Colors.successLight,
    fontWeight: '700',
  },
  shippingNotice: {
    fontSize: 11,
    color: Colors.primaryLight,
    marginTop: 2,
    marginBottom: 4,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 2,
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
