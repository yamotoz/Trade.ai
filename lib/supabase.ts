import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Tipos para as tabelas do banco
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          avatar_url?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          avatar_url?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          avatar_url?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      balances: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          currency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      daily_bonuses: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          claimed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          claimed_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          claimed_at?: string;
        };
      };
      trades: {
        Row: {
          id: string;
          user_id: string;
          asset_id: string;
          asset_symbol: string;
          side: 'buy' | 'sell';
          quantity: number;
          price: number;
          stop_loss?: number;
          take_profit?: number;
          status: 'open' | 'closed';
          pnl?: number;
          opened_at: string;
          closed_at?: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          asset_id: string;
          asset_symbol: string;
          side: 'buy' | 'sell';
          quantity: number;
          price: number;
          stop_loss?: number;
          take_profit?: number;
          status?: 'open' | 'closed';
          pnl?: number;
          opened_at?: string;
          closed_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          asset_id?: string;
          asset_symbol?: string;
          side?: 'buy' | 'sell';
          quantity?: number;
          price?: number;
          stop_loss?: number;
          take_profit?: number;
          status?: 'open' | 'closed';
          pnl?: number;
          opened_at?: string;
          closed_at?: string;
        };
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          asset_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          asset_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          asset_id?: string;
          created_at?: string;
        };
      };
      assets: {
        Row: {
          id: string;
          symbol: string;
          name: string;
          type: 'crypto' | 'forex' | 'stock';
          exchange: string;
          current_price: number;
          change_percent: number;
          volume_24h?: number;
          market_cap?: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          symbol: string;
          name: string;
          type: 'crypto' | 'forex' | 'stock';
          exchange: string;
          current_price: number;
          change_percent: number;
          volume_24h?: number;
          market_cap?: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          symbol?: string;
          name?: string;
          type?: 'crypto' | 'forex' | 'stock';
          exchange?: string;
          current_price?: number;
          change_percent?: number;
          volume_24h?: number;
          market_cap?: number;
          updated_at?: string;
        };
      };
      news: {
        Row: {
          id: string;
          title: string;
          content: string;
          summary: string;
          source: string;
          url: string;
          image_url?: string;
          category: string;
          published_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          summary: string;
          source: string;
          url: string;
          image_url?: string;
          category: string;
          published_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          summary?: string;
          source?: string;
          url?: string;
          image_url?: string;
          category?: string;
          published_at?: string;
          created_at?: string;
        };
      };
      studies: {
        Row: {
          id: string;
          title: string;
          content: string;
          summary: string;
          level: 'beginner' | 'intermediate' | 'advanced';
          category: string;
          tags: string[];
          estimated_time: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          summary: string;
          level: 'beginner' | 'intermediate' | 'advanced';
          category: string;
          tags: string[];
          estimated_time: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          summary?: string;
          level?: 'beginner' | 'intermediate' | 'advanced';
          category?: string;
          tags?: string[];
          estimated_time?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      study_progress: {
        Row: {
          id: string;
          user_id: string;
          study_id: string;
          progress: number;
          completed_at?: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          study_id: string;
          progress: number;
          completed_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          study_id?: string;
          progress?: number;
          completed_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      claim_daily_bonus: {
        Args: {
          user_id: string;
        };
        Returns: {
          success: boolean;
          message: string;
          bonus_amount: number;
        };
      };
      user_stats: {
        Args: {
          user_id: string;
        };
        Returns: {
          total_trades: number;
          winning_trades: number;
          losing_trades: number;
          win_rate: number;
          total_pnl: number;
          average_pnl: number;
          best_trade: number;
          worst_trade: number;
        };
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
