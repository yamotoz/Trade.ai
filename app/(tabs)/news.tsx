import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme';
import { NewsCard } from '@/components/news/NewsCard';
import { NewsDetail } from '@/components/news/NewsDetail';
import { useNews } from '@/lib/news';
import { BannerAd } from '@/components/ads/BannerAd';
import { InterstitialAd } from '@/components/ads/InterstitialAd';

export default function NewsScreen() {
  const { colors } = useTheme();
  const { news, isLoading, refetch, hasNextPage, fetchNextPage } = useNews();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedNews, setSelectedNews] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const categories = [
    { id: 'all', label: 'Todas', icon: 'newspaper' },
    { id: 'crypto', label: 'Cripto', icon: 'logo-bitcoin' },
    { id: 'forex', label: 'Forex', icon: 'trending-up' },
    { id: 'stock', label: 'Ações', icon: 'business' },
    { id: 'economy', label: 'Economia', icon: 'analytics' },
  ];

  const filteredNews = useMemo(() => {
    if (selectedCategory === 'all') return news || [];
    return (news || []).filter(item => item.category === selectedCategory);
  }, [news, selectedCategory]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const loadMore = () => {
    if (hasNextPage) {
      fetchNextPage();
    }
  };

  const renderNewsWithAds = () => {
    const items = [];
    
    filteredNews.forEach((newsItem, index) => {
      // Adicionar notícia
      items.push(
        <NewsCard
          key={newsItem.id}
          news={newsItem}
          onPress={() => setSelectedNews(newsItem)}
        />
      );
      
      // Adicionar anúncio a cada 5 itens
      if ((index + 1) % 5 === 0) {
        items.push(
          <View key={`ad-${index}`} style={styles.adContainer}>
            <BannerAd />
          </View>
        );
      }
    });
    
    return items;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
          Notícias
        </Text>
        
        {/* Filtros por Categoria */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => setSelectedCategory(category.id)}
              style={[
                styles.categoryButton,
                { marginRight: 12 },
                selectedCategory === category.id
                  ? { backgroundColor: colors.primary[500], borderColor: colors.primary[500] }
                  : { backgroundColor: colors.surface.primary, borderColor: colors.surface.secondary }
              ]}
            >
              <View style={styles.categoryButtonContent}>
                <Ionicons 
                  name={category.icon} 
                  size={16} 
                  color={selectedCategory === category.id ? 'white' : colors.text.primary} 
                />
                <Text style={[
                  styles.categoryButtonText,
                  { marginLeft: 8 },
                  selectedCategory === category.id ? { color: 'white' } : { color: colors.text.primary }
                ]}>
                  {category.label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Lista de Notícias */}
      <ScrollView 
        style={styles.newsList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary[500]}
            colors={[colors.primary[500]]}
          />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const paddingToBottom = 20;
          if (layoutMeasurement.height + contentOffset.y >= 
              contentSize.height - paddingToBottom) {
            loadMore();
          }
        }}
        scrollEventThrottle={400}
      >
        {filteredNews.length > 0 ? (
          <View style={styles.newsContainer}>
            {renderNewsWithAds()}
            
            {/* Indicador de Carregamento */}
            {hasNextPage && (
              <View style={styles.loadingContainer}>
                <Text style={[styles.loadingText, { color: colors.text.tertiary }]}>Carregando mais notícias...</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="newspaper-outline" size={64} color={colors.text.tertiary} />
            <Text style={[styles.emptyStateTitle, { color: colors.text.tertiary }]}>
              {selectedCategory === 'all' 
                ? 'Nenhuma notícia disponível'
                : `Nenhuma notícia de ${categories.find(c => c.id === selectedCategory)?.label}`
              }
            </Text>
            <TouchableOpacity
              onPress={onRefresh}
              style={[styles.retryButton, { backgroundColor: colors.primary[500] }]}
            >
              <Text style={styles.retryButtonText}>Tentar Novamente</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Modal de Detalhe da Notícia */}
      {selectedNews && (
        <NewsDetail
          news={selectedNews}
          visible={!!selectedNews}
          onClose={() => setSelectedNews(null)}
        />
      )}

      {/* Anúncio Intersticial */}
      <InterstitialAd       />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  categoryButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryButtonText: {
    fontWeight: '500',
  },
  adContainer: {
    marginVertical: 16,
  },
  newsList: {
    flex: 1,
  },
  newsContainer: {
    paddingHorizontal: 16,
  },
  loadingContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyStateTitle: {
    fontSize: 18,
    marginTop: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '500',
  },
});
