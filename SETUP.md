# 🚀 Guia de Setup - Trade.ai

Este guia te ajudará a configurar e executar o projeto Trade.ai em sua máquina local.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** ou **yarn** (vem com Node.js)
- **Git** ([Download](https://git-scm.com/))
- **Expo CLI** (`npm install -g @expo/cli`)

### Para desenvolvimento mobile:
- **iOS**: Xcode (Mac) ou iOS Simulator
- **Android**: Android Studio + Android Emulator
- **Web**: Qualquer navegador moderno

## 🔧 Configuração Inicial

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/trade-ai.git
cd trade-ai
```

### 2. Instale as dependências

```bash
npm install
```

**⚠️ Nota**: Se encontrar erros de dependências, tente:
```bash
npm install --legacy-peer-deps
# ou
yarn install
```

### 3. Configure as variáveis de ambiente

```bash
# Copie o arquivo de exemplo
cp env.example .env

# Edite o arquivo .env com suas credenciais
nano .env  # ou use seu editor preferido
```

## 🔑 Configuração das APIs

### Supabase (Backend)

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Crie um novo projeto
3. Vá para **Settings > API** e copie:
   - **Project URL** → `EXPO_PUBLIC_SUPABASE_URL`
   - **anon public** → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

4. Execute o schema do banco:
   - Vá para **SQL Editor**
   - Cole o conteúdo de `db/schema.sql`
   - Execute o script

5. Configure OAuth do Google:
   - **Authentication > Providers > Google**
   - Adicione suas credenciais OAuth

### Google AdMob (Anúncios)

1. Acesse [admob.google.com](https://admob.google.com)
2. Crie um app e obtenha:
   - **App ID** → `EXPO_PUBLIC_ADMOB_APP_ID`
   - **Banner Ad Unit ID** → `EXPO_PUBLIC_ADMOB_BANNER_ID`
   - **Interstitial Ad Unit ID** → `EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID`

### APIs de Mercado (Opcional)

#### Binance (Criptomoedas)
1. Crie conta em [binance.com](https://binance.com)
2. Vá para **API Management**
3. Crie nova API key → `EXPO_PUBLIC_BINANCE_API_KEY`

#### Alpha Vantage (Forex)
1. Registre-se em [alphavantage.co](https://alphavantage.co)
2. Obtenha API key gratuita → `EXPO_PUBLIC_ALPHA_VANTAGE_API_KEY`

#### Polygon.io (Ações)
1. Crie conta em [polygon.io](https://polygon.io)
2. Obtenha API key → `EXPO_PUBLIC_POLYGON_API_KEY`

## 🚀 Executando o Projeto

### Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
npm start

# Ou usar comandos específicos
npm run ios      # iOS Simulator
npm run android  # Android Emulator
npm run web      # Navegador
```

### Build de Produção

```bash
# Instalar EAS CLI
npm install -g @expo/eas-cli

# Fazer login na sua conta Expo
eas login

# Configurar build
eas build:configure

# Build para Android
eas build --platform android

# Build para iOS
eas build --platform ios
```

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Executar com coverage
npm run test:coverage

# Executar testes específicos
npm test -- --testNamePattern="Button"
```

## 🔍 Verificação de Qualidade

```bash
# Verificar código
npm run lint

# Corrigir problemas automaticamente
npm run lint:fix

# Formatar código
npm run format

# Verificar tipos TypeScript
npm run type-check
```

## 📱 Estrutura do Projeto

```
trade-ai/
├── app/                    # Telas e navegação (Expo Router)
│   ├── (tabs)/           # Navegação por tabs
│   ├── auth.tsx          # Autenticação
│   └── onboarding.tsx    # Onboarding
├── components/            # Componentes reutilizáveis
│   ├── ui/               # Componentes base (Button, Input)
│   ├── charts/           # Componentes de gráficos
│   ├── market/           # Componentes de mercado
│   └── ads/              # Componentes de anúncios
├── lib/                   # Bibliotecas e configurações
│   ├── supabase.ts       # Cliente Supabase
│   ├── auth.tsx          # Provider de autenticação
│   └── theme.tsx         # Provider de tema
├── db/                    # Schema do banco
│   └── schema.sql        # SQL completo
├── assets/                # Imagens, ícones, animações
└── docs/                  # Documentação adicional
```

## 🐛 Solução de Problemas

### Erro de dependências

```bash
# Limpar cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Erro de Metro bundler

```bash
# Limpar cache do Metro
npx expo start --clear
```

### Erro de TypeScript

```bash
# Verificar tipos
npm run type-check

# Reinstalar tipos
npm install --save-dev @types/react @types/react-native
```

### Erro de NativeWind

```bash
# Verificar configuração
npx tailwindcss --help

# Reinstalar NativeWind
npm uninstall nativewind
npm install nativewind@latest
```

## 📚 Recursos Adicionais

- [Documentação do Expo](https://docs.expo.dev/)
- [Documentação do Supabase](https://supabase.com/docs)
- [Documentação do NativeWind](https://nativewind.dev/)
- [Documentação do React Query](https://tanstack.com/query/latest)

## 🤝 Suporte

Se encontrar problemas:

1. Verifique se todas as variáveis de ambiente estão configuradas
2. Consulte os logs de erro no terminal
3. Verifique se todas as dependências foram instaladas
4. Abra uma issue no GitHub com detalhes do erro

## 🎯 Próximos Passos

Após configurar o projeto:

1. **Teste a autenticação**: Crie uma conta e faça login
2. **Verifique o banco**: Confirme se as tabelas foram criadas
3. **Teste as APIs**: Verifique se os dados estão sendo carregados
4. **Personalize**: Ajuste cores, logos e configurações
5. **Deploy**: Faça build e publique nas lojas

---

**Boa sorte com o Trade.ai! 🚀📈**
