import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface NewsCardProps {
  news: any;
  onPress?: () => void;
}

export function NewsCard({ news, onPress }: NewsCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.category}>{news?.category || 'Geral'}</Text>
        <Text style={styles.time}>{news?.time || '2h atrás'}</Text>
      </View>
      
      <Text style={styles.title}>{news?.title || 'Título da notícia'}</Text>
      <Text style={styles.summary} numberOfLines={3}>
        {news?.summary || 'Resumo da notícia que será exibido aqui...'}
      </Text>
      
      <View style={styles.footer}>
        <View style={styles.source}>
          <Ionicons name="newspaper" size={16} color="#999" />
          <Text style={styles.sourceText}>{news?.source || 'Fonte'}</Text>
        </View>
        
        <TouchableOpacity style={styles.readMore}>
          <Text style={styles.readMoreText}>Ler mais</Text>
          <Ionicons name="arrow-forward" size={16} color="#007AFF" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  category: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    lineHeight: 24,
  },
  summary: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  source: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sourceText: {
    fontSize: 12,
    color: '#999',
  },
  readMore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readMoreText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
});
