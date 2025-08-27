import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ChartPreviewProps {
  symbol: string;
  data?: any;
}

export function ChartPreview({ symbol, data }: ChartPreviewProps) {
  return (
    <View style={styles.container}>
      <View style={styles.chart}>
        <Text style={styles.chartText}>📊 {symbol}</Text>
        <Text style={styles.chartSubtext}>Gráfico em tempo real</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  chart: {
    height: 80,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  chartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  chartSubtext: {
    color: '#999',
    fontSize: 12,
  },
});
