import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { ShoppingCart, ArrowRight, Trash2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/types';
import { Colors } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/layout';
import { useCart } from '../../hooks/useCart';
import { CartItemRow } from '../../components/cart/CartItemRow';
import { OrderSummaryCard } from '../../components/cart/OrderSummaryCard';
import { Button } from '../../components/common/Button';
import { formatPrice } from '../../utils/formatters';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function CartScreen() {
  const navigation = useNavigation<NavigationProp>();
  const {
    cartItems,
    cartCount,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    loading,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart,
  } = useCart();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshCart();
    setRefreshing(false);
  };

  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: clearCart },
      ]
    );
  };

  const handleProceedToCheckout = () => {
    navigation.navigate('Checkout');
  };

  const handlePressProduct = (productId: string) => {
    navigation.navigate('ProductDetail', { productId });
  };

  if (cartCount === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <ShoppingCart size={44} color={Colors.primaryLight} />
          </View>
          <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
          <Text style={styles.emptySubtitle}>
            Looks like you haven't added anything yet. Explore our curated catalog and discover something amazing!
          </Text>
          <Button
            title="Start Shopping"
            onPress={() => (navigation as any).navigate('Shop')}
            style={styles.browseButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Shopping Cart</Text>
          <Text style={styles.headerSubtitle}>
            {cartCount} item{cartCount > 1 ? 's' : ''} in cart
          </Text>
        </View>

        <TouchableOpacity onPress={handleClearCart} style={styles.clearBtn}>
          <Trash2 size={16} color={Colors.errorLight} />
          <Text style={styles.clearBtnText}>Clear Cart</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primaryLight}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Cart Items List */}
        <View style={styles.itemsList}>
          {cartItems.map((item) => (
            <CartItemRow
              key={item.product._id}
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={removeFromCart}
              onPressProduct={handlePressProduct}
            />
          ))}
        </View>

        {/* Order Summary Breakdown */}
        <OrderSummaryCard
          itemsPrice={itemsPrice}
          shippingPrice={shippingPrice}
          taxPrice={taxPrice}
          totalPrice={totalPrice}
        />
      </ScrollView>

      {/* Sticky Bottom Checkout Action */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomPriceCol}>
          <Text style={styles.bottomPriceLabel}>Total Amount</Text>
          <Text style={styles.bottomPriceValue}>{formatPrice(totalPrice)}</Text>
        </View>

        <Button
          title="Checkout"
          onPress={handleProceedToCheckout}
          icon={<ArrowRight size={18} color={Colors.white} />}
          style={styles.checkoutBtn}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 6,
  },
  clearBtnText: {
    color: Colors.errorLight,
    fontSize: 13,
    fontWeight: '600',
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 110,
  },
  itemsList: {
    marginBottom: Spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
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
  browseButton: {
    minWidth: 180,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  bottomPriceCol: {
    flex: 1,
  },
  bottomPriceLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  bottomPriceValue: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.primaryLight,
  },
  checkoutBtn: {
    flex: 1.2,
  },
});
