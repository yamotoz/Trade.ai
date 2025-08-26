import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
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
          <View key={`ad-${index}`} className="my-4">
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
      <View className="p-4">
        <Text className="text-text-primary text-2xl font-bold mb-4">
          Notícias
        </Text>
        
        {/* Filtros por Categoria */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => setSelectedCategory(category.id)}
              className={`mr-3 px-4 py-2 rounded-lg border ${
                selectedCategory === category.id
                  ? 'bg-primary-500 border-primary-500'
                  : 'bg-surface-primary border-surface-secondary'
              }`}
            >
              <View className="flex-row items-center">
                <Ionicons 
                  name={category.icon} 
                  size={16} 
                  color={selectedCategory === category.id ? 'white' : colors.text.primary} 
                />
                <Text className={`ml-2 font-medium ${
                  selectedCategory === category.id ? 'text-white' : 'text-text-primary'
                }`}>
                  {category.label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Lista de Notícias */}
      <ScrollView 
        className="flex-1"
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
          <View className="px-4">
            {renderNewsWithAds()}
            
            {/* Indicador de Carregamento */}
            {hasNextPage && (
              <View className="py-4 items-center">
                <Text className="text-text-tertiary">Carregando mais notícias...</Text>
              </View>
            )}
          </View>
        ) : (
          <View className="flex-1 items-center justify-center py-16">
            <Ionicons name="newspaper-outline" size={64} color={colors.text.tertiary} />
            <Text className="text-text-tertiary text-lg mt-4 text-center">
              {selectedCategory === 'all' 
                ? 'Nenhuma notícia disponível'
                : `Nenhuma notícia de ${categories.find(c => c.id === selectedCategory)?.label}`
              }
            </Text>
            <TouchableOpacity
              onPress={onRefresh}
              className="mt-4 bg-primary-500 px-6 py-3 rounded-lg"
            >
              <Text className="text-white font-medium">Tentar Novamente</Text>
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
      <InterstitialAd />
    </SafeAreaView>
  );
}
