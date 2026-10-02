import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Star } from 'lucide-react-native';
import { Colors } from '../../constants/colors';

export interface StarRatingProps {
  rating: number;
  numReviews?: number;
  size?: number;
  showText?: boolean;
  style?: ViewStyle;
}

export function StarRating({
  rating,
  numReviews,
  size = 14,
  showText = false,
  style,
}: StarRatingProps) {
  const roundedRating = Math.round(rating * 10) / 10;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= Math.round(rating);
          return (
            <Star
              key={star}
              size={size}
              color={filled ? '#FBBF24' : Colors.surfaceHighlight}
              fill={filled ? '#FBBF24' : 'transparent'}
              style={{ marginRight: 2 }}
            />
          );
        })}
      </View>

      {showText && (
        <Text style={styles.ratingText}>
          {roundedRating.toFixed(1)}
          {numReviews !== undefined && (
            <Text style={styles.reviewCount}> ({numReviews})</Text>
          )}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FBBF24',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '400',
  },
});
