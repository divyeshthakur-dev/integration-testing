import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as WebBrowser from 'expo-web-browser';
import {
  ArrowLeft,
  MapPin,
  CreditCard,
  CheckCircle,
  ChevronDown,
  ShieldCheck,
  AlertCircle,
  Sparkles,
} from 'lucide-react-native';

import { RootStackParamList } from '../../navigation/types';
import { ShippingAddress, OrderItem } from '../../types';
import { Colors } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/layout';
import { INDIAN_STATES } from '../../constants/states';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { OrderSummaryCard } from '../../components/cart/OrderSummaryCard';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../utils/formatters';
import ordersApi from '../../api/orders';

type Props = NativeStackScreenProps<RootStackParamList, 'Checkout'>;

export function CheckoutScreen({ navigation }: Props) {
  const { user } = useAuth();
  const {
    cartItems,
    cartCount,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    clearCart,
  } = useCart();

  const [address, setAddress] = useState<ShippingAddress>({
    fullName: user?.name || '',
    address: '',
    city: '',
    state: 'Maharashtra',
    postalCode: '',
    country: 'India',
    phone: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ShippingAddress, string>>>({});
  const [paymentMethod, setPaymentMethod] = useState<'Stripe' | 'Mock Payment'>('Stripe');
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [stateModalVisible, setStateModalVisible] = useState(false);

  useEffect(() => {
    if (user?.name && !address.fullName) {
      setAddress((prev) => ({ ...prev, fullName: user.name }));
    }
  }, [user?.name, address.fullName]);

  const validate = () => {
    const errs: Partial<Record<keyof ShippingAddress, string>> = {};
    if (!address.fullName.trim()) errs.fullName = 'Full name is required';
    if (!address.address.trim()) errs.address = 'Street address is required';
    if (!address.city.trim()) errs.city = 'City is required';
    if (!address.state.trim()) errs.state = 'State is required';

    if (!address.postalCode.trim()) {
      errs.postalCode = 'Postal PIN code is required';
    } else if (!/^\d{6}$/.test(address.postalCode.trim())) {
      errs.postalCode = 'Valid 6-digit PIN code required';
    }

    if (!address.phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(address.phone.trim())) {
      errs.phone = 'Valid 10-digit mobile number required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePlaceOrder = async () => {
    setServerError('');
    if (!validate()) return;
    if (cartCount === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart before checking out.');
      return;
    }

    setLoading(true);
    try {
      const orderItems: OrderItem[] = cartItems.map(({ product, quantity }) => ({
        product: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity,
      }));

      // 1. Create order in MongoDB
      const createOrderRes = await ordersApi.createOrder({
        orderItems,
        shippingAddress: address,
        paymentMethod,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
      });

      if (!createOrderRes.success || !createOrderRes.data) {
        throw new Error(createOrderRes.message || 'Failed to place order');
      }

      const createdOrder = createOrderRes.data;

      if (paymentMethod === 'Stripe') {
        // 2. Create Stripe Checkout Session
        const stripeRes = await ordersApi.createStripeCheckoutSession(createdOrder._id);
        if (!stripeRes.success || !stripeRes.data?.url) {
          throw new Error(stripeRes.message || 'Failed to initialize Stripe payment session');
        }

        // Clear cart now that order is committed
        await clearCart();

        // 3. Open in-app browser session
        const checkoutUrl = stripeRes.data.url;
        await WebBrowser.openAuthSessionAsync(checkoutUrl, 'shopx://order-success');

        // Navigate to Order Success screen
        navigation.replace('OrderSuccess', { orderId: createdOrder._id });
      } else {
        // Mock payment simulation
        await ordersApi.payOrderMock(createdOrder._id);
        await clearCart();
        navigation.replace('OrderSuccess', { orderId: createdOrder._id });
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Payment initiation failed. Try again.';
      setServerError(msg);
    } finally {
      setLoading(false);
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
        <Text style={styles.topBarTitle}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Error Banner */}
          {!!serverError && (
            <View style={styles.errorBanner}>
              <AlertCircle size={18} color={Colors.errorLight} />
              <Text style={styles.errorBannerText}>{serverError}</Text>
            </View>
          )}

          {/* Shipping Address Section */}
          <Card style={styles.card}>
            <View style={styles.sectionHeaderRow}>
              <MapPin size={18} color={Colors.primaryLight} />
              <Text style={styles.sectionTitle}>Shipping Address</Text>
            </View>

            <Input
              label="Full Name"
              placeholder="e.g. John Doe"
              value={address.fullName}
              onChangeText={(text) => {
                setAddress({ ...address, fullName: text });
                setErrors((e) => ({ ...e, fullName: undefined }));
              }}
              error={errors.fullName}
            />

            <Input
              label="Street Address"
              placeholder="Apartment, suite, building, street"
              value={address.address}
              onChangeText={(text) => {
                setAddress({ ...address, address: text });
                setErrors((e) => ({ ...e, address: undefined }));
              }}
              error={errors.address}
            />

            <View style={styles.twoColRow}>
              <Input
                label="City"
                placeholder="Mumbai"
                value={address.city}
                containerStyle={{ flex: 1 }}
                onChangeText={(text) => {
                  setAddress({ ...address, city: text });
                  setErrors((e) => ({ ...e, city: undefined }));
                }}
                error={errors.city}
              />

              <Input
                label="PIN Code"
                placeholder="400001"
                keyboardType="numeric"
                maxLength={6}
                value={address.postalCode}
                containerStyle={{ flex: 1 }}
                onChangeText={(text) => {
                  setAddress({ ...address, postalCode: text });
                  setErrors((e) => ({ ...e, postalCode: undefined }));
                }}
                error={errors.postalCode}
              />
            </View>

            {/* State Picker Button */}
            <View style={{ marginBottom: Spacing.md }}>
              <Text style={styles.fieldLabel}>State / Union Territory</Text>
              <TouchableOpacity
                onPress={() => setStateModalVisible(true)}
                style={styles.stateSelectButton}
              >
                <Text style={styles.stateSelectText}>{address.state}</Text>
                <ChevronDown size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            <Input
              label="Contact Phone Number"
              placeholder="10-digit mobile number"
              keyboardType="phone-pad"
              maxLength={10}
              value={address.phone}
              onChangeText={(text) => {
                setAddress({ ...address, phone: text });
                setErrors((e) => ({ ...e, phone: undefined }));
              }}
              error={errors.phone}
            />
          </Card>

          {/* Payment Method Selector Card */}
          <Card style={styles.card}>
            <View style={styles.sectionHeaderRow}>
              <CreditCard size={18} color={Colors.secondaryLight} />
              <Text style={styles.sectionTitle}>Payment Method</Text>
            </View>

            {/* Stripe Option */}
            <TouchableOpacity
              onPress={() => setPaymentMethod('Stripe')}
              style={[
                styles.paymentOption,
                paymentMethod === 'Stripe' && styles.paymentOptionActive,
              ]}
              activeOpacity={0.8}
            >
              <View style={styles.paymentRadio}>
                {paymentMethod === 'Stripe' && <View style={styles.radioDot} />}
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.optionTitleRow}>
                  <Text style={styles.optionTitle}>Stripe Online Payment</Text>
                  <View style={styles.stripeBadge}>
                    <Text style={styles.stripeBadgeText}>Official Gateway</Text>
                  </View>
                </View>
                <Text style={styles.optionDesc}>
                  Cards (Visa, Mastercard, RuPay), UPI, Net Banking
                </Text>
              </View>
            </TouchableOpacity>

            {/* Mock Payment Simulation Option */}
            <TouchableOpacity
              onPress={() => setPaymentMethod('Mock Payment')}
              style={[
                styles.paymentOption,
                paymentMethod === 'Mock Payment' && styles.paymentOptionActive,
              ]}
              activeOpacity={0.8}
            >
              <View style={styles.paymentRadio}>
                {paymentMethod === 'Mock Payment' && <View style={styles.radioDot} />}
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.optionTitleRow}>
                  <Text style={styles.optionTitle}>Mock Payment (Instant Simulation)</Text>
                  <View style={styles.testBadge}>
                    <Text style={styles.testBadgeText}>Fast Test</Text>
                  </View>
                </View>
                <Text style={styles.optionDesc}>
                  Simulate immediate payment approval without credit card details
                </Text>
              </View>
            </TouchableOpacity>
          </Card>

          {/* Order Financials Breakdown */}
          <OrderSummaryCard
            itemsPrice={itemsPrice}
            shippingPrice={shippingPrice}
            taxPrice={taxPrice}
            totalPrice={totalPrice}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Sticky Bottom Place Order Action */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomPriceCol}>
          <Text style={styles.bottomPriceLabel}>Payable Total</Text>
          <Text style={styles.bottomPriceValue}>{formatPrice(totalPrice)}</Text>
        </View>

        <Button
          title={paymentMethod === 'Stripe' ? 'Pay with Stripe' : 'Confirm Order'}
          onPress={handlePlaceOrder}
          loading={loading}
          style={styles.payBtn}
        />
      </View>

      {/* State Selection Modal */}
      <Modal
        visible={stateModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setStateModalVisible(false)}
      >
        <SafeAreaView style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select State</Text>
              <TouchableOpacity onPress={() => setStateModalVisible(false)}>
                <Text style={styles.modalCloseText}>Done</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={INDIAN_STATES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setAddress({ ...address, state: item });
                    setStateModalVisible(false);
                  }}
                  style={[
                    styles.stateItem,
                    address.state === item && styles.stateItemActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.stateItemText,
                      address.state === item && styles.stateItemTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                  {address.state === item && (
                    <CheckCircle size={18} color={Colors.primaryLight} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </SafeAreaView>
      </Modal>
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
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 110,
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
  card: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  twoColRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stateSelectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    height: 52,
  },
  stateSelectText: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '500',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surfaceSubtle,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  paymentOptionActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surfaceHighlight,
  },
  paymentRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  optionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  stripeBadge: {
    backgroundColor: Colors.primaryGlow,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  stripeBadgeText: {
    color: Colors.primaryLight,
    fontSize: 10,
    fontWeight: '700',
  },
  testBadge: {
    backgroundColor: Colors.warningBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  testBadgeText: {
    color: Colors.warningLight,
    fontSize: 10,
    fontWeight: '700',
  },
  optionDesc: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
    lineHeight: 16,
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
  },
  bottomPriceValue: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.primaryLight,
  },
  payBtn: {
    flex: 1.4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    maxHeight: '70%',
    padding: Spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  modalCloseText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primaryLight,
  },
  stateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  stateItemActive: {
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: Radius.sm,
  },
  stateItemText: {
    fontSize: 15,
    color: Colors.textMuted,
  },
  stateItemTextActive: {
    color: Colors.text,
    fontWeight: '700',
  },
});
