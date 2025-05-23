import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ujtwhqumskbdxmnurfeq.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqdHdocXVtc2tiZHhtbnVyZmVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MzM0MjQsImV4cCI6MjA2MzUwOTQyNH0.lSiSWmYHkfVHk9KSo4NFDuFmWganbuOWm_3uCeUqRWA";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key são necessários.');
}

// Use a simplified client configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: typeof window !== 'undefined' ? localStorage : undefined
  }
});

// Types for Supabase tables
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
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: 'admin' | 'mensalista' | 'viewer';
          avatar?: string; 
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
    };
  };
};

// Handle supabase initialization more safely
export const fixSupabaseInfiniteRecursion = () => {
  // Skip initialization completely in non-browser environments
  if (typeof window === 'undefined') {
    return;
  }
  
  // Only attempt to initialize once
  let initialized = false;
  
  const safeInit = () => {
    if (initialized) return;
    
    // Set flag to prevent recursive initialization
    initialized = true;
    
    try {
      // Just check session existence without doing any redirects
      supabase.auth.getSession().catch(err => {
        console.error("Session check error:", err.message || err);
      });
    } catch (err) {
      console.error("Critical error in Supabase initialization:", err);
    }
  };
  
  // Run initialization after page load
  if (document.readyState === 'complete') {
    setTimeout(safeInit, 100);
  } else {
    window.addEventListener('load', () => setTimeout(safeInit, 100));
  }
};

// Initialize safely
fixSupabaseInfiniteRecursion();
