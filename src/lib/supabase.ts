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

// Create a safer initialization approach that won't cause recursion
export const fixSupabaseInfiniteRecursion = () => {
  console.log("Ensuring Supabase works correctly...");
  
  // Avoid multiple initialization calls
  let initialized = false;
  
  const initSession = () => {
    if (initialized) return;
    initialized = true;
    
    // Use setTimeout to push this to the end of the event loop
    setTimeout(() => {
      try {
        console.log("Initializing Supabase session...");
        // Simply check the session without any further actions to avoid recursion
        supabase.auth.getSession().then(({ data }) => {
          if (data && data.session) {
            console.log("Session found during initialization");
          } else {
            console.log("No active session during initialization");
          }
        }).catch(err => {
          console.log("Error checking session:", err.message || err);
          // Don't rethrow to prevent breaking the app
        });
      } catch (err) {
        console.error("Critical error initializing Supabase:", err);
        // Silent failure - we don't want to break the app
      }
    }, 1500); // Large delay to ensure everything is ready
  };
  
  // Initialize only after the DOM is fully loaded
  if (document.readyState === 'complete') {
    initSession();
  } else {
    // Use a once listener to avoid multiple initializations
    const onLoad = () => {
      initSession();
      window.removeEventListener('load', onLoad);
    };
    window.addEventListener('load', onLoad);
  }
};

// Call this function to fix the recursion issue
fixSupabaseInfiniteRecursion();
