import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme';

export default function TradeScreen() {
  const { colors } = useTheme();
  const [selectedAsset, setSelectedAsset] = useState('BTC');

  // Dados mockados para demonstração
  const mockAssets = ['BTC', 'ETH', 'AAPL', 'EUR/USD'];
  const mockTrades = [
    { id: '1', symbol: 'BTC', side: 'buy', quantity: 0.1, price: 45000, pnl: 250 },
    { id: '2', symbol: 'ETH', side: 'sell', quantity: 2, price: 3200, pnl: -80 },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Operação</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: colors.surface.secondary }]}
          >
            <Ionicons name="time" size={20} color={colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: colors.primary[500] }]}
          >
            <Ionicons name="add" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Estatísticas Rápidas */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.surface.primary }]}>
            <Text style={[styles.statLabel, { color: colors.text.tertiary }]}>P&L Total</Text>
            <Text style={[styles.statValue, { color: '#2ed573' }]}>
              $170.00
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface.primary }]}>
            <Text style={[styles.statLabel, { color: colors.text.tertiary }]}>Taxa de Acerto</Text>
            <Text style={[styles.statValue, { color: colors.text.primary }]}>
              50.0%
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface.primary }]}>
            <Text style={[styles.statLabel, { color: colors.text.tertiary }]}>Trades Abertos</Text>
            <Text style={[styles.statValue, { color: colors.text.primary }]}>
              2
            </Text>
          </View>
        </View>
      </View>

      {/* Seleção de Ativo */}
      <View style={styles.assetSelectionContainer}>
        <Text style={[styles.assetSelectionTitle, { color: colors.text.primary }]}>
          Selecionar Ativo
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {mockAssets.map((asset) => (
            <TouchableOpacity
              key={asset}
              onPress={() => setSelectedAsset(asset)}
              style={[
                styles.assetButton,
                { marginRight: 12 },
                selectedAsset === asset
                  ? { backgroundColor: colors.primary[500], borderColor: colors.primary[500] }
                  : { backgroundColor: colors.surface.primary, borderColor: colors.surface.secondary }
              ]}
            >
              <Text style={[
                styles.assetButtonText,
                { color: selectedAsset === asset ? 'white' : colors.text.primary }
              ]}>
                {asset}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Gráfico TradingView */}
      {selectedAsset && (
        <View style={styles.chartContainer}>
          <View style={[styles.chartCard, { backgroundColor: colors.surface.primary }]}>
            <View style={styles.chartPlaceholder}>
              <Text style={[styles.chartText, { color: colors.text.primary }]}>📊 {selectedAsset}</Text>
              <Text style={[styles.chartSubtext, { color: colors.text.secondary }]}>Gráfico em tempo real</Text>
            </View>
          </View>
        </View>
      )}

      {/* Trades Abertos */}
      <View style={styles.tradesContainer}>
        <Text style={[styles.tradesTitle, { color: colors.text.primary }]}>
          Trades Abertos
        </Text>
        {mockTrades.map((trade) => (
          <View key={trade.id} style={[styles.tradeCard, { backgroundColor: colors.surface.primary }]}>
            <View style={styles.tradeContent}>
              <View>
                <Text style={[styles.tradeSymbol, { color: colors.text.primary }]}>
                  {trade.symbol} {trade.side === 'buy' ? 'Compra' : 'Venda'}
                </Text>
                <Text style={[styles.tradeDetails, { color: colors.text.tertiary }]}>
                  Qtd: {trade.quantity} • Preço: ${trade.price}
                </Text>
              </View>
              <View style={styles.tradeActions}>
                <Text style={[styles.tradePnl, { color: trade.pnl >= 0 ? '#2ed573' : '#ff4757' }]}>
                  ${trade.pnl.toFixed(2)}
                </Text>
                <TouchableOpacity
                  style={[styles.closeButton, { backgroundColor: '#ff4757' }]}
                >
                  <Text style={styles.closeButtonText}>Fechar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
  },
  statsContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
  },
  statLabel: {
    fontSize: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  assetSelectionContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  assetSelectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  assetButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  assetButtonText: {
    fontWeight: '500',
  },
  chartContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  chartCard: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  tradesContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  tradesTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  tradeCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  tradeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tradeSymbol: {
    fontWeight: '500',
  },
  tradeDetails: {
    fontSize: 14,
  },
  tradeActions: {
    alignItems: 'flex-end',
  },
  tradePnl: {
    fontWeight: 'bold',
  },
  closeButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 4,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 12,
  },
  chartPlaceholder: {
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  chartSubtext: {
    fontSize: 16,
  },
});
