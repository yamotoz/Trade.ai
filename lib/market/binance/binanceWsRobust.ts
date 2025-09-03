// WebSocket robusto para Binance baseado na documentação oficial
import { WebSocketCallbacks, PriceData, CandleData, KlineInterval } from './binanceTypes';

interface BinanceWebSocketMessage {
  method?: string;
  params?: string[];
  id?: number;
  result?: any;
  stream?: string;
  data?: any;
}

interface BinanceTickerData {
  e: string; // Event type
  s: string; // Symbol
  c: string; // Close price
  o: string; // Open price
  h: string; // High price
  l: string; // Low price
  v: string; // Volume
  q: string; // Quote volume
  P: string; // Price change percent
  p: string; // Price change
  O: number; // Open time
  C: number; // Close time
  F: number; // First trade ID
  L: number; // Last trade ID
  n: number; // Trade count
  x: string; // Ignore
  Q: string; // Ignore
  B: string; // Ignore
  a: string; // Ignore
  A: string; // Ignore
  b: string; // Ignore
}

interface BinanceKlineData {
  e: string; // Event type
  E: number; // Event time
  s: string; // Symbol
  k: {
    t: number; // Kline start time
    T: number; // Kline close time
    s: string; // Symbol
    i: string; // Interval
    f: number; // First trade ID
    L: number; // Last trade ID
    o: string; // Open price
    c: string; // Close price
    h: string; // High price
    l: string; // Low price
    v: string; // Volume
    n: number; // Number of trades
    x: boolean; // Is this kline closed?
    q: string; // Quote asset volume
    V: string; // Taker buy base asset volume
    Q: string; // Taker buy quote asset volume
    B: string; // Ignore
  };
}

export class BinanceWebSocketRobust {
  private ws: WebSocket | null = null;
  private subscriptions: Set<string> = new Set();
  private callbacks: WebSocketCallbacks;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private pingInterval: NodeJS.Timeout | null = null;
  private pongTimeout: NodeJS.Timeout | null = null;
  private isConnected = false;
  private isConnecting = false;
  private static instance: BinanceWebSocketRobust | null = null;

  constructor(callbacks: WebSocketCallbacks) {
    this.callbacks = callbacks;
  }

  // Singleton pattern para evitar múltiplas instâncias
  static getInstance(callbacks: WebSocketCallbacks): BinanceWebSocketRobust {
    if (!BinanceWebSocketRobust.instance) {
      BinanceWebSocketRobust.instance = new BinanceWebSocketRobust(callbacks);
    }
    return BinanceWebSocketRobust.instance;
  }

