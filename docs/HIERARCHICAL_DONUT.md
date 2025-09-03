# 🍩 Gráfico Donut Hierárquico - Trade.ai

## Visão Geral

O gráfico donut hierárquico do portfolio foi implementado baseado no exemplo do Highcharts, proporcionando uma visualização em duas camadas: **categorias** (anel interno) e **ativos específicos** (anel externo).

## 🎯 Estrutura do Gráfico

### **Anel Interno (45% do tamanho)**
- **Função**: Mostra a distribuição por categoria de ativos
- **Dados**: Crypto, Stocks, Real Estate, Bonds, Commodities, Cash, Other
- **Características**: 
  - Labels centralizados
  - Cores principais por categoria
  - Percentual de cada categoria

### **Anel Externo (80% do tamanho, 60% interno)**
- **Função**: Mostra ativos específicos dentro de cada categoria
- **Dados**: Ativos individuais com drilldown
- **Características**:
  - Cores com variação de brilho
  - Labels externos com percentual
  - Filtro para mostrar apenas ativos > 2%

## 📊 Dados de Drilldown

### **Crypto**
- BTC (45.2%), ETH (28.7%), ADA (12.1%), DOT (8.3%), LINK (5.7%)

### **Stocks**
- PETR4 (35.8%), VALE3 (22.4%), ITUB4 (18.9%), BBDC4 (12.7%), ABEV3 (10.2%)

### **Real Estate**
- HGLG11 (40.1%), XPML11 (28.3%), VISC11 (18.7%), HGRU11 (12.9%)

### **Bonds**
- Tesouro IPCA+ (42.5%), Tesouro Selic (31.2%), CDB (15.8%), LCI (10.5%)

### **Commodities**
- Ouro (38.9%), Prata (25.4%), Petróleo (21.3%), Soja (14.4%)

### **Cash**
- Poupança (65.2%), CDB Liquidez (34.8%)

### **Other**
- Fundos (45.6%), ETFs (32.1%), REITs (22.3%)

## 🎨 Características Visuais

### **Cores**
- **Categorias**: Cores principais definidas no sistema
- **Ativos**: Variação de brilho baseada na posição na lista
- **Fórmula de Brilho**: `brightness = 0.2 - (index / total) / 5`

### **Labels**
- **Anel Interno**: Nome da categoria + percentual
- **Anel Externo**: Nome do ativo + percentual (apenas > 2%)
- **Filtro Responsivo**: Em telas < 400px, mostra apenas ativos > 5%

### **Tooltips**
- **Informações**: Nome, valor em R$, percentual
- **Formatação**: Brasileira (R$ e vírgulas)
- **Estilo**: Fundo escuro com borda azul

## 🔧 Funcionalidades Técnicas

### **Responsividade**
```javascript
responsive: {
    rules: [{
        condition: {
            maxWidth: 400
        },
        chartOptions: {
            series: [{
            }, {
                id: 'assets',
                dataLabels: {
                    distance: 10,
                    format: '{point.name}',
                    filter: {
                        property: 'custom.percentage',
                        operator: '>',
                        value: 5
                    }
                }
            }]
        }
    }]
}
```

### **Interatividade**
- **Seleção**: Clique para selecionar segmentos
- **Cursor**: Pointer para indicar interatividade
- **Tooltips**: Informações detalhadas ao passar o mouse

### **Filtros de Labels**
- **Desktop**: Mostra ativos com > 2% do portfolio
- **Mobile**: Mostra ativos com > 5% do portfolio
- **Otimização**: Evita sobreposição de texto

## 📱 Como Usar

### **1. Acessar o Portfolio**
- Toque no ícone da carteira na home
- Selecione a aba "Donut"

### **2. Visualizar Categorias**
- **Anel Interno**: Veja a distribuição por categoria
- **Cores**: Cada categoria tem uma cor específica
- **Percentuais**: Valores centralizados no anel

### **3. Explorar Ativos**
- **Anel Externo**: Veja ativos específicos
- **Drilldown**: Ativos agrupados por categoria
- **Variação de Cor**: Tons mais claros para ativos menores

### **4. Interagir**
- **Clique**: Selecione segmentos
- **Hover**: Veja tooltips com informações detalhadas
- **Responsivo**: Adapta-se ao tamanho da tela

## 🎯 Casos de Uso

### **1. Análise de Diversificação**
- Verifique se há concentração em uma categoria
- Identifique categorias sub-representadas
- Planeje rebalanceamento

### **2. Análise de Ativos**
- Veja quais ativos dominam cada categoria
- Identifique oportunidades de diversificação
- Monitore concentração de risco

### **3. Apresentação**
- Use para mostrar distribuição do portfolio
- Ideal para relatórios e apresentações
- Visualização intuitiva e profissional

## 🔄 Integração com Dados Reais

### **Substituir Dados Mockados**
```typescript
// Exemplo com dados reais
const realDrilldownData = {
    'Crypto': {
        categories: userCryptoAssets.map(asset => asset.symbol),
        data: userCryptoAssets.map(asset => asset.percentage)
    },
    // ... outras categorias
};
```

### **Atualização Dinâmica**
```typescript
// Atualizar quando portfolio mudar
useEffect(() => {
    if (portfolioData) {
        updateChartData();
    }
}, [portfolioData]);
```

## 🐛 Solução de Problemas

### **Gráfico não carrega**
1. Verifique se o WebView está funcionando
2. Confirme se os dados não estão vazios
3. Verifique os logs do console

### **Labels sobrepostos**
1. Ajuste os filtros de percentual mínimo
2. Reduza o tamanho da fonte
3. Use configurações responsivas

### **Performance lenta**
1. Reduza a quantidade de ativos mostrados
2. Use filtros mais restritivos
3. Otimize os dados de drilldown

## 🚀 Próximas Melhorias

1. **Drilldown Interativo**: Clique para expandir categorias
2. **Animações**: Transições suaves entre estados
3. **Exportação**: PNG/PDF do gráfico
4. **Comparação**: Múltiplos períodos
5. **Alertas**: Notificações de mudanças significativas

## 📞 Suporte

Para dúvidas sobre o gráfico donut hierárquico:
- Consulte a documentação do Highcharts
- Verifique os exemplos no código
- Teste com dados mockados primeiro
