import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';

const { width } = Dimensions.get('window');

const onboardingSteps = [
  {
    id: 1,
    title: 'Bem-vindo ao Trade.ai',
    description: 'Aprenda trading com simulação realista e dados de mercado em tempo real',
    icon: 'trending-up',
    animation: require('@/assets/animations/trading-intro.json'),
  },
  {
    id: 2,
    title: 'Simule Operações',
    description: 'Pratique com $10.000 virtuais e receba $250 diários de bônus',
    icon: 'swap-horizontal',
    animation: require('@/assets/animations/simulation.json'),
  },
  {
    id: 3,
    title: 'Análise Técnica',
    description: 'Acesse gráficos TradingView com indicadores profissionais',
    icon: 'analytics',
    animation: require('@/assets/animations/charts.json'),
  },
  {
    id: 4,
    title: 'Aprenda e Cresça',
    description: 'Biblioteca completa de estudos e notícias do mercado',
    icon: 'library',
    animation: require('@/assets/animations/learning.json'),
  },
];

export default function OnboardingScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const animationRef = useRef<LottieView>(null);

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      const nextStepIndex = currentStep + 1;
      setCurrentStep(nextStepIndex);
      scrollViewRef.current?.scrollTo({
        x: nextStepIndex * width,
        animated: true,
      });
    } else {
      completeOnboarding();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      const prevStepIndex = currentStep - 1;
      setCurrentStep(prevStepIndex);
      scrollViewRef.current?.scrollTo({
        x: prevStepIndex * width,
        animated: true,
      });
    }
  };

  const completeOnboarding = () => {
    // Marcar onboarding como completo
    // Salvar preferências iniciais
    router.replace('/(tabs)');
  };

  const skipOnboarding = () => {
    router.replace('/(tabs)');
  };

  const onScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const stepIndex = Math.round(contentOffset / width);
    if (stepIndex !== currentStep) {
      setCurrentStep(stepIndex);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
      {/* Header */}
      <View className="flex-row items-center justify-between p-4">
        <View className="flex-row items-center">
          <View className="w-8 h-8 bg-primary-500 rounded-full items-center justify-center mr-3">
            <Ionicons name="trending-up" size={20} color="white" />
          </View>
          <Text className="text-text-primary text-xl font-bold">Trade.ai</Text>
        </View>
        <TouchableOpacity onPress={skipOnboarding}>
          <Text className="text-primary-500 font-medium">Pular</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        className="flex-1"
      >
        {onboardingSteps.map((step, index) => (
          <View key={step.id} style={{ width }} className="flex-1 px-6">
            <View className="flex-1 justify-center items-center">
              {/* Animation */}
              <View className="w-64 h-64 mb-8">
                <LottieView
                  ref={animationRef}
                  source={step.animation}
                  autoPlay
                  loop
                  style={{ width: '100%', height: '100%' }}
                />
              </View>

              {/* Content */}
              <View className="items-center">
                <View className="w-16 h-16 bg-primary-500 rounded-full items-center justify-center mb-4">
                  <Ionicons name={step.icon} size={32} color="white" />
                </View>
                
                <Text className="text-text-primary text-2xl font-bold text-center mb-4">
                  {step.title}
                </Text>
                
                <Text className="text-text-secondary text-lg text-center leading-6 px-4">
                  {step.description}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Footer */}
      <View className="px-6 pb-8">
        {/* Progress Dots */}
        <View className="flex-row justify-center mb-8">
          {onboardingSteps.map((_, index) => (
            <View
              key={index}
              className={`w-3 h-3 rounded-full mx-1 ${
                index === currentStep ? 'bg-primary-500' : 'bg-surface-secondary'
              }`}
            />
          ))}
        </View>

        {/* Navigation Buttons */}
        <View className="flex-row justify-between items-center">
          <TouchableOpacity
            onPress={prevStep}
            className={`px-6 py-3 rounded-lg ${
              currentStep === 0 ? 'opacity-0' : 'opacity-100'
            }`}
            disabled={currentStep === 0}
          >
            <Text className="text-primary-500 font-medium">Anterior</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={nextStep}
            className="bg-primary-500 px-8 py-3 rounded-lg"
          >
            <Text className="text-white font-medium">
              {currentStep === onboardingSteps.length - 1 ? 'Começar' : 'Próximo'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
