import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface TradeHistoryProps {
  trades: any[];
  onClose: () => void;
}

export function TradeHistory({ trades, onClose }: TradeHistoryProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Histórico de Trades</Text>
      <Text style={styles.placeholder}>
        {trades?.length || 0} trades encontrados
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  placeholder: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 100,
  },
});
