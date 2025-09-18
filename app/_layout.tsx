import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from '@/lib/theme';
import { Toaster } from '@/components/ui/Toaster';
import { useAuth } from '@/lib/hooks/useAuth';
import { LoginScreen } from '@/components/auth/LoginScreen';
import { SplashScreen } from '@/components/auth/SplashScreen';


// Configuração do React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      gcTime: 1000 * 60 * 60 * 24, // 24 horas
    },
  },
});

function AppContent() {
  const { isLoggedIn, isLoading, forceUpdate } = useAuth();

  console.log('AppContent: Estado atual:', { isLoggedIn, isLoading, forceUpdate });

  if (isLoading) {
    console.log('AppContent: Mostrando SplashScreen');
    return <SplashScreen />;
  }

  if (!isLoggedIn) {
    console.log('AppContent: Mostrando LoginScreen');
    return <LoginScreen />;
  }

  console.log('AppContent: Mostrando aplicativo principal');
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#000000' },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <SafeAreaProvider>
            <AppContent />
            <StatusBar style="light" />
            <Toaster />
          </SafeAreaProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
