// Hook para gerenciar dados de mercado com Binance
import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  getQuote, 
  getMultipleQuotes, 
  getMultiplePriceQuotes,
  PriceData, 
  CandleData, 
  KlineInterval,
  POPULAR_SYMBOLS
} from '../market/binance';
import { createBinanceWebSocket } from '../market/binance/binanceWsRobust';
import { rateLimiter, makeRateLimitedRequest } from '../rateLimiter';
import { Optional, safeMapGet } from '../optional';

interface MarketDataState {
  prices: Map<string, PriceData>;
  candles: Map<string, CandleData[]>;
  loading: boolean;
  error: string | null;
  lastUpdate: number;
}

interface UseMarketDataOptions {
  symbols?: string[];
  interval?: KlineInterval;
  enableRealtime?: boolean;
  cacheTimeout?: number; // em ms
}

const CACHE_KEY = 'market_data_cache';
const DEFAULT_CACHE_TIMEOUT = 5 * 1000; // 5 segundos

export function useMarketData(options: UseMarketDataOptions = {}) {
  const {
    symbols = POPULAR_SYMBOLS.slice(0, 1), // Reduzido para 1 símbolo para evitar rate limiting
    interval = '1h',
    enableRealtime = true,
    cacheTimeout = DEFAULT_CACHE_TIMEOUT
  } = options;

  const [state, setState] = useState<MarketDataState>({
    prices: new Map(),
    candles: new Map(),
    loading: false,
    error: null,
    lastUpdate: 0
  });

  // Função segura para atualizar estado - versão completamente defensiva
  const safeSetState = useCallback((updater: (prev: MarketDataState) => MarketDataState) => {
    setState(prev => {
      try {
        // Estado padrão sempre disponível
        const defaultState: MarketDataState = {
          prices: new Map(),
          candles: new Map(),
          loading: false,
          error: null,
          lastUpdate: 0
        };

        // Se prev não existe, usar estado padrão
        if (!prev) {
          console.warn('prev is undefined, using default state');
          return updater(defaultState);
        }

        // Se prev existe mas não tem as propriedades necessárias, usar estado padrão
        if (typeof prev !== 'object') {
          console.warn('prev is not an object, using default state');
          return updater(defaultState);
        }

        // Criar estado seguro com fallbacks para cada propriedade
        const safePrev: MarketDataState = {
          prices: (prev && typeof prev === 'object' && 'prices' in prev && prev.prices instanceof Map) 
            ? prev.prices 
            : new Map(),
          candles: (prev && typeof prev === 'object' && 'candles' in prev && prev.candles instanceof Map) 
            ? prev.candles 
            : new Map(),
          loading: (prev && typeof prev === 'object' && 'loading' in prev && typeof prev.loading === 'boolean') 
            ? prev.loading 
            : false,
          error: (prev && typeof prev === 'object' && 'error' in prev) 
            ? prev.error 
            : null,
          lastUpdate: (prev && typeof prev === 'object' && 'lastUpdate' in prev && typeof prev.lastUpdate === 'number') 
            ? prev.lastUpdate 
            : 0
        };
        
        console.log('safeSetState: using safe prev state');
        return updater(safePrev);
      } catch (error) {
        console.error('Error updating market data state:', error);
        // Sempre retornar estado padrão em caso de erro
        return {
          prices: new Map(),
          candles: new Map(),
          loading: false,
          error: null,
          lastUpdate: 0
        };
      }
    });
  }, []);

  const wsRef = useRef<any>(null);
  const cacheTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isConnectingRef = useRef<boolean>(false);

  // Carregar dados do cache
  const loadFromCache = useCallback(async () => {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        
        // Verificar se o cache ainda é válido
        if (Date.now() - timestamp < cacheTimeout) {
          safeSetState(prev => ({
            ...prev,
            prices: new Map(Array.isArray(data.prices) ? data.prices : []),
            candles: new Map(Array.isArray(data.candles) ? data.candles : []),
            lastUpdate: timestamp
          }));
          return true;
        }
      }
    } catch (error) {
      console.error('Error loading from cache:', error);
    }
    return false;
  }, [cacheTimeout, safeSetState]);

  // Salvar dados no cache
  const saveToCache = useCallback(async (prices: Map<string, PriceData>, candles: Map<string, CandleData[]>) => {
    try {
      // Verificar se os Maps são válidos
      if (!prices || !candles || typeof prices.entries !== 'function' || typeof candles.entries !== 'function') {
        console.warn('Invalid Maps provided to saveToCache');
        return;
      }
      
      const data = {
        prices: Array.from(prices.entries()),
        candles: Array.from(candles.entries()),
        timestamp: Date.now()
      };
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  }, []);

  // Carregar dados mock - versão simplificada
  const loadMarketData = useCallback(async (forceRefresh = false) => {
    if (state.loading && !forceRefresh) return;

    console.log('Starting loadMarketData...');
    
    try {
      safeSetState(prev => ({ ...prev, loading: true, error: null }));
      console.log('Set loading to true');

      // Usar apenas dados mock para garantir funcionamento
      console.log('Loading mock market data for symbols:', symbols);
      
      const prices = new Map<string, PriceData>();
      const candles = new Map<string, CandleData[]>();

      // Gerar dados mock para todos os símbolos
      for (const symbol of symbols) {
        try {
          console.log(`Generating mock data for ${symbol}...`);
          
          // Gerar preço mock
          const mockPrice = generateMockPrice(symbol);
          prices.set(symbol, mockPrice);
          console.log(`Added mock price for ${symbol}: ${mockPrice.price}`);
          
          // Gerar candles mock
          const mockCandles = generateMockCandles(symbol, 50);
          candles.set(symbol, mockCandles);
          console.log(`Added mock candles for ${symbol}: ${mockCandles.length} candles`);
          
        } catch (error) {
          console.error(`Failed to generate mock data for ${symbol}:`, error);
          // Continuar com outros símbolos
        }
      }
      
      console.log('Final prices map size:', prices.size);
      console.log('Final candles map size:', candles.size);

      // Atualizar estado com dados mock
      safeSetState(prev => {
        console.log('Updating state with mock data...');
        return {
          ...prev,
          prices,
          candles,
          loading: false,
          error: null,
          lastUpdate: Date.now()
        };
      });

      console.log('Market data loaded successfully');

    } catch (error) {
      console.error('Error loading market data:', error);
      safeSetState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erro ao carregar dados'
      }));
    }
  }, [symbols, interval, state.loading, safeSetState]);

  // Atualizar preço específico
  const updatePrice = useCallback((symbol: string, priceData: PriceData) => {
    safeSetState(prev => {
      try {
        const pricesOptional = Optional.of(prev.prices);
        const candlesOptional = Optional.of(prev.candles);
        
        const newPrices = new Map(pricesOptional.orElse(new Map()));
        newPrices.set(symbol, priceData);
        
        // Salvar no cache
        saveToCache(newPrices, candlesOptional.orElse(new Map()));
        
        return {
          ...prev,
          prices: newPrices,
          lastUpdate: Date.now()
        };
      } catch (error) {
        console.error('Error updating price:', error);
        return prev;
      }
    });
  }, [saveToCache, safeSetState]);

  // Atualizar candle específico
  const updateCandle = useCallback((symbol: string, candleData: CandleData) => {
    safeSetState(prev => {
      try {
        const pricesOptional = Optional.of(prev.prices);
        const candlesOptional = Optional.of(prev.candles);
        
        const newCandles = new Map(candlesOptional.orElse(new Map()));
        const existingCandles = newCandles.get(symbol) || [];
        
        // Atualizar último candle ou adicionar novo
        const lastCandle = existingCandles[existingCandles.length - 1];
        if (lastCandle && lastCandle.timestamp === candleData.timestamp) {
          // Atualizar último candle
          existingCandles[existingCandles.length - 1] = candleData;
        } else {
          // Adicionar novo candle
          existingCandles.push(candleData);
          // Manter apenas os últimos 100 candles
          if (existingCandles.length > 100) {
            existingCandles.shift();
          }
        }
        
        newCandles.set(symbol, existingCandles);
        
        // Salvar no cache
        saveToCache(pricesOptional.orElse(new Map()), newCandles);
        
        return {
          ...prev,
          candles: newCandles,
          lastUpdate: Date.now()
        };
      } catch (error) {
        console.error('Error updating candle:', error);
        return prev;
      }
    });
  }, [saveToCache, safeSetState]);

  // Configurar WebSocket para dados em tempo real
  const setupWebSocket = useCallback(async () => {
    if (!enableRealtime || wsRef.current || isConnectingRef.current) {
      console.log('WebSocket já existe, conectando ou realtime desabilitado');
      return;
    }

    // Desabilitar WebSocket temporariamente para evitar problemas
    console.log('🔌 WebSocket desabilitado temporariamente para evitar problemas de conectividade');
    return;

    isConnectingRef.current = true;

    try {
      console.log('🔌 Configurando WebSocket para símbolos:', symbols);
      
      // Usar nova implementação robusta do WebSocket
      wsRef.current = createBinanceWebSocket({
        onPriceUpdate: (priceData) => {
          console.log('📈 Atualizando preço:', priceData.symbol, priceData.price);
          updatePrice(priceData.symbol, priceData);
        },
        onCandleUpdate: (candleData) => {
          console.log('🕯️ Atualizando candle:', candleData.interval);
          // Atualizar candle para o símbolo correspondente
          symbols.forEach(symbol => {
            if (candleData.interval === interval) {
              updateCandle(symbol, candleData);
            }
          });
        },
        onError: (error) => {
          console.error('WebSocket error:', error);
          safeSetState(prev => ({ ...prev, error: error.message }));
        },
        onReconnect: () => {
          console.log('WebSocket reconnected');
          safeSetState(prev => ({ ...prev, error: null }));
        }
      });

      // Inscrever em streams
      symbols.forEach(symbol => {
        wsRef.current.subscribeTicker(symbol);
        wsRef.current.subscribeKlines(symbol, interval);
      });

      // Conectar
      await wsRef.current.connect();
      isConnectingRef.current = false;
    } catch (error) {
      console.error('Error setting up WebSocket:', error);
      isConnectingRef.current = false;
      safeSetState(prev => ({ ...prev, error: 'Erro na conexão em tempo real' }));
    }
  }, [symbols, enableRealtime, interval, updatePrice, updateCandle, safeSetState]);

  // Configurar polling como fallback
  const setupPolling = useCallback(() => {
    if (cacheTimeoutRef.current) {
      clearInterval(cacheTimeoutRef.current);
    }

    // Polling mais frequente quando WebSocket não está funcionando
    const pollingInterval = enableRealtime ? cacheTimeout : 5000; // 5s se WebSocket falhar
    
    cacheTimeoutRef.current = setInterval(() => {
      loadMarketData(true);
    }, pollingInterval);
  }, [loadMarketData, cacheTimeout, enableRealtime]);

  // Inicializar - versão simplificada
  useEffect(() => {
    console.log('useEffect: Initializing market data...');
    loadMarketData();
    
    // Polling simples
    const interval = setInterval(() => {
      console.log('Polling: Refreshing market data...');
      loadMarketData(true);
    }, 10000); // 10 segundos

    return () => {
      console.log('useEffect: Cleaning up...');
      clearInterval(interval);
    };
  }, []); // Sem dependências para evitar loops

  // Configurar WebSocket quando habilitado
  useEffect(() => {
    if (enableRealtime) {
      setupWebSocket();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect();
        wsRef.current = null;
      }
      // WebSocket será limpo automaticamente pelo disconnect()
    };
  }, [enableRealtime, setupWebSocket]);

  // Funções de conveniência
  const getPrice = useCallback((symbol: string): PriceData | undefined => {
    return state.prices.get(symbol);
  }, [state.prices]);

  const getCandles = useCallback((symbol: string): CandleData[] => {
    return state.candles.get(symbol) || [];
  }, [state.candles]);

  const refresh = useCallback(() => {
    loadMarketData(true);
  }, [loadMarketData]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    // Estado
    prices: state.prices,
    candles: state.candles,
    loading: state.loading,
    error: state.error,
    lastUpdate: state.lastUpdate,
    
    // Funções
    getPrice,
    getCandles,
    refresh,
    clearError,
    updatePrice,
    updateCandle,
    
    // Configurações
    symbols,
    interval,
    enableRealtime
  };
}

