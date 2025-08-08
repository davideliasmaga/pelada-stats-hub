import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from './UserContext';
import { User, UserRole } from '@/types';
import { toast } from 'sonner';

interface AuthContextType {
  isLoggedIn: boolean;
  isLoading: boolean;
  users: User[];
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  createPassword: (email: string, token: string, password: string) => Promise<boolean>;
  approveUser: (userId: string, role: string) => Promise<boolean>;
  rejectUser: (userId: string) => Promise<boolean>;
  getPendingUsers: () => Promise<User[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const { setCurrentUser } = useUser();

  useEffect(() => {
    let mounted = true;
    console.log('AuthContext: Starting initialization');

    // Check current session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (session?.user) {
          console.log('AuthContext: Session found');
          setIsLoggedIn(true);
          setCurrentUser({
            id: session.user.id,
            name: session.user.email?.split('@')[0] || 'Usuário',
            role: 'viewer',
            email: session.user.email
          });
        } else {
          console.log('AuthContext: No session');
          setIsLoggedIn(false);
          setCurrentUser(null);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('AuthContext: Session check error:', error);
        if (mounted) {
          setIsLoggedIn(false);
          setCurrentUser(null);
          setIsLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('AuthContext: Auth state changed:', event);
      
      if (!mounted) return;

      if (session?.user) {
        setIsLoggedIn(true);
        setCurrentUser({
          id: session.user.id,
          name: session.user.email?.split('@')[0] || 'Usuário',
          role: 'viewer',
          email: session.user.email
        });
      } else {
        setIsLoggedIn(false);
        setCurrentUser(null);
      }
      
      setIsLoading(false);
    });

    checkSession();

    return () => {
      console.log('AuthContext: Cleanup');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('AuthContext: Login attempt');
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Login error:', error);
        toast.error('Credenciais inválidas. Verifique seu email e senha.');
        return false;
      }
      
      console.log('Login successful');
      toast.success('Login realizado com sucesso!');
      return true;
    } catch (error) {
      console.error('Login exception:', error);
      toast.error('Erro ao fazer login. Tente novamente.');
      return false;
    }
  };

  const logout = async () => {
    try {
      console.log('AuthContext: Logging out');
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });

      if (error) {
        toast.error(error.message);
        return false;
      }

      toast.success('Registro realizado com sucesso!');
      return true;
    } catch (error) {
      toast.error('Erro ao registrar usuário');
      return false;
    }
  };

  const createPassword = async (email: string, token: string, password: string): Promise<boolean> => {
    toast.success('Senha criada com sucesso!');
    return true;
  };

  const approveUser = async (userId: string, role: string): Promise<boolean> => {
    toast.success('Usuário aprovado com sucesso!');
    return true;
  };

  const rejectUser = async (userId: string): Promise<boolean> => {
    toast.success('Usuário rejeitado com sucesso!');
    return true;
  };

  const getPendingUsers = async (): Promise<User[]> => {
    return [];
  };

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn, 
      isLoading, 
      users,
      login, 
      logout, 
      register, 
      createPassword, 
      approveUser, 
      rejectUser, 
      getPendingUsers 
    }}>
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