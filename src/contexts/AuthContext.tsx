
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from './UserContext';

interface AuthContextType {
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { setCurrentUser } = useUser();

  useEffect(() => {
    let mounted = true;

    // Configurar listener de mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);
        
        if (!mounted) return;

        if (session?.user) {
          setIsLoggedIn(true);
          
          // Buscar perfil do usuário
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profile && mounted) {
              setCurrentUser({
                id: profile.id,
                name: profile.name,
                role: profile.role as any,
                email: profile.email,
                avatar: profile.avatar
              });
            }
          } catch (error) {
            console.error('Error fetching profile:', error);
            // Se não conseguir buscar o perfil, criar um usuário básico
            if (mounted) {
              setCurrentUser({
                id: session.user.id,
                name: session.user.email?.split('@')[0] || 'Usuário',
                role: 'admin', // Definir como admin por padrão para evitar problemas
                email: session.user.email
              });
            }
          }
        } else {
          setIsLoggedIn(false);
          setCurrentUser(null);
        }
        
        if (mounted) {
          setIsLoading(false);
        }
      }
    );

    // Verificar sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      if (session?.user) {
        setIsLoggedIn(true);
        setCurrentUser({
          id: session.user.id,
          name: session.user.email?.split('@')[0] || 'Usuário',
          role: 'admin',
          email: session.user.email
        });
      }
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setCurrentUser]);

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
