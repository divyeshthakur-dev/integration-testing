import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Search, X, SlidersHorizontal } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/types';
import { Product } from '../../types';
import { Colors } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/layout';
import { ProductCard } from '../../components/product/ProductCard';
import productsApi from '../../api/products';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SORT_OPTIONS = [
  { label: 'Featured', value: 'default' },
  { label: 'Price ↑', value: 'price_asc' },
  { label: 'Price ↓', value: 'price_desc' },
  { label: 'Rating', value: 'rating' },
  { label: 'Newest', value: 'newest' },
];

export function ProductsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const initialCategory = (route.params as any)?.initialCategory || 'all';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSort, setSelectedSort] = useState('default');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Sync category if navigated with route params
  useEffect(() => {
    if ((route.params as any)?.initialCategory) {
      setSelectedCategory((route.params as any).initialCategory);
      setPage(1);
    }
  }, [route.params]);

  // Load categories
  useEffect(() => {
    (async () => {
      try {
        const res = await productsApi.getCategories();
        if (res.success && res.data) {
          setCategories(res.data);
        }
      } catch (e) {
        console.warn('Failed to load categories', e);
      }
    })();
  }, []);

  // Fetch products
  const fetchProducts = useCallback(
    async (targetPage = 1, append = false) => {
      if (targetPage === 1) setLoading(true);
      try {
        const params: any = {
          page: targetPage,
          limit: 10,
        };
        if (selectedCategory && selectedCategory !== 'all') {
          params.category = selectedCategory;
        }
        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }
        if (selectedSort !== 'default') {
          params.sort = selectedSort;
        }

        const res = await productsApi.getProducts(params);
        if (res.success && res.data) {
          if (append) {
            setProducts((prev) => [...prev, ...res.data.products]);
          } else {
            setProducts(res.data.products);
          }
          setTotalPages(res.data.pages);
          setTotalCount(res.data.total);
          setPage(targetPage);
        }
      } catch (e) {
        console.warn('Failed to fetch products', e);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [selectedCategory, searchQuery, selectedSort]
  );

  useEffect(() => {
    fetchProducts(1, false);
  }, [fetchProducts]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts(1, false);
  };

  const handleLoadMore = () => {
    if (!loading && !loadingMore && page < totalPages) {
      setLoadingMore(true);
      fetchProducts(page + 1, true);
    }
  };

  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetail', { productId: product._id });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Search & Filter Bar */}
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Search size={18} color={Colors.textMuted} style={styles.searchIcon} />
          <TextInput
            placeholder="Search products, brands..."
            placeholderTextColor={Colors.textFaint}
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              setPage(1);
            }}
            style={styles.searchInput}
            returnKeyType="search"
          />
          {!!searchQuery && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <X size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Pills Bar */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={['all', ...categories]}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => {
            const isSelected = selectedCategory.toLowerCase() === item.toLowerCase();
            return (
              <TouchableOpacity
                onPress={() => {
                  setSelectedCategory(item);
                  setPage(1);
                }}
                style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
              >
                <Text style={[styles.categoryText, isSelected && styles.categoryTextActive]}>
                  {item === 'all' ? 'All Products' : item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />

        {/* Sort Chips Bar */}
        <View style={styles.sortBar}>
          <SlidersHorizontal size={14} color={Colors.textMuted} style={{ marginRight: 6 }} />
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={SORT_OPTIONS}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => {
              const isSelected = selectedSort === item.value;
              return (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedSort(item.value);
                    setPage(1);
                  }}
                  style={[styles.sortChip, isSelected && styles.sortChipActive]}
                >
                  <Text style={[styles.sortText, isSelected && styles.sortTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* Results Counter */}
        {!loading && (
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>{totalCount} products found</Text>
          </View>
        )}
      </View>

      {/* Product Grid */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primaryLight} />
        </View>
      ) : products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>No Products Found</Text>
          <Text style={styles.emptySubtitle}>Try adjusting your search or filters.</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          numColumns={2}
          contentContainerStyle={styles.gridContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primaryLight}
              colors={[Colors.primary]}
            />
          }
          renderItem={({ item }) => (
            <View style={styles.gridColumn}>
              <ProductCard product={item} onPress={handleProductPress} />
            </View>
          )}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator size="small" color={Colors.primaryLight} style={{ marginVertical: Spacing.md }} />
            ) : null
          }
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
  header: {
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingTop: Spacing.xs,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: Radius.md,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    height: 46,
  },
  searchIcon: {
    marginRight: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 14,
    height: '100%',
  },
  clearButton: {
    padding: 6,
  },
  categoryList: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    gap: Spacing.xs,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
    marginRight: 6,
  },
  categoryChipActive: {
    backgroundColor: Colors.primaryGlow,
    borderColor: Colors.primary,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  categoryTextActive: {
    color: Colors.primaryLight,
    fontWeight: '700',
  },
  sortBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  sortChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceHighlight,
    marginRight: 6,
  },
  sortChipActive: {
    backgroundColor: Colors.primaryDark,
  },
  sortText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  sortTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  metaRow: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  metaText: {
    fontSize: 11,
    color: Colors.textFaint,
    fontWeight: '500',
  },
  gridContent: {
    padding: Spacing.xs,
    paddingBottom: Spacing.xxl,
  },
  gridColumn: {
    flex: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
