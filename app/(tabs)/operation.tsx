// Tela de Operação em Tela Cheia
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Alert,
  SafeAreaView,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../lib/theme';
import { useSymbolData } from '../../lib/hooks/useMarketData';
import { TradingViewChart } from '../../components/charts/TradingViewChart';
import { POPULAR_SYMBOLS } from '../../lib/market/binance';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function OperationScreen() {
  const { colors } = useTheme();
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTCUSDT');
  const [orderType, setOrderType] = useState<'buy' | 'sell' | null>(null);
  const [quantity, setQuantity] = useState<string>('0');
  const [price, setPrice] = useState<string>('0');
  
  const { price: priceData, candles, loading, error, refresh } = useSymbolData(selectedSymbol, '1m');

  // Atualizar preço quando os dados mudarem
  useEffect(() => {
    if (priceData) {
      setPrice(priceData.price.toFixed(2));
    }
  }, [priceData]);

  const handleBuy = () => {
    setOrderType('buy');
    Alert.alert(
      'Ordem de Compra',
      `Comprar ${quantity} ${selectedSymbol.replace('USDT', '')} por $${price}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', onPress: () => executeOrder('buy') }
      ]
    );
  };

  const handleSell = () => {
    setOrderType('sell');
    Alert.alert(
      'Ordem de Venda',
      `Vender ${quantity} ${selectedSymbol.replace('USDT', '')} por $${price}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', onPress: () => executeOrder('sell') }
      ]
    );
  };

  const executeOrder = (type: 'buy' | 'sell') => {
    // Aqui você implementaria a lógica real de execução da ordem
    Alert.alert(
      'Ordem Executada',
      `Ordem de ${type === 'buy' ? 'compra' : 'venda'} executada com sucesso!`,
      [{ text: 'OK' }]
    );
    setOrderType(null);
  };

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
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.text.tertiary }]}>
                Volume 24h
              </Text>
              <Text style={[styles.statValue, { color: colors.text.primary }]}>
                {priceData.volume24h.toLocaleString()}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.text.tertiary }]}>
                Alta 24h
              </Text>
              <Text style={[styles.statValue, { color: colors.text.primary }]}>
                ${formatPrice(priceData.high24h)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.text.tertiary }]}>
                Baixa 24h
              </Text>
              <Text style={[styles.statValue, { color: colors.text.primary }]}>
                ${formatPrice(priceData.low24h)}
              </Text>
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
          <TradingViewChart
            symbol={selectedSymbol}
            height={screenHeight * 0.4}
            data={candles}
            interval="1m"
          />
        )}
      </View>

      {/* Formulário de Ordem */}
      <View style={[styles.orderForm, { backgroundColor: colors.surface.primary }]}>
        <Text style={[styles.formTitle, { color: colors.text.primary }]}>
          Nova Ordem
        </Text>
        
        <View style={styles.inputRow}>
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>
              Quantidade
            </Text>
            <View style={[styles.inputContainer, { borderColor: colors.surface.tertiary }]}>
              <Text style={[styles.inputValue, { color: colors.text.primary }]}>
                {quantity}
              </Text>
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>
              Preço
            </Text>
            <View style={[styles.inputContainer, { borderColor: colors.surface.tertiary }]}>
              <Text style={[styles.inputValue, { color: colors.text.primary }]}>
                ${price}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Botões de Ação */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.buyButton]}
          onPress={handleBuy}
          disabled={loading}
        >
          <Ionicons name="arrow-up" size={24} color="#ffffff" />
          <Text style={styles.actionButtonText}>COMPRAR</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.sellButton]}
          onPress={handleSell}
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
    marginBottom: 16,
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
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
  orderForm: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputGroup: {
    flex: 1,
    marginHorizontal: 4,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  inputValue: {
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
