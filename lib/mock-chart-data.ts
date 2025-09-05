// Dados mockados para validação dos gráficos Highcharts

export interface CandleData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface VolumeData {
  timestamp: number;
  volume: number;
}

export interface ChartData {
  symbol: string;
  name: string;
  candles: CandleData[];
  volume: VolumeData[];
  currentPrice: number;
  change24h: number;
  changePercent24h: number;
  trend: 'up' | 'down';
  dailyAppreciation: number; // Valorização do dia em %
}

// Função para gerar dados mockados realistas
export function generateMockChartData(
  symbol: string, 
  name: string, 
  days: number = 30,
  basePrice: number = 100
): ChartData {
  const candles: CandleData[] = [];
  const volume: VolumeData[] = [];
  
  // Preços base por símbolo
  const basePrices: { [key: string]: number } = {
    'BTC': 45000,
    'PETR4': 32.50,
    'VALE3': 68.75,
    'ITUB4': 28.90,
    'BBDC4': 22.15,
    'ABEV3': 12.80,
    'WEGE3': 45.20,
    'RENT3': 18.75,
    'LREN3': 15.30,
    'MGLU3': 8.45,
    'B3SA3': 12.30,
    'SUZB3': 25.80
  };
  
  const startPrice = basePrices[symbol] || basePrice;
  let currentPrice = startPrice;
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const timestamp = date.getTime();
    
    // Simular variação de preço mais realista
    const dailyVolatility = 0.02 + Math.random() * 0.08; // 2-10% de volatilidade diária
    const trend = (Math.random() - 0.5) * 0.01; // Tendência sutil
    const randomWalk = (Math.random() - 0.5) * dailyVolatility;
    
    const open = currentPrice;
    const close = open * (1 + trend + randomWalk);
    const high = Math.max(open, close) * (1 + Math.random() * 0.03);
    const low = Math.min(open, close) * (1 - Math.random() * 0.03);
    
    // Volume baseado na volatilidade
    const baseVolume = 1000000;
    const volumeMultiplier = 0.5 + Math.random() * 2; // 0.5x a 2.5x o volume base
    const vol = Math.floor(baseVolume * volumeMultiplier);
    
    candles.push({
      timestamp,
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100
    });
    
    volume.push({
      timestamp,
      volume: vol
    });
    
    currentPrice = close;
  }
  
  // Calcular mudança de 24h
  const price24hAgo = candles[candles.length - 2]?.close || startPrice;
  const change24h = currentPrice - price24hAgo;
  const changePercent24h = (change24h / price24hAgo) * 100;
  
  // Determinar tendência baseada na mudança (apenas Alta ou Baixa)
  let trend: 'up' | 'down' = 'up';
  if (changePercent24h < 0) trend = 'down';
  
  // Calcular valorização do dia (simulação mais realista)
  const dailyAppreciation = Math.round((Math.random() - 0.4) * 10 * 100) / 100; // -4% a +6%
  
  return {
    symbol,
    name,
    candles,
    volume,
    currentPrice: Math.round(currentPrice * 100) / 100,
    change24h: Math.round(change24h * 100) / 100,
    changePercent24h: Math.round(changePercent24h * 100) / 100,
    trend,
    dailyAppreciation
  };
}

// Dados pré-gerados para performance
export const mockChartData: { [key: string]: ChartData } = {
  'BTC': generateMockChartData('BTC', 'Bitcoin', 30, 45000),
  'PETR4': generateMockChartData('PETR4', 'Petrobras PN', 30, 32.50),
  'VALE3': generateMockChartData('VALE3', 'Vale ON', 30, 68.75),
  'ITUB4': generateMockChartData('ITUB4', 'Itaú PN', 30, 28.90),
  'BBDC4': generateMockChartData('BBDC4', 'Bradesco PN', 30, 22.15),
  'ABEV3': generateMockChartData('ABEV3', 'Ambev ON', 30, 12.80),
  'WEGE3': generateMockChartData('WEGE3', 'WEG ON', 30, 45.20),
  'RENT3': generateMockChartData('RENT3', 'Localiza ON', 30, 18.75),
  'LREN3': generateMockChartData('LREN3', 'Lojas Renner ON', 30, 15.30),
  'MGLU3': generateMockChartData('MGLU3', 'Magazine Luiza ON', 30, 8.45),
  'B3SA3': generateMockChartData('B3SA3', 'B3 ON', 30, 12.30),
  'SUZB3': generateMockChartData('SUZB3', 'Suzano ON', 30, 25.80)
};

// Função para obter dados de um símbolo específico
export function getMockChartData(symbol: string): ChartData | null {
  return mockChartData[symbol] || null;
}

// Função para obter lista de símbolos disponíveis
export function getAvailableSymbols(): string[] {
  return Object.keys(mockChartData);
}

// Função para simular atualização de dados em tempo real
export function simulateRealTimeUpdate(symbol: string): CandleData | null {
  const data = mockChartData[symbol];
  if (!data) return null;
  
  const lastCandle = data.candles[data.candles.length - 1];
  const now = Date.now();
  
  // Simular pequena variação no último candle
  const variation = (Math.random() - 0.5) * 0.02; // ±1% de variação
  const newClose = lastCandle.close * (1 + variation);
  const newHigh = Math.max(lastCandle.high, newClose);
  const newLow = Math.min(lastCandle.low, newClose);
  
  const updatedCandle: CandleData = {
    timestamp: now,
    open: lastCandle.close,
    high: Math.round(newHigh * 100) / 100,
    low: Math.round(newLow * 100) / 100,
    close: Math.round(newClose * 100) / 100
  };
  
  // Atualizar o último candle
  data.candles[data.candles.length - 1] = updatedCandle;
  data.currentPrice = updatedCandle.close;
  
  return updatedCandle;
}

// Função para formatar preço para exibição (sempre 4 dígitos)
export function formatPrice(price: number, currency: string = 'R$'): string {
  // Garantir que sempre tenha 4 dígitos (ex: 43,34 ou 1.234,56)
  const formatted = price.toFixed(2).replace('.', ',');
  const parts = formatted.split(',');
  
  if (parts[0].length < 4) {
    // Adicionar zeros à esquerda se necessário
    const paddedInteger = parts[0].padStart(4, '0');
    return `${currency} ${paddedInteger},${parts[1]}`;
  }
  
  return `${currency} ${formatted}`;
}

// Função para formatar percentual
export function formatPercentage(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2).replace('.', ',')}%`;
}

// Função para obter cor baseada na variação
export function getChangeColor(value: number): string {
  return value >= 0 ? '#2ed573' : '#ff4757';
}

// Função para obter cor da tendência
export function getTrendColor(trend: 'up' | 'down'): string {
  switch (trend) {
    case 'up': return '#2ed573';
    case 'down': return '#ff4757';
    default: return '#888888';
  }
}

// Função para obter ícone da tendência
export function getTrendIcon(trend: 'up' | 'down'): string {
  switch (trend) {
    case 'up': return '📈';
    case 'down': return '📉';
    default: return '📈';
  }
}

// Função para obter texto da tendência
export function getTrendText(trend: 'up' | 'down'): string {
  switch (trend) {
    case 'up': return 'Alta';
    case 'down': return 'Baixa';
    default: return 'Alta';
  }
}
