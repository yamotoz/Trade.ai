import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import { useTheme } from '@/lib/theme';
import { Text } from 'react-native';

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#000000', // Fundo preto total
          borderTopColor: '#000000', // Borda superior também preta
          borderTopWidth: 0,
          height: 110, // Aumentado para 100 para dar ainda mais espaço
          paddingBottom: 45, // Aumentado para 30 para melhor posicionamento
          paddingTop: 15
          
          , // Aumentado para 15 para melhor distribuição
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
        name="operation"
        options={{
          title: '',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ 
              width: 56,
              height: 56,
              backgroundColor: focused ? colors.primary[500] : 'transparent',
              borderRadius: 28,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: focused ? colors.primary[500] : colors.primary[500],
            }}>
              <Ionicons 
                name="swap-horizontal"
                size={24}
                color={focused ? '#ffffff' : colors.primary[500]}
              />
            </View>
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
            <Ionicons name="book" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
