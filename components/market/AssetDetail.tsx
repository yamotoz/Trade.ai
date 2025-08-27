import React from 'react';
import { View, Text, Modal, StyleSheet } from 'react-native';

interface AssetDetailProps {
  asset: any;
  visible: boolean;
  onClose: () => void;
}

export function AssetDetail({ asset, visible, onClose }: AssetDetailProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <Text style={styles.title}>{asset?.symbol || 'BTC'}</Text>
        <Text style={styles.name}>{asset?.name || 'Bitcoin'}</Text>
        <Text style={styles.price}>${asset?.price || '45,000.00'}</Text>
        <Text style={styles.change}>
          {(asset?.changePercent || 2.5) >= 0 ? '+' : ''}{(asset?.changePercent || 2.5).toFixed(2)}%
        </Text>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    color: '#999',
    marginBottom: 20,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  change: {
    fontSize: 20,
    color: '#2ed573',
    fontWeight: '600',
  },
});
