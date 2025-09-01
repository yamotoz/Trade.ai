import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme';

interface StudyReaderProps {
 study: any;
 visible: boolean;
 onClose: () => void;
 progress: number;
 onProgressUpdate: (newProgress: number) => void;
}

export function StudyReader({ study, visible, onClose, progress, onProgressUpdate }: StudyReaderProps) {
 const { colors } = useTheme();

 if (!visible) {
  return null;
 }

 return (
  <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
   {/* Botão Fechar */}
   <TouchableOpacity style={styles.closeButton} onPress={onClose}>
    <Ionicons name="close" size={28} color={colors.text.primary} />
   </TouchableOpacity>

   <ScrollView style={styles.contentContainer}>
    <Text style={[styles.title, { color: colors.text.primary }]}>{study?.title || 'Título do Estudo'}</Text>
    <Text style={[styles.content, { color: colors.text.secondary }]}>
     {study?.content || 'Conteúdo completo do estudo aqui...'}
    </Text>
   </ScrollView>
  </View>
 );
}

const styles = StyleSheet.create({
 container: {
  flex: 1,
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  padding: 20,
  paddingTop: 60,
  zIndex: 100,
 },
 closeButton: {
  position: 'absolute',
  top: 20,
  right: 20,
  padding: 8,
  zIndex: 10,
  borderRadius: 20,
 },
 contentContainer: {
  flex: 1,
 },
 title: {
  fontSize: 24,
  fontWeight: 'bold',
  marginBottom: 20,
  marginTop: 20,
 },
 content: {
  fontSize: 16,
  lineHeight: 24,
 },
});