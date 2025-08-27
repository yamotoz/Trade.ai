import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function BannerAd() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>📱 Anúncio Banner</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 50,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#333',
    marginVertical: 8,
  },
  text: {
    color: '#999',
    fontSize: 12,
  },
});
