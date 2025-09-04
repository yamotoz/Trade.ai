// Funções REST para API Binance
import { 
  BinancePrice, 
  BinanceKline, 
  BinanceTicker, 
  BinanceExchangeInfo, 
  KlineInterval,
  CandleData,
  PriceData
} from './binanceTypes';

const BINANCE_BASE_URL = 'https://api.binance.com';

// Função para fazer requisições HTTP
async function binanceRequest<T>(endpoint: string): Promise<T> {
  try {
    const response = await fetch(`${BINANCE_BASE_URL}${endpoint}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Binance API request failed:', error);
    throw error;
  }
}

// Obter preço atual de um símbolo
export async function getPrice(symbol: string): Promise<BinancePrice> {
  const endpoint = `/api/v3/ticker/price?symbol=${symbol.toUpperCase()}`;
  return binanceRequest<BinancePrice>(endpoint);
}

// Obter dados de ticker (preço, volume, variação)
export async function getTicker(symbol: string): Promise<BinanceTicker> {
  const endpoint = `/api/v3/ticker/24hr?symbol=${symbol.toUpperCase()}`;
  return binanceRequest<BinanceTicker>(endpoint);
}

// Obter candles OHLCV
export async function getKlines(
  symbol: string, 
  interval: KlineInterval = '1h', 
  limit: number = 100
): Promise<BinanceKline[]> {
  const endpoint = `/api/v3/klines?symbol=${symbol.toUpperCase()}&interval=${interval}&limit=${limit}`;
  return binanceRequest<BinanceKline[]>(endpoint);
}

// Obter informações do exchange
export async function getExchangeInfo(): Promise<BinanceExchangeInfo> {
  const endpoint = '/api/v3/exchangeInfo';
  return binanceRequest<BinanceExchangeInfo>(endpoint);
}

// Obter preços de múltiplos símbolos
export async function getAllPrices(): Promise<BinancePrice[]> {
  const endpoint = '/api/v3/ticker/price';
  return binanceRequest<BinancePrice[]>(endpoint);
}

// Obter tickers de múltiplos símbolos
export async function getAllTickers(): Promise<BinanceTicker[]> {
  const endpoint = '/api/v3/ticker/24hr';
  return binanceRequest<BinanceTicker[]>(endpoint);
}

// Converter dados da Binance para formato do app
export function convertKlineToCandle(kline: BinanceKline, interval?: KlineInterval): CandleData {
  return {
    timestamp: kline.openTime,
    open: parseFloat(kline.open),
    high: parseFloat(kline.high),
    low: parseFloat(kline.low),
    close: parseFloat(kline.close),
    volume: parseFloat(kline.volume),
    interval,
    isClosed: true
  };
}

// Converter ticker da Binance para formato do app
export function convertTickerToPriceData(ticker: BinanceTicker): PriceData {
  return {
    symbol: ticker.symbol,
    price: parseFloat(ticker.lastPrice),
    change24h: parseFloat(ticker.priceChange),
    changePercent24h: parseFloat(ticker.priceChangePercent),
    volume24h: parseFloat(ticker.volume),
    high24h: parseFloat(ticker.highPrice),
    low24h: parseFloat(ticker.lowPrice),
    lastUpdate: Date.now(),
    timestamp: ticker.closeTime
  };
}

// Função para obter dados completos de um símbolo
export async function getSymbolData(
  symbol: string, 
  interval: KlineInterval = '1h'
): Promise<{
  price: PriceData;
  candles: CandleData[];
}> {
  try {
    const [ticker, klines] = await Promise.all([
      getTicker(symbol),
      getKlines(symbol, interval, 100)
    ]);

    const price = convertTickerToPriceData(ticker);
    const candles = klines.map(kline => convertKlineToCandle(kline, interval));

    return { price, candles };
  } catch (error) {
    console.error(`Failed to get data for ${symbol}:`, error);
    throw error;
  }
}

// Função para obter dados de múltiplos símbolos
export async function getMultipleSymbolsData(
  symbols: string[], 
  interval: KlineInterval = '1h'
): Promise<Map<string, { price: PriceData; candles: CandleData[] }>> {
  const results = new Map();
  
  try {
    // Fazer requisições em paralelo
    const promises = symbols.map(async (symbol) => {
      try {
        const data = await getSymbolData(symbol, interval);
        results.set(symbol, data);
      } catch (error) {
        console.error(`Failed to get data for ${symbol}:`, error);
        // Continuar com outros símbolos mesmo se um falhar
      }
    });

    await Promise.allSettled(promises);
    return results;
  } catch (error) {
    console.error('Failed to get multiple symbols data:', error);
    throw error;
  }
}

// Função para obter apenas preços de múltiplos símbolos (mais rápida)
export async function getMultiplePrices(symbols: string[]): Promise<Map<string, PriceData>> {
  const results = new Map();
  
  try {
    const allTickers = await getAllTickers();
    
    // Filtrar apenas os símbolos que queremos
    const filteredTickers = allTickers.filter(ticker => 
      symbols.includes(ticker.symbol)
    );
    
    filteredTickers.forEach(ticker => {
      const priceData = convertTickerToPriceData(ticker);
      results.set(ticker.symbol, priceData);
    });
    
    return results;
  } catch (error) {
    console.error('Failed to get multiple prices:', error);
    throw error;
  }
}
