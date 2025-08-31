// lib/study.ts
import { useState, useEffect } from 'react';

// Dados mockados para demonstração
const mockStudies = [
  {
    id: '1',
    title: 'Introdução ao Trading',
    description: 'Aprenda os conceitos básicos de trading e análise técnica',
    category: 'básico',
    level: 'beginner',
    duration: '15 min',
    content: 'Conteúdo completo do estudo aqui...'
  },
  {
    id: '2',
    title: 'Análise Técnica Avançada',
    description: 'Técnicas avançadas de análise de gráficos e indicadores',
    category: 'intermediário',
    level: 'intermediate',
    duration: '30 min',
    content: 'Conteúdo completo do estudo aqui...'
  },
  {
    id: '3',
    title: 'Gestão de Risco',
    description: 'Como gerenciar riscos e proteger seu capital',
    category: 'avançado',
    level: 'advanced',
    duration: '20 min',
    content: 'Conteúdo completo do estudo aqui...'
  }
];

export function useStudies() {
  const [studies, setStudies] = useState(mockStudies);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setStudies(mockStudies);
      setIsLoading(false);
    }, 1000);
  }, []);

  const getStudyById = (id: string) => {
    return studies.find(study => study.id === id);
  };

  return { studies, isLoading, getStudyById };
}
