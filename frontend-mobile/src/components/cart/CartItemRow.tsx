import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Trash2, Plus, Minus } from 'lucide-react-native';
import { CartItem } from '../../types';
import { Colors } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/layout';
import { formatPrice } from '../../utils/formatters';

export interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  onPressProduct: (productId: string) => void;
}

export function CartItemRow({
  item,
  onUpdateQuantity,
  onRemove,
  onPressProduct,
}: CartItemRowProps) {
  const { product, quantity } = item;
  const isMaxStock = quantity >= product.stock;

  return (
    <View style={styles.card}>
      {/* Product Image Thumbnail */}
      <TouchableOpacity
        onPress={() => onPressProduct(product._id)}
        activeOpacity={0.8}
        style={styles.imageContainer}
      >
        {product.image ? (
          <Image source={{ uri: product.image }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={{ fontSize: 20 }}>📦</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Info & Controls */}
      <View style={styles.infoCol}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => onPressProduct(product._id)} style={{ flex: 1 }}>
            <Text style={styles.brand}>{product.brand.toUpperCase()}</Text>
            <Text style={styles.name} numberOfLines={1}>
              {product.name}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onRemove(product._id)}
            style={styles.deleteButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Trash2 size={18} color={Colors.errorLight} />
          </TouchableOpacity>
        </View>

        {/* Pricing & Stepper Row */}
        <View style={styles.bottomRow}>
          <View>
            <Text style={styles.price}>{formatPrice(product.price)}</Text>
            <Text style={styles.subtotal}>
              Subtotal: {formatPrice(product.price * quantity)}
            </Text>
          </View>

          {/* Stepper */}
          <View style={styles.stepper}>
            <TouchableOpacity
              onPress={() => onUpdateQuantity(product._id, quantity - 1)}
              style={styles.stepperBtn}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Minus size={14} color={Colors.text} />
            </TouchableOpacity>

            <Text style={styles.quantityValue}>{quantity}</Text>

            <TouchableOpacity
              onPress={() => onUpdateQuantity(product._id, quantity + 1)}
              style={styles.stepperBtn}
              disabled={isMaxStock}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Plus size={14} color={isMaxStock ? Colors.textFaint : Colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceHighlight,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCol: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  brand: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primaryLight,
    letterSpacing: 0.5,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 2,
  },
  deleteButton: {
    padding: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  price: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
  },
  subtotal: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceHighlight,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: Radius.sm,
  },
  stepperBtn: {
    padding: 8,
  },
  quantityValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    paddingHorizontal: 8,
    minWidth: 24,
    textAlign: 'center',
  },
});
