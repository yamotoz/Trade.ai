# Trade.ai 📈

Aplicativo mobile para iniciantes e intermediários em trading, com simulação realista, dados de mercado em tempo real, notícias e conteúdos de estudo.

## 🚀 Características

- **Simulador de Trading**: Pratique com $10.000 virtuais e receba $250 diários de bônus
- **Dados em Tempo Real**: Criptomoedas, Forex e Ações via APIs profissionais
- **Gráficos TradingView**: Análise técnica completa com indicadores profissionais
- **Biblioteca de Estudos**: Conteúdos organizados por nível e categoria
- **Feed de Notícias**: Atualizações do mercado em tempo real
- **Design Dark Moderno**: Interface elegante e intuitiva
- **Autenticação Segura**: Supabase Auth com Google OAuth

## 🛠️ Stack Tecnológica

- **Frontend**: React Native + Expo SDK 54
- **Navegação**: Expo Router (tabs + stacks)
- **UI**: NativeWind (Tailwind CSS para RN)
- **Estado**: Zustand + TanStack React Query
- **Backend**: Supabase (Auth + PostgreSQL + Storage)
- **Gráficos**: TradingView WebView + Victory Native
- **Formulários**: React Hook Form + Zod
- **Anúncios**: Google AdMob
- **Testes**: Jest + React Native Testing Library

## 📱 Telas Principais

- **Home**: Dashboard com preview de ativos e estatísticas
- **Ativos**: Lista pesquisável com filtros por tipo
- **Operação**: Simulador de trading com gráficos completos
- **Notícias**: Feed paginado com categorias
- **Estudos**: Biblioteca de conteúdos educativos
- **Perfil**: Estatísticas e configurações do usuário

## 🚀 Instalação

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Expo CLI
- iOS Simulator ou Android Emulator

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/trade-ai.git
cd trade-ai
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo `env.example` para `.env` e preencha com suas credenciais:

```bash
cp env.example .env
```

Configure as seguintes variáveis:

```env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=sua_url_supabase
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_supabase

# AdMob
EXPO_PUBLIC_ADMOB_APP_ID=seu_app_id_admob
EXPO_PUBLIC_ADMOB_BANNER_ID=seu_banner_id
EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID=seu_interstitial_id

# APIs de Mercado
EXPO_PUBLIC_BINANCE_API_KEY=sua_chave_binance
EXPO_PUBLIC_ALPHA_VANTAGE_API_KEY=sua_chave_alpha_vantage
EXPO_PUBLIC_POLYGON_API_KEY=sua_chave_polygon
```

### 4. Configure o Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute o SQL do arquivo `db/schema.sql` no SQL Editor
3. Configure as políticas RLS (Row Level Security)
4. Configure o OAuth do Google no Authentication > Providers

### 5. Execute o projeto

```bash
# Desenvolvimento
npm start

# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

- **profiles**: Perfis dos usuários
- **balances**: Saldos dos usuários
- **daily_bonuses**: Bônus diários
- **trades**: Operações de trading
- **assets**: Catálogo de ativos
- **news**: Notícias do mercado
- **studies**: Conteúdos educativos
- **favorites**: Ativos favoritos

### Funções RPC

- **claim_daily_bonus**: Aplicar bônus diário
- **user_stats**: Estatísticas do usuário

## 🎨 Design System

### Cores

- **Primária**: Azul escuro (#3b82f6)
- **Fundo**: Preto (#000000)
- **Superfície**: Cinza escuro (#111111)
- **Texto**: Branco (#ffffff)
- **Acentos**: Verde, Rosa, Amarelo, Vermelho

### Tipografia

- **Família**: Inter (sans), Poppins (display)
- **Tamanhos**: 12px, 14px, 16px, 18px, 20px, 24px, 32px

### Componentes

- Botões arredondados com variantes
- Inputs elegantes com validação
- Cards com sombras suaves
- Modais e overlays

## 📊 APIs de Mercado

### Criptomoedas
- **Binance**: WebSocket + REST para preços em tempo real
- **Endpoints**: getQuote, getOHLCV, streamPrices

### Forex
- **Alpha Vantage**: Dados de câmbio
- **Twelve Data**: Alternativa premium

### Ações
- **Yahoo Finance**: Dados básicos
- **Polygon.io**: Dados avançados e históricos

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Executar com coverage
npm run test:coverage

# Executar testes específicos
npm test -- --testNamePattern="Button"
```

## 📦 Scripts Disponíveis

```bash
npm start          # Iniciar servidor de desenvolvimento
npm run ios        # Executar no iOS Simulator
npm run android    # Executar no Android Emulator
npm run web        # Executar no navegador
npm run build      # Build de produção
npm run lint       # Verificar código
npm run lint:fix   # Corrigir problemas de lint
npm run format     # Formatar código
npm run type-check # Verificar tipos TypeScript
```

## 🔧 Configurações

### ESLint
- Regras para React Native e TypeScript
- Integração com Prettier
- Hooks de pre-commit via Husky

### Prettier
- Formatação consistente
- Integração com ESLint
- Configuração para React Native

### Metro
- Suporte a SVG
- NativeWind
- Otimizações para produção

## 📱 Build e Deploy

### Android

```bash
eas build --platform android
```

### iOS

```bash
eas build --platform ios
```

### Web

```bash
eas build --platform web
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🆘 Suporte

- **Issues**: [GitHub Issues](https://github.com/seu-usuario/trade-ai/issues)
- **Documentação**: [Wiki do Projeto](https://github.com/seu-usuario/trade-ai/wiki)
- **Email**: suporte@tradeai.com

## 🙏 Agradecimentos

- [Expo](https://expo.dev) pela plataforma incrível
- [Supabase](https://supabase.com) pelo backend robusto
- [TradingView](https://tradingview.com) pelos gráficos profissionais
- [NativeWind](https://nativewind.dev) pelo sistema de design

---

**Trade.ai** - Aprenda trading de forma inteligente e segura! 🚀
