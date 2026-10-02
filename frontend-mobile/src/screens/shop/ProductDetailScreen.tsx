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
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ArrowLeft,
  Share2,
  CheckCircle,
  Truck,
  ShieldCheck,
  Plus,
  Minus,
  ShoppingCart,
  Zap,
} from 'lucide-react-native';

import { RootStackParamList } from '../../navigation/types';
import { Product } from '../../types';
import { Colors } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/layout';
import { StarRating } from '../../components/product/StarRating';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { formatPrice, calculateDiscount } from '../../utils/formatters';
import productsApi from '../../api/products';
import { useCart } from '../../hooks/useCart';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetail'>;

export function ProductDetailScreen({ route, navigation }: Props) {
  const { productId } = route.params;
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await productsApi.getProductById(productId);
        if (res.success && res.data) {
          setProduct(res.data);
        }
      } catch (e) {
        console.warn('Failed to load product details', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [productId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingArea}>
        <ActivityIndicator size="large" color={Colors.primaryLight} />
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.errorArea}>
        <Text style={styles.errorTitle}>Product Not Found</Text>
        <Button title="Back to Products" onPress={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [product.image];
  const activeImage = images[selectedImageIndex] || product.image;
  const discount = calculateDiscount(product.price, product.originalPrice);
  const isOutOfStock = product.stock < 1;

  const handleAddToCart = async () => {
    if (!product) return;
    await addToCart(product, quantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
  };

  const handleBuyNow = async () => {
    if (!product) return;
    await addToCart(product, quantity);
    (navigation as any).navigate('MainTabs', { screen: 'Cart' });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle} numberOfLines={1}>
          {product.brand}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Main Image View */}
        <View style={styles.imageGallery}>
          <Image
            source={{ uri: activeImage }}
            style={styles.mainImage}
            resizeMode="contain"
          />

          {discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discount}% OFF</Text>
            </View>
          )}
        </View>

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailRow}
          >
            {images.map((img, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => setSelectedImageIndex(idx)}
                style={[
                  styles.thumbnailItem,
                  selectedImageIndex === idx && styles.thumbnailActive,
                ]}
              >
                <Image source={{ uri: img }} style={styles.thumbImage} resizeMode="cover" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Product Details Section */}
        <View style={styles.detailsContainer}>
          <View style={styles.badgeRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{product.category.toUpperCase()}</Text>
            </View>

            <View
              style={[
                styles.stockBadge,
                isOutOfStock ? styles.stockBadgeOut : styles.stockBadgeIn,
              ]}
            >
              <Text
                style={[
                  styles.stockBadgeText,
                  { color: isOutOfStock ? Colors.errorLight : Colors.successLight },
                ]}
              >
                {isOutOfStock ? 'OUT OF STOCK' : `IN STOCK (${product.stock})`}
              </Text>
            </View>
          </View>

          <Text style={styles.productName}>{product.name}</Text>

          {/* Rating */}
          <View style={styles.ratingSection}>
            <StarRating rating={product.rating} size={16} showText numReviews={product.numReviews} />
          </View>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(product.price)}</Text>
            {product.originalPrice && product.originalPrice > product.price && (
              <Text style={styles.originalPrice}>
                {formatPrice(product.originalPrice)}
              </Text>
            )}
            {discount > 0 && (
              <Text style={styles.savingsText}>Save {formatPrice(product.originalPrice! - product.price)}</Text>
            )}
          </View>

          {/* Quantity Selector */}
          {!isOutOfStock && (
            <View style={styles.quantityRow}>
              <Text style={styles.quantityLabel}>Quantity</Text>
              <View style={styles.stepper}>
                <TouchableOpacity
                  onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                  style={styles.stepperButton}
                  disabled={quantity <= 1}
                >
                  <Minus size={16} color={quantity <= 1 ? Colors.textFaint : Colors.text} />
                </TouchableOpacity>

                <Text style={styles.quantityText}>{quantity}</Text>

                <TouchableOpacity
                  onPress={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  style={styles.stepperButton}
                  disabled={quantity >= product.stock}
                >
                  <Plus size={16} color={quantity >= product.stock ? Colors.textFaint : Colors.text} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Perks Bar */}
          <View style={styles.perksCard}>
            <View style={styles.perkItem}>
              <Truck size={18} color={Colors.primaryLight} />
              <Text style={styles.perkText}>Free Delivery on ₹1,000+</Text>
            </View>
            <View style={styles.perkItem}>
              <ShieldCheck size={18} color={Colors.secondaryLight} />
              <Text style={styles.perkText}>100% Genuine Product</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <Text style={styles.descriptionText}>{product.description}</Text>
          </View>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tags</Text>
              <View style={styles.tagsContainer}>
                {product.tags.map((tag) => (
                  <View key={tag} style={styles.tagPill}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Reviews Section */}
          {product.reviews && product.reviews.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Customer Reviews ({product.reviews.length})</Text>
              {product.reviews.map((rev, i) => (
                <Card key={i} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewAuthor}>{rev.name}</Text>
                    <StarRating rating={rev.rating} size={12} />
                  </View>
                  <Text style={styles.reviewComment}>{rev.comment}</Text>
                </Card>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sticky Bottom Actions Bar */}
      <View style={styles.bottomBar}>
        {addedNotice && (
          <View style={styles.addedToast}>
            <CheckCircle size={16} color={Colors.successLight} />
            <Text style={styles.addedToastText}>Added {quantity} to Cart!</Text>
          </View>
        )}

        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            style={[styles.cartButton, isOutOfStock && styles.disabledButton]}
            onPress={handleAddToCart}
            disabled={isOutOfStock}
            activeOpacity={0.8}
          >
            <ShoppingCart size={20} color={Colors.text} />
            <Text style={styles.cartButtonText}>Add to Cart</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.buyButton, isOutOfStock && styles.disabledButton]}
            onPress={handleBuyNow}
            disabled={isOutOfStock}
            activeOpacity={0.8}
          >
            <Zap size={18} color={Colors.white} />
            <Text style={styles.buyButtonText}>Buy Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingArea: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorArea: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
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
  backButton: {
    padding: 8,
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  imageGallery: {
    width: '100%',
    aspectRatio: 1.1,
    backgroundColor: Colors.surface,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainImage: {
    width: '90%',
    height: '90%',
  },
  discountBadge: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    backgroundColor: Colors.primaryDark,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.sm,
  },
  discountText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '800',
  },
  thumbnailRow: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceHighlight,
  },
  thumbnailItem: {
    width: 60,
    height: 60,
    borderRadius: Radius.sm,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  thumbnailActive: {
    borderColor: Colors.primary,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    padding: Spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  categoryBadge: {
    backgroundColor: Colors.surfaceHighlight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primaryLight,
    letterSpacing: 0.5,
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  stockBadgeIn: {
    backgroundColor: Colors.successBg,
  },
  stockBadgeOut: {
    backgroundColor: Colors.errorBg,
  },
  stockBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  productName: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    lineHeight: 28,
    marginBottom: Spacing.xs,
  },
  ratingSection: {
    marginBottom: Spacing.sm,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  price: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.text,
  },
  originalPrice: {
    fontSize: 16,
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
  savingsText: {
    fontSize: 13,
    color: Colors.successLight,
    fontWeight: '700',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  quantityLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: Radius.md,
  },
  stepperButton: {
    padding: 10,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    paddingHorizontal: 16,
  },
  perksCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.surfaceSubtle,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  perkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  perkText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  descriptionText: {
    fontSize: 14,
    color: Colors.textMuted,
    lineHeight: 22,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  tagPill: {
    backgroundColor: Colors.surfaceHighlight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
  },
  tagText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  reviewCard: {
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  reviewAuthor: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  reviewComment: {
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  addedToast: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.successBg,
    borderColor: Colors.successBorder,
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingVertical: 6,
    gap: 6,
    marginBottom: Spacing.xs,
  },
  addedToastText: {
    color: Colors.successLight,
    fontSize: 12,
    fontWeight: '700',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  cartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceHighlight,
    borderColor: Colors.borderLight,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingVertical: 14,
    gap: 8,
  },
  cartButtonText: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  buyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 14,
    gap: 6,
  },
  buyButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.4,
  },
});
