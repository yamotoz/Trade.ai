import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme';
import { StudyCard } from '@/components/study/StudyCard';
import { StudyReader } from '@/components/study/StudyReader';
import { useStudies } from '@/lib/study';
import { useStudyProgress } from '@/lib/study-progress';
import { BannerAd } from '@/components/ads/BannerAd';

export default function StudyScreen() {
  const { colors } = useTheme();
  const { studies, isLoading } = useStudies();
  const { progress, updateProgress } = useStudyProgress();
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudy, setSelectedStudy] = useState(null);

  const levels = [
    { id: 'all', label: 'Todos', icon: 'school' },
    { id: 'beginner', label: 'Básico', icon: 'star' },
    { id: 'intermediate', label: 'Intermediário', icon: 'star-half' },
    { id: 'advanced', label: 'Avançado', icon: 'star-outline' },
  ];

  const categories = [
    { id: 'all', label: 'Todas', icon: 'grid' },
    { id: 'technical', label: 'Análise Técnica', icon: 'trending-up' },
    { id: 'fundamental', label: 'Análise Fundamental', icon: 'analytics' },
    { id: 'psychology', label: 'Psicologia', icon: 'brain' },
    { id: 'risk', label: 'Gestão de Risco', icon: 'shield' },
    { id: 'strategy', label: 'Estratégias', icon: 'compass' },
  ];

  const filteredStudies = useMemo(() => {
    let filtered = studies || [];
    
    // Filtro por nível
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(study => study.level === selectedLevel);
    }
    
    // Filtro por categoria
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(study => study.category === selectedCategory);
    }
    
    // Filtro por busca
    if (searchQuery) {
      filtered = filtered.filter(study => 
        study.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        study.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [studies, selectedLevel, selectedCategory, searchQuery]);

  const getProgressPercentage = (studyId: string) => {
    return progress[studyId] || 0;
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return colors.accent.green;
      case 'intermediate': return colors.accent.yellow;
      case 'advanced': return colors.accent.red;
      default: return colors.text.tertiary;
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'beginner': return 'Básico';
      case 'intermediate': return 'Intermediário';
      case 'advanced': return 'Avançado';
      default: return 'N/A';
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text.primary }]}>
          Biblioteca de Estudos
        </Text>
        
        {/* Barra de Pesquisa */}
        <View style={[styles.searchContainer, { backgroundColor: colors.surface.primary }]}>
          <Ionicons name="search" size={20} color={colors.text.tertiary} />
          <TextInput
            placeholder="Buscar conteúdos..."
            placeholderTextColor={colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.searchInput, { color: colors.text.primary }]}
          />
        </View>

        {/* Filtros por Nível */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
          {levels.map((level) => (
            <TouchableOpacity
              key={level.id}
              onPress={() => setSelectedLevel(level.id)}
              style={[
                styles.filterButton,
                { marginRight: 12 },
                selectedLevel === level.id
                  ? { backgroundColor: colors.primary[500], borderColor: colors.primary[500] }
                  : { backgroundColor: colors.surface.primary, borderColor: colors.surface.secondary }
              ]}
            >
              <View style={styles.filterButtonContent}>
                <Ionicons 
                  name={level.icon} 
                  size={16} 
                  color={selectedLevel === level.id ? 'white' : colors.text.primary} 
                />
                <Text style={[
                  styles.filterButtonText,
                  { marginLeft: 8 },
                  selectedLevel === level.id ? { color: 'white' } : { color: colors.text.primary }
                ]}>
                  {level.label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Filtros por Categoria */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => setSelectedCategory(category.id)}
              style={[
                styles.filterButton,
                { marginRight: 12 },
                selectedCategory === category.id
                  ? { backgroundColor: colors.primary[500], borderColor: colors.primary[500] }
                  : { backgroundColor: colors.surface.primary, borderColor: colors.surface.secondary }
              ]}
            >
              <View style={styles.filterButtonContent}>
                <Ionicons 
                  name={category.icon} 
                  size={16} 
                  color={selectedCategory === category.id ? 'white' : colors.text.primary} 
                />
                <Text style={[
                  styles.filterButtonText,
                  { marginLeft: 8 },
                  selectedCategory === category.id ? { color: 'white' } : { color: colors.text.primary }
                ]}>
                  {category.label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Lista de Estudos */}
      <ScrollView style={styles.studiesList}>
        {filteredStudies.length > 0 ? (
          <View style={styles.studiesContainer}>
            {filteredStudies.map((study) => (
              <StudyCard
                key={study.id}
                study={study}
                progress={getProgressPercentage(study.id)}
                onPress={() => setSelectedStudy(study)}
                levelColor={getLevelColor(study.level)}
                levelLabel={getLevelLabel(study.level)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="library-outline" size={64} color={colors.text.tertiary} />
            <Text style={[styles.emptyStateTitle, { color: colors.text.tertiary }]}>
              Nenhum conteúdo encontrado
            </Text>
            <Text style={[styles.emptyStateSubtitle, { color: colors.text.muted }]}>
              Tente ajustar os filtros ou buscar por outro termo
            </Text>
          </View>
        )}

        {/* Anúncio Banner */}
        <View style={styles.bannerContainer}>
          <BannerAd />
        </View>
      </ScrollView>

      {/* Modal de Leitura */}
      {selectedStudy && (
        <StudyReader
          study={selectedStudy}
          visible={!!selectedStudy}
          progress={getProgressPercentage(selectedStudy.id)}
          onClose={() => setSelectedStudy(null)}
          onProgressUpdate={(newProgress) => 
            updateProgress(selectedStudy.id, newProgress)
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchContainer: {
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
  },
  filtersContainer: {
    marginBottom: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  filterButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButtonText: {
    fontWeight: '500',
  },
  studiesList: {
    flex: 1,
  },
  studiesContainer: {
    paddingHorizontal: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyStateTitle: {
    fontSize: 18,
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  bannerContainer: {
    marginHorizontal: 16,
    marginVertical: 16,
  },
});
