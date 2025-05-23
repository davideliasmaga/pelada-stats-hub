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

// Complete override of initialization to prevent any recursion
export const fixSupabaseInfiniteRecursion = () => {
  // Don't initialize at all if we're in a build process
  if (typeof window === 'undefined') {
    console.log("Skipping Supabase initialization in non-browser environment");
    return;
  }

  console.log("Setting up safe Supabase initialization...");
  
  // Flag to prevent multiple initializations
  let isInitializing = false;
  let isInitialized = false;
  
  const safeInitSession = () => {
    // Prevent multiple concurrent initializations
    if (isInitializing || isInitialized) return;
    
    isInitializing = true;
    console.log("Starting safe Supabase initialization...");
    
    // Use a very delayed initialization to ensure everything is loaded
    setTimeout(() => {
      try {
        // Just check if session exists, don't do any redirects or actions
        supabase.auth.getSession()
          .then(({ data }) => {
            if (data && data.session) {
              console.log("Found existing session during safe initialization");
            } else {
              console.log("No active session found during safe initialization");
            }
            isInitialized = true;
            isInitializing = false;
          })
          .catch(err => {
            console.error("Error during safe session check:", err.message || err);
            // Mark as initialized anyway to prevent retries that might cause issues
            isInitialized = true;
            isInitializing = false;
          });
      } catch (err) {
        console.error("Critical error in Supabase initialization:", err);
        // Mark as initialized to avoid infinite retry loops
        isInitialized = true;
        isInitializing = false;
      }
    }, 2000); // Extra long delay for safety
  };
  
  // Run initialization after everything else has loaded
  if (document.readyState === 'complete') {
    safeInitSession();
  } else {
    const handleLoad = () => {
      safeInitSession();
      window.removeEventListener('load', handleLoad);
    };
    window.addEventListener('load', handleLoad);
  }
};

// Initialize safely
fixSupabaseInfiniteRecursion();
