import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';
import { Session, User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      setIsLoading(false);
    });

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Proteção de rotas
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === 'onboarding';

    if (!user && !inAuthGroup && !inOnboardingGroup) {
      // Usuário não autenticado, redirecionar para auth
      router.replace('/auth');
    } else if (user && inAuthGroup) {
      // Usuário autenticado, redirecionar para home
      router.replace('/(tabs)');
    }
  }, [user, segments, isLoading]);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erro ao buscar perfil:', error);
        return;
      }

      setUser(data);
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Aplicar bônus diário
      await claimDailyBonus();
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (signUpError) throw signUpError;

      // Criar perfil do usuário
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: user.id,
              email: user.email!,
              name,
            },
          ]);

        if (profileError) throw profileError;

        // Inicializar saldo
        await initializeBalance(user.id);
      }
    } catch (error) {
      console.error('Erro no cadastro:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Erro no logout:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'trade-ai://auth/callback',
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error('Erro no login com Google:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'trade-ai://auth/reset-password',
      });

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      // Atualizar estado local
      setUser(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw error;
    }
  };

  const claimDailyBonus = async () => {
    try {
      if (!user) return;

      const { error } = await supabase.rpc('claim_daily_bonus', {
        user_id: user.id,
      });

      if (error) {
        console.error('Erro ao aplicar bônus diário:', error);
      }
    } catch (error) {
      console.error('Erro ao aplicar bônus diário:', error);
    }
  };

  const initializeBalance = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('balances')
        .insert([
          {
            user_id: userId,
            amount: 10000, // Saldo inicial de $10.000
            currency: 'USD',
          },
        ]);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao inicializar saldo:', error);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    resetPassword,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
