import { useState, useEffect } from 'react';

// Dados mockados para demonstração
const mockAssets = [
  {
    id: '1',
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 45000,
    changePercent: 2.5,
    type: 'crypto'
  },
  {
    id: '2',
    symbol: 'ETH',
    name: 'Ethereum',
    price: 3200,
    changePercent: -1.2,
    type: 'crypto'
  },
  {
    id: '3',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 180,
    changePercent: 0.8,
    type: 'stock'
  },
  {
    id: '4',
    symbol: 'EUR/USD',
    name: 'Euro/Dólar',
    price: 1.08,
    changePercent: 0.3,
    type: 'forex'
  }
];

export function useAssets() {
  const [assets, setAssets] = useState(mockAssets);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Simular carregamento
    setIsLoading(true);
    setTimeout(() => {
      setAssets(mockAssets);
      setIsLoading(false);
    }, 1000);
  }, []);

  return { assets, isLoading };
}
