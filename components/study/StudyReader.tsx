import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StudyReaderProps {
  study: any;
  visible: boolean;
  onClose: () => void;
}

export function StudyReader({ study, visible, onClose }: StudyReaderProps) {
  if (!visible) return null;
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{study?.title || 'Título do Estudo'}</Text>
      <Text style={styles.content}>
        {study?.content || 'Conteúdo completo do estudo aqui...'}
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
  content: {
    fontSize: 16,
    color: '#ccc',
    lineHeight: 24,
  },
});
