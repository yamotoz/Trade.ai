import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StudyReaderProps {
  study: any;
  visible: boolean;
  onClose: () => void;
}

export function StudyReader({ study, visible, onClose }: StudyReaderProps) {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      {/* Botão de fechar */}
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Ionicons name="close" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Conteúdo */}
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
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 8,
    zIndex: 10,
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
