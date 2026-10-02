import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Product } from '../../types';
import { Colors } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/layout';
import { formatPrice, calculateDiscount } from '../../utils/formatters';
import { StarRating } from './StarRating';

export interface ProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
  style?: ViewStyle;
}

export function ProductCard({ product, onPress, style }: ProductCardProps) {
  const discount = calculateDiscount(product.price, product.originalPrice);
  const isOutOfStock = product.stock < 1;

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={() => onPress(product)}
      style={[styles.card, style]}
    >
      {/* Product Image Container */}
      <View style={styles.imageContainer}>
        {product.image ? (
          <Image
            source={{ uri: product.image }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderText}>📦</Text>
          </View>
        )}

        {/* Discount Badge */}
        {discount > 0 && !isOutOfStock && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discount}% OFF</Text>
          </View>
        )}

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <View style={styles.outOfStockBadge}>
            <Text style={styles.outOfStockText}>OUT OF STOCK</Text>
          </View>
        )}
      </View>

      {/* Content Container */}
      <View style={styles.content}>
        <Text style={styles.brand} numberOfLines={1}>
          {product.brand.toUpperCase()}
        </Text>

        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>

        {/* Rating */}
        <View style={styles.ratingRow}>
          <StarRating rating={product.rating} size={12} showText numReviews={product.numReviews} />
        </View>

        {/* Pricing Row */}
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatPrice(product.price)}</Text>
          {product.originalPrice && product.originalPrice > product.price && (
            <Text style={styles.originalPrice}>
              {formatPrice(product.originalPrice)}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: Radius.md,
    overflow: 'hidden',
    flex: 1,
    margin: Spacing.xs,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: Colors.surfaceHighlight,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceSubtle,
  },
  placeholderText: {
    fontSize: 32,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: Colors.primaryDark,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  discountText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  outOfStockBadge: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outOfStockText: {
    color: Colors.errorLight,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  content: {
    padding: Spacing.sm,
    flex: 1,
    justifyContent: 'space-between',
  },
  brand: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primaryLight,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    lineHeight: 18,
    marginBottom: 6,
    minHeight: 36,
  },
  ratingRow: {
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  price: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
  },
  originalPrice: {
    fontSize: 12,
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
});
