
import { createClient } from '@supabase/supabase-js';

// Estas variáveis devem ser definidas no arquivo .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://ujtwhqumskbdxmnurfeq.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqdHdocXVtc2tiZHhtbnVyZmVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MzM0MjQsImV4cCI6MjA2MzUwOTQyNH0.lSiSWmYHkfVHk9KSo4NFDuFmWganbuOWm_3uCeUqRWA";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key são necessários. Verifique seu arquivo .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage
  }
});

// Tipos para as tabelas do Supabase
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: 'admin' | 'mensalista' | 'viewer';
          avatar?: string;
          created_at: string;
          is_approved: boolean;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      auth_users: {
        Row: {
          id: string;
          email: string;
          password: string;
          user_id: string;
          reset_token?: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['auth_users']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['auth_users']['Insert']>;
      };
      games: {
        Row: {
          id: string;
          date: string;
          type: 'pelada' | 'campeonato';
          status: 'agendado' | 'em_andamento' | 'finalizado';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['games']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['games']['Insert']>;
      };
      players: {
        Row: {
          id: string;
          name: string;
          email?: string;
          phone?: string;
          status: 'ativo' | 'inativo';
          type: 'mensalista' | 'avulso';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['players']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['players']['Insert']>;
      };
      transactions: {
        Row: {
          id: string;
          player_id: string;
          amount: number;
          type: 'entrada' | 'saida';
          description: string;
          date: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['transactions']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['transactions']['Insert']>;
      };
    };
  };
};
