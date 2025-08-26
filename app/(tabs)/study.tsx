import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
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
      <View className="p-4">
        <Text className="text-text-primary text-2xl font-bold mb-4">
          Biblioteca de Estudos
        </Text>
        
        {/* Barra de Pesquisa */}
        <View className="bg-surface-primary rounded-lg flex-row items-center px-3 py-2 mb-4">
          <Ionicons name="search" size={20} color={colors.text.tertiary} />
          <TextInput
            placeholder="Buscar conteúdos..."
            placeholderTextColor={colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 ml-2 text-text-primary"
          />
        </View>

        {/* Filtros por Nível */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
          {levels.map((level) => (
            <TouchableOpacity
              key={level.id}
              onPress={() => setSelectedLevel(level.id)}
              className={`mr-3 px-4 py-2 rounded-lg border ${
                selectedLevel === level.id
                  ? 'bg-primary-500 border-primary-500'
                  : 'bg-surface-primary border-surface-secondary'
              }`}
            >
              <View className="flex-row items-center">
                <Ionicons 
                  name={level.icon} 
                  size={16} 
                  color={selectedLevel === level.id ? 'white' : colors.text.primary} 
                />
                <Text className={`ml-2 font-medium ${
                  selectedLevel === level.id ? 'text-white' : 'text-text-primary'
                }`}>
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
              className={`mr-3 px-4 py-2 rounded-lg border ${
                selectedCategory === category.id
                  ? 'bg-primary-500 border-primary-500'
                  : 'bg-surface-primary border-surface-secondary'
              }`}
            >
              <View className="flex-row items-center">
                <Ionicons 
                  name={category.icon} 
                  size={16} 
                  color={selectedCategory === category.id ? 'white' : colors.text.primary} 
                />
                <Text className={`ml-2 font-medium ${
                  selectedCategory === category.id ? 'text-white' : 'text-text-primary'
                }`}>
                  {category.label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Lista de Estudos */}
      <ScrollView className="flex-1">
        {filteredStudies.length > 0 ? (
          <View className="px-4">
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
          <View className="flex-1 items-center justify-center py-16">
            <Ionicons name="library-outline" size={64} color={colors.text.tertiary} />
            <Text className="text-text-tertiary text-lg mt-4 text-center">
              Nenhum conteúdo encontrado
            </Text>
            <Text className="text-text-muted text-sm mt-2 text-center px-8">
              Tente ajustar os filtros ou buscar por outro termo
            </Text>
          </View>
        )}

        {/* Anúncio Banner */}
        <View className="mx-4 my-4">
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
