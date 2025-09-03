# 📊 Gráficos Highcharts - Trade.ai

## Visão Geral

Os gráficos do Trade.ai foram completamente reformulados usando **Highcharts StockChart** para proporcionar uma experiência visual mais elegante e robusta. Os gráficos agora incluem:

- **Candlestick Charts** (velas japonesas)
- **Volume Charts** (gráficos de volume)
- **Tema escuro** personalizado (azul marinho e preto)
- **Dados em tempo real** (simulados)
- **Interatividade** completa

## 🏗️ Estrutura dos Arquivos

```
components/charts/
├── HighchartsChart.tsx          # Componente principal do gráfico
├── TradingViewChart.tsx         # Componente legado (placeholder)
└── ChartPreview.tsx             # Componente legado (placeholder)

lib/
└── mock-chart-data.ts           # Dados mockados e funções utilitárias

assets/charts/
└── highcharts-template.html     # Template HTML do Highcharts

docs/
└── CHARTS_README.md             # Esta documentação
```

## 🚀 Como Usar

### 1. Importar o Componente

```tsx
import { HighchartsChart } from '@/components/charts/HighchartsChart';
import { getMockChartData } from '@/lib/mock-chart-data';
```

### 2. Usar o Componente

```tsx
<HighchartsChart
  symbol="BTC"
  title="Bitcoin"
  height={200}
  data={getMockChartData('BTC')?.candles}
  volumeData={getMockChartData('BTC')?.volume}
  interval="1d"
  onChartReady={() => console.log('Gráfico carregado!')}
/>
```

### 3. Propriedades Disponíveis

| Propriedade | Tipo | Obrigatório | Descrição |
|-------------|------|-------------|-----------|
| `symbol` | `string` | ✅ | Símbolo do ativo (ex: 'BTC', 'PETR4') |
| `title` | `string` | ✅ | Título do gráfico |
| `height` | `number` | ❌ | Altura do gráfico (padrão: 300) |
| `data` | `CandleData[]` | ❌ | Dados de candlestick |
| `volumeData` | `VolumeData[]` | ❌ | Dados de volume |
| `interval` | `string` | ❌ | Intervalo de tempo (padrão: '1d') |
| `onChartReady` | `function` | ❌ | Callback quando gráfico carrega |

## 📊 Tipos de Dados

### CandleData
```tsx
interface CandleData {
  timestamp: number;  // Timestamp em milissegundos
  open: number;       // Preço de abertura
  high: number;       // Preço máximo
  low: number;        // Preço mínimo
  close: number;      // Preço de fechamento
}
```

### VolumeData
```tsx
interface VolumeData {
  timestamp: number;  // Timestamp em milissegundos
  volume: number;     // Volume negociado
}
```

## 🎨 Características Visuais

### Tema Escuro
- **Fundo**: Gradiente azul marinho (#0a0a0a → #1a1a2e)
- **Velas de alta**: Verde (#2ed573)
- **Velas de baixa**: Vermelho (#ff4757)
- **Volume**: Azul (#4a9eff)
- **Texto**: Branco e cinza

### Interatividade
- **Tooltip**: Informações detalhadas ao passar o mouse
- **Zoom**: Zoom automático nos dados
- **Responsivo**: Adapta-se ao tamanho da tela

## 🔧 Funções Utilitárias

### getMockChartData(symbol: string)
Retorna dados mockados para um símbolo específico.

```tsx
const btcData = getMockChartData('BTC');
console.log(btcData?.currentPrice); // Preço atual
console.log(btcData?.changePercent24h); // Variação 24h
```

### formatPrice(price: number, currency?: string)
Formata preços para exibição.

```tsx
formatPrice(1234.56); // "R$ 1.234,56"
formatPrice(1234.56, '$'); // "$ 1.234,56"
```

### formatPercentage(value: number)
Formata percentuais para exibição.

```tsx
formatPercentage(5.67); // "+5,67%"
formatPercentage(-2.34); // "-2,34%"
```

### getChangeColor(value: number)
Retorna cor baseada na variação.

```tsx
getChangeColor(5.67); // "#2ed573" (verde)
getChangeColor(-2.34); // "#ff4757" (vermelho)
```

## 📱 Símbolos Disponíveis

Os seguintes símbolos têm dados mockados pré-gerados:

- **BTC** - Bitcoin
- **PETR4** - Petrobras PN
- **VALE3** - Vale ON
- **ITUB4** - Itaú PN
- **BBDC4** - Bradesco PN
- **ABEV3** - Ambev ON
- **WEGE3** - WEG ON
- **RENT3** - Localiza ON
- **LREN3** - Lojas Renner ON
- **MGLU3** - Magazine Luiza ON
- **B3SA3** - B3 ON
- **SUZB3** - Suzano ON

## 🔄 Integração com APIs Reais

Para integrar com dados reais de APIs, substitua os dados mockados:

```tsx
// Exemplo com API real
const [chartData, setChartData] = useState<CandleData[]>([]);

useEffect(() => {
  fetchRealTimeData('BTC').then(data => {
    setChartData(data);
  });
}, []);

<HighchartsChart
  symbol="BTC"
  title="Bitcoin"
  data={chartData} // Dados reais em vez de mockados
  volumeData={volumeData}
/>
```

## 🐛 Solução de Problemas

### Gráfico não carrega
1. Verifique se o `react-native-webview` está instalado
2. Confirme se o HTML está sendo carregado corretamente
3. Verifique os logs do console para erros JavaScript

### Dados não aparecem
1. Confirme se os dados estão no formato correto
2. Verifique se o timestamp está em milissegundos
3. Teste com dados mockados primeiro

### Performance lenta
1. Reduza a quantidade de dados históricos
2. Use `useMemo` para dados que não mudam frequentemente
3. Considere paginação para grandes datasets

## 🚀 Próximos Passos

1. **Integração com APIs reais** (Alpha Vantage, Yahoo Finance, etc.)
2. **Indicadores técnicos** (RSI, MACD, Bollinger Bands)
3. **Múltiplos timeframes** (1m, 5m, 15m, 1h, 4h, 1d)
4. **Alertas de preço** integrados aos gráficos
5. **Análise técnica** automatizada

## 📞 Suporte

Para dúvidas ou problemas com os gráficos, consulte:
- [Documentação do Highcharts](https://www.highcharts.com/docs)
- [React Native WebView](https://github.com/react-native-webview/react-native-webview)
- Issues do projeto no GitHub
