import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AssetCardProps {
  asset: any;
  onPress?: () => void;
  compact?: boolean;
  showChart?: boolean;
  showFavorite?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export function AssetCard({ 
  asset, 
  onPress, 
  compact = false, 
  showChart = false,
  showFavorite = false,
  isFavorite = false,
  onToggleFavorite 
}: AssetCardProps) {
  return (
    <TouchableOpacity 
      style={[styles.container, compact && styles.compact]} 
      onPress={onPress}
    >
      <View style={styles.header}>
        <View style={styles.symbolContainer}>
          <Text style={styles.symbol}>{asset?.symbol || 'BTC'}</Text>
          <Text style={styles.name}>{asset?.name || 'Bitcoin'}</Text>
        </View>
        {showFavorite && (
          <TouchableOpacity onPress={onToggleFavorite}>
            <Ionicons 
              name={isFavorite ? "heart" : "heart-outline"} 
              size={20} 
              color={isFavorite ? "#ff4757" : "#666"} 
            />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.priceContainer}>
        <Text style={styles.price}>${asset?.price || '45,000.00'}</Text>
        <Text style={[
          styles.change, 
          { color: (asset?.changePercent || 0) >= 0 ? '#2ed573' : '#ff4757' }
        ]}>
          {(asset?.changePercent || 2.5) >= 0 ? '+' : ''}{(asset?.changePercent || 2.5).toFixed(2)}%
        </Text>
      </View>
      
      {showChart && (
        <View style={styles.chartPlaceholder}>
          <Text style={styles.chartText}>📈 Gráfico</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  compact: {
    padding: 12,
    marginRight: 12,
    minWidth: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  symbolContainer: {
    flex: 1,
  },
  symbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  name: {
    fontSize: 12,
    color: '#999',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  change: {
    fontSize: 14,
    fontWeight: '600',
  },
  chartPlaceholder: {
    height: 60,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartText: {
    color: '#999',
    fontSize: 12,
  },
});
