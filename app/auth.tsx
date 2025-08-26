import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string(),
  isAdult: z.boolean().refine(val => val === true, 'Você deve ser maior de 18 anos'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export default function AuthScreen() {
  const { colors } = useTheme();
  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      isAdult: false,
    },
  });

  const onLogin = async (data: LoginForm) => {
    try {
      setIsLoading(true);
      await signIn(data.email, data.password);
    } catch (error) {
      Alert.alert('Erro', 'Email ou senha incorretos');
    } finally {
      setIsLoading(false);
    }
  };

  const onRegister = async (data: RegisterForm) => {
    try {
      setIsLoading(true);
      await signUp(data.name, data.email, data.password);
      Alert.alert('Sucesso', 'Conta criada com sucesso! Verifique seu email.');
    } catch (error) {
      Alert.alert('Erro', 'Erro ao criar conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const onGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
    } catch (error) {
      Alert.alert('Erro', 'Erro ao fazer login com Google');
    } finally {
      setIsLoading(false);
    }
  };

  const onForgotPassword = async (email: string) => {
    try {
      setIsLoading(true);
      await resetPassword(email);
      Alert.alert('Sucesso', 'Email de recuperação enviado!');
      setShowForgotPassword(false);
    } catch (error) {
      Alert.alert('Erro', 'Erro ao enviar email de recuperação');
    } finally {
      setIsLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
        <View className="flex-1 justify-center px-6">
          <TouchableOpacity
            onPress={() => setShowForgotPassword(false)}
            className="absolute top-16 left-6"
          >
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>

          <Text className="text-text-primary text-2xl font-bold text-center mb-8">
            Recuperar Senha
          </Text>

          <Text className="text-text-secondary text-center mb-6">
            Digite seu email para receber um link de recuperação
          </Text>

          <Controller
            control={loginForm.control}
            name="email"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <Input
                placeholder="Email"
                value={value}
                onChangeText={onChange}
                error={error?.message}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            )}
          />

          <Button
            title="Enviar Email"
            onPress={() => onForgotPassword(loginForm.getValues('email'))}
            loading={isLoading}
            className="mt-6"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-center px-6">
          {/* Logo */}
          <View className="items-center mb-12">
            <View className="w-20 h-20 bg-primary-500 rounded-full items-center justify-center mb-4">
              <Ionicons name="trending-up" size={40} color="white" />
            </View>
            <Text className="text-text-primary text-3xl font-bold">Trade.ai</Text>
            <Text className="text-text-tertiary text-center mt-2">
              Aprenda trading com simulação realista
            </Text>
          </View>

          {/* Formulário */}
          {isLogin ? (
            // Login Form
            <View>
              <Text className="text-text-primary text-2xl font-bold text-center mb-8">
                Entrar
              </Text>

              <Controller
                control={loginForm.control}
                name="email"
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <Input
                    placeholder="Email"
                    value={value}
                    onChangeText={onChange}
                    error={error?.message}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                )}
              />

              <Controller
                control={loginForm.control}
                name="password"
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <Input
                    placeholder="Senha"
                    value={value}
                    onChangeText={onChange}
                    error={error?.message}
                    secureTextEntry
                  />
                )}
              />

              <TouchableOpacity
                onPress={() => setShowForgotPassword(true)}
                className="self-end mt-2"
              >
                <Text className="text-primary-500 text-sm">Esqueceu a senha?</Text>
              </TouchableOpacity>

              <Button
                title="Entrar"
                onPress={loginForm.handleSubmit(onLogin)}
                loading={isLoading}
                className="mt-6"
              />

              <View className="flex-row items-center my-6">
                <View className="flex-1 h-px bg-surface-secondary" />
                <Text className="mx-4 text-text-tertiary">ou</Text>
                <View className="flex-1 h-px bg-surface-secondary" />
              </View>

              <Button
                title="Continuar com Google"
                onPress={onGoogleSignIn}
                variant="outline"
                icon="logo-google"
                loading={isLoading}
              />

              <View className="flex-row justify-center mt-6">
                <Text className="text-text-tertiary">Não tem uma conta? </Text>
                <TouchableOpacity onPress={() => setIsLogin(false)}>
                  <Text className="text-primary-500 font-medium">Cadastre-se</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            // Register Form
            <View>
              <Text className="text-text-primary text-2xl font-bold text-center mb-8">
                Criar Conta
              </Text>

              <Controller
                control={registerForm.control}
                name="name"
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <Input
                    placeholder="Nome completo"
                    value={value}
                    onChangeText={onChange}
                    error={error?.message}
                  />
                )}
              />

              <Controller
                control={registerForm.control}
                name="email"
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <Input
                    placeholder="Email"
                    value={value}
                    onChangeText={onChange}
                    error={error?.message}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                )}
              />

              <Controller
                control={registerForm.control}
                name="password"
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <Input
                    placeholder="Senha"
                    value={value}
                    onChangeText={onChange}
                    error={error?.message}
                    secureTextEntry
                  />
                )}
              />

              <Controller
                control={registerForm.control}
                name="confirmPassword"
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <Input
                    placeholder="Confirmar senha"
                    value={value}
                    onChangeText={onChange}
                    error={error?.message}
                    secureTextEntry
                  />
                )}
              />

              <View className="flex-row items-center mt-4">
                <TouchableOpacity
                  onPress={() => registerForm.setValue('isAdult', !registerForm.getValues('isAdult'))}
                  className="w-5 h-5 border border-surface-secondary rounded mr-3 items-center justify-center"
                >
                  {registerForm.watch('isAdult') && (
                    <Ionicons name="checkmark" size={16} color={colors.primary[500]} />
                  )}
                </TouchableOpacity>
                <Text className="text-text-secondary text-sm flex-1">
                  Sou maior de 18 anos
                </Text>
              </View>
              {registerForm.formState.errors.isAdult && (
                <Text className="text-accent-red text-xs mt-1 ml-8">
                  {registerForm.formState.errors.isAdult.message}
                </Text>
              )}

              <Button
                title="Criar Conta"
                onPress={registerForm.handleSubmit(onRegister)}
                loading={isLoading}
                className="mt-6"
              />

              <View className="flex-row justify-center mt-6">
                <Text className="text-text-tertiary">Já tem uma conta? </Text>
                <TouchableOpacity onPress={() => setIsLogin(true)}>
                  <Text className="text-primary-500 font-medium">Entrar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
