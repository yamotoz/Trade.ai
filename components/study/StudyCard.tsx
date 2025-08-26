import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StudyCardProps {
  study: any;
  onPress?: () => void;
}

export function StudyCard({ study, onPress }: StudyCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="book" size={24} color="#007AFF" />
        </View>
        <View style={styles.info}>
          <Text style={styles.title}>{study?.title || 'Título do Estudo'}</Text>
          <Text style={styles.category}>{study?.category || 'Categoria'}</Text>
        </View>
        <View style={styles.duration}>
          <Text style={styles.durationText}>{study?.duration || '15 min'}</Text>
        </View>
      </View>
      
      <Text style={styles.description} numberOfLines={2}>
        {study?.description || 'Descrição do estudo que será exibida aqui...'}
      </Text>
      
      <View style={styles.footer}>
        <View style={styles.level}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.levelText}>{study?.level || 'Iniciante'}</Text>
        </View>
        
        <View style={styles.progress}>
          <Text style={styles.progressText}>0%</Text>
        </View>
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
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  category: {
    fontSize: 12,
    color: '#007AFF',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  duration: {
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  durationText: {
    fontSize: 12,
    color: '#999',
  },
  description: {
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
  level: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  levelText: {
    fontSize: 12,
    color: '#999',
  },
  progress: {
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  progressText: {
    fontSize: 12,
    color: '#999',
  },
});
