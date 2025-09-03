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
const DEFAULT_CACHE_TIMEOUT = 5 * 60 * 1000; // 5 minutos

export function useMarketData(options: UseMarketDataOptions = {}) {
  const {
    symbols = POPULAR_SYMBOLS.slice(0, 3), // Reduzido para 3 símbolos para evitar rate limiting
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

  // Função segura para atualizar estado
  const safeSetState = useCallback((updater: (prev: MarketDataState) => MarketDataState) => {
    setState(prev => {
      try {
        return updater(prev);
      } catch (error) {
        console.error('Error updating market data state:', error);
        return prev;
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
            prices: new Map(data.prices),
            candles: new Map(data.candles),
            lastUpdate: timestamp
          }));
          return true;
        }
      }
    } catch (error) {
      console.error('Error loading from cache:', error);
    }
    return false;
  }, [cacheTimeout]);

  // Salvar dados no cache
  const saveToCache = useCallback(async (prices: Map<string, PriceData>, candles: Map<string, CandleData[]>) => {
    try {
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

  // Carregar dados via REST
  const loadMarketData = useCallback(async (forceRefresh = false) => {
    if (state.loading && !forceRefresh) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Tentar carregar do cache primeiro
      if (!forceRefresh) {
        const fromCache = await loadFromCache();
        if (fromCache) {
          setState(prev => ({ ...prev, loading: false }));
          return;
        }
      }

      // Carregar dados da API
      const data = await getMultipleQuotes(symbols, interval);
      
      const prices = new Map<string, PriceData>();
      const candles = new Map<string, CandleData[]>();

      data.forEach((value, symbol) => {
        prices.set(symbol, value.price);
        candles.set(symbol, value.candles);
      });

      setState(prev => ({
        ...prev,
        prices,
        candles,
        loading: false,
        error: null,
        lastUpdate: Date.now()
      }));

      // Salvar no cache
      await saveToCache(prices, candles);

    } catch (error) {
      console.error('Error loading market data:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erro ao carregar dados'
      }));
    }
  }, [symbols, interval, state.loading, loadFromCache, saveToCache]);

  // Atualizar preço específico
  const updatePrice = useCallback((symbol: string, priceData: PriceData) => {
    safeSetState(prev => {
      // Garantir que prev sempre tenha as propriedades necessárias
      const safePrev = {
        prices: prev.prices || new Map(),
        candles: prev.candles || new Map(),
        loading: prev.loading || false,
        error: prev.error || null,
        lastUpdate: prev.lastUpdate || 0
      };
      
      const newPrices = new Map(safePrev.prices);
      newPrices.set(symbol, priceData);
      
      // Salvar no cache
      saveToCache(newPrices, safePrev.candles);
      
      return {
        ...safePrev,
        prices: newPrices,
        lastUpdate: Date.now()
      };
    });
  }, [saveToCache, safeSetState]);

  // Atualizar candle específico
  const updateCandle = useCallback((symbol: string, candleData: CandleData) => {
    safeSetState(prev => {
      // Garantir que prev sempre tenha as propriedades necessárias
      const safePrev = {
        prices: prev.prices || new Map(),
        candles: prev.candles || new Map(),
        loading: prev.loading || false,
        error: prev.error || null,
        lastUpdate: prev.lastUpdate || 0
      };
      
      const newCandles = new Map(safePrev.candles);
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
      saveToCache(safePrev.prices, newCandles);
      
      return {
        ...safePrev,
        candles: newCandles,
        lastUpdate: Date.now()
      };
    });
  }, [saveToCache, safeSetState]);

  // Configurar WebSocket para dados em tempo real
  const setupWebSocket = useCallback(async () => {
    if (!enableRealtime || wsRef.current || isConnectingRef.current) {
      console.log('WebSocket já existe, conectando ou realtime desabilitado');
      return;
    }

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
    const pollingInterval = enableRealtime ? cacheTimeout : 30000; // 30s se WebSocket falhar
    
    cacheTimeoutRef.current = setInterval(() => {
      loadMarketData(true);
    }, pollingInterval);
  }, [loadMarketData, cacheTimeout, enableRealtime]);

  // Inicializar
  useEffect(() => {
    loadMarketData();
    setupPolling();

    return () => {
      if (cacheTimeoutRef.current) {
        clearInterval(cacheTimeoutRef.current);
      }
    };
  }, [loadMarketData, setupPolling]);

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
