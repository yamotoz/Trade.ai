# 📊 Gráficos do Portfolio - Trade.ai

## Visão Geral

Os gráficos do portfolio foram completamente reformulados com **Highcharts** para proporcionar visualizações elegantes e interativas da evolução e distribuição dos investimentos.

## 🎯 Tipos de Gráficos Disponíveis

### 1. 📈 Gráfico de Linha (Chart)
- **Função**: Mostra a evolução do valor total do portfolio ao longo do tempo
- **Dados**: Simulação de 30 dias de evolução
- **Características**:
  - Linha suave com sombra
  - Cor dinâmica (verde para crescimento, vermelho para queda)
  - Tooltip com data e valor
  - Formatação em R$ brasileiro

### 2. 📊 Gráfico de Barras (Categories)
- **Função**: Exibe a distribuição do valor por categoria de ativos
- **Dados**: Valor e percentual de cada categoria
- **Características**:
  - Barras arredondadas com cores específicas
  - Labels de percentual nas barras
  - Tooltip com valor e percentual
  - Cores personalizadas por categoria

### 3. 🍩 Gráfico Donut (Donut)
- **Função**: Visualização circular da distribuição do portfolio
- **Dados**: Percentual e valor de cada categoria
- **Características**:
  - Centro vazio com total do portfolio
  - Labels com nome e percentual
  - Legenda interativa
  - Cores consistentes com o tema

## 🎨 Paleta de Cores

### Categorias de Ativos
```typescript
const categoryColors = {
  'Crypto': '#FFD700',      // Amarelo dourado
  'Stocks': '#4CAF50',      // Verde
  'Real Estate': '#9C27B0', // Roxo
  'Bonds': '#2196F3',       // Azul
  'Commodities': '#FF9800', // Laranja
  'Cash': '#607D8B',        // Cinza
  'Other': '#F44336'        // Vermelho
};
```

### Cores do Sistema
- **Primária**: `colors.primary[500]` (do tema)
- **Sucesso**: `#2ed573` (verde)
- **Perigo**: `#ff4757` (vermelho)
- **Aviso**: `#ffa500` (laranja)
- **Info**: `#4a9eff` (azul)

## 🚀 Como Usar

### Importar o Componente
```tsx
import { PortfolioChart } from '@/components/charts/PortfolioChart';
```

### Gráfico de Linha
```tsx
<PortfolioChart
  type="line"
  totalValue={calculateTotalPortfolio()}
  height={200}
/>
```

### Gráfico de Barras
```tsx
const categoryData = [
  {
    name: 'Crypto',
    value: 15000,
    percentage: 45.5,
    color: '#FFD700'
  },
  // ... outros dados
];

<PortfolioChart
  type="bar"
  categoryData={categoryData}
  height={200}
/>
```

### Gráfico Donut
```tsx
<PortfolioChart
  type="donut"
  categoryData={categoryData}
  totalValue={calculateTotalPortfolio()}
  height={200}
/>
```

## 📊 Estrutura de Dados

### PortfolioData (para gráfico de linha)
```typescript
interface PortfolioData {
  timestamp: number;  // Timestamp em milissegundos
  value: number;      // Valor do portfolio
}
```

### CategoryData (para gráficos de barras e donut)
```typescript
interface CategoryData {
  name: string;       // Nome da categoria
  value: number;      // Valor em R$
  percentage: number; // Percentual do total
  color: string;      // Cor da categoria
}
```

## 🔧 Funcionalidades

### Interatividade
- **Tooltips**: Informações detalhadas ao passar o mouse
- **Legendas**: Clique para mostrar/ocultar categorias (donut)
- **Responsivo**: Adapta-se ao tamanho da tela
- **Animações**: Transições suaves entre dados

### Formatação
- **Moeda**: Valores em R$ com formatação brasileira
- **Percentuais**: Com 1 casa decimal
- **Datas**: Formato brasileiro (DD/MM/AAAA)
- **Números**: Separadores de milhares

### Performance
- **Dados Mockados**: Geração automática para demonstração
- **Lazy Loading**: Carregamento sob demanda
- **Otimização**: Renderização eficiente via WebView

## 🎯 Casos de Uso

### 1. Análise de Performance
- Use o gráfico de linha para acompanhar a evolução
- Identifique tendências de crescimento ou queda
- Compare períodos diferentes

### 2. Diversificação
- Use o gráfico de barras para ver distribuição
- Identifique categorias super-representadas
- Planeje rebalanceamento

### 3. Visão Geral
- Use o gráfico donut para apresentação
- Mostre distribuição de forma intuitiva
- Destaque categorias principais

## 🔄 Integração com Dados Reais

### Substituir Dados Mockados
```tsx
// Exemplo com API real
const [portfolioHistory, setPortfolioHistory] = useState<PortfolioData[]>([]);

useEffect(() => {
  fetchPortfolioHistory().then(data => {
    setPortfolioHistory(data);
  });
}, []);

<PortfolioChart
  type="line"
  data={portfolioHistory} // Dados reais
  totalValue={currentTotal}
  height={200}
/>
```

### Atualização em Tempo Real
```tsx
// Simular atualizações
useEffect(() => {
  const interval = setInterval(() => {
    const newData = generateRealTimeUpdate();
    setPortfolioHistory(prev => [...prev, newData]);
  }, 5000);

  return () => clearInterval(interval);
}, []);
```

## 🐛 Solução de Problemas

### Gráfico não carrega
1. Verifique se o WebView está funcionando
2. Confirme se os dados estão no formato correto
3. Verifique os logs do console

### Dados não aparecem
1. Confirme se os dados não estão vazios
2. Verifique se os timestamps estão corretos
3. Teste com dados mockados primeiro

### Performance lenta
1. Reduza a quantidade de pontos de dados
2. Use `useMemo` para dados que não mudam
3. Considere paginação para históricos longos

## 🚀 Próximas Melhorias

1. **Indicadores Técnicos**: Médias móveis, RSI
2. **Comparação**: Benchmark vs portfolio
3. **Projeções**: Simulação de cenários
4. **Exportação**: PDF, PNG dos gráficos
5. **Alertas**: Notificações de mudanças significativas

## 📞 Suporte

Para dúvidas sobre os gráficos do portfolio:
- Consulte a documentação do Highcharts
- Verifique os exemplos no código
- Teste com dados mockados primeiro
