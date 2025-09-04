r// Sistema de Rate Limiting baseado na documentação da Binance
interface RateLimit {
  rateLimitType: 'REQUEST_WEIGHT' | 'ORDERS';
  interval: 'SECOND' | 'MINUTE' | 'HOUR' | 'DAY';
  intervalNum: number;
  limit: number;
  count: number;
}

class RateLimiter {
  private requestCounts: Map<string, number> = new Map();
  private lastReset: Map<string, number> = new Map();
  private blockedUntil: number = 0;

  // Limites baseados na documentação da Binance
  private readonly limits: RateLimit[] = [
    {
      rateLimitType: 'REQUEST_WEIGHT',
      interval: 'MINUTE',
      intervalNum: 1,
      limit: 6000, // Limite padrão da Binance
      count: 0
    },
    {
      rateLimitType: 'REQUEST_WEIGHT',
      interval: 'SECOND',
      intervalNum: 10,
      limit: 100, // Limite conservador para evitar problemas
      count: 0
    }
  ];

  // Verificar se pode fazer uma requisição
  canMakeRequest(weight: number = 1): boolean {
    const now = Date.now();
    
    // Verificar se está bloqueado
    if (now < this.blockedUntil) {
      console.warn(`Rate limit: bloqueado até ${new Date(this.blockedUntil).toISOString()}`);
      return false;
    }

    // Verificar limites
    for (const limit of this.limits) {
      const key = `${limit.rateLimitType}_${limit.interval}_${limit.intervalNum}`;
      const currentCount = this.requestCounts.get(key) || 0;
      const lastResetTime = this.lastReset.get(key) || 0;
      
      // Verificar se precisa resetar o contador
      if (this.shouldResetCounter(now, lastResetTime, limit.interval, limit.intervalNum)) {
        this.requestCounts.set(key, 0);
        this.lastReset.set(key, now);
      }

      // Verificar se excedeu o limite
      if (currentCount + weight > limit.limit) {
        console.warn(`Rate limit excedido: ${limit.rateLimitType} ${limit.interval} ${limit.intervalNum}`);
        return false;
      }
    }

    return true;
  }

  // Registrar uma requisição
  recordRequest(weight: number = 1): void {
    const now = Date.now();
    
    for (const limit of this.limits) {
      const key = `${limit.rateLimitType}_${limit.interval}_${limit.intervalNum}`;
      const currentCount = this.requestCounts.get(key) || 0;
      this.requestCounts.set(key, currentCount + weight);
      this.lastReset.set(key, now);
    }
  }

  // Bloquear por um período
  blockFor(ms: number): void {
    this.blockedUntil = Date.now() + ms;
    console.warn(`Rate limiter bloqueado por ${ms}ms`);
  }

  // Verificar se deve resetar o contador
  private shouldResetCounter(now: number, lastReset: number, interval: string, intervalNum: number): boolean {
    const intervalMs = this.getIntervalMs(interval, intervalNum);
    return (now - lastReset) >= intervalMs;
  }

  // Converter intervalo para milissegundos
  private getIntervalMs(interval: string, intervalNum: number): number {
    const baseMs = {
      'SECOND': 1000,
      'MINUTE': 60 * 1000,
      'HOUR': 60 * 60 * 1000,
      'DAY': 24 * 60 * 60 * 1000
    };
    
    return baseMs[interval as keyof typeof baseMs] * intervalNum;
  }

  // Obter status dos limites
  getStatus(): RateLimit[] {
    return this.limits.map(limit => ({
      ...limit,
      count: this.requestCounts.get(`${limit.rateLimitType}_${limit.interval}_${limit.intervalNum}`) || 0
    }));
  }

  // Limpar contadores
  clear(): void {
    this.requestCounts.clear();
    this.lastReset.clear();
    this.blockedUntil = 0;
  }
}

// Instância global do rate limiter
export const rateLimiter = new RateLimiter();

// Função para fazer requisições com rate limiting
export async function makeRateLimitedRequest<T>(
  requestFn: () => Promise<T>,
  weight: number = 1,
  maxRetries: number = 3
): Promise<T> {
  let retries = 0;
  
  while (retries < maxRetries) {
    if (rateLimiter.canMakeRequest(weight)) {
      try {
        rateLimiter.recordRequest(weight);
        const result = await requestFn();
        return result;
      } catch (error: any) {
        // Verificar se é erro de rate limit (429)
        if (error.status === 429 || error.status === 418) {
          const retryAfter = error.retryAfter || 60000; // 1 minuto padrão
          rateLimiter.blockFor(retryAfter);
          console.warn(`Rate limit error: bloqueado por ${retryAfter}ms`);
          
          // Aguardar antes de tentar novamente
          await new Promise(resolve => setTimeout(resolve, Math.min(retryAfter, 30000)));
          retries++;
          continue;
        }
        
        throw error;
      }
    } else {
      // Aguardar um pouco antes de tentar novamente
      await new Promise(resolve => setTimeout(resolve, 1000));
      retries++;
    }
  }
  
  throw new Error('Máximo de tentativas de rate limiting atingido');
}