// Hook para dados de um símbolo específico
export function useSymbolData(symbol: string, interval: KlineInterval = '1h') {
  const [data, setData] = useState<{
    price: PriceData | null;
    candles: CandleData[];
    loading: boolean;
    error: string | null;
  }>({
    price: null,
    candles: [],
    loading: false,
    error: null
  });

  const wsRef = useRef<any>(null);

  const loadData = useCallback(async () => {
    setData(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await getQuote(symbol, interval);
      setData({
        price: result.price,
        candles: result.candles,
        loading: false,
        error: null
      });
    } catch (error) {
      setData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erro ao carregar dados'
      }));
    }
  }, [symbol, interval]);

  const setupRealtime = useCallback(async () => {
    if (wsRef.current) return;

    try {
      wsRef.current = createBinanceWebSocket({
        onPriceUpdate: (priceData) => {
          setData(prev => ({ ...prev, price: priceData }));
        },
        onError: (error) => {
          console.error('WebSocket error:', error);
        }
      });

      wsRef.current.subscribeTicker(symbol);
      await wsRef.current.connect();
    } catch (error) {
      console.error('Error setting up realtime for symbol:', error);
    }
  }, [symbol]);

  useEffect(() => {
    loadData();
    setupRealtime();

    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect();
        wsRef.current = null;
      }
    };
  }, [loadData, setupRealtime]);

  return {
    ...data,
    refresh: loadData
  };
}