  // Conectar ao WebSocket
  async connect(): Promise<void> {
    if (this.isConnected || this.isConnecting) return;

    this.isConnecting = true;

    try {
      // Usar combined stream para múltiplos streams em uma conexão
      const streams = Array.from(this.subscriptions);
      const url = streams.length > 0 
        ? `wss://stream.binance.com:9443/stream?streams=${streams.join('/')}`
        : 'wss://stream.binance.com:9443/ws';

      console.log('🔌 Conectando ao WebSocket Binance:', url);
      
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('✅ WebSocket Binance conectado');
        this.isConnected = true;
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.startPing();
        this.callbacks.onReconnect?.();
      };

      this.ws.onmessage = (event) => {
        try {
          const message: BinanceWebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('❌ Erro ao processar mensagem WebSocket:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('⚠️ WebSocket Binance desconectado:', event.code, event.reason);
        this.isConnected = false;
        this.isConnecting = false;
        this.stopPing();
        this.handleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('❌ Erro WebSocket Binance:', error);
        this.callbacks.onError?.(error);
      };

    } catch (error) {
      console.error('❌ Erro ao conectar WebSocket:', error);
      this.isConnecting = false;
      this.handleReconnect();
    }
  }

  // Processar mensagens recebidas
  private handleMessage(message: BinanceWebSocketMessage): void {
    // Responder a pings do servidor
    if (message.ping) {
      this.sendPong(message.ping);
      return;
    }

    // Processar dados de stream
    if (message.stream && message.data) {
      this.processStreamData(message.stream, message.data);
      return;
    }

    // Processar respostas de métodos
    if (message.result !== undefined) {
      console.log('📨 Resposta do servidor:', message);
      return;
    }

    // Processar dados diretos (para streams individuais)
    if (message.e) {
      this.processStreamData('', message);
    }
  }

  // Processar dados de stream específicos
  private processStreamData(stream: string, data: any): void {
    if (data.e === '24hrTicker') {
      this.handleTickerUpdate(data as BinanceTickerData);
    } else if (data.e === 'kline') {
      this.handleKlineUpdate(data as BinanceKlineData);
    }
  }

  // Processar atualização de ticker
  private handleTickerUpdate(data: BinanceTickerData): void {
    const priceData: PriceData = {
      symbol: data.s,
      price: parseFloat(data.c),
      change24h: parseFloat(data.p),
      changePercent24h: parseFloat(data.P),
      volume: parseFloat(data.v),
      high24h: parseFloat(data.h),
      low24h: parseFloat(data.l),
      open24h: parseFloat(data.o),
      timestamp: data.C
    };

    this.callbacks.onPriceUpdate?.(priceData);
  }

  // Processar atualização de kline
  private handleKlineUpdate(data: BinanceKlineData): void {
    const kline = data.k;
    const candleData: CandleData = {
      timestamp: kline.t,
      open: parseFloat(kline.o),
      high: parseFloat(kline.h),
      low: parseFloat(kline.l),
      close: parseFloat(kline.c),
      volume: parseFloat(kline.v),
      interval: kline.i as KlineInterval,
      isClosed: kline.x
    };

    this.callbacks.onCandleUpdate?.(candleData);
  }

  // Enviar pong em resposta ao ping
  private sendPong(pingId?: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ pong: pingId }));
    }
  }

  // Iniciar ping para manter conexão viva
  private startPing(): void {
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        // Enviar ping vazio
        this.ws.send(JSON.stringify({ method: 'PING', id: Date.now() }));
        
        // Configurar timeout para pong
        this.pongTimeout = setTimeout(() => {
          console.log('⚠️ Timeout de pong, reconectando...');
          this.disconnect();
        }, 10000); // 10 segundos para responder
      }
    }, 30000); // Ping a cada 30 segundos
  }

  // Parar ping
  private stopPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    if (this.pongTimeout) {
      clearTimeout(this.pongTimeout);
      this.pongTimeout = null;
    }
  }

  // Inscrever em stream de ticker
  subscribeTicker(symbol: string): void {
    const streamName = `${symbol.toLowerCase()}@ticker`;
    this.subscriptions.add(streamName);
    console.log('📡 Inscrito em ticker:', streamName);
    
    if (this.isConnected) {
      this.sendSubscription([streamName]);
    }
  }

  // Inscrever em stream de kline
  subscribeKlines(symbol: string, interval: KlineInterval): void {
    const streamName = `${symbol.toLowerCase()}@kline_${interval}`;
    this.subscriptions.add(streamName);
    console.log('📡 Inscrito em kline:', streamName);
    
    if (this.isConnected) {
      this.sendSubscription([streamName]);
    }
  }

  // Enviar subscrição
  private sendSubscription(streams: string[]): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = {
        method: 'SUBSCRIBE',
        params: streams,
        id: Date.now()
      };
      this.ws.send(JSON.stringify(message));
      console.log('📤 Enviando subscrição:', streams);
    }
  }

  // Cancelar subscrição
  unsubscribe(streamName: string): void {
    this.subscriptions.delete(streamName);
    
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = {
        method: 'UNSUBSCRIBE',
        params: [streamName],
        id: Date.now()
      };
      this.ws.send(JSON.stringify(message));
      console.log('📤 Cancelando subscrição:', streamName);
    }
  }

  // Cancelar todas as subscrições
  unsubscribeAll(): void {
    this.subscriptions.clear();
    
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = {
        method: 'UNSUBSCRIBE',
        params: Array.from(this.subscriptions),
        id: Date.now()
      };
      this.ws.send(JSON.stringify(message));
    }
  }

  // Desconectar
  disconnect(): void {
    this.stopPing();
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.isConnected = false;
    this.isConnecting = false;
  }

  // Reconectar automaticamente
  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Máximo de tentativas de reconexão atingido');
      this.callbacks.onError?.(new Error('Máximo de tentativas de reconexão atingido'));
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Backoff exponencial
    
    console.log(`🔄 Tentando reconectar em ${delay}ms (tentativa ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  // Verificar se está conectado
  isWebSocketConnected(): boolean {
    return this.isConnected && this.ws?.readyState === WebSocket.OPEN;
  }

  // Obter lista de subscrições
  getSubscriptions(): string[] {
    return Array.from(this.subscriptions);
  }

  // Limpar instância singleton
  static clearInstance(): void {
    if (BinanceWebSocketRobust.instance) {
      BinanceWebSocketRobust.instance.disconnect();
      BinanceWebSocketRobust.instance = null;
    }
  }
}

// Função para criar instância do WebSocket (singleton)
export function createBinanceWebSocket(callbacks: WebSocketCallbacks): BinanceWebSocketRobust {
  return BinanceWebSocketRobust.getInstance(callbacks);
}

// Função para conectar e inscrever em múltiplos streams
export async function connectAndSubscribe(
  symbols: string[],
  interval: KlineInterval,
  callbacks: WebSocketCallbacks
): Promise<BinanceWebSocketRobust> {
  const ws = createBinanceWebSocket(callbacks);
  
  // Inscrever em streams
  symbols.forEach(symbol => {
    ws.subscribeTicker(symbol);
    ws.subscribeKlines(symbol, interval);
  });
  
  // Conectar
  await ws.connect();
  
  return ws;
}
