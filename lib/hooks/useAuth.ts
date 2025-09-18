import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserData {
  email: string;
  password: string;
  acceptedTerms: boolean;
  loginDate: string;
}

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [forceUpdate, setForceUpdate] = useState(0);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const [loginStatus, userDataString] = await Promise.all([
        AsyncStorage.getItem('isLoggedIn'),
        AsyncStorage.getItem('userData'),
      ]);

      if (loginStatus === 'true' && userDataString) {
        setIsLoggedIn(true);
        setUserData(JSON.parse(userDataString));
      } else {
        setIsLoggedIn(false);
        setUserData(null);
      }
    } catch (error) {
      console.error('Erro ao verificar status de autenticação:', error);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('useAuth: Iniciando login...', { email, password });
      
      const userData: UserData = {
        email,
        password,
        acceptedTerms: true,
        loginDate: new Date().toISOString(),
      };

      console.log('useAuth: Salvando dados no AsyncStorage...');
      await Promise.all([
        AsyncStorage.setItem('isLoggedIn', 'true'),
        AsyncStorage.setItem('userData', JSON.stringify(userData)),
      ]);

      console.log('useAuth: Dados salvos, atualizando estado...');
      setIsLoggedIn(true);
      setUserData(userData);
      console.log('useAuth: Login concluído com sucesso!');
      
      // Forçar re-render após um pequeno delay
      setTimeout(() => {
        console.log('useAuth: Forçando re-render...');
        setForceUpdate(prev => prev + 1);
        checkAuthStatus();
      }, 100);
    } catch (error) {
      console.error('useAuth: Erro ao fazer login:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem('isLoggedIn'),
        AsyncStorage.removeItem('userData'),
      ]);

      setIsLoggedIn(false);
      setUserData(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return {
    isLoggedIn,
    userData,
    isLoading,
    login,
    logout,
    checkAuthStatus,
    forceUpdate,
  };
}
