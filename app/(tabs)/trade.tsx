import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme';
import { TradingViewChart } from '@/components/charts/TradingViewChart';
import { OrderTicket } from '@/components/trading/OrderTicket';
import { TradeHistory } from '@/components/trading/TradeHistory';
import { useTrades } from '@/lib/trading';
import { useAssets } from '@/lib/market';

export default function TradeScreen() {
  const { colors } = useTheme();
  const { trades, openTrade, closeTrade } = useTrades();
  const { assets } = useAssets();
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showOrderTicket, setShowOrderTicket] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const openTrades = trades?.filter(t => t.status === 'open') || [];
  const closedTrades = trades?.filter(t => t.status === 'closed') || [];

  const totalPnL = closedTrades.reduce((sum, trade) => sum + trade.pnl, 0);
  const winRate = closedTrades.length > 0 
    ? (closedTrades.filter(t => t.pnl > 0).length / closedTrades.length) * 100 
    : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
      {/* Header */}
      <View className="flex-row items-center justify-between p-4">
        <Text className="text-text-primary text-xl font-bold">Operação</Text>
        <View className="flex-row space-x-2">
          <TouchableOpacity
            onPress={() => setShowHistory(true)}
            className="bg-surface-secondary p-2 rounded-lg"
          >
            <Ionicons name="time" size={20} color={colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowOrderTicket(true)}
            className="bg-primary-500 p-2 rounded-lg"
          >
            <Ionicons name="add" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Estatísticas Rápidas */}
      <View className="mx-4 mb-4">
        <View className="flex-row space-x-3">
          <View className="flex-1 bg-surface-primary p-3 rounded-lg">
            <Text className="text-text-tertiary text-xs">P&L Total</Text>
            <Text className={`text-lg font-bold ${totalPnL >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
              ${totalPnL.toFixed(2)}
            </Text>
          </View>
          <View className="flex-1 bg-surface-primary p-3 rounded-lg">
            <Text className="text-text-tertiary text-xs">Taxa de Acerto</Text>
            <Text className="text-text-primary text-lg font-bold">
              {winRate.toFixed(1)}%
            </Text>
          </View>
          <View className="flex-1 bg-surface-primary p-3 rounded-lg">
            <Text className="text-text-tertiary text-xs">Trades Abertos</Text>
            <Text className="text-text-primary text-lg font-bold">
              {openTrades.length}
            </Text>
          </View>
        </View>
      </View>

      {/* Seleção de Ativo */}
      <View className="mx-4 mb-4">
        <Text className="text-text-primary text-lg font-semibold mb-2">
          Selecionar Ativo
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {assets?.slice(0, 10).map((asset) => (
            <TouchableOpacity
              key={asset.id}
              onPress={() => setSelectedAsset(asset)}
              className={`mr-3 px-4 py-2 rounded-lg border ${
                selectedAsset?.id === asset.id
                  ? 'bg-primary-500 border-primary-500'
                  : 'bg-surface-primary border-surface-secondary'
              }`}
            >
              <Text className={`font-medium ${
                selectedAsset?.id === asset.id ? 'text-white' : 'text-text-primary'
              }`}>
                {asset.symbol}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Gráfico TradingView */}
      {selectedAsset && (
        <View className="flex-1 mx-4 mb-4">
          <View className="bg-surface-primary rounded-lg overflow-hidden">
            <TradingViewChart 
              symbol={selectedAsset.symbol}
              interval="1D"
              height={300}
            />
          </View>
        </View>
      )}

      {/* Trades Abertos */}
      {openTrades.length > 0 && (
        <View className="mx-4 mb-4">
          <Text className="text-text-primary text-lg font-semibold mb-2">
            Trades Abertos
          </Text>
          {openTrades.map((trade) => (
            <View key={trade.id} className="bg-surface-primary p-3 rounded-lg mb-2">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-text-primary font-medium">
                    {trade.asset.symbol} {trade.side === 'buy' ? 'Compra' : 'Venda'}
                  </Text>
                  <Text className="text-text-tertiary text-sm">
                    Qtd: {trade.quantity} • Preço: ${trade.price}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className={`font-bold ${
                    trade.pnl >= 0 ? 'text-accent-green' : 'text-accent-red'
                  }`}>
                    ${trade.pnl.toFixed(2)}
                  </Text>
                  <TouchableOpacity
                    onPress={() => closeTrade(trade.id)}
                    className="bg-accent-red px-3 py-1 rounded mt-1"
                  >
                    <Text className="text-white text-xs">Fechar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Modal do Ticket de Ordem */}
      <Modal
        visible={showOrderTicket}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <OrderTicket
          asset={selectedAsset}
          onClose={() => setShowOrderTicket(false)}
          onSubmit={openTrade}
        />
      </Modal>

      {/* Modal do Histórico */}
      <Modal
        visible={showHistory}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <TradeHistory
          trades={closedTrades}
          onClose={() => setShowHistory(false)}
        />
      </Modal>
    </SafeAreaView>
  );
}
