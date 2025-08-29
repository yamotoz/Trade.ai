import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Asset {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  price: number;
  date: string;
  totalValue: number;
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

export default function HomeScreen() {
  const { colors } = useTheme();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssetPicker, setShowAssetPicker] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedAssetForAlert, setSelectedAssetForAlert] = useState<Asset | null>(null);
  const [selectedAssetForNews, setSelectedAssetForNews] = useState<Asset | null>(null);
  const [isDollarMode, setIsDollarMode] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([
    // Bitcoin como ativo padrão de início
    {
      id: 'btc-default',
      symbol: 'BTC',
      name: 'Bitcoin',
      quantity: 0.001,
      price: 250000,
      date: new Date().toISOString(),
      totalValue: 250,
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
    { symbol: 'PETR4', name: 'Petrobras PN' },
    { symbol: 'VALE3', name: 'Vale ON' },
    { symbol: 'ITUB4', name: 'Itaú PN' },
    { symbol: 'BBDC4', name: 'Bradesco PN' },
    { symbol: 'ABEV3', name: 'Ambev ON' },
    { symbol: 'WEGE3', name: 'WEG ON' },
    { symbol: 'RENT3', name: 'Localiza ON' },
    { symbol: 'LREN3', name: 'Lojas Renner ON' },
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
      return `${dollarValue.toFixed(2).replace('.', ',')}`;
    }
    return `${value.toFixed(2).replace('.', ',')}`;
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <ScrollView style={styles.container}>
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
                <View style={styles.portfolioIconContainer}>
                  <Ionicons name="wallet" size={24} color={colors.text.primary} />
                </View>
                <View>
                  <View style={styles.portfolioHeader}>
                    <Text style={[styles.portfolioLabel, { color: colors.text.tertiary }]}>
                      Carteira
                    </Text>
                    <TouchableOpacity 
                      style={styles.currencyToggle}
                      onPress={toggleCurrencyMode}
                    >
                      <Text style={[styles.currencyToggleText, { color: colors.primary[500] }]}>
                        {isDollarMode ? 'R$' : '$'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={[styles.portfolioAmount, { color: colors.text.primary }]}>
                    {formatCurrency(calculateTotalPortfolio())}
                  </Text>
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

        {/* Gráfico de Análise */}
        <View style={styles.chartContainer}>
          <View style={[styles.chartCard, { backgroundColor: colors.surface.primary, borderColor: colors.surface.secondary }]}>
            <View style={styles.chartHeader}>
              <View style={styles.chartAssetSelector}>
                <Text style={[styles.chartLabel, { color: colors.text.tertiary }]}>Análise</Text>
                <TouchableOpacity
                  style={styles.assetSelectorButton}
                  onPress={() => setShowAssetPicker(true)}
                >
                  <Text style={[styles.selectedAssetText, { color: colors.text.primary }]}>
                    {assets.length > 0 ? assets[0].symbol : 'Selecione'}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color={colors.text.tertiary} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.chartPeriodSelector}>
                <TouchableOpacity style={[styles.periodButton, { backgroundColor: colors.primary[500] }]}>
                  <Text style={styles.periodButtonText}>1D</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.periodButton, { backgroundColor: colors.surface.secondary }]}>
                  <Text style={[styles.periodButtonText, { color: colors.text.primary }]}>1W</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.periodButton, { backgroundColor: colors.surface.secondary }]}>
                  <Text style={[styles.periodButtonText, { color: colors.text.primary }]}>1M</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Gráfico Simulado */}
            <View style={styles.chartArea}>
              <View style={styles.chartLine}>
                {[20, 35, 25, 45, 30, 55, 40, 65, 50, 75, 60, 85].map((height, index) => (
                  <View
                    key={index}
                    style={[
                      styles.chartBar,
                      {
                        height: height,
                        backgroundColor: index === 11 ? colors.primary[500] : colors.surface.secondary,
                        marginRight: index === 11 ? 0 : 2,
                      }
                    ]}
                  />
                ))}
              </View>
            </View>

            {/* Informações do Gráfico */}
            <View style={styles.chartInfo}>
              <View style={styles.chartPriceInfo}>
                <Text style={[styles.currentPrice, { color: colors.text.primary }]}>
                  R$ 85,42
                </Text>
                <View style={styles.priceChange}>
                  <Ionicons name="trending-up" size={16} color="#2ed573" />
                  <Text style={[styles.changeText, { color: '#2ed573' }]}>+12,5%</Text>
                </View>
              </View>
              
              <View style={styles.chartIndicators}>
                <View style={styles.indicator}>
                  <Text style={[styles.indicatorLabel, { color: colors.text.tertiary }]}>Tendência</Text>
                  <View style={styles.trendIndicatorContainer}>
                    <Ionicons name="trending-up" size={14} color="#2ed573" />
                    <Text style={[styles.trendText, { color: '#2ed573' }]}>Alta</Text>
                  </View>
                </View>
                
                <View style={styles.indicator}>
                  <Text style={[styles.indicatorLabel, { color: colors.text.tertiary }]}>Volume</Text>
                  <Text style={[styles.indicatorValue, { color: colors.text.primary }]}>2.5M</Text>
                </View>
                
                <View style={styles.indicator}>
                  <Text style={[styles.indicatorLabel, { color: colors.text.tertiary }]}>RSI</Text>
                  <Text style={[styles.indicatorValue, { color: colors.text.primary }]}>68</Text>
                </View>
              </View>
            </View>
          </View>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
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
    marginLeft: 8,
    paddingHorizontal: 8,
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
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
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
  currentPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  priceChange: {
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
});

