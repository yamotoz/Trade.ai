import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme';
import { TermsModal } from './TermsModal';
import { useAuth } from '@/lib/hooks/useAuth';

const { width, height } = Dimensions.get('window');

export function LoginScreen() {
  const { colors } = useTheme();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<Video>(null);

  const handleLogin = async () => {
    console.log('Tentando fazer login...', { email, password, acceptedTerms });
    
    if (!email.trim() || !password.trim()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    if (!acceptedTerms) {
      Alert.alert('Erro', 'Você deve aceitar os Termos e Condições para continuar');
      return;
    }

    setIsLoading(true);
    console.log('Iniciando processo de login...');

    try {
      console.log('Chamando função login...');
      await login(email.trim(), password.trim());
      console.log('Login realizado com sucesso!');
      setIsLoading(false);
    } catch (error) {
      console.error('Erro no login:', error);
      setIsLoading(false);
      Alert.alert('Erro', 'Erro ao fazer login. Tente novamente.');
    }
  };

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
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 24,
      zIndex: 1,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: 48,
    },
    logo: {
      fontSize: 48,
      fontWeight: 'bold',
      color: '#ffffff',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: '#ffffff',
      opacity: 0.8,
      textAlign: 'center',
    },
    form: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 16,
      padding: 24,
      backdropFilter: 'blur(10px)',
    },
    inputContainer: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      color: '#ffffff',
      marginBottom: 8,
      fontWeight: '500',
    },
    input: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: '#ffffff',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    passwordContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    passwordInput: {
      flex: 1,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: '#ffffff',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    eyeButton: {
      position: 'absolute',
      right: 16,
      padding: 4,
    },
    termsContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 24,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: '#ffffff',
      marginRight: 12,
      marginTop: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxChecked: {
      backgroundColor: colors.primary[500],
      borderColor: colors.primary[500],
    },
    termsText: {
      flex: 1,
      fontSize: 14,
      color: '#ffffff',
      lineHeight: 20,
    },
    termsLink: {
      textDecorationLine: 'underline',
      color: colors.primary[500],
    },
    loginButton: {
      backgroundColor: colors.primary[500],
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    },
    loginButtonDisabled: {
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    loginButtonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#ffffff',
      marginLeft: 8,
    },
    loadingText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#ffffff',
    },
  });

  return (
    <View style={styles.container}>
      {/* Vídeo de fundo */}
      <View style={styles.videoContainer}>
        <Video
          ref={videoRef}
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
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>Trade.ai</Text>
            <Text style={styles.subtitle}>
              Sua plataforma de análise de mercado
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>E-mail</Text>
              <TextInput
                style={styles.input}
                placeholder="Digite seu e-mail"
                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Senha</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Digite sua senha"
                  placeholderTextColor="rgba(255, 255, 255, 0.6)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.termsContainer}>
              <TouchableOpacity
                style={[
                  styles.checkbox,
                  acceptedTerms && styles.checkboxChecked,
                ]}
                onPress={() => setAcceptedTerms(!acceptedTerms)}
              >
                {acceptedTerms && (
                  <Ionicons name="checkmark" size={14} color="#ffffff" />
                )}
              </TouchableOpacity>
              <Text style={styles.termsText}>
                Eu aceito os{' '}
                <Text
                  style={styles.termsLink}
                  onPress={() => setShowTerms(true)}
                >
                  Termos e Condições de Uso
                </Text>
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.loginButton,
                (!acceptedTerms || isLoading) && styles.loginButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={!acceptedTerms || isLoading}
            >
              {isLoading ? (
                <Text style={styles.loadingText}>Entrando...</Text>
              ) : (
                <>
                  <Ionicons name="log-in" size={20} color="#ffffff" />
                  <Text style={styles.loginButtonText}>Entrar</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <TermsModal
        visible={showTerms}
        onClose={() => setShowTerms(false)}
        onAccept={() => {
          setAcceptedTerms(true);
          setShowTerms(false);
        }}
      />
    </View>
  );
}
