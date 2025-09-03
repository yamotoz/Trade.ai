// WebSocket para dados em tempo real da Binance
import { 
  BinanceTradeStream, 
  BinanceTickerStream, 
  BinanceKlineStream,
  KlineInterval,
  CandleData,
  PriceData
} from './binanceTypes';

const BINANCE_WS_BASE_URL = 'wss://stream.binance.com:9443/ws';

export interface WebSocketCallbacks {
  onPriceUpdate?: (data: PriceData) => void;
  onCandleUpdate?: (data: CandleData) => void;
  onTradeUpdate?: (data: any) => void;
  onError?: (error: Error) => void;
  onReconnect?: () => void;
}

class BinanceWebSocket {
  private ws: WebSocket | null = null;
  private subscriptions: Set<string> = new Set();
  private callbacks: WebSocketCallbacks = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private pingInterval: NodeJS.Timeout | null = null;
  private isConnecting = false;

  constructor(callbacks: WebSocketCallbacks = {}) {
    this.callbacks = callbacks;
  }

  // Conectar ao WebSocket
  private async connect(): Promise<void> {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;

    try {
      this.ws = new WebSocket(BINANCE_WS_BASE_URL);
      
      this.ws.onopen = () => {
        console.log('Binance WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.startPing();
        
        // Reinscrever em todas as streams
        this.resubscribeAll();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('Binance WebSocket closed:', event.code, event.reason);
        this.isConnecting = false;
        this.stopPing();
        
        if (event.code !== 1000) { // Não foi fechamento normal
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('Binance WebSocket error:', error);
        this.isConnecting = false;
        this.callbacks.onError?.(new Error('WebSocket connection error'));
      };

    } catch (error) {
      console.error('Failed to connect to Binance WebSocket:', error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  // Processar mensagens recebidas
  private handleMessage(data: any): void {
    if (data.e === 'ticker') {
      this.handleTickerUpdate(data);
    } else if (data.e === 'kline') {
      this.handleKlineUpdate(data);
    } else if (data.e === 'trade') {
      this.handleTradeUpdate(data);
    }
  }

  // Processar atualização de ticker
  private handleTickerUpdate(data: BinanceTickerStream): void {
    const priceData: PriceData = {
      symbol: data.s,
      price: parseFloat(data.c),
      change24h: parseFloat(data.p),
      changePercent24h: parseFloat(data.P),
      volume24h: parseFloat(data.v),
      high24h: parseFloat(data.h),
      low24h: parseFloat(data.l),
      lastUpdate: data.E
    };

    this.callbacks.onPriceUpdate?.(priceData);
  }

  // Processar atualização de kline
  private handleKlineUpdate(data: BinanceKlineStream): void {
    const kline = data.k;
    const candleData: CandleData = {
      timestamp: kline.t,
      open: parseFloat(kline.o),
      high: parseFloat(kline.h),
      low: parseFloat(kline.l),
      close: parseFloat(kline.c),
      volume: parseFloat(kline.v)
    };

    this.callbacks.onCandleUpdate?.(candleData);
  }

  // Processar atualização de trade
  private handleTradeUpdate(data: BinanceTradeStream): void {
    this.callbacks.onTradeUpdate?.(data);
  }

  // Inscrever em stream de ticker
  public subscribeTicker(symbol: string): void {
    const streamName = `${symbol.toLowerCase()}@ticker`;
    this.subscriptions.add(streamName);
    this.sendSubscriptionWithDelay(streamName, 200); // Delay de 200ms entre subscrições
  }

  // Inscrever em stream de kline
  public subscribeKlines(symbol: string, interval: KlineInterval): void {
    const streamName = `${symbol.toLowerCase()}@kline_${interval}`;
    this.subscriptions.add(streamName);
    this.sendSubscription(streamName);
  }

  // Inscrever em stream de trades
  public subscribeTrades(symbol: string): void {
    const streamName = `${symbol.toLowerCase()}@trade`;
    this.subscriptions.add(streamName);
    this.sendSubscription(streamName);
  }

  // Enviar subscrição
  private sendSubscription(streamName: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = {
        method: 'SUBSCRIBE',
        params: [streamName],
        id: Date.now()
      };
      this.ws.send(JSON.stringify(message));
      console.log('Subscribed to:', streamName);
    }
  }

  // Enviar subscrição com delay
  private sendSubscriptionWithDelay(streamName: string, delay: number = 100): void {
    setTimeout(() => {
      this.sendSubscription(streamName);
    }, delay);
  }

  // Cancelar subscrição
  public unsubscribe(streamName: string): void {
    this.subscriptions.delete(streamName);
    
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = {
        method: 'UNSUBSCRIBE',
        params: [streamName],
        id: Date.now()
      };
      this.ws.send(JSON.stringify(message));
      console.log('Unsubscribed from:', streamName);
    }
  }

  // Cancelar todas as subscrições
  public unsubscribeAll(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = {
        method: 'UNSUBSCRIBE',
        params: Array.from(this.subscriptions),
        id: Date.now()
      };
      this.ws.send(JSON.stringify(message));
    }
    
    this.subscriptions.clear();
  }

  // Reinscrever em todas as streams
  private resubscribeAll(): void {
    this.subscriptions.forEach(streamName => {
      this.sendSubscription(streamName);
    });
  }

  // Iniciar ping para manter conexão viva
  private startPing(): void {
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ method: 'PING' }));
      }
    }, 30000); // Ping a cada 30 segundos
  }

  // Parar ping
  private stopPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  // Agendar reconexão
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  // Conectar e inscrever
  public async connectAndSubscribe(): Promise<void> {
    await this.connect();
  }

  // Fechar conexão
  public close(): void {
    this.unsubscribeAll();
    this.stopPing();
    
    if (this.ws) {
      this.ws.close(1000, 'Normal closure');
      this.ws = null;
    }
  }

  // Verificar se está conectado
  public isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  // Obter estado da conexão
  public getConnectionState(): string {
    if (!this.ws) return 'CLOSED';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'CONNECTING';
      case WebSocket.OPEN: return 'OPEN';
      case WebSocket.CLOSING: return 'CLOSING';
      case WebSocket.CLOSED: return 'CLOSED';
      default: return 'UNKNOWN';
    }
  }
}

