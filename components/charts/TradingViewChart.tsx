import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface TradingViewChartProps {
  symbol: string;
  interval: string;
  height: number;
}

export function TradingViewChart({ symbol, interval, height }: TradingViewChartProps) {
  return (
    <View style={[styles.container, { height }]}>
      <Text style={styles.title}>📊 {symbol}</Text>
      <Text style={styles.interval}>{interval}</Text>
      <Text style={styles.placeholder}>Gráfico TradingView</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  interval: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  placeholder: {
    fontSize: 16,
    color: '#666',
  },
});
