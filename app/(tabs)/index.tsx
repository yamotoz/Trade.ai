import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TouchableWithoutFeedback, StyleSheet, Modal, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { HighchartsChart } from '@/components/charts/HighchartsChart';
import { PortfolioChart } from '@/components/charts/PortfolioChart';
import { useMarketData } from '@/lib/hooks/useMarketData';
import { formatPrice, formatPercentage, getChangeColor, getTrendColor, getTrendIcon, getTrendText } from '@/lib/mock-chart-data';
import { POPULAR_SYMBOLS } from '@/lib/market/binance';
import { Optional, safeMapGet } from '@/lib/optional';

interface Asset {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  price: number;
  date: string;
  totalValue: number;
  category: string;
  color: string;
}

interface PriceAlert {
  id: string;
  assetSymbol: string;
  targetPrice: number;
  isAbove: boolean; // true = acima de, false = abaixo de
}

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  assetSymbol: string;
  date: string;
  source: string;
}

const { width: screenWidth } = Dimensions.get('window');

export default function HomeScreen() {
  const { colors } = useTheme();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssetPicker, setShowAssetPicker] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [selectedAssetForAlert, setSelectedAssetForAlert] = useState<Asset | null>(null);
  const [selectedAssetForNews, setSelectedAssetForNews] = useState<Asset | null>(null);
  
  // Dados de mercado em tempo real
  const { prices, candles, loading: marketLoading, error: marketError, refresh: refreshMarket } = useMarketData({
    symbols: POPULAR_SYMBOLS.slice(0, 1), // Reduzido para 1 símbolo para evitar rate limiting
    interval: '1h',
    enableRealtime: false // Desabilitado temporariamente para evitar muitas requisições
  });

  // Debug: verificar estado dos dados
  console.log('Market Data State:', {
    prices: prices ? `Map(${prices.size})` : 'undefined',
    candles: candles ? `Map(${candles.size})` : 'undefined',
    loading: marketLoading,
    error: marketError
  });
  const [isDollarMode, setIsDollarMode] = useState(false);
  const [selectedChartType, setSelectedChartType] = useState<'chart' | 'categories' | 'donut'>('categories');
  const [displayedCharts, setDisplayedCharts] = useState<string[]>(['BTCUSDT']);
  const [availableSymbols] = useState(POPULAR_SYMBOLS.slice(0, 9));
  const [assets, setAssets] = useState<Asset[]>([
    // Bitcoin como ativo padrão de início
    {
      id: 'btc-default',
      symbol: 'BTC',
      name: 'Bitcoin',
      quantity: 0.001,
      price: 594.23,
      date: new Date().toISOString(),
      totalValue: 0.59423,
      category: 'Crypto',
      color: '#FFD700'
    },
    {
      id: 'petr4-default',
      symbol: 'PETR4',
      name: 'Petrobras PN',
      quantity: 100,
      price: 32.50,
      date: new Date().toISOString(),
      totalValue: 3250.00,
      category: 'Stocks',
      color: '#4CAF50'
    },
    {
      id: 'vale3-default',
      symbol: 'VALE3',
      name: 'Vale ON',
      quantity: 50,
      price: 68.75,
      date: new Date().toISOString(),
      totalValue: 3437.50,
      category: 'Stocks',
      color: '#2196F3'
    }
  ]);
  const [selectedAsset, setSelectedAsset] = useState('');
  const [quantity, setQuantity] = useState('');
  const [date, setDate] = useState('');
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);
  const [alertPrice, setAlertPrice] = useState('');
  const [alertType, setAlertType] = useState<'above' | 'below'>('above');

  // Ativos fictícios disponíveis para seleção
  const availableAssets = [
    { symbol: 'PETR4', name: 'Petrobras PN', category: 'Stocks', color: '#4CAF50' },
    { symbol: 'VALE3', name: 'Vale ON', category: 'Stocks', color: '#2196F3' },
    { symbol: 'ITUB4', name: 'Itaú PN', category: 'Stocks', color: '#FF9800' },
    { symbol: 'BBDC4', name: 'Bradesco PN', category: 'Stocks', color: '#9C27B0' },
    { symbol: 'ABEV3', name: 'Ambev ON', category: 'Stocks', color: '#795548' },
    { symbol: 'WEGE3', name: 'WEG ON', category: 'Stocks', color: '#607D8B' },
    { symbol: 'RENT3', name: 'Localiza ON', category: 'Stocks', color: '#E91E63' },
    { symbol: 'LREN3', name: 'Lojas Renner ON', category: 'Stocks', color: '#00BCD4' },
  ];

  // Notícias fictícias baseadas nos ativos
  const generateNewsForAsset = (assetSymbol: string): NewsItem[] => {
    const newsTemplates = [
      {
        title: `${assetSymbol} apresenta resultados acima das expectativas`,
        summary: 'Empresa supera projeções do mercado com forte performance operacional...',
        source: 'InvestNews'
      },
      {
        title: `Analistas elevam recomendação para ${assetSymbol}`,
        summary: 'Instituições financeiras revisam projeções positivamente...',
        source: 'Mercado Financeiro'
      },
      {
        title: `${assetSymbol} anuncia novo plano de expansão`,
        summary: 'Diretoria apresenta estratégia de crescimento para os próximos anos...',
        source: 'Portal Econômico'
      }
    ];

    return newsTemplates.map((news, index) => ({
      id: `${assetSymbol}-${index}`,
      ...news,
      assetSymbol,
      date: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')
    }));
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const calculateTotalPortfolio = () => {
    return assets.reduce((total, asset) => total + asset.totalValue, 0);
  };

  const calculateTotalProfit = () => {
    // Simulando lucro baseado na valorização dos ativos
    return assets.reduce((total, asset) => {
      const profit = asset.totalValue * 0.05; // 5% de lucro fictício
      return total + profit;
    }, 0);
  };

  const calculateTotalProfitPercentage = () => {
    const totalValue = calculateTotalPortfolio();
    const totalProfit = calculateTotalProfit();
    return totalValue > 0 ? (totalProfit / totalValue) * 100 : 0;
  };

  const getCategoryDistribution = () => {
    const total = calculateTotalPortfolio();
    const distribution: { [key: string]: { value: number; percentage: number; color: string } } = {};
    
    assets.forEach(asset => {
      if (!distribution[asset.category]) {
        distribution[asset.category] = { value: 0, percentage: 0, color: asset.color };
      }
      distribution[asset.category].value += asset.totalValue;
    });

    Object.keys(distribution).forEach(category => {
      distribution[category].percentage = (distribution[category].value / total) * 100;
    });

    return distribution;
  };

  const handleAddAsset = () => {
    if (!selectedAsset || !quantity || !date) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    const asset = availableAssets.find(a => a.symbol === selectedAsset);
    if (!asset) return;

    // Preço fictício baseado no símbolo (simulando preços reais)
    const basePrice = Math.random() * 100 + 10;
    const quantityNum = parseFloat(quantity);
    const totalValue = basePrice * quantityNum;

    const newAsset: Asset = {
      id: Date.now().toString(),
      symbol: asset.symbol,
      name: asset.name,
      quantity: quantityNum,
      price: basePrice,
      date,
      totalValue,
      category: asset.category,
      color: asset.color,
    };

    setAssets([...assets, newAsset]);
    setShowAddModal(false);
    setSelectedAsset('');
    setQuantity('');
    setDate('');
  };

  const handleAddPriceAlert = () => {
    if (!selectedAssetForAlert || !alertPrice) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    const newAlert: PriceAlert = {
      id: Date.now().toString(),
      assetSymbol: selectedAssetForAlert.symbol,
      targetPrice: parseFloat(alertPrice),
      isAbove: alertType === 'above',
    };

    setPriceAlerts([...priceAlerts, newAlert]);
    setShowAlertModal(false);
    setSelectedAssetForAlert(null);
    setAlertPrice('');
    setAlertType('above');

    Alert.alert(
      'Alerta Configurado!',
      `Você será notificado quando ${selectedAssetForAlert.symbol} atingir R$ ${alertPrice}`
    );
  };

  const handleDeleteAsset = (assetId: string) => {
    Alert.alert(
      'Remover Ativo',
      'Tem certeza que deseja remover este ativo da sua carteira?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => {
            setAssets(assets.filter(asset => asset.id !== assetId));
          },
        },
      ]
    );
  };

  const formatCurrency = (value: number) => {
    if (isDollarMode) {
      const dollarValue = value / 5.67;
      return dollarValue.toFixed(2).replace('.', ',');
    }
    return value.toFixed(2).replace('.', ',');
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  };

  const getAssetNews = (assetSymbol: string) => {
    return generateNewsForAsset(assetSymbol);
  };

  const toggleCurrencyMode = () => {
    setIsDollarMode(!isDollarMode);
  };

  // Função para trocar um gráfico por outro
  const swapChart = (currentSymbol: string) => {
    const availableOptions = availableSymbols.filter(symbol => !displayedCharts.includes(symbol));
    if (availableOptions.length > 0) {
      const randomSymbol = availableOptions[Math.floor(Math.random() * availableOptions.length)];
      setDisplayedCharts(prev => 
        prev.map(symbol => symbol === currentSymbol ? randomSymbol : symbol)
      );
    }
  };

  // Função para adicionar mais um gráfico
  const addMoreChart = () => {
    const availableOptions = availableSymbols.filter(symbol => !displayedCharts.includes(symbol));
    if (availableOptions.length > 0 && displayedCharts.length < 5) {
      const randomSymbol = availableOptions[Math.floor(Math.random() * availableOptions.length)];
      setDisplayedCharts(prev => [...prev, randomSymbol]);
    }
  };

  // Renderizar gráfico de linha (evolução do portfolio)
  const renderLineChart = () => {
    return (
      <PortfolioChart
        type="line"
        totalValue={calculateTotalPortfolio()}

        height={200}
      />
    );
  };

  // Renderizar gráfico de barras elegante
  const renderBarChart = () => {
    const distribution = getCategoryDistribution();
    const categories = Object.keys(distribution);
    
    // Cores elegantes para cada categoria
    const categoryColors = {
      'Crypto': '#FFD700',      // Amarelo dourado para crypto
      'Stocks': '#4CAF50',      // Verde para ações
      'Real Estate': '#9C27B0', // Roxo para imóveis
      'Bonds': '#2196F3',       // Azul para títulos
      'Commodities': '#FF9800', // Laranja para commodities
      'Cash': '#607D8B',        // Cinza para dinheiro
      'Other': '#F44336'        // Vermelho para outros
    };
    
    const categoryData = categories.map(category => ({
      name: category,
      value: distribution[category].value,
      percentage: distribution[category].percentage,
      color: categoryColors[category as keyof typeof categoryColors] || distribution[category].color
    }));
    
    return (
      <PortfolioChart
        type="bar"
        categoryData={categoryData}
        height={200}
      />
    );
  };

  // Renderizar gráfico donut
  const renderDonutChart = () => {
    const distribution = getCategoryDistribution();
    const categories = Object.keys(distribution);
    
    // Cores elegantes para cada categoria
    const categoryColors = {
      'Crypto': '#FFD700',      // Amarelo dourado para crypto
      'Stocks': '#4CAF50',      // Verde para ações
      'Real Estate': '#9C27B0', // Roxo para imóveis
      'Bonds': '#2196F3',       // Azul para títulos
      'Commodities': '#FF9800', // Laranja para commodities
      'Cash': '#607D8B',        // Cinza para dinheiro
      'Other': '#F44336'        // Vermelho para outros
    };
    
    const categoryData = categories.map(category => ({
      name: category,
      value: distribution[category].value,
      percentage: distribution[category].percentage,
      color: categoryColors[category as keyof typeof categoryColors] || distribution[category].color
    }));
    
    return (
      <PortfolioChart
        type="donut"
        categoryData={categoryData}
        totalValue={calculateTotalPortfolio()}
        height={200}
      />
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }} edges={['top', 'left', 'right']}>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Header Simplificado */}
        <View style={styles.header}>
          <Text style={[styles.welcomeText, { color: colors.text.primary }]}>
            {greeting()}, Trader!
          </Text>
          <TouchableOpacity
            style={[styles.profileButton, { backgroundColor: colors.surface.secondary }]}
          >
            <Ionicons name="person" size={20} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Carteira Principal - Faixa Horizontal */}
        <View style={styles.portfolioContainer}>
          <View style={[styles.portfolioCard, { backgroundColor: colors.surface.primary, borderColor: colors.surface.secondary }]}>
            <View style={styles.portfolioContent}>
              <View style={styles.portfolioInfo}>
                <TouchableOpacity 
                  style={styles.portfolioIconContainer}
                  onPress={() => setShowPortfolioModal(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="wallet" size={24} color={colors.text.primary} />
                </TouchableOpacity>
                                 <View>
                   <Text style={[styles.portfolioLabel, { color: colors.text.tertiary }]}>
                     Carteira
                   </Text>
                   <View style={styles.portfolioAmountContainer}>
                     <TouchableOpacity 
                       style={styles.currencyToggle}
                       onPress={toggleCurrencyMode}
                     >
                       <Text style={[styles.currencyToggleText, { color: colors.primary[500] }]}>
                         {isDollarMode ? 'R$' : '$'}
                       </Text>
                     </TouchableOpacity>
                     <Text style={[styles.portfolioAmount, { color: colors.text.primary }]}>
                       {formatCurrency(calculateTotalPortfolio())}
                     </Text>
                   </View>
                 </View>
              </View>
              
              <View style={styles.portfolioStats}>
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: colors.text.tertiary }]}>Ativos</Text>
                  <Text style={[styles.statValue, { color: colors.text.primary }]}>{assets.length}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: colors.text.tertiary }]}>Lucro</Text>
                  <Text style={[styles.statValue, { color: '#2ed573' }]}>
                    {formatCurrency(calculateTotalProfit())}
                  </Text>
                </View>
              </View>

              <Button
                title="+"
                onPress={() => setShowAddModal(true)}
                variant="primary"
                size="sm"
                style={styles.addButton}
              />
            </View>
          </View>
        </View>

        {/* Seção de Gráficos Highcharts */}
        <View style={styles.chartsSectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              Gráficos de Mercado
            </Text>
            {marketLoading && (
              <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
                Carregando...
              </Text>
            )}
            {marketError && (
              <TouchableOpacity onPress={refreshMarket} style={styles.refreshButton}>
                <Text style={[styles.errorText, { color: '#ff4757' }]}>
                  Erro: {marketError} - Toque para tentar novamente
                </Text>
              </TouchableOpacity>
            )}
          </View>
          
          {/* Container de Gráficos Deslizáveis */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chartsScrollContainer}
            pagingEnabled={true}
            snapToInterval={screenWidth - 32}
            decelerationRate="fast"
          >
            {displayedCharts.map((symbol, index) => {
              // Usar Optional para acesso seguro aos dados
              const priceDataOptional = safeMapGet(prices, symbol);
              const candleDataOptional = safeMapGet(candles, symbol);
              
              const priceData = priceDataOptional.orElse(null as any);
              const candleData = candleDataOptional.orElse(null as any);
              
              // Debug: verificar se os dados estão disponíveis
              console.log(`Chart ${symbol}:`, { 
                priceData: !!priceData, 
                candleData: !!candleData, 
                pricesSize: prices?.size, 
                candlesSize: candles?.size,
                pricesType: typeof prices,
                candlesType: typeof candles
              });
              
              if (!priceData || !candleData) {
                // Mostrar placeholder enquanto carrega
                return (
                  <View key={`${symbol}-${index}`} style={[styles.chartCard, { backgroundColor: colors.surface.primary, borderColor: colors.surface.secondary }]}>
                    <View style={styles.chartHeader}>
                      <View style={styles.chartAssetInfo}>
                        <View style={[styles.assetLogo, { backgroundColor: '#f7931a' }]}>
                          <Text style={styles.assetLogoText}>₿</Text>
                        </View>
                        <View>
                          <Text style={[styles.chartAssetSymbol, { color: colors.text.primary }]}>{symbol.replace('USDT', '')}</Text>
                          <Text style={[styles.chartAssetName, { color: colors.text.secondary }]}>{symbol}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.chartArea}>
                      <Text style={[styles.chartAssetName, { color: colors.text.secondary, textAlign: 'center', marginTop: 50 }]}>
                        Carregando dados...
                      </Text>
                    </View>
                  </View>
                );
              }

              const assetLogos: { [key: string]: { text: string; color: string } } = {
                'BTCUSDT': { text: '₿', color: '#f7931a' },
                'ETHUSDT': { text: 'Ξ', color: '#627eea' },
                'BNBUSDT': { text: 'B', color: '#f3ba2f' },
                'ADAUSDT': { text: 'A', color: '#0033ad' },
                'DOTUSDT': { text: 'D', color: '#e6007a' },
                'LINKUSDT': { text: 'L', color: '#2a5ada' },
                'LTCUSDT': { text: 'Ł', color: '#bfbbbb' },
                'BCHUSDT': { text: 'B', color: '#0ac18e' },
                'XLMUSDT': { text: 'X', color: '#7b00ff' }
              };

              const logo = assetLogos[symbol] || { text: symbol[0], color: '#607D8B' };

              return (
                <View key={`${symbol}-${index}`} style={[styles.chartCard, { backgroundColor: colors.surface.primary, borderColor: colors.surface.secondary }]}>
                  <View style={styles.chartHeader}>
                    <View style={styles.chartAssetInfo}>
                      <View style={[styles.assetLogo, { backgroundColor: logo.color }]}>
                        <Text style={styles.assetLogoText}>{logo.text}</Text>
                      </View>
                      <View>
                        <Text style={[styles.chartAssetSymbol, { color: colors.text.primary }]}>{symbol.replace('USDT', '')}</Text>
                        <Text style={[styles.chartAssetName, { color: colors.text.secondary }]}>{symbol}</Text>
                      </View>
                    </View>
                    
                    {/* Ícone de Troca */}
                    <TouchableOpacity 
                      style={styles.swapButton}
                      onPress={() => swapChart(symbol)}
                    >
                      <Ionicons name="swap-horizontal" size={20} color={colors.text.secondary} />
                    </TouchableOpacity>
                  </View>
                  
                                      <HighchartsChart
                      symbol={symbol}
                      title={symbol.replace('USDT', '')}
                      height={200}
                      data={candleData}
                      volumeData={candleData.map(c => ({ timestamp: c.timestamp, volume: c.volume }))}
                      interval="1h"
                    />
                  
                                    <View style={styles.chartInfo}>
                    <View style={styles.chartPriceInfo}>
                      <Text style={[styles.currentPrice, { color: colors.text.primary }]}>
                        ${priceData.price.toFixed(2)}
                      </Text>
                    </View>

                    <View style={styles.chartIndicators}>
                      <View style={styles.indicator}>
                        <Text style={[styles.indicatorLabel, { color: colors.text.tertiary }]}>Tendência</Text>
                        <View style={styles.trendContainer}>
                          <Text style={styles.trendIcon}>{getTrendIcon(priceData.changePercent24h >= 0 ? 'up' : 'down')}</Text>
                          <Text style={[styles.indicatorValue, { color: getTrendColor(priceData.changePercent24h >= 0 ? 'up' : 'down') }]}>
                            {getTrendText(priceData.changePercent24h >= 0 ? 'up' : 'down')}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.indicator}>
                        <Text style={[styles.indicatorLabel, { color: colors.text.tertiary }]}>Valorização</Text>
                        <Text style={[styles.indicatorValue, { color: getChangeColor(priceData.changePercent24h) }]}>
                          {formatPercentage(priceData.changePercent24h)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}

            {/* Botão para Adicionar Mais Gráficos */}
            {displayedCharts.length < 5 && (
              <TouchableOpacity 
                style={[styles.addChartCard, { backgroundColor: colors.surface.secondary, borderColor: colors.surface.tertiary }]}
                onPress={addMoreChart}
              >
                <View style={styles.addChartContent}>
                  <Ionicons name="add-circle-outline" size={40} color={colors.text.secondary} />
                  <Text style={[styles.addChartText, { color: colors.text.secondary }]}>
                    Adicionar Gráfico
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        {/* Lista de Ativos - Novo Design */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Meus Ativos
          </Text>
          
          {assets.map((asset) => (
            <TouchableOpacity
              key={asset.id}
              style={[styles.newAssetStrip, { backgroundColor: colors.surface.primary, borderColor: colors.surface.secondary }]}
              onLongPress={() => handleDeleteAsset(asset.id)}
              activeOpacity={0.7}
            >
              {/* Lado Esquerdo - Logo e Informações */}
              <View style={styles.assetLeftSection}>
                <View style={styles.logoContainer}>
                  <View style={styles.bitcoinIcon}>
                    <Text style={styles.bitcoinSymbol}>₿</Text>
                  </View>
                </View>
                
                <View style={styles.newAssetInfo}>
                  <View style={styles.newAssetHeader}>
                    <Text style={[styles.assetSymbol, { color: colors.text.primary }]}>{asset.symbol}</Text>
                    <View style={styles.newAssetActions}>
                      <TouchableOpacity
                        style={styles.actionIconButton}
                        onPress={() => {
                          setSelectedAssetForNews(asset);
                          setShowNewsModal(true);
                        }}
                      >
                        <Ionicons name="newspaper" size={16} color="#ffa500" />
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={styles.actionIconButton}
                        onPress={() => {
                          setSelectedAssetForAlert(asset);
                          setShowAlertModal(true);
                        }}
                      >
                        <Ionicons name="notifications" size={16} color="#ffa500" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text style={[styles.assetName, { color: colors.text.secondary }]}>{asset.name}</Text>
                </View>
              </View>
              
                             {/* Lado Direito - Preço e Variação */}
               <View style={styles.assetRightSection}>
                 <Text style={[styles.currentPrice, { color: colors.text.primary }]}>
                   {asset.price.toFixed(2).replace('.', ',')}
                 </Text>
                <View style={styles.priceChange}>
                  <Text style={[styles.changeAmount, { color: '#2ed573' }]}>
                    +{(asset.price * 0.01).toFixed(2).replace('.', ',')}
                  </Text>
                  <Text style={[styles.changePercentage, { color: '#2ed573' }]}>
                    +1,44%
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
          
          {/* Botão Transparente para Adicionar Ativos */}
          <TouchableOpacity
            style={[styles.addAssetButton, { borderColor: colors.surface.secondary }]}
            onPress={() => setShowAddModal(true)}
          >
            <Ionicons name="add-circle-outline" size={24} color={colors.text.tertiary} />
            <Text style={[styles.addAssetButtonText, { color: colors.text.tertiary }]}>
              Adicionar Ativo
            </Text>
          </TouchableOpacity>
        </View>



        {/* Seção de Notícias */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Notícias dos Seus Ativos
          </Text>
          
          {assets.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.surface.secondary }]}>
              <Ionicons name="newspaper" size={48} color={colors.text.tertiary} />
              <Text style={[styles.emptyStateText, { color: colors.text.tertiary }]}>
                Nenhuma notícia disponível
              </Text>
              <Text style={[styles.emptyStateSubtext, { color: colors.text.tertiary }]}>
                Adicione ativos para ver notícias relacionadas
              </Text>
            </View>
          ) : (
            <View>
              {assets.slice(0, 3).map((asset) => {
                const assetNews = getAssetNews(asset.symbol);
                return assetNews.slice(0, 1).map((news) => (
                  <View key={news.id} style={[styles.newsCard, { backgroundColor: colors.surface.primary, borderColor: colors.surface.secondary }]}>
                    <View style={styles.newsHeader}>
                      <Text style={[styles.newsAsset, { color: colors.primary[500] }]}>{asset.symbol}</Text>
                      <Text style={[styles.newsDate, { color: colors.text.tertiary }]}>{news.date}</Text>
                    </View>
                    <Text style={[styles.newsTitle, { color: colors.text.primary }]}>
                      {news.title}
                    </Text>
                    <Text style={[styles.newsSummary, { color: colors.text.secondary }]}>
                      {news.summary}
                    </Text>
                    <Text style={[styles.newsSource, { color: colors.text.tertiary }]}>
                      Fonte: {news.source}
                    </Text>
                  </View>
                ));
              })}
            </View>
          )}
        </View>
        
        {/* Espaçamento adicional no final para evitar sobreposição com a navbar */}
        <View style={styles.finalSpacing} />
      </ScrollView>

      {/* Modal Adicionar Ativo */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface.primary }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text.primary }]}>
                Adicionar Ativo
              </Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text.primary }]}>Ativo</Text>
                <View style={[styles.pickerContainer, { borderColor: colors.surface.secondary }]}>
                  <TouchableOpacity
                    style={styles.pickerButton}
                    onPress={() => setShowAssetPicker(true)}
                  >
                    <Text style={[styles.pickerText, { color: selectedAsset ? colors.text.primary : colors.text.tertiary }]}>
                      {selectedAsset || 'Selecione um ativo'}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color={colors.text.tertiary} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text.primary }]}>Quantidade</Text>
                <Input
                  placeholder="Ex: 100"
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text.primary }]}>Data de Compra</Text>
                <Input
                  placeholder="DD/MM/AAAA"
                  value={date}
                  onChangeText={setDate}
                />
              </View>
            </View>

            <View style={styles.modalFooter}>
              <Button
                title="Cancelar"
                onPress={() => setShowAddModal(false)}
                variant="secondary"
                size="md"
                style={styles.modalButton}
              />
              <Button
                title="Adicionar"
                onPress={handleAddAsset}
                variant="primary"
                size="md"
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Seleção de Ativos */}
      <Modal
        visible={showAssetPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAssetPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface.primary }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text.primary }]}>
                Selecionar Ativo
              </Text>
              <TouchableOpacity onPress={() => setShowAssetPicker(false)}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.assetListContainer}>
              {availableAssets.map((asset) => (
                <TouchableOpacity
                  key={asset.symbol}
                  style={[
                    styles.assetOption,
                    { 
                      backgroundColor: selectedAsset === asset.symbol 
                        ? colors.primary[500] 
                        : colors.surface.secondary 
                    }
                  ]}
                  onPress={() => {
                    setSelectedAsset(asset.symbol);
                    setShowAssetPicker(false);
                  }}
                >
                  <View>
                    <Text style={[
                      styles.assetOptionSymbol, 
                      { color: selectedAsset === asset.symbol ? 'white' : colors.text.primary }
                    ]}>
                      {asset.symbol}
                    </Text>
                    <Text style={[
                      styles.assetOptionName, 
                      { color: selectedAsset === asset.symbol ? 'rgba(255,255,255,0.8)' : colors.text.secondary }
                    ]}>
                      {asset.name}
                    </Text>
                  </View>
                  {selectedAsset === asset.symbol && (
                    <Ionicons name="checkmark" size={20} color="white" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal Configuração de Alertas */}
      <Modal
        visible={showAlertModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAlertModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface.primary }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text.primary }]}>
                Configurar Alerta de Preço
              </Text>
              <TouchableOpacity onPress={() => setShowAlertModal(false)}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.alertAssetInfo}>
                <Text style={[styles.alertAssetSymbol, { color: colors.text.primary }]}>
                  {selectedAssetForAlert?.symbol}
                </Text>
                <Text style={[styles.alertAssetName, { color: colors.text.secondary }]}>
                  {selectedAssetForAlert?.name}
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text.primary }]}>Preço Alvo</Text>
                <Input
                  placeholder="Ex: 25,50"
                  value={alertPrice}
                  onChangeText={setAlertPrice}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text.primary }]}>Tipo de Alerta</Text>
                <View style={styles.alertTypeContainer}>
                  <TouchableOpacity
                    style={[
                      styles.alertTypeButton,
                      { 
                        backgroundColor: alertType === 'above' 
                          ? colors.primary[500] 
                          : colors.surface.secondary 
                      }
                    ]}
                    onPress={() => setAlertType('above')}
                  >
                    <Text style={[
                      styles.alertTypeText,
                      { color: alertType === 'above' ? 'white' : colors.text.primary }
                    ]}>
                      Acima de
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.alertTypeButton,
                      { 
                        backgroundColor: alertType === 'below' 
                          ? colors.primary[500] 
                          : colors.surface.secondary 
                      }
                    ]}
                    onPress={() => setAlertType('below')}
                  >
                    <Text style={[
                      styles.alertTypeText,
                      { color: alertType === 'below' ? 'white' : colors.text.primary }
                    ]}>
                      Abaixo de
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <Button
                title="Cancelar"
                onPress={() => setShowAlertModal(false)}
                variant="secondary"
                size="md"
                style={styles.modalButton}
              />
              <Button
                title="Configurar"
                onPress={handleAddPriceAlert}
                variant="primary"
                size="md"
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Notícias do Ativo */}
      <Modal
        visible={showNewsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowNewsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface.primary }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text.primary }]}>
                Notícias - {selectedAssetForNews?.symbol}
              </Text>
              <TouchableOpacity onPress={() => setShowNewsModal(false)}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.newsListContainer}>
              {selectedAssetForNews && getAssetNews(selectedAssetForNews.symbol).map((news) => (
                <View key={news.id} style={[styles.newsModalCard, { backgroundColor: colors.surface.secondary }]}>
                  <View style={styles.newsModalHeader}>
                    <Text style={[styles.newsModalDate, { color: colors.text.tertiary }]}>{news.date}</Text>
                    <Text style={[styles.newsModalSource, { color: colors.text.tertiary }]}>{news.source}</Text>
                  </View>
                  <Text style={[styles.newsModalTitle, { color: colors.text.primary }]}>
                    {news.title}
                  </Text>
                  <Text style={[styles.newsModalSummary, { color: colors.text.secondary }]}>
                    {news.summary}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal Portfolio Completo */}
      <Modal
        visible={showPortfolioModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPortfolioModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => setShowPortfolioModal(false)}>
            <View style={styles.modalOverlayBackground} />
          </TouchableWithoutFeedback>
          <View style={[styles.portfolioModalContent, { backgroundColor: colors.surface.primary }]}>
            {/* Header do Portfolio */}
            <View style={styles.portfolioModalHeader}>
              <Text style={[styles.portfolioModalTitle, { color: colors.text.primary }]}>
                Portfolio
              </Text>
              <TouchableOpacity
                style={[styles.portfolioAddButton, { backgroundColor: colors.primary[500] }]}
                onPress={() => {
                  setShowPortfolioModal(false);
                  setShowAddModal(true);
                }}
              >
                <Ionicons name="add" size={16} color="white" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.portfolioModalBody} showsVerticalScrollIndicator={false}>
              {/* Total Investido */}
              <View style={styles.portfolioTotalSection}>
                <View style={styles.portfolioTotalHeader}>
                  <Text style={[styles.portfolioTotalLabel, { color: colors.text.tertiary }]}>
                    Total Investido
                  </Text>
                  <View style={styles.portfolioHeaderRight}>
                    <TouchableOpacity 
                      style={styles.portfolioCurrencyToggle}
                      onPress={toggleCurrencyMode}
                    >
                      <Text style={[styles.portfolioCurrencyToggleText, { color: colors.primary[500] }]}>
                        {isDollarMode ? 'R$' : '$'}
                      </Text>
                    </TouchableOpacity>
                    <View style={styles.portfolioProfitIndicator}>
                      <Text style={[styles.portfolioProfitText, { color: '#2ed573' }]}>
                        +{calculateTotalProfitPercentage().toFixed(2)}%
                      </Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.portfolioTotalAmountContainer}>
                  <Text style={[styles.portfolioCurrencySymbol, { color: colors.text.primary }]}>
                    {isDollarMode ? 'R$' : '$'}
                  </Text>
                  <Text style={[styles.portfolioTotalAmount, { color: colors.text.primary }]}>
                    {formatCurrency(calculateTotalPortfolio()).replace(/[R$]/g, '').trim()}
                  </Text>
                </View>
              </View>

              {/* Seletor de Tipo de Visualização */}
              <View style={styles.portfolioViewSelector}>
                <TouchableOpacity 
                  style={[
                    styles.portfolioViewButton, 
                    { backgroundColor: selectedChartType === 'chart' ? colors.primary[500] : 'transparent' }
                  ]}
                  onPress={() => setSelectedChartType('chart')}
                >
                  <Text style={[
                    styles.portfolioViewButtonText, 
                    { color: selectedChartType === 'chart' ? 'white' : colors.text.primary }
                  ]}>
                    Chart
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.portfolioViewButton, 
                    { backgroundColor: selectedChartType === 'categories' ? colors.primary[500] : 'transparent' }
                  ]}
                  onPress={() => setSelectedChartType('categories')}
                >
                  <Text style={[
                    styles.portfolioViewButtonText, 
                    { color: selectedChartType === 'categories' ? 'white' : colors.text.primary }
                  ]}>
                    Categories
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.portfolioViewButton, 
                    { backgroundColor: selectedChartType === 'donut' ? colors.primary[500] : 'transparent' }
                  ]}
                  onPress={() => setSelectedChartType('donut')}
                >
                  <Text style={[
                    styles.portfolioViewButtonText, 
                    { color: selectedChartType === 'donut' ? 'white' : colors.text.primary }
                  ]}>
                    Donut
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Gráfico de Distribuição */}
              <View style={styles.portfolioChartSection}>
                <View style={styles.portfolioChartContainer}>
                  {selectedChartType === 'chart' && renderLineChart()}
                  {selectedChartType === 'categories' && renderBarChart()}
                  {selectedChartType === 'donut' && renderDonutChart()}
                </View>
              </View>

              {/* Lista Completa de Ativos */}
              <View style={styles.portfolioAssetsSection}>
                <Text style={[styles.portfolioAssetsTitle, { color: colors.text.primary }]}>
                  Assets
                </Text>
                
                {assets.map((asset) => (
                  <View key={asset.id} style={[styles.portfolioAssetItem, { backgroundColor: colors.surface.secondary }]}>
                    <View style={styles.portfolioAssetLeft}>
                      <View style={[styles.portfolioAssetLogo, { backgroundColor: asset.color }]}>
                        <Text style={styles.portfolioAssetLogoText}>{asset.symbol}</Text>
                      </View>
                      <View>
                        <Text style={[styles.portfolioAssetSymbol, { color: colors.text.primary }]}>
                          {asset.symbol}
                        </Text>
                        <Text style={[styles.portfolioAssetName, { color: colors.text.secondary }]}>
                          {asset.name}
                        </Text>
                        <Text style={[styles.portfolioAssetCategory, { color: colors.text.tertiary }]}>
                          {asset.category}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.portfolioAssetRight}>
                      <Text style={[styles.portfolioAssetValue, { color: colors.text.primary }]}>
                        {formatCurrency(asset.totalValue)}
                      </Text>
                      <Text style={[styles.portfolioAssetPercentage, { color: colors.text.tertiary }]}>
                        {((asset.totalValue / calculateTotalPortfolio()) * 100).toFixed(1)}%
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent', // Garante que o container seja transparente
  },
  scrollContent: {
    paddingBottom: 200, // Aumentado significativamente para 200 para subir muito mais o conteúdo
    paddingTop: 8, // Adicionado padding superior para melhor espaçamento
    minHeight: '100%', // Garante que o conteúdo ocupe pelo menos toda a altura disponível
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 4, // Adicionado margem superior para melhor posicionamento
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  portfolioContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  portfolioCard: {
    padding: 18, // Aumentado de 16 para 18 para melhor espaçamento interno
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000', // Adicionado sombra sutil
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  portfolioContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  portfolioInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  portfolioIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(46, 213, 115, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  portfolioLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  portfolioAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  portfolioAmountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currencyToggle: {
    marginRight: 3,
    paddingHorizontal: 1,
    paddingVertical: 4,
    borderRadius: 6,
  },
  currencyToggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  portfolioStats: {
    flexDirection: 'row',
    gap: 20,
    marginRight: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  sectionContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  refreshButton: {
    padding: 4,
  },
  emptyState: {
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  assetsHorizontalContainer: {
    paddingRight: 16,
  },
  assetCardHorizontal: {
    width: 140,
    padding: 12,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
  },
  assetHeaderHorizontal: {
    marginBottom: 8,
  },
  assetSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  assetName: {
    fontSize: 12,
  },
  assetDetailsHorizontal: {
    marginBottom: 8,
  },
  assetPrice: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  assetQuantity: {
    fontSize: 10,
  },
  assetFooterHorizontal: {
    alignItems: 'center',
  },
  assetTotal: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Estilos para as faixas de ativos
  assetStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  assetStripInfo: {
    flex: 1,
  },
  assetStripHeader: {
    marginBottom: 4,
  },
  assetStripSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  assetStripName: {
    fontSize: 12,
  },
  assetStripDetails: {
    marginBottom: 4,
  },
  assetStripPrice: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  assetStripQuantity: {
    fontSize: 11,
  },
  assetStripActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Estilos para notícias
  newsCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  newsAsset: {
    fontSize: 12,
    fontWeight: '600',
  },
  newsDate: {
    fontSize: 11,
  },
  newsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 18,
  },
  newsSummary: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 8,
  },
  newsSource: {
    fontSize: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalOverlayBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalBody: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
  assetListContainer: {
    maxHeight: 300,
  },
  assetOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  assetOptionSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  assetOptionName: {
    fontSize: 14,
  },
  // Estilos para modal de alertas
  alertAssetInfo: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
  },
  alertAssetSymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  alertAssetName: {
    fontSize: 14,
  },
  alertTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  alertTypeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  alertTypeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  // Estilos para modal de notícias
  newsListContainer: {
    maxHeight: 400,
  },
  newsModalCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  newsModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  newsModalDate: {
    fontSize: 12,
  },
  newsModalSource: {
    fontSize: 12,
  },
  newsModalTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 20,
  },
  newsModalSummary: {
    fontSize: 14,
    lineHeight: 18,
  },
  // Estilos para o gráfico de análise
  chartContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  chartCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    width: screenWidth * 0.85,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  swapButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  chartAssetSelector: {
    flex: 1,
  },
  chartLabel: {
    fontSize: 12,
    marginBottom: 8,
    fontWeight: '500',
  },
  assetSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  selectedAssetText: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  chartPeriodSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  periodButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 32,
    alignItems: 'center',
  },
  periodButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  chartArea: {
    height: 120,
    marginBottom: 20,
    justifyContent: 'flex-end',
  },
  chartLine: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: '100%',
  },
  chartBar: {
    width: 8,
    borderRadius: 4,
    minHeight: 4,
  },
  chartInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 12,
  },
  chartPriceInfo: {
    flex: 1,
  },
  currentPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  priceChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  chartIndicators: {
    flexDirection: 'row',
    gap: 20,
  },
  indicator: {
    alignItems: 'center',
  },
  indicatorLabel: {
    fontSize: 10,
    marginBottom: 4,
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
  },
  trendIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  indicatorValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendIcon: {
    fontSize: 12,
  },
  addChartCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    width: screenWidth * 0.85,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  addChartContent: {
    alignItems: 'center',
    gap: 12,
  },
  addChartText: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Estilos para os novos elementos
  assetHeaderLeft: {
    flex: 1,
  },
  deleteButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 71, 87, 0.1)',
    borderRadius: 12,
  },
  addAssetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    marginTop: 16,
    backgroundColor: 'transparent',
  },
  addAssetButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  // Estilos para o novo design de faixa
  newAssetStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  assetLeftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoContainer: {
    position: 'relative',
    marginRight: 12,
  },
  redMarker: {
    position: 'absolute',
    left: -4,
    top: 8,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 0,
    borderBottomWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: '#ff4757',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderTopColor: 'transparent',
    zIndex: 1,
  },
  circularLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  logoTopHalf: {
    width: '100%',
    height: '50%',
    backgroundColor: '#ffd700',
  },
  logoBottomHalf: {
    width: '100%',
    height: '50%',
    backgroundColor: '#006400',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  newAssetInfo: {
    flex: 1,
  },
  newAssetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  newAssetActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionIconButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assetRightSection: {
    alignItems: 'flex-end',
  },
  changeAmount: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  changePercentage: {
    fontSize: 12,
    fontWeight: '600',
  },
  portfolioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  bitcoinIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffd700',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bitcoinSymbol: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  // Estilos para seção de gráficos deslizáveis
  chartsSectionContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  chartTypeSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  chartTypeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  chartTypeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  chartsScrollContainer: {
    paddingRight: 16,
  },
  chartAssetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  assetLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  assetLogoText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  chartAssetSymbol: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  chartAssetName: {
    fontSize: 12,
  },
  // Estilos para gráficos de distribuição
  chartLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  chartLegendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  chartLegendText: {
    fontSize: 14,
    fontWeight: '500',
  },
  // Estilos elegantes para o gráfico de barras
  elegantBarChartContainer: {
    width: '100%',
    paddingVertical: 8,
  },
  elegantBarChartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  elegantBarChartLeft: {
    width: 100,
    marginRight: 16,
  },
  elegantBarChartLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  elegantBarChartPercentage: {
    fontSize: 12,
    fontWeight: '500',
  },
  elegantBarChartRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  elegantBarChartBarContainer: {
    width: '100%',
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  elegantBarChartBar: {
    height: '100%',
    borderRadius: 12,
    minWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  donutChartContainer: {
    alignItems: 'center',
  },
  donutChartCenter: {
    alignItems: 'center',
    marginBottom: 20,
  },
  donutChartTotal: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  donutChartLabel: {
    fontSize: 14,
  },
  // Estilos para o modal de portfolio completo
  portfolioModalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  portfolioModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  portfolioModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  portfolioModalBody: {
    paddingBottom: 20,
  },
  portfolioAddButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  portfolioTotalSection: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  portfolioTotalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  portfolioTotalLabel: {
    fontSize: 14,
  },
  portfolioCurrencyToggle: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  portfolioCurrencyToggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  portfolioTotalAmountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  portfolioCurrencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 4,
  },
  portfolioTotalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  portfolioProfitIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  portfolioProfitText: {
    fontSize: 14,
    fontWeight: '600',
  },
  portfolioChartSection: {
    marginBottom: 20,
  },
  portfolioChartTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  portfolioChartTypeSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  portfolioChartTypeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  portfolioChartTypeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  portfolioHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  portfolioViewSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  portfolioViewButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(156, 163, 175, 0.3)',
  },
  portfolioViewButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  portfolioChartContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  portfolioAssetsSection: {
    marginTop: 16,
  },
  portfolioAssetsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  portfolioAssetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  portfolioAssetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  portfolioAssetLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  portfolioAssetLogoText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  portfolioAssetSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  portfolioAssetName: {
    fontSize: 14,
  },
  portfolioAssetCategory: {
    fontSize: 12,
    marginTop: 4,
  },
  portfolioAssetRight: {
    alignItems: 'flex-end',
  },
  portfolioAssetValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  portfolioAssetPercentage: {
    fontSize: 12,
  },
  finalSpacing: {
    height: 100, // Aumentado para 100 para dar muito mais espaço da navbar
  },
});


