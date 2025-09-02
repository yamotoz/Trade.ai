import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface NewsDetailProps {
  news: any;
  visible: boolean;
  onClose: () => void;
}

export function NewsDetail({ news, visible, onClose }: NewsDetailProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        {/* Botão Voltar */}
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.title}>{news?.title || 'Título da Notícia'}</Text>
        <Text style={styles.content}>
          {news?.content || 'Conteúdo completo da notícia aqui...'}
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
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    padding: 8,
    borderRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    marginTop: 40, // espaço extra por causa do botão
  },
  content: {
    fontSize: 16,
    color: '#ccc',
    lineHeight: 24,
  },
});
