import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme';
import { useAuth } from '@/lib/auth';

export default function TabLayout() {
  const { colors } = useTheme();
  const { user } = useAuth();

  if (!user) {
    return null; // Redirecionar para auth se não estiver logado
  }

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.surface.primary,
          borderTopColor: colors.surface.secondary,
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarActiveTintColor: colors.primary[500],
        tabBarInactiveTintColor: colors.text.tertiary,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="assets"
        options={{
          title: 'Ativos',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trending-up" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="trade"
        options={{
          title: 'Operação',
          tabBarIcon: ({ color, size }) => (
            <Ionicons 
              name="swap-horizontal" 
              size={size + 4} 
              color={color} 
            />
          ),
          tabBarButton: (props) => (
            <div className="flex-1 items-center justify-center">
              <div className="w-16 h-16 bg-primary-500 rounded-full items-center justify-center shadow-lg">
                <Ionicons 
                  name="swap-horizontal" 
                  size={28} 
                  color="white" 
                />
              </div>
            </div>
          ),
        }}
      />
      <Tabs.Screen
        name="news"
        options={{
          title: 'Notícias',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="newspaper" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="study"
        options={{
          title: 'Estudos',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="library" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
