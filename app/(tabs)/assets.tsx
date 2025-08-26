import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme';
import { AssetCard } from '@/components/market/AssetCard';
import { AssetDetail } from '@/components/market/AssetDetail';
import { useAssets } from '@/lib/market';
import { useFavorites } from '@/lib/favorites';
import { BannerAd } from '@/components/ads/BannerAd';

export default function AssetsScreen() {
  const { colors } = useTheme();
  const { assets, isLoading } = useAssets();
  const { favorites, toggleFavorite } = useFavorites();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedAsset, setSelectedAsset] = useState(null);

  const assetTypes = [
    { id: 'all', label: 'Todos', icon: 'grid' },
    { id: 'crypto', label: 'Cripto', icon: 'logo-bitcoin' },
    { id: 'forex', label: 'Forex', icon: 'trending-up' },
    { id: 'stock', label: 'Ações', icon: 'business' },
  ];

  const filteredAssets = useMemo(() => {
    let filtered = assets || [];
    
    // Filtro por tipo
    if (selectedType !== 'all') {
      filtered = filtered.filter(asset => asset.type === selectedType);
    }
    
    // Filtro por busca
    if (searchQuery) {
      filtered = filtered.filter(asset => 
        asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [assets, selectedType, searchQuery]);

  const topGainers = assets?.filter(a => a.changePercent > 0).slice(0, 5) || [];
  const topLosers = assets?.filter(a => a.changePercent < 0).slice(0, 5) || [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
      {/* Header */}
      <View className="p-4">
        <Text className="text-text-primary text-2xl font-bold mb-4">
          Ativos
        </Text>
        
        {/* Barra de Pesquisa */}
        <View className="bg-surface-primary rounded-lg flex-row items-center px-3 py-2 mb-4">
          <Ionicons name="search" size={20} color={colors.text.tertiary} />
          <TextInput
            placeholder="Buscar ativos..."
            placeholderTextColor={colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 ml-2 text-text-primary"
          />
        </View>

        {/* Filtros por Tipo */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {assetTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              onPress={() => setSelectedType(type.id)}
              className={`mr-3 px-4 py-2 rounded-lg border ${
                selectedType === type.id
                  ? 'bg-primary-500 border-primary-500'
                  : 'bg-surface-primary border-surface-secondary'
              }`}
            >
              <View className="flex-row items-center">
                <Ionicons 
                  name={type.icon} 
                  size={16} 
                  color={selectedType === type.id ? 'white' : colors.text.primary} 
                />
                <Text className={`ml-2 font-medium ${
                  selectedType === type.id ? 'text-white' : 'text-text-primary'
                }`}>
                  {type.label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView className="flex-1">
        {/* Top Gainers */}
        {topGainers.length > 0 && (
          <View className="mx-4 mb-6">
            <Text className="text-text-primary text-lg font-semibold mb-3">
              Top Gainers
            </Text>
            {topGainers.map((asset) => (
              <AssetCard 
                key={asset.id} 
                asset={asset} 
                onPress={() => setSelectedAsset(asset)}
                showFavorite
                isFavorite={favorites.includes(asset.id)}
                onToggleFavorite={() => toggleFavorite(asset.id)}
              />
            ))}
          </View>
        )}

        {/* Top Losers */}
        {topLosers.length > 0 && (
          <View className="mx-4 mb-6">
            <Text className="text-text-primary text-lg font-semibold mb-3">
              Top Losers
            </Text>
            {topLosers.map((asset) => (
              <AssetCard 
                key={asset.id} 
                asset={asset} 
                onPress={() => setSelectedAsset(asset)}
                showFavorite
                isFavorite={favorites.includes(asset.id)}
                onToggleFavorite={() => toggleFavorite(asset.id)}
              />
            ))}
          </View>
        )}

        {/* Lista de Ativos Filtrados */}
        <View className="mx-4 mb-6">
          <Text className="text-text-primary text-lg font-semibold mb-3">
            {selectedType === 'all' ? 'Todos os Ativos' : `${assetTypes.find(t => t.id === selectedType)?.label}`}
            {searchQuery && ` - "${searchQuery}"`}
          </Text>
          {filteredAssets.map((asset) => (
            <AssetCard 
              key={asset.id} 
              asset={asset} 
              onPress={() => setSelectedAsset(asset)}
              showFavorite
              isFavorite={favorites.includes(asset.id)}
              onToggleFavorite={() => toggleFavorite(asset.id)}
            />
          ))}
          {filteredAssets.length === 0 && (
            <View className="items-center py-8">
              <Ionicons name="search" size={48} color={colors.text.tertiary} />
              <Text className="text-text-tertiary text-lg mt-2">
                Nenhum ativo encontrado
              </Text>
            </View>
          )}
        </View>

        {/* Anúncio Banner */}
        <View className="mx-4 mb-4">
          <BannerAd />
        </View>
      </ScrollView>

      {/* Modal de Detalhe do Ativo */}
      {selectedAsset && (
        <AssetDetail
          asset={selectedAsset}
          visible={!!selectedAsset}
          onClose={() => setSelectedAsset(null)}
        />
      )}
    </SafeAreaView>
  );
}
