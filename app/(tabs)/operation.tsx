import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  SafeAreaView,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme';
import { useMarketData } from '@/lib/hooks/useMarketData';
import { HighchartsChart } from '@/components/charts/HighchartsChart';
import { POPULAR_SYMBOLS } from '@/lib/market/binance';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function OperationScreen() {
  const { colors } = useTheme();
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTCUSDT');
  
  const { prices, candles, loading, error, refresh } = useMarketData({
    symbols: [selectedSymbol],
    interval: '1h',
    enableRealtime: false
  });
  
  const priceData = prices.get(selectedSymbol);
  const candleData = candles.get(selectedSymbol) || [];
  
  // Recarregar dados quando o símbolo mudar
  useEffect(() => {
    refresh();
  }, [selectedSymbol]); // Removido refresh das dependências para evitar loop

  const formatPrice = (value: number) => {
    return value.toFixed(2).replace('.', ',');
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2).replace('.', ',')}%`;
  };

  const getChangeColor = (value: number) => {
    return value >= 0 ? '#2ed573' : '#ff4757';
  };

  const getTrendIcon = (value: number) => {
    return value >= 0 ? '📈' : '📉';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background.primary} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background.primary }]}>
        <View style={styles.headerTop}>
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
            Operação
          </Text>
          <TouchableOpacity style={styles.refreshButton} onPress={refresh}>
            <Ionicons 
              name="refresh" 
              size={24} 
              color={colors.text.secondary} 
            />
          </TouchableOpacity>
        </View>
        
        {/* Seleção de Símbolo */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.symbolSelector}
          contentContainerStyle={styles.symbolSelectorContent}
        >
          {POPULAR_SYMBOLS.map((symbol) => (
            <TouchableOpacity
              key={symbol}
              style={[
                styles.symbolButton,
                { 
                  backgroundColor: selectedSymbol === symbol 
                    ? colors.primary[500] 
                    : colors.surface.secondary,
                  borderColor: colors.surface.tertiary
                }
              ]}
              onPress={() => setSelectedSymbol(symbol)}
            >
              <Text style={[
                styles.symbolText,
                { 
                  color: selectedSymbol === symbol 
                    ? '#ffffff' 
                    : colors.text.primary 
                }
              ]}>
                {symbol.replace('USDT', '')}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Informações do Ativo */}
      {priceData && (
        <View style={[styles.assetInfo, { backgroundColor: colors.surface.primary }]}>
          <View style={styles.assetHeader}>
            <View>
              <Text style={[styles.assetSymbol, { color: colors.text.primary }]}>
                {selectedSymbol.replace('USDT', '')}
              </Text>
              <Text style={[styles.assetName, { color: colors.text.secondary }]}>
                {selectedSymbol}
              </Text>
            </View>
            <View style={styles.priceInfo}>
              <Text style={[styles.currentPrice, { color: colors.text.primary }]}>
                ${formatPrice(priceData.price)}
              </Text>
              <View style={styles.changeInfo}>
                <Text style={styles.trendIcon}>
                  {getTrendIcon(priceData.changePercent24h)}
                </Text>
                <Text style={[
                  styles.changeText, 
                  { color: getChangeColor(priceData.changePercent24h) }
                ]}>
                  {formatPercentage(priceData.changePercent24h)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Gráfico */}
      <View style={styles.chartContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
              Carregando gráfico...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: colors.text.danger }]}>
              Erro ao carregar dados: {error}
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={refresh}>
              <Text style={[styles.retryText, { color: colors.primary[500] }]}>
                Tentar Novamente
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <HighchartsChart
            symbol={selectedSymbol}
            height={screenHeight * 0.4}
            data={candleData}
            interval="1h"
          />
        )}
      </View>

      {/* Botões de Ação */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.buyButton]}
          disabled={loading}
        >
          <Ionicons name="arrow-up" size={24} color="#ffffff" />
          <Text style={styles.actionButtonText}>COMPRAR</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.sellButton]}
          disabled={loading}
        >
          <Ionicons name="arrow-down" size={24} color="#ffffff" />
          <Text style={styles.actionButtonText}>VENDER</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  refreshButton: {
    padding: 8,
  },
  symbolSelector: {
    marginTop: 8,
  },
  symbolSelectorContent: {
    paddingRight: 16,
  },
  symbolButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  symbolText: {
    fontSize: 14,
    fontWeight: '600',
  },
  assetInfo: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  assetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assetSymbol: {
    fontSize: 20,
    fontWeight: '700',
  },
  assetName: {
    fontSize: 14,
    marginTop: 2,
  },
  priceInfo: {
    alignItems: 'flex-end',
  },
  currentPrice: {
    fontSize: 24,
    fontWeight: '700',
  },
  changeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  trendIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  chartContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    padding: 12,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  buyButton: {
    backgroundColor: '#2ed573',
  },
  sellButton: {
    backgroundColor: '#ff4757',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
