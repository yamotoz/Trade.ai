// Exportações unificadas para integração Binance

// Tipos
export * from './binanceTypes';

// REST API
export * from './binanceRest';

// WebSocket
export * from './binanceWs';

// Funções de conveniência
import { getSymbolData, getMultipleSymbolsData, getMultiplePrices } from './binanceRest';
import { subscribeToPriceUpdates, subscribeToCandleUpdates, subscribeToMultipleUpdates, getBinanceWebSocket } from './binanceWs';
import { KlineInterval, PriceData, CandleData, WebSocketCallbacks } from './binanceTypes';

// Função para obter cotação completa (preço + candles)
export async function getQuote(
  symbol: string, 
  interval: KlineInterval = '1h'
): Promise<{
  price: PriceData;
  candles: CandleData[];
}> {
  return getSymbolData(symbol, interval);
}

// Função para obter dados OHLCV
export async function getOHLCV(
  symbol: string, 
  interval: KlineInterval = '1h',
  limit: number = 100
): Promise<CandleData[]> {
  const { candles } = await getSymbolData(symbol, interval);
  return candles.slice(-limit);
}

// Função para stream de preços em tempo real
export async function streamPrices(
  symbols: string[],
  callbacks: WebSocketCallbacks
): Promise<void> {
  // Usar apenas streams de ticker para reduzir rate limiting
  const ws = getBinanceWebSocket(callbacks);
  await ws.connectAndSubscribe();
  
  symbols.forEach(symbol => {
    ws.subscribeTicker(symbol);
  });
}

// Função para stream de preço único
export async function streamSinglePrice(
  symbol: string,
  onPriceUpdate: (data: PriceData) => void
): Promise<void> {
  await subscribeToPriceUpdates(symbol, onPriceUpdate);
}

// Função para stream de candles
export async function streamCandles(
  symbol: string,
  interval: KlineInterval,
  onCandleUpdate: (data: CandleData) => void
): Promise<void> {
  await subscribeToCandleUpdates(symbol, interval, onCandleUpdate);
}

// Função para obter dados de múltiplos símbolos
export async function getMultipleQuotes(
  symbols: string[],
  interval: KlineInterval = '1h'
): Promise<Map<string, { price: PriceData; candles: CandleData[] }>> {
  return getMultipleSymbolsData(symbols, interval);
}

// Função para obter apenas preços de múltiplos símbolos
export async function getMultiplePriceQuotes(
  symbols: string[]
): Promise<Map<string, PriceData>> {
  return getMultiplePrices(symbols);
}
