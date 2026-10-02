import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, ArrowRight, Zap, Flame } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/types';
import { Product } from '../../types';
import { Colors } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/layout';
import { ProductCard } from '../../components/product/ProductCard';
import productsApi from '../../api/products';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();

  const [categories, setCategories] = useState<string[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [latestProducts, setLatestProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [catsRes, featRes, latestRes] = await Promise.all([
        productsApi.getCategories(),
        productsApi.getFeaturedProducts(),
        productsApi.getProducts({ limit: 4, sort: 'newest' }),
      ]);

      if (catsRes.success && catsRes.data) {
        setCategories(catsRes.data);
      }
      if (featRes.success && featRes.data) {
        setFeaturedProducts(featRes.data);
      }
      if (latestRes.success && latestRes.data) {
        setLatestProducts(latestRes.data.products);
      }
    } catch (e) {
      console.warn('Failed to load home data', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetail', { productId: product._id });
  };

  const handleCategoryPress = (category: string) => {
    (navigation as any).navigate('Shop', { initialCategory: category });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
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
        {/* Top App Bar Branding */}
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoBadge}
            >
              <Sparkles size={18} color={Colors.white} />
            </LinearGradient>
            <Text style={styles.brandTitle}>ShopX</Text>
          </View>
        </View>

        {/* Hero Banner */}
        <LinearGradient
          colors={['#1E1B4B', '#0F172A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroBadge}>
            <Zap size={13} color={Colors.primaryLight} />
            <Text style={styles.heroBadgeText}>PREMIUM EXPERIENCE</Text>
          </View>

          <Text style={styles.heroTitle}>Shop Smarter,{'\n'}Live Better</Text>
          <Text style={styles.heroSubtitle}>
            Discover handpicked flagship products curated for your daily lifestyle.
          </Text>

          <TouchableOpacity
            style={styles.heroButton}
            onPress={() => (navigation as any).navigate('Shop')}
            activeOpacity={0.8}
          >
            <Text style={styles.heroButtonText}>Explore Products</Text>
            <ArrowRight size={16} color={Colors.white} />
          </TouchableOpacity>
        </LinearGradient>

        {/* Categories Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => handleCategoryPress(cat)}
                style={styles.categoryChip}
                activeOpacity={0.7}
              >
                <Text style={styles.categoryText}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured Products Carousel / Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Flame size={18} color={Colors.secondary} />
              <Text style={styles.sectionTitle}>Featured Picks</Text>
            </View>
            <TouchableOpacity onPress={() => (navigation as any).navigate('Shop')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="small" color={Colors.primaryLight} style={{ marginVertical: Spacing.lg }} />
          ) : (
            <View style={styles.productsGrid}>
              {featuredProducts.slice(0, 4).map((item) => (
                <View key={item._id} style={styles.gridItem}>
                  <ProductCard product={item} onPress={handleProductPress} />
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Latest Arrivals Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Latest Arrivals</Text>
            <TouchableOpacity onPress={() => (navigation as any).navigate('Shop')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="small" color={Colors.primaryLight} style={{ marginVertical: Spacing.lg }} />
          ) : (
            <View style={styles.productsGrid}>
              {latestProducts.map((item) => (
                <View key={item._id} style={styles.gridItem}>
                  <ProductCard product={item} onPress={handleProductPress} />
                </View>
              ))}
            </View>
          )}
        </View>
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
    paddingBottom: Spacing.xxl,
  },
  topBar: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  heroCard: {
    margin: Spacing.md,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryGlow,
    borderColor: Colors.borderLight,
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
    marginBottom: Spacing.sm,
  },
  heroBadgeText: {
    color: Colors.primaryLight,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.white,
    lineHeight: 32,
    letterSpacing: -0.5,
    marginBottom: Spacing.xs,
  },
  heroSubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 18,
    marginBottom: Spacing.md,
    maxWidth: 280,
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: Radius.md,
    gap: 6,
  },
  heroButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  section: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  seeAllText: {
    fontSize: 13,
    color: Colors.primaryLight,
    fontWeight: '600',
  },
  categoryScroll: {
    paddingVertical: Spacing.xs,
    gap: Spacing.sm,
  },
  categoryChip: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: Spacing.xs,
  },
  categoryText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.xs,
  },
  gridItem: {
    width: '50%',
  },
});
