-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE asset_type AS ENUM ('crypto', 'forex', 'stock');
CREATE TYPE trade_side AS ENUM ('buy', 'sell');
CREATE TYPE trade_status AS ENUM ('open', 'closed');
CREATE TYPE study_level AS ENUM ('beginner', 'intermediate', 'advanced');

-- Profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Balances table
CREATE TABLE balances (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(15,2) NOT NULL DEFAULT 10000.00,
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, currency)
);

-- Daily bonuses table
CREATE TABLE daily_bonuses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL DEFAULT 250.00,
  claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, DATE(claimed_at))
);

-- Assets table
CREATE TABLE assets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  symbol TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type asset_type NOT NULL,
  exchange TEXT NOT NULL,
  current_price DECIMAL(15,6) NOT NULL,
  change_percent DECIMAL(8,4) NOT NULL DEFAULT 0.0000,
  volume_24h DECIMAL(20,2),
  market_cap DECIMAL(20,2),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trades table
CREATE TABLE trades (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE NOT NULL,
  asset_symbol TEXT NOT NULL,
  side trade_side NOT NULL,
  quantity DECIMAL(15,6) NOT NULL,
  price DECIMAL(15,6) NOT NULL,
  stop_loss DECIMAL(15,6),
  take_profit DECIMAL(15,6),
  status trade_status NOT NULL DEFAULT 'open',
  pnl DECIMAL(15,2),
  opened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  closed_at TIMESTAMP WITH TIME ZONE
);

-- Favorites table
CREATE TABLE favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, asset_id)
);