// Instância global do WebSocket
let globalWebSocket: BinanceWebSocket | null = null;

// Função para obter instância global
export function getBinanceWebSocket(callbacks?: WebSocketCallbacks): BinanceWebSocket {
  if (!globalWebSocket) {
    globalWebSocket = new BinanceWebSocket(callbacks);
  }
  
  if (callbacks) {
    globalWebSocket.callbacks = { ...globalWebSocket.callbacks, ...callbacks };
  }
  
  return globalWebSocket;
}

// Função para fechar conexão global
export function closeBinanceWebSocket(): void {
  if (globalWebSocket) {
    globalWebSocket.close();
    globalWebSocket = null;
  }
}

// Funções de conveniência
export async function subscribeToPriceUpdates(
  symbol: string, 
  onPriceUpdate: (data: PriceData) => void
): Promise<BinanceWebSocket> {
  const ws = getBinanceWebSocket({ onPriceUpdate });
  await ws.connectAndSubscribe();
  ws.subscribeTicker(symbol);
  return ws;
}

export async function subscribeToCandleUpdates(
  symbol: string, 
  interval: KlineInterval,
  onCandleUpdate: (data: CandleData) => void
): Promise<BinanceWebSocket> {
  const ws = getBinanceWebSocket({ onCandleUpdate });
  await ws.connectAndSubscribe();
  ws.subscribeKlines(symbol, interval);
  return ws;
}

export async function subscribeToMultipleUpdates(
  symbols: string[],
  interval: KlineInterval,
  callbacks: WebSocketCallbacks
): Promise<BinanceWebSocket> {
  const ws = getBinanceWebSocket(callbacks);
  await ws.connectAndSubscribe();
  
  symbols.forEach(symbol => {
    ws.subscribeTicker(symbol);
    ws.subscribeKlines(symbol, interval);
  });
  
  return ws;
}
