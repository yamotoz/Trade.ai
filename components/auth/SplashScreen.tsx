import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { useTheme } from '@/lib/theme';

const { width, height } = Dimensions.get('window');

export function SplashScreen() {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#000000',
    },
    videoContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: width,
      height: height,
    },
    video: {
      width: '100%',
      height: '100%',
    },
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1,
    },
    logo: {
      fontSize: 64,
      fontWeight: 'bold',
      color: '#ffffff',
      marginBottom: 16,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 18,
      color: '#ffffff',
      opacity: 0.8,
      textAlign: 'center',
      marginBottom: 40,
    },
    loadingContainer: {
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 16,
      color: '#ffffff',
      opacity: 0.6,
      marginTop: 16,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary[500],
      marginHorizontal: 4,
    },
    dotsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
    },
  });

  return (
    <View style={styles.container}>
      {/* Vídeo de fundo */}
      <View style={styles.videoContainer}>
        <Video
          style={styles.video}
          source={require('@/components/Banner video/bannervideo.mp4')}
          resizeMode={ResizeMode.COVER}
          shouldPlay
          isLooping
          isMuted
        />
      </View>

      {/* Overlay escuro */}
      <View style={styles.overlay} />

      {/* Conteúdo */}
      <View style={styles.content}>
        <Text style={styles.logo}>Trade.ai</Text>
        <Text style={styles.subtitle}>
          Sua plataforma de análise de mercado
        </Text>
        
        <View style={styles.loadingContainer}>
          <View style={styles.dotsContainer}>
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      </View>
    </View>
  );
}