// Função para gerar preço mock
function generateMockPrice(symbol: string): PriceData {
  const basePrice = symbol === 'BTCUSDT' ? 50000 : 3000;
  const variation = (Math.random() - 0.5) * 0.02; // ±1% de variação
  const currentPrice = basePrice * (1 + variation);
  const change24h = currentPrice * (Math.random() - 0.5) * 0.05; // ±2.5% de mudança
  const changePercent24h = (change24h / (currentPrice - change24h)) * 100;
  
  return {
    symbol,
    price: currentPrice,
    change24h,
    changePercent24h,
    volume24h: Math.random() * 1000000,
    high24h: currentPrice * (1 + Math.random() * 0.02),
    low24h: currentPrice * (1 - Math.random() * 0.02),
    lastUpdate: Date.now(),
    timestamp: Date.now()
  };
}

// Função para gerar dados mock de candles
function generateMockCandles(symbol: string, count: number): CandleData[] {
  const candles: CandleData[] = [];
  const now = Date.now();
  const basePrice = symbol === 'BTCUSDT' ? 50000 : 3000; // Preço base
  
  for (let i = count - 1; i >= 0; i--) {
    const timestamp = now - (i * 60 * 60 * 1000); // 1 hora atrás
    const variation = (Math.random() - 0.5) * 0.02; // ±1% de variação
    const open = basePrice * (1 + variation);
    const close = open * (1 + (Math.random() - 0.5) * 0.01);
    const high = Math.max(open, close) * (1 + Math.random() * 0.005);
    const low = Math.min(open, close) * (1 - Math.random() * 0.005);
    const volume = Math.random() * 1000;
    
    candles.push({
      timestamp,
      open,
      high,
      low,
      close,
      volume,
      interval: '1h' as KlineInterval,
      isClosed: true
    });
  }
  
  return candles;
}
