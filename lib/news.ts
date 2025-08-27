import { useState, useEffect } from 'react';

// Dados mockados para demonstração
const mockNews = [
  {
    id: '1',
    title: 'Bitcoin atinge nova máxima histórica',
    summary: 'Bitcoin supera a marca de $50.000 pela primeira vez em 2024...',
    category: 'crypto',
    source: 'CryptoNews',
    time: '2h atrás'
  },
  {
    id: '2',
    title: 'Fed mantém taxas de juros estáveis',
    summary: 'Federal Reserve decide manter as taxas de juros inalteradas...',
    category: 'economy',
    source: 'Financial Times',
    time: '4h atrás'
  }
];

export function useNews() {
  const [news, setNews] = useState(mockNews);
  const [isLoading, setIsLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);

  const refetch = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setNews(mockNews);
      setIsLoading(false);
    }, 1000);
  };

  const fetchNextPage = () => {
    // Simular paginação
    setHasNextPage(false);
  };

  return { 
    news, 
    isLoading, 
    refetch, 
    hasNextPage, 
    fetchNextPage 
  };
}
