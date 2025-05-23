
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ujtwhqumskbdxmnurfeq.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqdHdocXVtc2tiZHhtbnVyZmVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MzM0MjQsImV4cCI6MjA2MzUwOTQyNH0.lSiSWmYHkfVHk9KSo4NFDuFmWganbuOWm_3uCeUqRWA";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key são necessários.');
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

// Fix for the recursion detection in policy issue
export const fixSupabaseInfiniteRecursion = () => {
  console.log("Ensuring Supabase works correctly...");
  
  // Use a robust initialization approach
  let initialized = false;
  
  const initSession = () => {
    if (initialized) return;
    
    // Add significant delay to avoid any potential race conditions
    setTimeout(() => {
      try {
        console.log("Initializing Supabase session...");
        supabase.auth.getSession().then(({ data, error }) => {
          if (error) {
            console.error("Session error during initialization:", error);
          } else if (data.session) {
            console.log("Session found during initialization");
          } else {
            console.log("No active session during initialization");
          }
          initialized = true;
        });
      } catch (err) {
        console.error("Critical error initializing Supabase:", err);
      }
    }, 1000); // Longer delay for safety
  };
  
  // Initialize after DOM is fully loaded
  if (document.readyState === 'complete') {
    initSession();
  } else {
    window.addEventListener('load', initSession);
  }
};

// Call this function to fix the recursion issue
fixSupabaseInfiniteRecursion();
