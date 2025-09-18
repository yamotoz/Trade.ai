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
import { useAuth } from '@/lib/hooks/useAuth';
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
  isAbove: boolean;
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
  const { logout } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssetPicker, setShowAssetPicker] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [selectedAssetForAlert, setSelectedAssetForAlert] = useState<Asset | null>(null);
  const [selectedAssetForNews, setSelectedAssetForNews] = useState<Asset | null>(null);
  
  // Estados para gráficos
  const [displayedCharts, setDisplayedCharts] = useState<string[]>(['BTCUSDT']);
  const [availableSymbols] = useState(POPULAR_SYMBOLS.slice(0, 9));
  
  // Dados de mercado em tempo real
  const { prices, candles, loading: marketLoading, error: marketError, refresh: refreshMarket } = useMarketData({
    symbols: displayedCharts,
    interval: '1h',
    enableRealtime: false
  });

  const [isDollarMode, setIsDollarMode] = useState(false);
  const [selectedChartType, setSelectedChartType] = useState<'chart' | 'categories' | 'donut'>('categories');
  const [assets, setAssets] = useState<Asset[]>([
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
    return assets.reduce((total, asset) => {
      const profit = asset.totalValue * 0.05;
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
      return `${dollarValue.toFixed(2).replace('.', ',')}`;
    }
    return `${value.toFixed(2).replace('.', ',')}`;
  };

  const getAssetIcon = (symbol: string) => {
    const iconMap: { [key: string]: { icon: string; color: string; text: string } } = {
      'BTC': { icon: '₿', color: '#f7931a', text: '₿' },
      'PETR4': { icon: '🛢️', color: '#4CAF50', text: 'P' },
      'VALE3': { icon: '⛏️', color: '#2196F3', text: 'V' },
      'ITUB4': { icon: '🏦', color: '#FF9800', text: 'I' },
      'BBDC4': { icon: '🏛️', color: '#9C27B0', text: 'B' },
      'ABEV3': { icon: '🍺', color: '#795548', text: 'A' },
      'WEGE3': { icon: '⚡', color: '#607D8B', text: 'W' },
      'RENT3': { icon: '🚗', color: '#E91E63', text: 'R' },
      'LREN3': { icon: '👕', color: '#00BCD4', text: 'L' },
    };
    
    return iconMap[symbol] || { icon: '📈', color: '#607D8B', text: symbol[0] };
  };

  const toggleCurrencyMode = () => {
    setIsDollarMode(!isDollarMode);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }} edges={['top', 'left', 'right']}>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.welcomeText, { color: colors.text.primary }]}>
            {greeting()}, Trader!
          </Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.profileButton, { backgroundColor: colors.surface.secondary }]}
            >
              <Ionicons name="person" size={20} color={colors.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.logoutButton, { backgroundColor: colors.surface.secondary }]}
              onPress={() => {
                Alert.alert(
                  'Sair',
                  'Tem certeza que deseja sair do aplicativo?',
                  [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Sair', style: 'destructive', onPress: logout }
                  ]
                );
              }}
            >
              <Ionicons name="log-out" size={20} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Carteira Principal */}
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
                    +{calculateTotalProfitPercentage().toFixed(2).replace('.', ',')}%
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

        {/* Lista de Ativos */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Meus Ativos
          </Text>
          
          {assets.map((asset) => {
            const assetIcon = getAssetIcon(asset.symbol);
            return (
              <TouchableOpacity
                key={asset.id}
                style={[styles.assetStrip, { backgroundColor: colors.surface.primary, borderColor: colors.surface.secondary }]}
                onLongPress={() => handleDeleteAsset(asset.id)}
                activeOpacity={0.7}
              >
                <View style={styles.assetLeftSection}>
                  <View style={styles.logoContainer}>
                    <View style={[styles.assetIconContainer, { backgroundColor: assetIcon.color }]}>
                      <Text style={styles.assetIconText}>{assetIcon.text}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.assetInfo}>
                    <View style={styles.assetHeader}>
                      <Text style={[styles.assetSymbol, { color: colors.text.primary }]}>{asset.symbol}</Text>
                    </View>
                    <Text style={[styles.assetName, { color: colors.text.secondary }]}>{asset.name}</Text>
                  </View>
                </View>
                
                <View style={styles.assetRightSection}>
                  <Text style={[styles.currentPrice, { color: colors.text.primary }]}>
                    {formatPrice(asset.price, 'R$')}
                  </Text>
                  <View style={styles.priceChange}>
                    <Text style={[styles.changeAmount, { color: '#2ed573' }]}>
                      +{formatPrice(asset.price * 0.01, 'R$')}
                    </Text>
                    <Text style={[styles.changePercentage, { color: '#2ed573' }]}>
                      +1,44%
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
          
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingBottom: 200,
    paddingTop: 8,
    minHeight: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 4,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  portfolioContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  portfolioCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
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
    fontSize: 14,
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
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  assetStrip: {
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
  assetIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  assetIconText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  assetInfo: {
    flex: 1,
  },
  assetHeader: {
    marginBottom: 4,
  },
  assetSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  assetName: {
    fontSize: 12,
  },
  assetRightSection: {
    alignItems: 'flex-end',
  },
  currentPrice: {
    fontSize: 16,
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
  finalSpacing: {
    height: 100,
  },
});