-- News table
CREATE TABLE news (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT NOT NULL,
  source TEXT NOT NULL,
  url TEXT NOT NULL,
  image_url TEXT,
  category TEXT NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Studies table
CREATE TABLE studies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT NOT NULL,
  level study_level NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  estimated_time INTEGER NOT NULL DEFAULT 10, -- in minutes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study progress table
CREATE TABLE study_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  study_id UUID REFERENCES studies(id) ON DELETE CASCADE NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, study_id)
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_balances_user_id ON balances(user_id);
CREATE INDEX idx_daily_bonuses_user_date ON daily_bonuses(user_id, DATE(claimed_at));
CREATE INDEX idx_assets_symbol ON assets(symbol);
CREATE INDEX idx_assets_type ON assets(type);
CREATE INDEX idx_trades_user_id ON trades(user_id);
CREATE INDEX idx_trades_asset_id ON trades(asset_id);
CREATE INDEX idx_trades_status ON trades(status);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_news_category ON news(category);
CREATE INDEX idx_news_published_at ON news(published_at);
CREATE INDEX idx_studies_level ON studies(level);
CREATE INDEX idx_studies_category ON studies(category);
CREATE INDEX idx_study_progress_user_id ON study_progress(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_bonuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_progress ENABLE ROW LEVEL SECURITY;

-- Assets and news are public (read-only)
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE studies ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: users can only access their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Balances: users can only access their own balance
CREATE POLICY "Users can view own balance" ON balances
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own balance" ON balances
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own balance" ON balances
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Daily bonuses: users can only access their own bonuses
CREATE POLICY "Users can view own daily bonuses" ON daily_bonuses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily bonus" ON daily_bonuses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trades: users can only access their own trades
CREATE POLICY "Users can view own trades" ON trades
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trades" ON trades
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trades" ON trades
  FOR UPDATE USING (auth.uid() = user_id);

-- Favorites: users can only access their own favorites
CREATE POLICY "Users can view own favorites" ON favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Study progress: users can only access their own progress
CREATE POLICY "Users can view own study progress" ON study_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own study progress" ON study_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own study progress" ON study_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Assets: public read access
CREATE POLICY "Public read access to assets" ON assets
  FOR SELECT USING (true);

-- News: public read access
CREATE POLICY "Public read access to news" ON news
  FOR SELECT USING (true);

-- Studies: public read access
CREATE POLICY "Public read access to studies" ON studies
  FOR SELECT USING (true);

-- Functions

-- Function to claim daily bonus
CREATE OR REPLACE FUNCTION claim_daily_bonus(user_id UUID)
RETURNS JSON AS $$
DECLARE
  bonus_amount DECIMAL(10,2) := 250.00;
  already_claimed BOOLEAN;
  result JSON;
BEGIN
  -- Check if user already claimed bonus today
  SELECT EXISTS(
    SELECT 1 FROM daily_bonuses 
    WHERE daily_bonuses.user_id = claim_daily_bonus.user_id 
    AND DATE(claimed_at) = CURRENT_DATE
  ) INTO already_claimed;
  
  IF already_claimed THEN
    result := json_build_object(
      'success', false,
      'message', 'Bônus diário já foi reclamado hoje',
      'bonus_amount', 0
    );
  ELSE
    -- Insert daily bonus record
    INSERT INTO daily_bonuses (user_id, amount)
    VALUES (claim_daily_bonus.user_id, bonus_amount);
    
    -- Update user balance
    UPDATE balances 
    SET amount = amount + bonus_amount,
        updated_at = NOW()
    WHERE balances.user_id = claim_daily_bonus.user_id;
    
    result := json_build_object(
      'success', true,
      'message', 'Bônus diário aplicado com sucesso',
      'bonus_amount', bonus_amount
    );
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user statistics
CREATE OR REPLACE FUNCTION user_stats(user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_trades', COALESCE(total_trades, 0),
    'winning_trades', COALESCE(winning_trades, 0),
    'losing_trades', COALESCE(losing_trades, 0),
    'win_rate', COALESCE(win_rate, 0),
    'total_pnl', COALESCE(total_pnl, 0),
    'average_pnl', COALESCE(average_pnl, 0),
    'best_trade', COALESCE(best_trade, 0),
    'worst_trade', COALESCE(worst_trade, 0)
  ) INTO result
  FROM (
    SELECT
      COUNT(*) as total_trades,
      COUNT(CASE WHEN pnl > 0 THEN 1 END) as winning_trades,
      COUNT(CASE WHEN pnl < 0 THEN 1 END) as losing_trades,
      CASE 
        WHEN COUNT(*) > 0 THEN 
          ROUND((COUNT(CASE WHEN pnl > 0 THEN 1 END)::DECIMAL / COUNT(*)) * 100, 2)
        ELSE 0 
      END as win_rate,
      COALESCE(SUM(pnl), 0) as total_pnl,
      COALESCE(AVG(pnl), 0) as average_pnl,
      COALESCE(MAX(pnl), 0) as best_trade,
      COALESCE(MIN(pnl), 0) as worst_trade
    FROM trades 
    WHERE trades.user_id = user_stats.user_id 
    AND status = 'closed'
  ) stats;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_balances_updated_at 
  BEFORE UPDATE ON balances 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trades_updated_at 
  BEFORE UPDATE ON trades 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_studies_updated_at 
  BEFORE UPDATE ON studies 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_progress_updated_at 
  BEFORE UPDATE ON study_progress 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data

-- Sample assets
INSERT INTO assets (symbol, name, type, exchange, current_price, change_percent, volume_24h, market_cap) VALUES
('BTC', 'Bitcoin', 'crypto', 'Binance', 45000.00, 2.5, 25000000000, 850000000000),
('ETH', 'Ethereum', 'crypto', 'Binance', 3200.00, 1.8, 15000000000, 380000000000),
('EUR/USD', 'Euro / US Dollar', 'forex', 'FXCM', 1.0850, -0.2, NULL, NULL),
('GBP/USD', 'British Pound / US Dollar', 'forex', 'FXCM', 1.2650, 0.1, NULL, NULL),
('AAPL', 'Apple Inc.', 'stock', 'NASDAQ', 175.50, 1.2, 5000000000, 2750000000000),
('GOOGL', 'Alphabet Inc.', 'stock', 'NASDAQ', 140.25, -0.8, 3000000000, 1800000000000);

-- Sample studies
INSERT INTO studies (title, content, summary, level, category, tags, estimated_time) VALUES
('Introdução ao Trading', 'Conteúdo completo sobre os fundamentos do trading...', 'Aprenda os conceitos básicos do mercado financeiro', 'beginner', 'fundamental', ARRAY['básico', 'introdução'], 15),
('Análise Técnica Básica', 'Guia completo sobre análise técnica...', 'Entenda gráficos, tendências e indicadores básicos', 'beginner', 'technical', ARRAY['gráficos', 'tendências'], 20),
('Gestão de Risco', 'Estratégias para proteger seu capital...', 'Aprenda a gerenciar riscos de forma eficiente', 'intermediate', 'risk', ARRAY['risco', 'capital'], 25),
('Estratégias Avançadas', 'Técnicas profissionais de trading...', 'Domine estratégias avançadas para traders experientes', 'advanced', 'strategy', ARRAY['avançado', 'profissional'], 30);

-- Sample news
INSERT INTO news (title, content, summary, source, url, category, published_at) VALUES
('Bitcoin atinge nova máxima do ano', 'O Bitcoin superou a marca de $45.000...', 'Criptomoeda registra forte alta e atrai novos investidores', 'CoinDesk', 'https://coindesk.com/bitcoin-high', 'crypto', NOW() - INTERVAL '2 hours'),
('Fed mantém juros estáveis', 'O Federal Reserve decidiu manter...', 'Decisão do Fed impacta mercados globais', 'Reuters', 'https://reuters.com/fed-rates', 'economy', NOW() - INTERVAL '4 hours'),
('Apple anuncia novos produtos', 'A Apple revelou sua nova linha...', 'Empresa tecnológica apresenta inovações', 'Bloomberg', 'https://bloomberg.com/apple-announcement', 'stock', NOW() - INTERVAL '6 hours');
