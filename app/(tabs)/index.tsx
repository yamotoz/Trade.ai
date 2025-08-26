import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/lib/theme';
import { ChartPreview } from '@/components/charts/ChartPreview';
import { AssetCard } from '@/components/market/AssetCard';
import { ProfileModal } from '@/components/profile/ProfileModal';
import { useAssets } from '@/lib/market';
import { useState } from 'react';

export default function HomeScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { assets, isLoading } = useAssets();
  const [showProfile, setShowProfile] = useState(false);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const topAssets = assets?.slice(0, 6) || [];
  const cryptoAssets = assets?.filter(a => a.type === 'crypto').slice(0, 3) || [];
  const forexAssets = assets?.filter(a => a.type === 'forex').slice(0, 3) || [];
  const stockAssets = assets?.filter(a => a.type === 'stock').slice(0, 3) || [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4">
          <View>
            <Text className="text-text-tertiary text-sm">
              {greeting()}
            </Text>
            <Text className="text-text-primary text-xl font-bold">
              Bem-vindo, {user?.name || 'Trader'}!
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowProfile(true)}
            className="w-10 h-10 bg-surface-secondary rounded-full items-center justify-center"
          >
            <Ionicons name="person" size={20} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Saldo */}
        <View className="mx-4 mb-6">
          <View className="bg-surface-primary p-4 rounded-xl border border-surface-secondary">
            <Text className="text-text-tertiary text-sm mb-1">Saldo Disponível</Text>
            <Text className="text-text-primary text-2xl font-bold">
              $10,000.00
            </Text>
            <Text className="text-accent-green text-sm mt-1">
              +$250.00 bônus diário
            </Text>
          </View>
        </View>

        {/* Ativos em Destaque */}
        <View className="mx-4 mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-text-primary text-lg font-semibold">
              Ativos em Destaque
            </Text>
            <TouchableOpacity>
              <Text className="text-primary-500 text-sm">Ver todos</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {topAssets.map((asset) => (
              <AssetCard key={asset.id} asset={asset} compact />
            ))}
          </ScrollView>
        </View>

        {/* Criptomoedas */}
        <View className="mx-4 mb-6">
          <Text className="text-text-primary text-lg font-semibold mb-3">
            Criptomoedas
          </Text>
          {cryptoAssets.map((asset) => (
            <View key={asset.id} className="mb-3">
              <AssetCard asset={asset} showChart />
            </View>
          ))}
        </View>

        {/* Forex */}
        <View className="mx-4 mb-6">
          <Text className="text-text-primary text-lg font-semibold mb-3">
            Forex
          </Text>
          {forexAssets.map((asset) => (
            <View key={asset.id} className="mb-3">
              <AssetCard asset={asset} showChart />
            </View>
          ))}
        </View>

        {/* Ações */}
        <View className="mx-4 mb-6">
          <Text className="text-text-primary text-lg font-semibold mb-3">
            Ações
          </Text>
          {stockAssets.map((asset) => (
            <View key={asset.id} className="mb-3">
              <AssetCard asset={asset} showChart />
            </View>
          ))}
        </View>
      </ScrollView>

      <ProfileModal 
        visible={showProfile} 
        onClose={() => setShowProfile(false)} 
      />
    </SafeAreaView>
  );
}
