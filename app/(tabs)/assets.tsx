import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme';

export default function AssetsScreen() {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  const assetTypes = [
    { id: 'all', label: 'Todos', icon: 'grid' },
    { id: 'crypto', label: 'Cripto', icon: 'logo-bitcoin' },
    { id: 'forex', label: 'Forex', icon: 'trending-up' },
    { id: 'stock', label: 'Ações', icon: 'business' },
  ];

  // Dados mockados para demonstração
  const mockAssets = [
    { id: '1', symbol: 'BTC', name: 'Bitcoin', price: 45000, changePercent: 2.5, type: 'crypto' },
    { id: '2', symbol: 'ETH', name: 'Ethereum', price: 3200, changePercent: -1.2, type: 'crypto' },
    { id: '3', symbol: 'AAPL', name: 'Apple Inc.', price: 180, changePercent: 0.8, type: 'stock' },
    { id: '4', symbol: 'EUR/USD', name: 'Euro/Dólar', price: 1.08, changePercent: 0.3, type: 'forex' },
  ];

  const filteredAssets = mockAssets.filter(asset => {
    if (selectedType !== 'all' && asset.type !== selectedType) return false;
    if (searchQuery && !asset.symbol.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const topGainers = mockAssets.filter(a => a.changePercent > 0).slice(0, 3);
  const topLosers = mockAssets.filter(a => a.changePercent < 0).slice(0, 3);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
          Ativos
        </Text>
        
        {/* Barra de Pesquisa */}
        <View style={[styles.searchContainer, { backgroundColor: colors.surface.primary }]}>
          <Ionicons name="search" size={20} color={colors.text.tertiary} />
          <TextInput
            placeholder="Buscar ativos..."
            placeholderTextColor={colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.searchInput, { color: colors.text.primary }]}
          />
        </View>

        {/* Filtros por Tipo */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {assetTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              onPress={() => setSelectedType(type.id)}
              style={[
                styles.typeButton,
                { marginRight: 12 },
                selectedType === type.id
                  ? { backgroundColor: colors.primary[500], borderColor: colors.primary[500] }
                  : { backgroundColor: colors.surface.primary, borderColor: colors.surface.secondary }
              ]}
            >
              <View style={styles.typeButtonContent}>
                <Ionicons 
                  name={type.icon as any} 
                  size={16} 
                  color={selectedType === type.id ? 'white' : colors.text.primary} 
                />
                <Text style={[
                  styles.typeButtonText,
                  { marginLeft: 8 },
                  selectedType === type.id ? { color: 'white' } : { color: colors.text.primary }
                ]}>
                  {type.label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.assetsList}>
        {/* Top Gainers */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Top Gainers 📈
          </Text>
          {topGainers.map((asset) => (
            <View key={asset.id} style={[styles.assetCard, { backgroundColor: colors.surface.primary }]}>
              <View style={styles.assetHeader}>
                <Text style={[styles.assetSymbol, { color: colors.text.primary }]}>{asset.symbol}</Text>
                <Text style={[styles.assetChange, { color: '#2ed573' }]}>+{asset.changePercent}%</Text>
              </View>
              <Text style={[styles.assetName, { color: colors.text.secondary }]}>{asset.name}</Text>
              <Text style={[styles.assetPrice, { color: colors.text.primary }]}>${asset.price.toLocaleString()}</Text>
            </View>
          ))}
        </View>

        {/* Top Losers */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Top Losers 📉
          </Text>
          {topLosers.map((asset) => (
            <View key={asset.id} style={[styles.assetCard, { backgroundColor: colors.surface.primary }]}>
              <View style={styles.assetHeader}>
                <Text style={[styles.assetSymbol, { color: colors.text.primary }]}>{asset.symbol}</Text>
                <Text style={[styles.assetChange, { color: '#ff4757' }]}>{asset.changePercent}%</Text>
              </View>
              <Text style={[styles.assetName, { color: colors.text.secondary }]}>{asset.name}</Text>
              <Text style={[styles.assetPrice, { color: colors.text.primary }]}>${asset.price.toLocaleString()}</Text>
            </View>
          ))}
        </View>

        {/* Lista de Ativos Filtrados */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            {selectedType === 'all' ? 'Todos os Ativos' : `${assetTypes.find(t => t.id === selectedType)?.label}`}
            {searchQuery && ` - "${searchQuery}"`}
          </Text>
          {filteredAssets.map((asset) => (
            <View key={asset.id} style={[styles.assetCard, { backgroundColor: colors.surface.primary }]}>
              <View style={styles.assetHeader}>
                <Text style={[styles.assetSymbol, { color: colors.text.primary }]}>{asset.symbol}</Text>
                <Text style={[styles.assetChange, { color: asset.changePercent >= 0 ? '#2ed573' : '#ff4757' }]}>
                  {asset.changePercent >= 0 ? '+' : ''}{asset.changePercent}%
                </Text>
              </View>
              <Text style={[styles.assetName, { color: colors.text.secondary }]}>{asset.name}</Text>
              <Text style={[styles.assetPrice, { color: colors.text.primary }]}>${asset.price.toLocaleString()}</Text>
            </View>
          ))}
          {filteredAssets.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="search" size={48} color={colors.text.tertiary} />
              <Text style={[styles.emptyStateText, { color: colors.text.tertiary }]}>
                Nenhum ativo encontrado
              </Text>
            </View>
          )}
        </View>
      </ScrollView>


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
  searchContainer: {
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
  },
  typeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  typeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeButtonText: {
    fontWeight: '500',
  },
  assetsList: {
    flex: 1,
  },
  sectionContainer: {
    marginHorizontal: 12,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 18,
    marginTop: 8,
  },
  assetCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  assetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  assetSymbol: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  assetName: {
    fontSize: 14,
    marginBottom: 8,
  },
  assetPrice: {
    fontSize: 16,
    fontWeight: '600',
  },
  assetChange: {
    fontSize: 14,
    fontWeight: '600',
  },
});
