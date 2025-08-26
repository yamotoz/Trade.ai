import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme';

export default function HomeScreen() {
  const { colors } = useTheme();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.text.tertiary }]}>
              {greeting()}
            </Text>
            <Text style={[styles.welcomeText, { color: colors.text.primary }]}>
              Bem-vindo, Trader!
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.profileButton, { backgroundColor: colors.surface.secondary }]}
          >
            <Ionicons name="person" size={20} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Saldo */}
        <View style={styles.balanceContainer}>
          <View style={[styles.balanceCard, { backgroundColor: colors.surface.primary, borderColor: colors.surface.secondary }]}>
            <Text style={[styles.balanceLabel, { color: colors.text.tertiary }]}>Saldo Disponível</Text>
            <Text style={[styles.balanceAmount, { color: colors.text.primary }]}>
              $10,000.00
            </Text>
            <Text style={[styles.bonusText, { color: '#2ed573' }]}>
              +$250.00 bônus diário
            </Text>
          </View>
        </View>

        {/* Ativos em Destaque */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Ativos em Destaque
          </Text>
          
          <View style={[styles.assetCard, { backgroundColor: colors.surface.primary }]}>
            <Text style={[styles.assetSymbol, { color: colors.text.primary }]}>BTC</Text>
            <Text style={[styles.assetName, { color: colors.text.secondary }]}>Bitcoin</Text>
            <Text style={[styles.assetPrice, { color: colors.text.primary }]}>$45,000.00</Text>
            <Text style={[styles.assetChange, { color: '#2ed573' }]}>+2.5%</Text>
          </View>

          <View style={[styles.assetCard, { backgroundColor: colors.surface.primary }]}>
            <Text style={[styles.assetSymbol, { color: colors.text.primary }]}>ETH</Text>
            <Text style={[styles.assetName, { color: colors.text.secondary }]}>Ethereum</Text>
            <Text style={[styles.assetPrice, { color: colors.text.primary }]}>$3,200.00</Text>
            <Text style={[styles.assetChange, { color: '#ff4757' }]}>-1.2%</Text>
          </View>
        </View>

        {/* Notícias */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Últimas Notícias 📰
          </Text>
          <View style={[styles.newsCard, { backgroundColor: colors.surface.primary }]}>
            <Text style={[styles.newsTitle, { color: colors.text.primary }]}>
              Bitcoin atinge nova máxima histórica
            </Text>
            <Text style={[styles.newsSummary, { color: colors.text.secondary }]}>
              Bitcoin supera a marca de $50.000 pela primeira vez em 2024...
            </Text>
          </View>
        </View>
      </ScrollView>
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
  greeting: {
    fontSize: 14,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  balanceCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  balanceLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  bonusText: {
    fontSize: 14,
    marginTop: 4,
  },
  sectionContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  assetCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  assetSymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  assetName: {
    fontSize: 14,
    marginBottom: 8,
  },
  assetPrice: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  assetChange: {
    fontSize: 14,
    fontWeight: '600',
  },
  newsCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  newsSummary: {
    fontSize: 14,
    lineHeight: 20,
  },
});
