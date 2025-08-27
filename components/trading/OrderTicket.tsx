import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface OrderTicketProps {
  asset: any;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export function OrderTicket({ asset, onClose, onSubmit }: OrderTicketProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ticket de Ordem</Text>
      <Text style={styles.asset}>{asset?.symbol || 'BTC'}</Text>
      <Text style={styles.placeholder}>Formulário de ordem aqui...</Text>
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
  asset: {
    fontSize: 18,
    color: '#007AFF',
    marginBottom: 20,
  },
  placeholder: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 100,
  },
});
