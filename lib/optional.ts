// Implementação do padrão Optional para lidar com valores undefined/null
export class Optional<T> {
  private constructor(private value: T | null | undefined) {}

  /**
   * Cria um Optional com um valor que pode ser null ou undefined
   */
  static of<T>(value: T | null | undefined): Optional<T> {
    return new Optional(value);
  }

  /**
   * Cria um Optional vazio
   */
  static empty<T>(): Optional<T> {
    return new Optional<T>(null);
  }

  /**
   * Verifica se o valor não existe no objeto
   */
  isEmpty(): boolean {
    return this.value === null || this.value === undefined;
  }

  /**
   * Verifica se o valor existe no objeto
   */
  isPresent(): boolean {
    return !this.isEmpty();
  }

  /**
   * Recebe uma função e passa o valor para que ela use ele caso ele exista
   */
  ifPresent(use: (value: T) => void): void {
    if (this.isPresent()) {
      use(this.value as T);
    }
  }

  /**
   * Se o valor existir retorna ele, caso contrário retorna o valor passado pelo parâmetro
   */
  orElse(defaultValue: T): T {
    return this.isPresent() ? (this.value as T) : defaultValue;
  }

  /**
   * Se o valor existir retorna ele, caso contrário executa a função e retorna seu resultado
   */
  orElseGet(supplier: () => T): T {
    return this.isPresent() ? (this.value as T) : supplier();
  }

  /**
   * Se o valor existir retorna ele, caso contrário lança um erro
   */
  orElseThrow(errorSupplier?: () => Error): T {
    if (this.isPresent()) {
      return this.value as T;
    }
    
    const error = errorSupplier ? errorSupplier() : new Error('Value is not present');
    throw error;
  }

  /**
   * Transforma o valor se ele existir
   */
  map<U>(mapper: (value: T) => U): Optional<U> {
    if (this.isPresent()) {
      try {
        return Optional.of(mapper(this.value as T));
      } catch (error) {
        return Optional.empty<U>();
      }
    }
    return Optional.empty<U>();
  }

  /**
   * Filtra o valor se ele existir
   */
  filter(predicate: (value: T) => boolean): Optional<T> {
    if (this.isPresent() && predicate(this.value as T)) {
      return this;
    }
    return Optional.empty<T>();
  }

  /**
   * Pega o valor encapsulado ele existindo ou não
   */
  get(): T | null | undefined {
    return this.value;
  }

  /**
   * Converte para string
   */
  toString(): string {
    return this.isPresent() ? `Optional[${this.value}]` : 'Optional.empty';
  }
}

// Funções utilitárias para uso comum
export function safeGet<T, K extends keyof T>(obj: T | null | undefined, key: K): Optional<T[K]> {
  return Optional.of(obj?.[key]);
}

export function safeCall<T, R>(fn: (() => R) | null | undefined, ...args: any[]): Optional<R> {
  if (fn && typeof fn === 'function') {
    try {
      return Optional.of(fn.apply(null, args));
    } catch (error) {
      return Optional.empty<R>();
    }
  }
  return Optional.empty<R>();
}

export function safeMapGet<K, V>(map: Map<K, V> | null | undefined, key: K): Optional<V> {
  if (map && map instanceof Map) {
    return Optional.of(map.get(key));
  }
  return Optional.empty<V>();
}
